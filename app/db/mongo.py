from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

mongo_client: AsyncIOMotorClient = None

async def connect_mongo():
    global mongo_client
    mongo_client = AsyncIOMotorClient(settings.mongo_url)
    # Create indexes for fast queries
    await mongo_client.admin.command('ping')
    print("✅ MongoDB connected")
    
    db = mongo_client[settings.mongo_db_name]
    await db.clicks.create_index([("slug", 1), ("timestamp", -1)])
    await db.clicks.create_index([("slug", 1), ("country", 1)])

async def disconnect_mongo():
    if mongo_client:
        mongo_client.close()

def get_mongo_db():
    return mongo_client[settings.mongo_db_name]