import json
from typing import Tuple, List
from .models import list_users

def jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 0.0
    return len(a & b) / max(1, len(a | b))

def match_score(u, v) -> Tuple[float, List[str]]:
    u_interests = set(json.loads(u["interests"]))
    v_interests = set(json.loads(v["interests"]))
    overlap = u_interests & v_interests

    interest_score = jaccard(u_interests, v_interests)  # 0..1

    # prefer_group is 0..100; smaller distance is better
    pg_diff = abs(int(u["prefers_group"]) - int(v["prefers_group"]))
    pref_score = 1.0 - (pg_diff / 100.0)

    # vibe match bonus
    vibe_bonus = 0.1 if u["vibe"] == v["vibe"] else 0.0

    score = 0.7 * interest_score + 0.2 * pref_score + vibe_bonus

    why = []
    if overlap:
        why.append(f"Shared interests: {', '.join(list(overlap)[:4])}")
    why.append(f"Social preference similarity: {int(pref_score*100)}%")
    if vibe_bonus > 0:
        why.append("Similar conversation vibe")

    return round(score, 3), why

def get_matches_for(user_id: str, top_k: int = 10):
    users = list_users()
    me = None
    for u in users:
        if u["id"] == user_id:
            me = u
            break
    if me is None:
        return []

    scored = []
    for u in users:
        if u["id"] == user_id:
            continue
        score, why = match_score(me, u)
        scored.append((score, why, u))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:top_k]
