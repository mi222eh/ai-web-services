import logging
from beanie import PydanticObjectId
from fastapi import HTTPException
from datetime import datetime

from server.services.synonym_service.ai import create_and_validate_synonym
from server.services.synonym_service.worker import worker
from ..models import CreateSynonymDTO, Explanation, ExplanationEntry, PaginatedResponse
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Annotated
from fastapi import Query

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("")
async def create_synonym(synonym: CreateSynonymDTO) -> Explanation:
    logger.info(f"Creating synonym for word: {synonym.word}")

    existing = await Explanation.find_one(Explanation.word == synonym.word)
    if existing:
        logger.info(f"Word already exists: {synonym.word}")
        return existing

    # Create new explanation without entries
    new_explanation = Explanation(word=synonym.word, entries=[])
    new_explanation.created_at = datetime.now()
    await new_explanation.save()
    logger.info(f"Created new explanation for word: {synonym.word}")

    # Add task to worker queue
    worker.add_task(new_explanation.id)
    logger.info(f"Added explanation to worker queue: {synonym.word}")

    return new_explanation

class GetSynonymsQuery(BaseModel):
    skip: int = 0
    limit: int = 10
    query: str | None = None

@router.get("")
async def get_synonyms(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1),
    query: str = Query(default="", min_length=0)
) -> PaginatedResponse[Explanation]:
    logger.info(f"[GET /explanations] Received request with params: skip={skip}, limit={limit}, query={query!r}")
    logger.info(f"[GET /explanations] Query type: {type(query)}, Query value: {query!r}")

    # Start with a base query using Beanie's query builder
    base_query = Explanation.find()

    # Only apply query filter if query is not empty string
    if query.strip():
        logger.info(f"[GET /explanations] Applying query filter: {query!r}")
        # Use Beanie's query operators for case-insensitive search
        base_query = base_query.find(
            {
                "$or": [
                    {"word": {"$regex": query, "$options": "i"}},
                    {"entries.explanation": {"$regex": query, "$options": "i"}},
                ]
            }
        )
    else:
        logger.info("[GET /explanations] No query filter applied")

    # Get total count for pagination
    total = await base_query.count()
    logger.info(f"[GET /explanations] Total results: {total}")

    # Get paginated results
    items = await base_query.skip(skip).limit(limit).to_list()
    logger.info(f"[GET /explanations] Returning {len(items)} items")

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
        explanation = await Explanation.get(id)
    except Exception:
        logger.error(f"Synonym with id {id} not found")
        raise HTTPException(status_code=404, detail="Synonym not found")

    try:
        # Add to worker queue with retry flag
        worker.add_task(explanation.id, is_retry=True)
        logger.info(f"Added explanation to worker queue for retry: {explanation.word}")
        return explanation
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
