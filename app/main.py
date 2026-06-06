from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.router import auth, links, redirect, analytics, qr
from app.db.redis import connect_redis, disconnect_redis
from app.db.mongo import connect_mongo, disconnect_mongo
from app.middleware import setup_cors
from app.core.config import settings



## lifespan function to manage startup and shutdown events for Redis connection...
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Test database connection
    try:
        from app.db.postgres import engine
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        print("✅ PostgreSQL connected")
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        raise

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

# Setup CORS middleware - MUST be added before routes
setup_cors(app)

print(f"🚀 Backend starting with BASE_URL: {settings.base_url}")


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

