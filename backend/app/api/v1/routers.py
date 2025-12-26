from fastapi import APIRouter
from app.api.v1.endpoints import users
from app.api.v1.endpoints import hello

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(hello.router, prefix="/hello", tags=["Hello"])
