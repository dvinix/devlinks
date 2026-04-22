import hashlib
from datetime import datetime
from weakref import ref
import httpx
import httpx
from user_agents import parse
from app.db.mongo import get_mongo_db
from loguru import logger  # or just print for now
from urllib.parse import urlparse
import httpx 



REFERRER_MAP = {

    'whatsapp.com': 'WhatsApp',
    'facebook.com': 'Facebook',
    'x.com': 'X',
    'reddit.com': 'Reddit',
    'linkedin.com': 'LinkedIn',
    'instagram.com': 'Instagram',
}   


def parse_referrer(referer_url: str) -> str:

    if not referer_url:
        return "Direct"
    

    try:
        parsed = urlparse(referer_url)
        domain = parsed.netloc
        if domain.startswith('www.'):
            domain  = domain[4:]
        
        return REFERRER_MAP.get(domain, domain)
    
    except Exception:
        return "Unknown"
    

async def record_click(slug: str, request, ip: str, user_agent: str, referer: str = None):

    try:

        country, city = None, None
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"http://ip-api.com/json/{ip}?fields=country,city,status")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success":
                        country = data.get("country")
                        city = data.get("city")

        except Exception as e:
                print(f"Geo lookup failed: {e}")


    
        ua = parse(user_agent)
        if ua.is_mobile:
            device = "mobile"

        elif ua.is_tablet:
            device = "tablet"

        else:
            device = "desktop"

    
        src = parse_referrer(referer)
        ip_hash  = hashlib.sha256(ip.encode()).hexdigest() 

        click_doc = {
            "slug": slug,
            "timestamp": datetime.utcnow(),
            "ip_hash": ip_hash,
            "device": device,
            "browser": ua.browser.family,
            "referrer": src,
            "country": country if 'country' in locals() else None,
            "city": city if 'city' in locals() else None
        }

        db = get_mongo_db()
        result = await db.clicks.insert_one(click_doc)
        print(f"✅ Click recorded for {slug}: {result.inserted_id}")

    except Exception as e:
        print(f"❌ Failed to record click: {e}")
        import traceback
        traceback.print_exc()

       