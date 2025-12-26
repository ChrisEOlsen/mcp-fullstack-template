from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.crud.crud_user import user as crud_user
from app.db import connections
from app.db.schemas.user import User, UserCreate, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[User])
async def read_users(
    db: AsyncSession = Depends(connections.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve users.
    """
    users = await crud_user.get_multi(db, skip=skip, limit=limit)
    return users


@router.post("/", response_model=User)
async def create_user(
    *,
    db: AsyncSession = Depends(connections.get_db),
    user_in: UserCreate,
):
    """
    Create new user.
    """
    user = await crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = await crud_user.create(db, obj_in=user_in)
    return user


@router.get("/{user_id}", response_model=User)
async def read_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(connections.get_db),
):
    """
    Get a specific user by id.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=User)
async def update_user(
    *,
    db: AsyncSession = Depends(connections.get_db),
    user_id: int,
    user_in: UserUpdate,
):
    """
    Update a user.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user = await crud_user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/{user_id}", response_model=User)
async def delete_user(
    *,
    db: AsyncSession = Depends(connections.get_db),
    user_id: int,
):
    """
    Delete a user.
    """
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = await crud_user.remove(db, id=user_id)
    return user
