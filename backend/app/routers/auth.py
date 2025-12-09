from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from ..schemas import (
    LoginCredentials,
    SignupCredentials,
    User,
    ApiResponse,
    TokenResponse,
)
from ..database import db
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from token."""
    token = credentials.credentials
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@router.post("/login", response_model=ApiResponse)
async def login(credentials: LoginCredentials):
    """Login user and return access token."""
    user = db.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )

    return ApiResponse(
        success=True,
        data={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar"),
            "created_at": user["created_at"],
            "access_token": access_token,
            "token_type": "bearer",
        },
    )


@router.post("/signup", response_model=ApiResponse)
async def signup(credentials: SignupCredentials):
    """Create new user account."""
    if db.get_user_by_email(credentials.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        user = db.create_user(
            username=credentials.username,
            email=credentials.email,
            password=credentials.password,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )

    return ApiResponse(
        success=True,
        data={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar"),
            "created_at": user["created_at"],
            "access_token": access_token,
            "token_type": "bearer",
        },
    )


@router.get("/me", response_model=ApiResponse)
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current logged in user."""
    return ApiResponse(
        success=True,
        data={
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar": user.get("avatar"),
            "created_at": user["created_at"],
        },
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(user: dict = Depends(get_current_user)):
    """Logout user (token is invalidated client-side)."""
    return ApiResponse(success=True, data=None)
