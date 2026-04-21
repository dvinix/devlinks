from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.db.redis import get_redis
from app.models.link import Link
from datetime import datetime
import time

from app.services.analytics_service import record_click

router = APIRouter(tags=["redirect"])



@router.get("/{slug}")
async def redirect(
    slug: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    redis_client = Depends(get_redis)
):
    start = time.perf_counter()
    


    #Try Redis cache
    cached_url = await redis_client.get(f"link:{slug}")
    if cached_url:
        elapsed = (time.perf_counter() - start) * 1000
        print(f":) REDIS HIT: {elapsed:.2f}ms - {slug} -> {cached_url[:50]}")
        return RedirectResponse(url=cached_url, status_code=307)
    
    #Cache miss - query PostgreSQL
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.is_active == True)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link has expired")
    
    #Store in Redis for 24 hours
    await redis_client.setex(f"link:{slug}", 86400, link.original_url)
    
    elapsed = (time.perf_counter() - start) * 1000
    print(f" :( REDIS MISS (PostgreSQL): {elapsed:.2f}ms - {slug} -> {link.original_url[:50]}")

    background_tasks.add_task(
        record_click,
        slug,
        request,
        request.client.host,
        request.headers.get("user-agent", "unknown"),  
        request.headers.get("referer")
    )
    
    return RedirectResponse(url=link.original_url, status_code=307)


