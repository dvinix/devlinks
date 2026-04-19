from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.models.users import Users
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.core.security import verify_password, create_access_token, hash_password 


router = APIRouter() 


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession=Depends(get_db)):

    existing_user = await db.execute(
        select(Users).where(Users.email == user_data.email)
    )

    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Email already regisetered..."
        )
    
    new_user = Users(
        email = user_data.email,
        hashed_password=hash_password(user_data.password)

    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user) ##

    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession=Depends(get_db)):

    
    result = await db.execute(
        select(Users).where(Users.email == user_data.email)
    )

    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    

    access_token = create_access_token(str(user.id))
    refresh_token = create_access_token(str(user.id))


    return {
        "acsess_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
    
