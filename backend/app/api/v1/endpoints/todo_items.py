from fastapi import APIRouter, Depends, HTTPException
from app.logging_config import backend_logger as logger
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.crud.crud_todo_item import crud_todo_item
from app.db.schemas.todo_item import TodoItem, TodoItemCreate, TodoItemUpdate
from app.db.connections import get_db

router = APIRouter()

@router.get("/todo_items/", response_model=List[TodoItem])
async def read_todo_items(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    list_id: int | None = None,
):
    """
    Retrieve todo_items.
    """
    items = await crud_todo_item.get_multi_by_list(db, list_id=list_id, skip=skip, limit=limit)
    return items

@router.post("/todo_items/", response_model=TodoItem)
async def create_todo_item(
    *,
    db: AsyncSession = Depends(get_db),
    item_in: TodoItemCreate,
):
    """
    Create new todo_item.
    """
    item = await crud_todo_item.create(db=db, obj_in=item_in)
    return item

@router.put("/todo_items/{item_id}", response_model=TodoItem)
async def update_todo_item(
    *,
    db: AsyncSession = Depends(get_db),
    item_id: int,
    item_in: TodoItemUpdate,
):
    """
    Update a todo_item.
    """
    logger.info(f"recieved obj: {item_id}: {item_in}")
    item = await crud_todo_item.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="TodoItem not found")
    item = await crud_todo_item.update(db=db, db_obj=item, obj_in=item_in)
    return item

@router.delete("/todo_items/{item_id}", response_model=TodoItem)
async def delete_todo_item(
    *,
    db: AsyncSession = Depends(get_db),
    item_id: int,
):
    """
    Delete a todo_item.
    """
    item = await crud_todo_item.delete(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="TodoItem not found")
    return item