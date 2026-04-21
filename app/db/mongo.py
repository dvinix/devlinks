from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class MongoDB:
    client: AsyncIOMotorClient = None

    async def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URL)
        print(":) Mongo Connected")

    async def disconnect(self):
        if self.client:
            self.client.close()
            print(":) Mongo Disconnected")

    def get_db(self):
        return self.client[settings.MONGO_DB_NAME]
    

mongo = MongoDB()