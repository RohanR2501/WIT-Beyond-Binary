import json
from typing import List, Dict
from .safety import sanitize_for_ai

PROMPT_BANK = {
    "gentle": [
        "What’s a small thing that made your week better recently?",
        "If you had 2 free hours this week, how would you spend it?",
        "What’s a hobby you’d want to try if time wasn’t an issue?",
    ],
    "fun": [
        "Hot take time: what’s an opinion you’ll defend forever?",
        "Pick one: movies, games, or food — what’s your top recommendation?",
        "Would you rather be amazing at cooking or amazing at sports?",
    ],
    "deep": [
        "What’s something you’re proud of that people don’t usually notice?",
        "What helps you recharge when life gets stressful?",
        "What’s a value you care a lot about in friendships?",
    ],
    "minimal": [
        "What are you up to today?",
        "Any fun plans this week?",
        "What’s your go-to comfort show or song?",
    ]
}

def detect_dry_chat(last_messages: List[Dict]) -> bool:
    # Very simple heuristic: many short messages lately
    if len(last_messages) < 6:
        return False
    short_count = 0
    for m in last_messages[-8:]:
        txt = (m["text"] or "").strip()
        if len(txt) <= 8:
            short_count += 1
    return short_count >= 5

def shared_interest_prompt(user_a_interests: List[str], user_b_interests: List[str]) -> str | None:
    shared = list(set(user_a_interests) & set(user_b_interests))
    if not shared:
        return None
    topic = shared[0]
    return f"You both like {topic}. What got you into it, and what’s one beginner-friendly way to start?"

def generate_wingman_suggestions(
    vibe: str,
    user_a: Dict,
    user_b: Dict,
    last_messages: List[Dict],
) -> Dict:
    vibe = vibe if vibe in PROMPT_BANK else "gentle"
    a_int = json.loads(user_a["interests"])
    b_int = json.loads(user_b["interests"])

    # sanitize messages (privacy + safety)
    _ = [sanitize_for_ai(m["text"]) for m in last_messages[-20:]]

    suggestions = []
    si = shared_interest_prompt(a_int, b_int)
    if si:
        suggestions.append(si)

    # add bank prompts
    for p in PROMPT_BANK[vibe]:
        if len(suggestions) >= 3:
            break
        suggestions.append(p)

    # optional in-chat “wingman line”
    in_chat = None
    if detect_dry_chat(last_messages):
        in_chat = "I can help with a quick spark: try asking a ‘why’ question about a shared interest 🙂"

    return {
        "suggestions": suggestions[:3],
        "wingman_in_chat": in_chat
    }
