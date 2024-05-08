from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import qrcode
import io

from app.db.postgres import get_db
from app.models.link import Link
from app.models.users import Users
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/{slug}/qr")
async def generate_qr_code(
    slug: str,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate QR code for a shortened link.
    Returns PNG image.
    """
    # Verify user owns this link
    result = await db.execute(
        select(Link).where(Link.slug == slug, Link.user_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found or access denied")
    
    # Construct short URL from slug
    # Use the base URL from settings and append the slug
    base_url = settings.base_url.rstrip('/')
    short_url = f"{base_url}/{link.slug}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(short_url)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to bytes buffer
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    
    # Return as streaming response
    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="{slug}-qr.png"'
        }
    )
