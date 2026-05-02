from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession 
from app.db.postgres import get_db
from app.schemas.link import LinkResponse
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkResponse
from app.services.link_service import generate_unique_slug
from app.core.dependencies import get_current_user
from app.models.users import Users
from app.core.config import settings
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
from sqlalchemy import select
import re

router = APIRouter()


# Accept both `/links` and `/links/` (otherwise `/links` gets captured by `/{slug}` redirect route)
@router.post("", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    link_data: LinkCreate,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    RESERVED_SLUGS = {
        "auth",
        "links",
        "analytics",
        "docs",
        "redoc",
        "openapi.json",
        "health",
    }

    slug: str
    is_custom = False

    if link_data.custom_slug:
        candidate = link_data.custom_slug.strip()
        if not re.fullmatch(r"[A-Za-z0-9_-]{3,32}", candidate):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="custom_slug must be 3-32 chars and only use letters, numbers, '_' or '-'",
            )
        if candidate.lower() in RESERVED_SLUGS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="custom_slug is reserved",
            )

        exists = await db.execute(select(Link).where(Link.slug == candidate))
        if exists.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="custom_slug is already taken",
            )

        slug = candidate
        is_custom = True
    else:
        slug = await generate_unique_slug(db)

    expires_at = link_data.expires_at
    if expires_at:
        # Frontend `datetime-local` sends no timezone; treat it as UTC to avoid accidental instant-expiry.
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at = expires_at.astimezone(timezone.utc)

        if expires_at <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="expires_at must be in the future",
            )

    new_link = Link(
        user_id=current_user.id,
        original_url=str(link_data.original_url),
        slug=slug,
        is_custom_slug=is_custom,
        expires_at=expires_at
    )

    db.add(new_link)
    await db.commit()
    await db.refresh(new_link)

    short_url = f"{settings.base_url}/{slug}"

    return LinkResponse(
        id=new_link.id,
        original_url=new_link.original_url,
        slug=new_link.slug,
        short_url=short_url,
        is_active=new_link.is_active,  
        created_at=new_link.created_at
    )



@router.get("", response_model=list[LinkResponse])
@router.get("/", response_model=list[LinkResponse])
async def get_user_links(
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all links for the current user"""
    result = await db.execute(
        select(Link)
        .where(Link.user_id == current_user.id)
        .order_by(Link.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    links = result.scalars().all()
    
    return [
        LinkResponse(
            id=link.id,
            original_url=link.original_url,
            slug=link.slug,
            short_url=f"{settings.base_url}/{link.slug}",
            is_active=link.is_active,
            created_at=link.created_at
        )
        for link in links
    ]


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    slug: str,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a link"""
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.user_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    await db.delete(link)
    await db.commit()
    
    return None