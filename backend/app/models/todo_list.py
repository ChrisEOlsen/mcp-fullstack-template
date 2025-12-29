from sqlalchemy import Column, Integer, Text, String, Boolean, Float, Date, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TodoList(Base):
    __tablename__ = "todo_lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)

    items = relationship("TodoItem", back_populates="todo_list")
    