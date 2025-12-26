from app.logging_config import app_logger as logger
from fastapi import Request
from starlette.responses import JSONResponse
import os

from app.utils.hmac_validation import is_valid_hmac_signature

# --- Exempt Paths (can be configured as needed) ---
EXEMPT_PATHS = (
    "/docs",                 # Exempt Swagger UI
    "/openapi.json",         # Exempt OpenAPI schema
    "/auth/",                # Exempt all authentication-related paths
    "/favicon.ico",
    "/_next",                # Next.js internal paths
)

async def validate_tenant_middleware(request: Request, call_next):
    """
    Validates HMAC signature and the tenant domain for the request.
    """
    path = request.url.path
    if any(path.startswith(p) for p in EXEMPT_PATHS) or path == "/":
        return await call_next(request)
    if path.startswith("/webhooks/"):
        return await call_next(request)

    domain = request.headers.get("X-Tenant-Domain")
    signature = request.headers.get("X-Tenant-Signature")
    expected_tenant_domain = os.getenv("DOMAIN")

    if not domain or not signature:
        logger.warning("❌ Missing tenant headers")
        return JSONResponse(status_code=403, content={"detail": "Missing tenant signature headers"})

    if domain != expected_tenant_domain:
        logger.warning(f"❌ Invalid tenant domain: {domain}")
        return JSONResponse(status_code=403, content={"detail": "Forbidden: Unrecognized tenant"})

    if not await is_valid_hmac_signature(domain, signature):
        logger.warning(f"❌ Invalid HMAC for domain: {domain}")
        return JSONResponse(status_code=403, content={"detail": "Invalid tenant signature"})

    # Attach the resolved domain to the request state for use in endpoints
    request.state.domain_name = domain
    return await call_next(request)