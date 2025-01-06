from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime
import requests

from server.services.synonym_service.ai import create_synonym_ai
from ..models import CreateSynonymDTO, Explanation, ExplanationEntry
from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Explanation:
    result = create_synonym_ai(synonym.word)

    existing = await Explanation.find_one(Explanation.word == result)
    if not existing:
        existing = Explanation(word=synonym.word, entries=[])
        existing.created_at = datetime.now()
    else:
        existing.updated_at = datetime.now()

    existing.entries.append(
        ExplanationEntry(synonyms=result.synonyms, explanation=result.explanation)
    )

    await existing.save()
    return existing


@router.get("")
async def get_synonyms() -> list[Explanation]:
    return await Explanation.find_all().to_list()


@router.get("/{id}")
async def get_synonym(id: PydanticObjectId) -> Explanation:
    synonym = await Explanation.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")
    return synonym


@router.put("/{id}")
async def update_synonym(id: PydanticObjectId) -> Explanation:
    synonym = await Explanation.get(id)

    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")

    update = create_synonym_ai(synonym.word, synonym.entries)

    synonym.synonyms = update.synonyms
    synonym.explanation = update.explanation
    synonym.updated_at = datetime.now()
    await synonym.save()
    return await Explanation.get(id)


@router.delete("/{id}")
async def delete_synonym(id: PydanticObjectId):
    synonym = await Explanation.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")
    await synonym.delete()
