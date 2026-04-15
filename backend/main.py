from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.router import router as api_router
from app.core.config import get_settings
from app.middleware import OrganizationMiddleware
import logging

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="CAR-Bot API",
        description="Compliance Audit & Reporting Bot API based on NDPA 2023",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Organization/tenant isolation middleware
    app.add_middleware(OrganizationMiddleware)

    # Include API routes
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
