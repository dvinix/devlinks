from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession 
from app.db.postgres import get_db 
from app.models.users import Users  
from app.core.security import decode_token


## Dependency to get the current user from the token in the Authorization header...

## ??HttpBearer is a FastAPI class that extracts the token from the 
## Authorization header of incoming requests.
security = HTTPBearer(auto_error=False)

async def  get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession  = Depends(get_db)
)-> Users:
    

    if not creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not Authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
     
    token  = creds.credentials  ## get the token string from the credentials object

    payload = decode_token(token)   ## decode krle mf... return payload


    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    ## Verify it's a access token not refresh token...

    if payload.get("type") != "access":  
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"}
        )
    

    user_id = payload.get("sub")  ##extrct USER_ID
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    

    ## fetch the user from the database using the extracted user_id
    result = await db.execute(
        select(Users).where(Users.id == user_id)   
    )
    user = result.scalar_one_or_none()


    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled" 
        )
    
    return user
    

    