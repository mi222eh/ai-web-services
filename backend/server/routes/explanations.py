import logging
from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime

from server.services.synonym_service.ai import create_and_validate_synonym
from ..models import CreateSynonymDTO, Explanation, ExplanationEntry, PaginatedResponse
from fastapi import APIRouter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Explanation:
    logger.info(f"Creating synonym for word: {synonym.word}")

    try:
        result = create_and_validate_synonym(synonym.word)
    except Exception as e:
        logger.error(f"Failed to create and validate synonym: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    existing = await Explanation.find_one(Explanation.word == synonym.word)
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

    if existing.id:
        await existing.save()
    else:
        await existing.save()
    logger.info(f"Saved validated explanation for word: {synonym.word}")
    return existing


@router.get("")
async def get_synonyms(
    skip: int = 0, limit: int = 10, query: str | None = None
) -> PaginatedResponse[Explanation]:
    logger.info(f"Fetching synonyms with skip={skip}, limit={limit}, query={query}")

    # Start with a base query using Beanie's query builder
    base_query = Explanation.find()

    if query:
        # Use Beanie's query operators for case-insensitive search
        base_query = base_query.find(
            {
                "$or": [
                    {"word": {"$regex": query, "$options": "i"}},
                    {"entries.explanation": {"$regex": query, "$options": "i"}},
                ]
            }
        )

    # Get total count for pagination
    total = await base_query.count()

    # Get paginated results
    items = await base_query.skip(skip).limit(limit).to_list()

    return PaginatedResponse[Explanation](
        items=items, total=total, skip=skip, limit=limit
    )


@router.get("/{id}")
async def get_synonym(id: PydanticObjectId) -> Explanation:
    logger.info(f"Fetching synonym with id: {id}")
    try:
        synonym = await Explanation.get(id)
        return synonym
    except Exception:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")


@router.put("/{id}")
async def update_synonym(id: PydanticObjectId) -> Explanation:
    logger.info(f"Updating synonym with id: {id}")
    try:
        synonym = await Explanation.get(id)
    except Exception:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")

    try:
        update = create_and_validate_synonym(synonym.word)
        synonym.entries.append(
            ExplanationEntry(synonyms=update.synonyms, explanation=update.explanation)
        )
        synonym.updated_at = datetime.now()
        await synonym.save()
        logger.info(f"Updated and saved synonym with id: {id}")
        return synonym
    except Exception as e:
        logger.error(f"Failed to update synonym: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_synonym(id: PydanticObjectId):
    logger.info(f"Deleting synonym with id: {id}")
    try:
        synonym = await Explanation.get(id)
        await synonym.delete()
        logger.info(f"Deleted synonym with id: {id}")
    except Exception:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")
