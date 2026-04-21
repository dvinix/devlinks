from fastapi import FastAPI
from sqlalchemy import desc
from app.router import auth, links ,redirect
from contextlib import asynccontextmanager
from app.db.redis import connect_redis, disconnect_redis
from app.db.mongo import mongo

## lifespan function to manage startup and shutdown events for Redis connection...
@asynccontextmanager
async def lifespan(app: FastAPI):

    ##Redis
    await connect_redis()
    print(":) Services Connected...")

    yield

    await disconnect_redis()
    print(":( Services Disconnected...")

    ##Mongo
    await mongo.connect()

    yield

    await mongo.disconnect()


app = FastAPI(
    title="devlinks API",
    description="URL Shortener with Analytics",   
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)




app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(links.router, prefix="/links", tags=["links"])
app.include_router(redirect.router)  # No prefix for redirect routes, they are at the root level... 

@app.get("/")
async def root():
    return {
        "message": "Welcome to devlinks API",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }

