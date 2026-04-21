from ast import Pass
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from argon2 import PasswordHasher
from app.core.config import settings


ph = PasswordHasher(
    time_cost=2,  # Number of iterations
    memory_cost=1024,  
    parallelism=2,
    hash_len=32,
    salt_len=16
)

def hash_password(password: str) -> str:
    return ph.hash(password)




def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False
    



#### rehash is needed Nigga?

def needs_rehash(hashed_password: str) -> bool:
    return ph.check_needs_rehash(hashed_password)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc)
    }


    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)



def create_refresh_token(user_id:str) -> str:  ## refresh token --> to get new access tkn without re-auth
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

    payload = {
         "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
        "iat": datetime.now(timezone.utc)
    }

    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str)->dict | None:

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        
        )
        return payload
    except JWTError as e:
        return None   ## Token Expire hogya bkl... abh kon dega...



def verify_access_token(token: str)->str | None:

    payload = decode_token(token)

    if not payload:
        return None
    
    if payload.get("type") != "access":
        return None
    
    return payload.get("sub")




def verify_refresh_token(token: str)->str | None:

    payload = decode_token(token)

    if not payload:
        return None
    
    if payload.get("type") != "refresh":
        return None
    
    return payload.get("sub")