from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.api.dashboard import router as dashboard_router
from app.api.analysis import router as analysis_router
from app.api.auth import router as auth_router
from app.core.config import settings


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered cybersecurity assistant",
    version=settings.APP_VERSION,
    # Disable Swagger UI docs in production to reduce attack surface
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)


allowed_origins = settings.get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {
        "message": "CyberSathi API is running",
        "status": "online",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get(
    "/favicon.ico",
    include_in_schema=False,
)
async def favicon():
    return Response(status_code=204)