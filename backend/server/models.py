from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel


class Synonym(Document):
    word: str
    explanation: str
    synonyms: list[str]
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "synonyms"


class Explanation(Document):
    word: str
    explanation: str
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "explanations"


class CreateSynonymDTO(BaseModel):
    word: str


class CreateExplanationDTO(BaseModel):
    word: str
