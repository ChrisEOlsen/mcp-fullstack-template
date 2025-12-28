from app.db.base import CRUDBase
from app.models.todo_list import TodoList
from app.db.schemas.todo_list import TodoListCreate, TodoListUpdate

# Create a CRUD object for the TodoList model,
# inheriting all the basic CRUD methods from the CRUDBase.
crud_todo_list = CRUDBase[TodoList, TodoListCreate, TodoListUpdate](TodoList)