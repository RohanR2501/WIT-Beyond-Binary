import json
import time
from typing import List
from .db import get_conn

def create_or_update_user(
    user_id: str,
    name: str,
    age_range: str | None,
    interests: List[str],
    vibe: str,
    prefers_group: int,
    ai_enabled: bool,
):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO users (id, name, age_range, interests, vibe, prefers_group, ai_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          age_range=excluded.age_range,
          interests=excluded.interests,
          vibe=excluded.vibe,
          prefers_group=excluded.prefers_group,
          ai_enabled=excluded.ai_enabled
    """, (user_id, name, age_range, json.dumps(interests), vibe, prefers_group, 1 if ai_enabled else 0))
    conn.commit()
    conn.close()

def get_user(user_id: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row

def list_users():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users")
    rows = cur.fetchall()
    conn.close()
    return rows

def save_message(room_id: str, sender_id: str, text: str):
    conn = get_conn()
    cur = conn.cursor()
    ts = int(time.time())
    cur.execute(
        "INSERT INTO messages (room_id, sender_id, text, ts) VALUES (?, ?, ?, ?)",
        (room_id, sender_id, text, ts)
    )
    conn.commit()
    conn.close()
    return ts

def get_last_messages(room_id: str, limit: int = 20):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT sender_id, text, ts FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT ?",
        (room_id, limit)
    )
    rows = cur.fetchall()
    conn.close()
    return list(reversed(rows))
