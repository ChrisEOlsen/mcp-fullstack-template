from fastapi import APIRouter
from app.db.schemas.hello import HelloMessage

router = APIRouter(tags=["Hello"])

@router.get("/hello")
async def read_hello():
    return {"message": "Hello from FastAPI!"}

@router.post("/hello")
async def post_hello(message: HelloMessage):
    return {"message": f"Hello from FastAPI, received: {message.message}"}