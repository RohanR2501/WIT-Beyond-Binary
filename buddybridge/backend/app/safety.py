import re

BANNED_PATTERNS = [
    r"\bkill yourself\b",
    r"\bsuicide\b",
    r"\bself[- ]harm\b",
    r"\b(i hate you)\b",
]

def is_allowed(text: str) -> bool:
    t = text.lower()
    for pat in BANNED_PATTERNS:
        if re.search(pat, t):
            return False
    return True

def sanitize_for_ai(text: str) -> str:
    # remove obvious identifiers (super basic)
    return text.strip()
