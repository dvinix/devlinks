import redis.asyncio as redis
from app.core.config import settings


redis_client: redis.Redis = None


async def connect_redis():
    ## Initialize the Redis client and test the connection
    global redis_client
    redis_client = await redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20
    )
        

async def disconnect_redis():
    if redis_client:
        await redis_client.close() 



def get_redis():
    return redis_client