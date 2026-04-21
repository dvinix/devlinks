import redis.asyncio as redis
from app.core.config import settings


redis_client: redis.Redis = None


async def connect_redis():
    ## Initialize the Redis client and test the connection
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            password=settings.redis_password,
            decode_responses=True
        )
        try:
            await redis_client.ping()
            print("Connected to Redis successfully!")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            raise e
        

async def disconnect_redis():
    if redis_client:
        await redis_client.close() 

def get_redis():
    return redis_client