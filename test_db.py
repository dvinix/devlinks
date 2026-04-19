import asyncio
from sqlalchemy import select, text
from app.db.postgres import AsyncSessionLocal
from app.models.users import Users, hash_password
async def test_connection():
    async with AsyncSessionLocal() as session:
        # Test 1: Can we connect?
        result = await session.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        
        # Test 2: Can we query?
        result = await session.execute(select(Users))
        users = result.scalars().all()
        print(f"✅ Query works. Found {len(users)} users")
        
        # Test 3: Can we insert?
        
        new_user = Users(
            email="test@example.com",
            hashed_password=hash_password("test123")
        )
        session.add(new_user)
        await session.commit()
        print(f"✅ Insert works. Created user with ID: {new_user.id}")
        
        # Test 4: Can we find by email?
        result = await session.execute(
            select(Users).where(Users.email == "test@example.com")
        )
        found = result.scalar_one()
        print(f"✅ Found user by email: {found.email}")

asyncio.run(test_connection())