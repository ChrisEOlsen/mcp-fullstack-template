from pydantic import BaseModel
from typing import Optional

# Pydantic model for creating a new TodoList
class TodoListCreate(BaseModel):
    title: str
    description: Optional[str] = None

# Pydantic model for updating a TodoList
# All fields are optional for partial updates
class TodoListUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

# Pydantic model for reading/returning a TodoList
# This is the base model that includes fields present in the database
class TodoList(BaseModel):
    id: int
    title: str
    description: Optional[str] = None

    class Config:
        from_attributes = True