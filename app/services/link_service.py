import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.link import Link



alphabeet = string.ascii_letters + string.digits

async def generate_unique_slug(db: AsyncSession, length: int = 6) -> str:

    while True:
        slug = ''.join(random.choices(alphabeet, k=length))

        result = await db.execute(select(Link).where(Link.slug == slug))
        if not result.scalar_one_or_none():
            return slug


