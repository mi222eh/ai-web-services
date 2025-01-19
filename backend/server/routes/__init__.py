from fastapi import APIRouter, Request
from .explanations import router as explanations_router
from .ws import router as ws_router
from .auth import router as auth_router


# Create a router for API routes
protected_router = APIRouter()

protected_router.include_router(
    explanations_router, prefix="/explanations", tags=["Explanations"]
)

protected_router.include_router(ws_router, prefix="/ws", tags=["WebSocket"])

# Create the main router
router = APIRouter()

# Include the protected routes under /api
router.include_router(protected_router, prefix="")

# Include auth routes separately
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
