from fastapi import APIRouter
from .explanations import router as explanations_router
from .ws import router as ws_router


router = APIRouter()

router.include_router(
    explanations_router, prefix="/explanations", tags=["Explanations"]
)

router.include_router(ws_router, prefix="/ws", tags=["WebSocket"])
