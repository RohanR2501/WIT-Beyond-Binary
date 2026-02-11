from pydantic import BaseModel, Field
from typing import List, Optional

class UserCreate(BaseModel):
    id: str
    name: str
    age_range: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    vibe: str = "gentle"  # gentle | fun | deep | minimal
    prefers_group: int = 0  # 0..100 slider-ish
    ai_enabled: bool = True

class UserOut(BaseModel):
    id: str
    name: str
    age_range: Optional[str] = None
    interests: List[str]
    vibe: str
    prefers_group: int
    ai_enabled: bool

class MatchOut(BaseModel):
    user: UserOut
    score: float
    why: List[str]

class MessageIn(BaseModel):
    sender_id: str
    text: str

class MessageOut(BaseModel):
    sender_id: str
    text: str
    ts: int
