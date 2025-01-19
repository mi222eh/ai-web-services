from fastapi import Request, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, TypedDict, Any
from pydantic import BaseModel
from ..config import settings

# JWT settings
ALGORITHM = "HS256"

class TokenData(TypedDict):
    sub: str
    exp: int  # JWT expects timestamp

class UserData(TypedDict):
    authenticated: bool
    sub: Optional[str]

class TokenPayload(BaseModel):
    sub: str
    exp: int  # JWT expects timestamp

def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": int(expire.timestamp())})  # Convert to timestamp
    encoded_jwt = jwt.encode(to_encode, settings.AUTH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_token_from_cookie(request: Request) -> Optional[str]:
    cookie_authorization: Optional[str] = request.cookies.get("access_token")
    if not cookie_authorization:
        return None
    
    scheme, _, token = cookie_authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    
    return token

async def get_current_user(request: Request) -> UserData:
    print("Checking auth token in cookies")
    token: Optional[str] = request.cookies.get("access_token")
    print("Found token:", token)
    
    if not token or not token.startswith("Bearer "):
        print("No valid token found")
        return UserData(authenticated=False, sub=None)
        
    try:
        token_value = token.split(" ")[1]
        payload = jwt.decode(
            token_value, 
            settings.AUTH_SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print("Token payload:", payload)
        return UserData(authenticated=True, sub=payload.get("sub"))
    except JWTError as e:
        print("JWT Error:", str(e))
        return UserData(authenticated=False, sub=None)
    except Exception as e:
        print("Unexpected error:", str(e))
        return UserData(authenticated=False, sub=None)

async def require_auth_dependency(request: Request) -> bool:
    token = await get_token_from_cookie(request)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    try:
        payload = jwt.decode(token, settings.AUTH_SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        request.state.user = UserData(authenticated=True, sub=username)
        return True
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# For use as middleware
async def require_auth(request: Request) -> bool:
    return await require_auth_dependency(request) 