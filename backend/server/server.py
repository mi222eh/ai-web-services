import os
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient

from server.services.static_service import STATIC_PATH
from server.models import Explanation
from server.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Get MongoDB URL from environment variable or use default
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

    # Initialize MongoDB connection on startup
    client = AsyncIOMotorClient(mongodb_url)
    await init_beanie(database=client.worddb, document_models=[Explanation])
    yield
    # Clean up the MongoDB connection on shutdown
    client.close()


app = FastAPI(lifespan=lifespan, docs_url="/docs/")


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve static files from the "static" directory
app.mount("/static", StaticFiles(directory=str(STATIC_PATH)), name="static")

# Include the router in the app
app.include_router(router, prefix="/api", tags=["api"])


# Catch all route to serve index.html
@app.get("/")
async def serve_root():
    return FileResponse("static/index.html")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    return FileResponse("static/index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
