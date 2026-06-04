from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.router import auth, links, redirect, analytics, qr
from app.db.redis import connect_redis, disconnect_redis
from app.db.mongo import connect_mongo, disconnect_mongo
from app.middleware import setup_cors



## lifespan function to manage startup and shutdown events for Redis connection...
@asynccontextmanager
async def lifespan(app: FastAPI):

    ##Redis
    await connect_redis()
    await connect_mongo()
    print(":) Services Connected...")

    yield

    await disconnect_redis()
    await disconnect_mongo()
    print(":( Services Disconnected...")


app = FastAPI(
    title="devlinks API",
    description="URL Shortener with Analytics",   
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup CORS middleware
setup_cors(app)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(links.router, prefix="/links", tags=["links"])
app.include_router(qr.router, prefix="/links", tags=["qr"])
app.include_router(redirect.router)  
app.include_router(analytics.router) #
# No prefix for redirect routes, they are at the root level... 

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

