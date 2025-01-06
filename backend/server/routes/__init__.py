from fastapi import APIRouter
from .synonyms import router as synonyms_router


router = APIRouter(prefix="/api")

router.include_router(synonyms_router, prefix="/synonyms", tags=["Synonyms"])
