from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.models.link import Link
from datetime import datetime

router = APIRouter(tags=["redirect"])

@router.get("/{slug}")
async def redirect(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.is_active == True)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(404, "Link not found")
    if link.expires_at and link.expires_at < datetime.utcnow():
        raise HTTPException(410, "Link expired")
    return RedirectResponse(url=link.original_url, status_code=307)