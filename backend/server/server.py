from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from server.models import Explanation
from server.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize MongoDB connection on startup
    client = AsyncIOMotorClient("mongodb://localhost:27017")
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

# Include the router in the app
app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
