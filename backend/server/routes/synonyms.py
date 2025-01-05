from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime
import requests

from server.services.synonym_service.ai import create_synonym_ai
from ..models import CreateSynonymDTO, Synonym
from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Synonym:
    result = create_synonym_ai(synonym.word)

    response = Synonym(
        word=synonym.word,
        synonyms=result.synonyms,
        explanation=result.explanation,
        created_at=datetime.now(),
    )

    await response.create()
    return response


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

    updated_synonym.updated_at = datetime.now()
    await synonym.set(updated_synonym.model_dump(exclude={"id", "created_at"}))
    return await Synonym.get(id)


@router.delete("/{id}")
async def delete_synonym(id: PydanticObjectId):
    synonym = await Synonym.get(id)
    if not synonym:
        raise HTTPException(status_code=404, detail="Synonym not found")
    await synonym.delete()
