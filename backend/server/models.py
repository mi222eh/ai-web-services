from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel


class SynonymEntry(BaseModel):
    explanation: str
    synonyms: list[str]


class Synonym(Document):
    word: str
    entries: list[SynonymEntry]
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "synonyms"


class CreateSynonymDTO(BaseModel):
    word: str
