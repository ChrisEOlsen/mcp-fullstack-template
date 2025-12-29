from sqlalchemy import Column, Integer, Text, String, Boolean, Float, Date, DateTime, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from app.db.base_class import Base

class TodoItem(Base):
    __tablename__ = "todo_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    completed = Column(Boolean, nullable=False)

    list_id = Column(Integer, ForeignKey("todo_lists.id"), nullable=True)
    todo_list = relationship("TodoList", back_populates="items")
    