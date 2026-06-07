#!/usr/bin/env python3
"""
Create database tables if they don't exist
This is a fallback for when migrations can't be run
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


async def create_tables():
    """Create all database tables"""
    try:
        print("🔄 Creating database tables...")
        
        from app.db.postgres import engine, Base
        from app.models import users, link  # Import all models
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Tables created successfully")
        
        # Verify tables exist
        async with engine.connect() as conn:
            from sqlalchemy import text
            result = await conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            )
            tables = [row[0] for row in result]
            print(f"📋 Tables in database: {', '.join(tables)}")
        
        await engine.dispose()
        return 0
        
    except Exception as e:
        print(f"❌ Table creation failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(create_tables())
    sys.exit(exit_code)
