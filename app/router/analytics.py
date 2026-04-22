from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
from app.db.mongo import get_mongo_db
from app.core.dependencies import get_current_user
from app.models.users import Users
from app.models.link import Link
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from sqlalchemy import select

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/{slug}")
async def get_link_analytics(
    slug: str,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    days: int = 30
):
    # 1. Verify user owns this link
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.user_id == current_user.id)
    )

    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(404, "Link not found or access denied")
    

    # 2. Query MongoDB
    mongo_db = get_mongo_db()
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Total clicks
    total = await mongo_db.clicks.count_documents({
        "slug": slug,
        "timestamp": {"$gte": since}
    })
    
    # Clicks per day
    daily_pipeline = [
        {"$match": {"slug": slug, "timestamp": {"$gte": since}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily = await mongo_db.clicks.aggregate(daily_pipeline).to_list(None)
    
    # Top devices
    device_pipeline = [
        {"$match": {"slug": slug}},
        {"$group": {"_id": "$device", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    devices = await mongo_db.clicks.aggregate(device_pipeline).to_list(None)
    
    # Top browsers
    browser_pipeline = [
        {"$match": {"slug": slug}},
        {"$group": {"_id": "$browser", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    browsers = await mongo_db.clicks.aggregate(browser_pipeline).to_list(None)

    source_pipeline = [
        {"$match": {"slug": slug}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]

    sources = await mongo_db.clicks.aggregate(source_pipeline).to_list(None)

    location_pipeline = [
        {"$match": {"slug": slug, "city": {"$ne": None}}},
        {"$group": {"_id": {"country": "$country", "city": "$city"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    
    locations = await mongo_db.clicks.aggregate(location_pipeline).to_list(None)
    
    return {
        "slug": slug,
        "total_clicks": total,
        "daily_clicks": daily,
        "devices": devices,
        "browsers": browsers,
        "sources": sources,
        "top_locations": locations,
        "period_days": days
    }