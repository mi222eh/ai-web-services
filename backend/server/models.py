from datetime import datetime
from typing import Optional, TypeVar, Generic, Literal
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


class SynonymNuance(Document):
    word1: str
    word2: str
    nuance_explanation: str
    usage_examples: list[str]
    context_differences: str
    formality_level: Literal["word1_more_formal", "word2_more_formal", "equally_formal"]
    emotional_weight: Literal["word1_stronger", "word2_stronger", "equally_strong"]
    created_at: datetime = datetime.now()

    class Settings:
        name = "nuances"
        indexes = [
            [("word1", 1), ("word2", 1)],  # Compound index for word pairs
        ]


class CreateSynonymDTO(BaseModel):
    word: str


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    skip: int
    limit: int


class NuanceRequest(BaseModel):
    word1: str
    word2: str
