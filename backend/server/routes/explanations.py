import logging
from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime
import requests

from server.services.synonym_service.ai import create_synonym_ai
from ..models import CreateSynonymDTO, Explanation, ExplanationEntry
from fastapi import APIRouter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Explanation:
    logger.info(f"Creating synonym for word: {synonym.word}")
    result = create_synonym_ai(synonym.word)

    existing = await Explanation.find_one(Explanation.word == result)
    if not existing:
        existing = Explanation(word=synonym.word, entries=[])
        existing.created_at = datetime.now()
        logger.info(f"Created new explanation for word: {synonym.word}")
    else:
        existing.updated_at = datetime.now()
        logger.info(f"Updated existing explanation for word: {synonym.word}")

    existing.entries.append(
        ExplanationEntry(synonyms=result.synonyms, explanation=result.explanation)
    )

    await existing.save()
    logger.info(f"Saved explanation for word: {synonym.word}")
    return existing


@router.get("")
async def get_synonyms() -> list[Explanation]:
    logger.info("Fetching all synonyms")
    return await Explanation.find_all().to_list()


@router.get("/{id}")
async def get_synonym(id: PydanticObjectId) -> Explanation:
    logger.info(f"Fetching synonym with id: {id}")
    synonym = await Explanation.get(id)
    if not synonym:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")
    return synonym


@router.put("/{id}")
async def update_synonym(id: PydanticObjectId) -> Explanation:
    logger.info(f"Updating synonym with id: {id}")
    synonym = await Explanation.get(id)

    if not synonym:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")

    update = create_synonym_ai(synonym.word, synonym.entries)

    synonym.synonyms = update.synonyms
    synonym.explanation = update.explanation
    synonym.updated_at = datetime.now()
    await synonym.save()
    logger.info(f"Updated and saved synonym with id: {id}")
    return await Explanation.get(id)


@router.delete("/{id}")
async def delete_synonym(id: PydanticObjectId):
    logger.info(f"Deleting synonym with id: {id}")
    synonym = await Explanation.get(id)
    if not synonym:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")
    await synonym.delete()
    logger.info(f"Deleted synonym with id: {id}")
