import os
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import partial

from beanie import init_beanie
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient

from server.services.static_service import STATIC_PATH
from server.models import Explanation, SynonymNuance
from server.routes import router, auth
from .middleware.auth import require_auth_dependency
from fastapi import Request


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Get MongoDB URL from environment variable or use default
    mongodb_url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")

    # Initialize MongoDB connection on startup
    client = AsyncIOMotorClient(mongodb_url)
    await init_beanie(
        database=client.worddb, document_models=[Explanation, SynonymNuance]
    )
    yield
    # Clean up the MongoDB connection on shutdown
    client.close()


app = FastAPI(lifespan=lifespan, docs_url="/docs/")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your Vite dev server
    allow_credentials=True,  # This is crucial for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from the "static" directory
app.mount("/static", StaticFiles(directory=str(STATIC_PATH)), name="static")

# Include the router in the app
app.include_router(
    router,
    prefix="/api",
    tags=["api"],
)

# Include the auth router
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"],
)


# Protect the static files except for login-related ones
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    print("\n=== Auth Middleware ===")
    print(f"Method: {request.method}")
    print(f"Path: {request.url.path}")
    print(f"Query Params: {request.query_params}")
    print(f"Headers: {request.headers.get('cookie', 'No cookie')}")
    print(f"All Headers: {dict(request.headers)}")

    # Skip auth for WebSocket connections - they handle their own auth
    upgrade_header = request.headers.get("upgrade", "").lower()
    connection_header = request.headers.get("connection", "").lower()
    print(f"Upgrade header: {upgrade_header}")
    print(f"Connection header: {connection_header}")

    if "websocket" in upgrade_header or "websocket" in connection_header:
        print("WebSocket connection detected, skipping auth middleware")
        return await call_next(request)

    # Skip auth for these paths
    public_paths = [
        "/api/auth/login",
        "/auth/login",  # Frontend login route
        "/api/auth/check",
        "/api/ws",  # WebSocket endpoint
        "/static/index.html",
        "/static/assets",  # Your frontend assets
        "/docs",  # API docs if you need them
        "/static",  # All static files
        "/",  # Root path
    ]

    path = request.url.path
    print(f"\nChecking path against public paths: {path}")

    # Allow public paths
    if any(path.startswith(public_path) for public_path in public_paths):
        print(f"Public path detected: {path}")
        response = await call_next(request)
        print(f"Public path response status: {response.status_code}")
        return response

    # Require auth for everything else
    try:
        print(f"\nAttempting auth for protected path: {path}")
        await require_auth_dependency(request)
        print("Auth successful!")
        response = await call_next(request)
        print(f"Protected path response status: {response.status_code}")
        return response
    except HTTPException as e:
        print(f"Auth failed with error: {e.detail}")
        if not path.startswith("/api/"):
            print(f"Redirecting to login page")
            return RedirectResponse(url="/auth/login")
        print(f"Returning 401 for API route")
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception as e:
        print(f"Unexpected error in auth middleware: {str(e)}")
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error"}
        )


# Catch all route to serve index.html
@app.get("/")
async def serve_root():
    return FileResponse("static/index.html")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    file_to_get = STATIC_PATH / full_path
    if not file_to_get.exists():
        file_to_get = STATIC_PATH / "index.html"
    return FileResponse(str(file_to_get))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
