from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


#Engine
engine = create_async_engine(
    settings.postgres_url,
    pool_size=10,
    max_overflow=20,
    echo=False
)

## SessionFactory - create database sess...

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


## Dependency to get a database sess in our API endpoints

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally: 
            await session.close()
            