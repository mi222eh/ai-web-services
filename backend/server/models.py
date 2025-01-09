from datetime import datetime
from typing import Optional, TypeVar, Generic
from beanie import Document
from pydantic import BaseModel


class ExplanationEntry(BaseModel):
    explanation: str
    synonyms: Optional[list[str]]


class Explanation(Document):
    word: str
    entries: list[ExplanationEntry]
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Settings:
        name = "synonyms"


class CreateSynonymDTO(BaseModel):
    word: str


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    skip: int
    limit: int
