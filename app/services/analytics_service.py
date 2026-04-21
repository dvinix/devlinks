import hashlib
from datetime import datetime
from user_agents import parse
from app.db.mongo import get_mongo_db

async def record_click(slug: str, request, ip: str, user_agent: str, referer: str = None):

    #Store every click event in MongoDB
    ua = parse(user_agent)
    
    # Determine device type
    if ua.is_mobile:
        device = "mobile"
    elif ua.is_tablet:
        device = "tablet"
    else:
        device = "desktop"
    
    # Simple geo‑lookup (optional, can add later)
    # For now, store IP hash only
    ip_hash = hashlib.sha256(ip.encode()).hexdigest()
    
    click_doc = {
        "slug": slug,
        "timestamp": datetime.utcnow(),
        "ip_hash": ip_hash,
        "device": device,
        "browser": ua.browser.family,
        "referrer": referer,
        # country, city – we'll add later with a free API
    }
    
    db = get_mongo_db()
    await db.clicks.insert_one(click_doc)