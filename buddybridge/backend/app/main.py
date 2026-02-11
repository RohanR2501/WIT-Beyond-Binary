import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .schemas import UserCreate, UserOut, MatchOut
from .models import create_or_update_user, get_user, save_message, get_last_messages
from .matching import get_matches_for
from .wingman import generate_wingman_suggestions
from .safety import is_allowed

app = FastAPI(title="BuddyBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

def row_to_userout(row) -> UserOut:
    return UserOut(
        id=row["id"],
        name=row["name"],
        age_range=row["age_range"],
        interests=json.loads(row["interests"]),
        vibe=row["vibe"],
        prefers_group=int(row["prefers_group"]),
        ai_enabled=bool(row["ai_enabled"]),
    )

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/users", response_model=UserOut)
def upsert_user(u: UserCreate):
    create_or_update_user(
        user_id=u.id,
        name=u.name,
        age_range=u.age_range,
        interests=u.interests,
        vibe=u.vibe,
        prefers_group=u.prefers_group,
        ai_enabled=u.ai_enabled
    )
    row = get_user(u.id)
    return row_to_userout(row)

@app.get("/users/{user_id}", response_model=UserOut)
def get_user_api(user_id: str):
    row = get_user(user_id)
    if not row:
        raise HTTPException(404, "User not found")
    return row_to_userout(row)

@app.get("/matches/{user_id}", response_model=list[MatchOut])
def matches(user_id: str):
    scored = get_matches_for(user_id, top_k=10)
    out = []
    for score, why, row in scored:
        out.append(MatchOut(user=row_to_userout(row), score=score, why=why))
    return out

@app.get("/wingman/{room_id}")
def wingman(room_id: str, user_a: str, user_b: str):
    a = get_user(user_a)
    b = get_user(user_b)
    if not a or not b:
        raise HTTPException(404, "User(s) not found")

    # Respect privacy: if either disables AI, return nothing
    if not bool(a["ai_enabled"]) or not bool(b["ai_enabled"]):
        return {"enabled": False, "suggestions": [], "wingman_in_chat": None}

    last = get_last_messages(room_id, limit=20)
    last_msgs = [{"sender_id": r["sender_id"], "text": r["text"], "ts": r["ts"]} for r in last]

    vibe = a["vibe"]  # could combine; keep MVP simple
    payload = generate_wingman_suggestions(vibe=vibe, user_a=a, user_b=b, last_messages=last_msgs)
    return {"enabled": True, **payload}

class RoomHub:
    def __init__(self):
        self.rooms: dict[str, set[WebSocket]] = {}

    async def join(self, room_id: str, ws: WebSocket):
        await ws.accept()
        self.rooms.setdefault(room_id, set()).add(ws)

    def leave(self, room_id: str, ws: WebSocket):
        if room_id in self.rooms:
            self.rooms[room_id].discard(ws)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast(self, room_id: str, message: dict):
        for ws in list(self.rooms.get(room_id, [])):
            await ws.send_json(message)

hub = RoomHub()

@app.websocket("/ws/chat/{room_id}")
async def chat_ws(ws: WebSocket, room_id: str):
    await hub.join(room_id, ws)
    try:
        while True:
            data = await ws.receive_json()
            sender_id = data.get("sender_id", "")
            text = (data.get("text") or "").strip()

            if not text:
                continue

            # Basic safety gate
            if not is_allowed(text):
                await ws.send_json({"type": "error", "message": "Message blocked by safety filter."})
                continue

            ts = save_message(room_id, sender_id, text)
            await hub.broadcast(room_id, {"type": "msg", "sender_id": sender_id, "text": text, "ts": ts})
    except WebSocketDisconnect:
        hub.leave(room_id, ws)
