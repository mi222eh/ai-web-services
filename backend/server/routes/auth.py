import os
from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict
from ..middleware.auth import create_access_token, get_current_user, UserData
from ..config import settings

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    message: str

class AuthResponse(BaseModel):
    authenticated: bool

class LogoutResponse(BaseModel):
    message: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response) -> LoginResponse:
    print("Login attempt with password:", request.password)
    print("Expected password:", settings.AUTH_PASSWORD)
    if request.password != settings.AUTH_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token = create_access_token(
        data={"sub": "user"}, 
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    print("Setting cookie with token:", access_token)
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=False,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return LoginResponse(message="Successfully logged in")

@router.post("/logout", response_model=LogoutResponse)
async def logout(request: Request, response: Response) -> LogoutResponse:
    print("Logout called")
    print("Current cookies:", request.cookies)
    response.delete_cookie("access_token")
    print("Cookie deleted")
    return LogoutResponse(message="Successfully logged out")

@router.get("/check", response_model=AuthResponse)
async def check_auth(current_user: UserData = Depends(get_current_user)) -> AuthResponse:
    print("Auth check called, user:", current_user)
    return AuthResponse(authenticated=current_user["authenticated"]) 