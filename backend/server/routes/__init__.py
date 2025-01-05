from fastapi import APIRouter
from .explanations import router as explanations_router
from .synonyms import router as synonyms_router


router = APIRouter(prefix="/api")

router.include_router(
    explanations_router, prefix="/explanations", tags=["Explanations"]
)
router.include_router(synonyms_router, prefix="/synonyms", tags=["Synonyms"])
