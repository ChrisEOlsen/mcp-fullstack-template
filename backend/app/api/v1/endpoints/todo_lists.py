from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.crud.crud_todo_list import crud_todo_list
from app.db.schemas.todo_list import TodoList, TodoListCreate, TodoListUpdate
from app.db.connections import get_db

router = APIRouter()

@router.get("/todo_lists/", response_model=List[TodoList])
async def read_todo_lists(
    db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100
):
    """
    Retrieve todo_lists.
    """
    items = await crud_todo_list.get_multi(db, skip=skip, limit=limit)
    return items

@router.post("/todo_lists/", response_model=TodoList)
async def create_todo_list(
    *,
    db: AsyncSession = Depends(get_db),
    item_in: TodoListCreate,
):
    """
    Create new todo_list.
    """
    item = await crud_todo_list.create(db=db, obj_in=item_in)
    return item

@router.put("/todo_lists/{item_id}", response_model=TodoList)
async def update_todo_list(
    *,
    db: AsyncSession = Depends(get_db),
    item_id: int,
    item_in: TodoListUpdate,
):
    """
    Update a todo_list.
    """
    item = await crud_todo_list.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="TodoList not found")
    item = await crud_todo_list.update(db=db, db_obj=item, obj_in=item_in)
    return item

@router.delete("/todo_lists/{item_id}", response_model=TodoList)
async def delete_todo_list(
    *,
    db: AsyncSession = Depends(get_db),
    item_id: int,
):
    """
    Delete a todo_list.
    """
    item = await crud_todo_list.delete(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="TodoList not found")
    return item