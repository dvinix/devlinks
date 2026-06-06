#!/usr/bin/env python3
"""
Run database migrations
This script is called during Render's build phase
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from alembic import command
from alembic.config import Config


def run_migrations():
    """Run alembic migrations"""
    try:
        print("🔄 Running database migrations...")
        
        # Create alembic config
        alembic_ini_path = project_root / "alembic.ini"
        alembic_cfg = Config(str(alembic_ini_path))
        
        # Run upgrade to head
        command.upgrade(alembic_cfg, "head")
        
        print("✅ Migrations completed successfully")
        return 0
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = run_migrations()
    sys.exit(exit_code)
