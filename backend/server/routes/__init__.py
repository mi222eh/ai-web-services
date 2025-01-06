from fastapi import APIRouter
from .explanations import router as explanations_router


router = APIRouter()

router.include_router(
    explanations_router, prefix="/explanations", tags=["Explanations"]
)
