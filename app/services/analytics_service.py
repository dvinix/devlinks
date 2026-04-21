import hashlib
from datetime import datetime
from user_agents import parse
from app.db.mongo import get_mongo_db
from loguru import logger  # or just print for now

async def record_click(slug: str, request, ip: str, user_agent: str, referer: str = None):
    try:
        ua = parse(user_agent)
        
        if ua.is_mobile:
            device = "mobile"
        elif ua.is_tablet:
            device = "tablet"
        else:
            device = "desktop"
        
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()
        
        click_doc = {
            "slug": slug,
            "timestamp": datetime.utcnow(),
            "ip_hash": ip_hash,
            "device": device,
            "browser": ua.browser.family,
            "referrer": referer,
        }
        
        db = get_mongo_db()
        result = await db.clicks.insert_one(click_doc)
        print(f"✅ Click recorded for {slug}: {result.inserted_id}")
    except Exception as e:
        print(f"❌ Failed to record click: {e}")
        import traceback
        traceback.print_exc()