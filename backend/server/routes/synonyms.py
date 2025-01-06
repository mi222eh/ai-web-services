from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime
import requests

from server.services.synonym_service.ai import create_synonym_ai
from ..models import CreateSynonymDTO, Synonym, SynonymEntry
from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Synonym:
    result = create_synonym_ai(synonym.word)

    existing = await Synonym.find_one(Synonym.word == result)
    if not existing:
        existing = Synonym(word=synonym.word, entries=[])
        existing.created_at = datetime.now()
    else:
        existing.updated_at = datetime.now()

    existing.entries.append(
        SynonymEntry(synonyms=result.synonyms, explanation=result.explanation)
    )

    await existing.save()
    return existing


@router.get("")
async def get_synonyms() -> list[Synonym]:
    return await Synonym.find_all().to_list()


@router.get("/{id}")
async def get_synonym(id: PydanticObjectId) -> Synonym:
    synonym = await Synonym.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")
    return synonym


@router.put("/{id}")
async def update_synonym(id: PydanticObjectId, updated_synonym: Synonym) -> Synonym:
    synonym = await Synonym.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")

    update = create_synonym_ai(updated_synonym.word)

    updated_synonym.synonyms = update.synonyms
    updated_synonym.explanation = update.explanation
    updated_synonym.updated_at = datetime.now()
    await updated_synonym.save()
    return await Synonym.get(id)


@router.delete("/{id}")
async def delete_synonym(id: PydanticObjectId):
    synonym = await Synonym.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")
    await synonym.delete()
