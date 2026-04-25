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

router = APIRouter()


@router.post("/", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    link_data: LinkCreate,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    slug = await generate_unique_slug(db)

    new_link = Link(
        user_id=current_user.id,
        original_url=str(link_data.original_url),
        slug=slug,
        is_custom_slug = False,
        expires_at=link_data.expires_at
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