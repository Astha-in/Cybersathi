import secrets
from typing import Optional
from urllib.parse import quote, urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        auth_provider="local",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/refresh")
def refresh_access_token(
    refresh_token: str,
):
    try:
        payload = jwt.decode(
            refresh_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        access_token = create_access_token(
            data={"sub": str(user_id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


# ─── Google OAuth Flow ─────────────────────────────────────────────────────────


@router.get("/google/login")
def google_login():
    """Initiates Google OAuth 2.0 authorization code flow."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        error_msg = quote("Google OAuth is not configured on the server.")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    # Generate a signed state token for CSRF protection
    state = jwt.encode(
        {"csrf": secrets.token_hex(16), "type": "oauth_state"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent select_account",
        "include_granted_scopes": "true",
        "state": state,
    }

    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    print(f"\n[GOOGLE OAUTH] Initiating Auth URL: {url}\n")
    return RedirectResponse(url=url)


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Handles callback from Google OAuth and exchanges code for user profile."""
    print(f"\n[GOOGLE OAUTH] Received Callback Query Params: {dict(request.query_params)}\n")

    if error:
        detail = error_description or error
        error_msg = quote(f"Google login failed: {detail}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    if not code:
        # Check if Google provided any detail in query params
        params_str = ", ".join(f"{k}={v}" for k, v in request.query_params.items())
        error_msg = quote(
            f"Authorization code was not provided by Google. Received params: [{params_str}]. "
            "Please ensure your email is added under 'Test users' in Google Cloud Console."
        )
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    # Validate CSRF state
    if not state:
        error_msg = quote("Invalid state parameter in Google callback.")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    try:
        payload = jwt.decode(
            state,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "oauth_state":
            raise ValueError("Invalid state payload")
    except Exception:
        error_msg = quote("OAuth state verification failed. Please try again.")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    # Exchange authorization code for Google tokens
    token_payload = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data=token_payload,
            )
        except Exception as exc:
            print(f"\n[GOOGLE OAUTH] ERROR Token exchange connection error: {exc}\n")
            error_msg = quote("Failed to connect to Google token exchange endpoint.")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
            )

        if token_response.status_code != 200:
            print(f"\n[GOOGLE OAUTH] ERROR Token exchange failed [{token_response.status_code}]: {token_response.text}\n")
            error_msg = quote("Google rejected token authorization code exchange.")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
            )

        token_data = token_response.json()
        google_access_token = token_data.get("access_token")

        if not google_access_token:
            error_msg = quote("No access token returned from Google.")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
            )

        # Retrieve user profile from Google UserInfo
        try:
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {google_access_token}"},
            )
        except Exception as exc:
            print(f"\n[GOOGLE OAUTH] ERROR UserInfo fetch error: {exc}\n")
            error_msg = quote("Failed to retrieve profile from Google.")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
            )

        if userinfo_response.status_code != 200:
            print(f"\n[GOOGLE OAUTH] ERROR UserInfo failed [{userinfo_response.status_code}]: {userinfo_response.text}\n")
            error_msg = quote("Google userinfo verification failed.")
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
            )

        profile = userinfo_response.json()
        print(f"\n[GOOGLE OAUTH] OK Profile received: sub={profile.get('sub')}, email={profile.get('email')}, verified={profile.get('email_verified')}\n")

    google_id = profile.get("sub")
    email = profile.get("email")
    email_verified = profile.get("email_verified", False)
    name = profile.get("name") or (email.split("@")[0] if email else "User")
    picture = profile.get("picture")

    if not google_id or not email or not email_verified:
        print(f"\n[GOOGLE OAUTH] ERROR Profile incomplete: google_id={google_id}, email={email}, verified={email_verified}\n")
        error_msg = quote(
            "Google account email is unverified or incomplete."
        )
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    # Find existing user by google_id or verified email
    print(f"\n[GOOGLE OAUTH] LOOKUP user: google_id={google_id}, email={email}\n")
    try:
        user = db.scalar(
            select(User).where(User.google_id == google_id)
        )
    except Exception as exc:
        print(f"\n[GOOGLE OAUTH] ERROR DB lookup error: {exc}\n")
        error_msg = quote("Database error during Google login. Ensure migrations are applied (alembic upgrade head).")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error_msg}"
        )

    if not user:
        # Check if an account already exists with the same verified email
        user = db.scalar(
            select(User).where(User.email == email)
        )

        if user:
            # Safely link Google identity to existing account
            user.google_id = google_id
            if picture and not user.avatar_url:
                user.avatar_url = picture
            db.commit()
            db.refresh(user)
        else:
            # Create new user for Google login
            user = User(
                name=name,
                email=email,
                google_id=google_id,
                auth_provider="google",
                avatar_url=picture,
                password_hash=None,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # Issue CyberSathi's own JWT access & refresh tokens
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)}
    )

    # Redirect to frontend callback route with URL fragment
    fragment_params = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
    }

    redirect_url = f"{settings.FRONTEND_URL}/google-callback#{urlencode(fragment_params)}"
    return RedirectResponse(url=redirect_url)