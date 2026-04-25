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



@router.get("/{slug}")
async def redirect_to_url(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.is_active == True)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    ## Check Expiration...
    if link.expires_at and link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Link has expired")
    

    return RedirectResponse(url=link.original_url, status_code=307)