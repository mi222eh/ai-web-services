from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from datetime import datetime
from server.models import CreateExplanationDTO, Explanation

router = APIRouter()


@router.post("")
async def create_explanation(explanation: CreateExplanationDTO) -> Explanation:
    await explanation.create()
    return explanation


@router.get("")
async def get_explanations() -> list[Explanation]:
    return await Explanation.find_all().to_list()


@router.get("/{id}")
async def get_explanation(id: PydanticObjectId) -> Explanation:
    explanation = await Explanation.get(id)
    if not explanation:
        raise HTTPException(status_code=404, detail="Explanation not found")
    return explanation


@router.put("/{id}")
async def update_explanation(
    id: PydanticObjectId, updated_explanation: Explanation
) -> Explanation:
    explanation = await Explanation.get(id)
    if not explanation:
        raise HTTPException(status_code=404, detail="Explanation not found")

    updated_explanation.updated_at = datetime.now()
    await explanation.set(updated_explanation.model_dump(exclude={"id", "created_at"}))
    return await Explanation.get(id)


@router.delete("/{id}")
async def delete_explanation(id: PydanticObjectId):
    explanation = await Explanation.get(id)
    if not explanation:
        raise HTTPException(status_code=404, detail="Explanation not found")
    await explanation.delete()
