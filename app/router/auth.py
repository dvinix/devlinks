from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets
from firebase_admin._auth_utils import InvalidIdTokenError
from app.db.postgres import get_db
from app.models.users import Users
from app.schemas.user import FirebaseAuthRequest, UserRegister, UserLogin, TokenResponse, UserResponse
from app.schemas.user import RefreshRequest
from app.core.security import verify_password, create_access_token, create_refresh_token, hash_password, verify_refresh_token
from app.core.dependencies import get_current_user
from app.core.firebase_auth import verify_firebase_id_token

router = APIRouter() 


def _create_token_response(user_id: str) -> TokenResponse:
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")



@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Users = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user



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
    

    return _create_token_response(str(user.id))


@router.post("/refresh")
async def refresh_token(payload: RefreshRequest):
    user_id = verify_refresh_token(payload.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    access_token = create_access_token(user_id)
    return {"access_token": access_token}


@router.post("/firebase", response_model=TokenResponse)
async def firebase_login(payload: FirebaseAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = verify_firebase_id_token(payload.id_token)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )
    except InvalidIdTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
        )

    email = decoded.get("email")
    email_verified = decoded.get("email_verified", False)

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase email is missing or not verified",
        )

    existing_user = await db.execute(
        select(Users).where(Users.email == email)
    )
    user = existing_user.scalar_one_or_none()

    if not user:
        user = Users(
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return _create_token_response(str(user.id))
    
