#!/usr/bin/env python3
"""
Test PostgreSQL connection
Tests both port 5432 and 6543 to show which works
"""
import asyncio
import asyncpg
import sys


SUPABASE_HOST = "db.dkuwxoakkargysffamco.supabase.co"
PASSWORD = "cYaXHDJBkhLQucPy"
DATABASE = "postgres"
USER = "postgres"


async def test_connection(port: int) -> bool:
    """Test connection on specific port"""
    print(f"\n{'='*60}")
    print(f"Testing PostgreSQL connection on port {port}...")
    print(f"{'='*60}")
    
    url = f"postgresql://{USER}:{PASSWORD}@{SUPABASE_HOST}:{port}/{DATABASE}"
    
    try:
        print(f"Connecting to: postgresql://{USER}:***@{SUPABASE_HOST}:{port}/{DATABASE}")
        
        conn = await asyncio.wait_for(
            asyncpg.connect(url),
            timeout=10.0
        )
        
        # Test query
        version = await conn.fetchval('SELECT version()')
        tables_result = await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        tables = [row['table_name'] for row in tables_result]
        
        print(f"✅ SUCCESS!")
        print(f"   PostgreSQL version: {version[:60]}...")
        print(f"   Tables in database: {', '.join(tables) if tables else 'None yet'}")
        
        await conn.close()
        return True
        
    except asyncio.TimeoutError:
        print(f"❌ TIMEOUT - Connection took too long (>10 seconds)")
        print(f"   This usually means the port is blocked or wrong")
        return False
        
    except asyncpg.exceptions.PostgresError as e:
        print(f"❌ DATABASE ERROR: {e}")
        return False
        
    except OSError as e:
        print(f"❌ NETWORK ERROR: {e}")
        print(f"   This usually means:")
        if "Network is unreachable" in str(e):
            print(f"   - Port {port} is blocked")
            print(f"   - Or wrong port for this connection type")
        elif "Connection refused" in str(e):
            print(f"   - PostgreSQL not listening on port {port}")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {type(e).__name__}: {e}")
        return False


async def main():
    """Test both ports"""
    print("\n" + "="*60)
    print("PostgreSQL Connection Test")
    print("Testing both ports to find which one works")
    print("="*60)
    
    # Test direct connection (port 5432)
    port_5432_works = await test_connection(5432)
    
    await asyncio.sleep(1)
    
    # Test connection pooler (port 6543)
    port_6543_works = await test_connection(6543)
    
    # Summary
    print(f"\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Port 5432 (Direct):    {'✅ Works' if port_5432_works else '❌ Failed'}")
    print(f"Port 6543 (Pooler):    {'✅ Works' if port_6543_works else '❌ Failed'}")
    print()
    
    if port_6543_works:
        print("🎉 GOOD NEWS!")
        print("Port 6543 works - this is the correct port for production.")
        print()
        print("✅ Use this URL on Render:")
        print(f"   postgresql+asyncpg://{USER}:{PASSWORD}@{SUPABASE_HOST}:6543/{DATABASE}")
        return 0
    elif port_5432_works:
        print("⚠️  WARNING!")
        print("Only port 5432 works - this is the WRONG port for Render.")
        print("Port 5432 only works from within Supabase network.")
        print()
        print("❌ Don't use: port 5432")
        print("✅ Must use: port 6543 (connection pooler)")
        print()
        print("Check Supabase settings to enable connection pooler.")
        return 1
    else:
        print("❌ PROBLEM!")
        print("Neither port works. Possible issues:")
        print("1. Wrong password")
        print("2. Database doesn't exist")
        print("3. Supabase project is paused")
        print("4. Network/firewall issue")
        print()
        print("Check your Supabase dashboard.")
        return 1


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user")
        sys.exit(130)
