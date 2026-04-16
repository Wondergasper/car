"""
FastAPI middleware for multi-tenant security.
Sets PostgreSQL app.current_org_id for RLS enforcement.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from sqlalchemy import text
from app.core.security import decode_access_token
from app.db.session import async_session


class OrganizationMiddleware(BaseHTTPMiddleware):
    """
    Extract org_id from JWT token and set it in PostgreSQL session.
    This enables Row-Level Security for all database queries.
    NOTE: Must return JSONResponse for errors — do NOT raise HTTPException
    from Starlette BaseHTTPMiddleware.
    """

    async def dispatch(self, request: Request, call_next):
        # Skip auth for public endpoints
        public_paths = ["/health", "/docs", "/redoc", "/openapi.json"]
        if request.url.path in public_paths or request.url.path.startswith("/api/auth/"):
            return await call_next(request)

        # Extract and verify token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing authentication"},
            )

        token = auth_header.replace("Bearer ", "")
        payload = decode_access_token(token)
        if not payload:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

        user_id = payload.get("sub")
        org_id = payload.get("org_id")

        if not org_id:
            return JSONResponse(
                status_code=403,
                content={"detail": "No organization associated with user"},
            )

        # Set org context in request state
        request.state.user_id = user_id
        request.state.org_id = org_id
        request.state.token_payload = payload

        response = await call_next(request)
        return response


async def get_db_with_org(org_id: str):
    """
    Get a database session with RLS org_id set.
    Use this in endpoints that need tenant-scoped data access.
    """
    async with async_session() as session:
        try:
            # Set the org_id for RLS
            await session.execute(
                text(f"SET LOCAL app.current_org_id = '{org_id}'")
            )
            yield session
        finally:
            await session.close()
