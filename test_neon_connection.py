#!/usr/bin/env python3
"""
Test Neon PostgreSQL connection
"""
import asyncio
import asyncpg


NEON_URL = "postgresql://neondb_owner:npg_Z0NIT9EievVB@ep-shiny-sunset-ao9dtvp3.c-2.ap-southeast-1.aws.neon.tech/neondb?ssl=require"


async def test_neon():
    """Test connection to Neon"""
    print("="*60)
    print("Testing Neon PostgreSQL Connection")
    print("="*60)
    
    try:
        print(f"\nConnecting to: ep-shiny-sunset-ao9dtvp3.c-2.ap-southeast-1.aws.neon.tech")
        
        conn = await asyncio.wait_for(
            asyncpg.connect(NEON_URL),
            timeout=10.0
        )
        
        # Test query
        version = await conn.fetchval('SELECT version()')
        
        # Check tables
        tables_result = await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        tables = [row['table_name'] for row in tables_result]
        
        print(f"\n✅ SUCCESS! Connected to Neon")
        print(f"   PostgreSQL version: {version[:60]}...")
        print(f"   Tables in database: {', '.join(tables) if tables else 'None yet (will be created)'}")
        
        await conn.close()
        return True
        
    except asyncio.TimeoutError:
        print(f"\n❌ TIMEOUT - Connection took too long")
        return False
        
    except Exception as e:
        print(f"\n❌ CONNECTION FAILED: {e}")
        return False


async def main():
    success = await test_neon()
    
    if success:
        print("\n" + "="*60)
        print("🎉 Neon connection works!")
        print("="*60)
        print("\nNext steps:")
        print("1. Update POSTGRES_URL on Render to:")
        print("   postgresql+asyncpg://neondb_owner:npg_Z0NIT9EievVB@")
        print("   ep-shiny-sunset-ao9dtvp3.c-2.ap-southeast-1.aws.neon.tech/")
        print("   neondb?ssl=require")
        print("\n2. Create tables by running:")
        print("   python create_tables.py")
        print("\n3. Deploy and test!")
        return 0
    else:
        print("\n" + "="*60)
        print("❌ Connection failed")
        print("="*60)
        return 1


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest cancelled")
        exit(130)
