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
    # Test database connection (non-blocking)
    postgres_connected = False
    try:
        from app.db.postgres import engine
        from sqlalchemy import text
        print(f"🔍 Attempting PostgreSQL connection to: {settings.postgres_url.split('@')[1]}")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.close()
        print("✅ PostgreSQL connected successfully")
        postgres_connected = True
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        print(f"⚠️  App will start but database features won't work")
        print(f"🔧 Check: POSTGRES_URL environment variable")
        # Don't raise - let app start anyway

    ##Redis
    try:
        await connect_redis()
        print("✅ Redis connected")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
    
    try:
        await connect_mongo()
        print("✅ MongoDB connected")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    
    print(":) Services startup completed")
    if not postgres_connected:
        print("⚠️  WARNING: PostgreSQL not connected - app running in degraded mode")

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
    """Health check endpoint that tests all services"""
    from app.db.postgres import engine
    from app.db.redis import get_redis_client
    from app.db.mongo import get_mongo_client
    
    health_status = {
        "status": "degraded",
        "services": {
            "api": "healthy",
            "postgres": "unknown",
            "redis": "unknown",
            "mongodb": "unknown"
        },
        "config": {
            "postgres_host": settings.postgres_url.split('@')[1].split('/')[0] if '@' in settings.postgres_url else "unknown",
            "base_url": settings.base_url,
            "cors_origins": settings.cors_origins_list
        }
    }
    
    # Test PostgreSQL
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health_status["services"]["postgres"] = "healthy"
    except Exception as e:
        health_status["services"]["postgres"] = f"unhealthy: {str(e)[:100]}"
    
    # Test Redis
    try:
        redis = await get_redis_client()
        await redis.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)[:100]}"
    
    # Test MongoDB
    try:
        mongo = get_mongo_client()
        await mongo.admin.command('ping')
        health_status["services"]["mongodb"] = "healthy"
    except Exception as e:
        health_status["services"]["mongodb"] = f"unhealthy: {str(e)[:100]}"
    
    # Overall status
    if all(v == "healthy" for v in health_status["services"].values()):
        health_status["status"] = "healthy"
    
    return health_status


@app.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment configuration"""
    import re
    
    # Mask password in URL
    postgres_url_safe = re.sub(
        r'://([^:]+):([^@]+)@',
        r'://\1:****@',
        settings.postgres_url
    )
    
    return {
        "postgres_url": postgres_url_safe,
        "postgres_host": settings.postgres_url.split('@')[1].split('/')[0] if '@' in settings.postgres_url else "unknown",
        "postgres_port": settings.postgres_url.split(':')[-1].split('/')[0] if ':' in settings.postgres_url else "unknown",
        "mongo_host": settings.mongo_url.split('@')[1].split('/')[0] if '@' in settings.mongo_url else "localhost",
        "redis_host": settings.redis_url.split('@')[1] if '@' in settings.redis_url else settings.redis_url.replace('redis://', '').split('/')[0],
        "base_url": settings.base_url,
        "cors_origins": settings.cors_origins_list,
        "app_host": settings.app_host,
        "app_port": settings.app_port
    }

