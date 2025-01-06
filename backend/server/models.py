from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel


class ExplanationEntry(BaseModel):
    explanation: str
    synonyms: list[str]


class Explanation(Document):
    word: str
    entries: list[ExplanationEntry]
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "synonyms"


class CreateSynonymDTO(BaseModel):
    word: str
