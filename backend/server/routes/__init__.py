from fastapi import APIRouter
from .explanations import router as synonyms_router


router = APIRouter(prefix="/api")

router.include_router(synonyms_router, prefix="/explanations", tags=["Explanations"])
