from pydantic import BaseModel
from typing import Optional

# Pydantic model for creating a new TodoItem
class TodoItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool
    list_id: Optional[int] = None

# Pydantic model for updating a TodoItem
# All fields are optional for partial updates
class TodoItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    list_id: Optional[int] = None

# Pydantic model for reading/returning a TodoItem
# This is the base model that includes fields present in the database
class TodoItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    list_id: Optional[int] = None

    class Config:
        from_attributes = True