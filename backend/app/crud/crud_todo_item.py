from typing import Sequence
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import CRUDBase
from app.models.todo_item import TodoItem
from app.db.schemas.todo_item import TodoItemCreate, TodoItemUpdate

class CRUDTodoItem(CRUDBase[TodoItem, TodoItemCreate, TodoItemUpdate]):
    async def get_multi_by_list(
        self, db: AsyncSession, *, list_id: int | None, skip: int = 0, limit: int = 100
    ) -> Sequence[TodoItem]:
        statement = select(self.model)
        if list_id is not None:
            statement = statement.where(self.model.list_id == list_id)
        statement = statement.offset(skip).limit(limit)
        result = await db.execute(statement)
        return result.scalars().all()

# Create a CRUD object for the TodoItem model,
# inheriting all the basic CRUD methods from the CRUDBase.
crud_todo_item = CRUDTodoItem(TodoItem)