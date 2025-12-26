# Gemini Workflow: Full-Stack Resource Addition Guide

This document outlines the complete, step-by-step recipe for adding a new resource to this application. Following this pattern ensures consistency, maintainability, and scalability.

We will use the example of adding a new resource called **"Widget"**.

---

## Part 1: The Backend (5 Steps)

The backend is responsible for the data model, business logic, and API endpoints.

### Step 1: Create the Database Model
Define the resource's table schema in the database.

1.  **Create file**: `/backend/app/models/widget.py`
2.  **Add code**:
    ```python
    # /backend/app/models/widget.py
    from sqlalchemy import Column, String, Integer, Text
    from .user import Base # Assuming Base is already defined in another model or a base file

    class Widget(Base):
        __tablename__ = "widgets"
        id = Column(Integer, primary_key=True, index=True)
        name = Column(String, index=True, nullable=False)
        description = Column(Text, nullable=True)
    ```
3.  **Make it discoverable**: Import the new model in `/backend/app/models/__init__.py` so that the automatic table creation on startup can find it.

### Step 2: Define the Pydantic Schemas
Define the data shapes for API validation, serialization, and documentation.

1.  **Create file**: `/backend/app/db/schemas/widget.py`
2.  **Add code**:
    ```python
    # /backend/app/db/schemas/widget.py
    from pydantic import BaseModel
    from typing import Optional

    class WidgetBase(BaseModel):
        name: str
        description: Optional[str] = None

    class WidgetCreate(WidgetBase):
        pass

    class WidgetUpdate(WidgetBase):
        pass

    class WidgetInDBBase(WidgetBase):
        id: int
        class Config:
            from_attributes = True

    class Widget(WidgetInDBBase):
        pass
    ```

### Step 3: Create the CRUD Logic
Create the reusable functions for Create, Read, Update, and Delete (CRUD) database operations.

1.  **Create file**: `/backend/app/crud/crud_widget.py`
2.  **Add code**:
    ```python
    # /backend/app/crud/crud_widget.py
    from app.db.base import CRUDBase
    from app.models.widget import Widget
    from app.db.schemas.widget import WidgetCreate, WidgetUpdate

    class CRUDWidget(CRUDBase[Widget, WidgetCreate, WidgetUpdate]):
        pass

    widget = CRUDWidget(Widget)
    ```

### Step 4: Create the API Endpoint (Router)
Expose the CRUD logic to the outside world via HTTP endpoints.

1.  **Create file**: `/backend/app/api/v1/endpoints/widget.py`
2.  **Add code**:
    ```python
    # /backend/app/api/v1/endpoints/widget.py
    from fastapi import APIRouter, Depends, HTTPException
    from sqlalchemy.ext.asyncio import AsyncSession
    from typing import List

    from app.crud.crud_widget import widget as crud_widget
    from app.db import connections
    from app.db.schemas.widget import Widget, WidgetCreate, WidgetUpdate

    router = APIRouter()

    @router.post("/", response_model=Widget)
    async def create_widget(widget_in: WidgetCreate, db: AsyncSession = Depends(connections.get_db)):
        return await crud_widget.create(db, obj_in=widget_in)

    @router.get("/", response_model=List[Widget])
    async def read_widgets(db: AsyncSession = Depends(connections.get_db), skip: int = 0, limit: int = 100):
        return await crud_widget.get_multi(db, skip=skip, limit=limit)

    # ... Implement other endpoints (GET by ID, PUT, DELETE) following the same pattern ...
    ```

### Step 5: Include the New Router
Register the new endpoints with the main FastAPI application.

1.  **Edit file**: `/backend/app/api/v1/routers.py`
2.  **Modify code**:
    ```python
    # /backend/app/api/v1/routers.py
    from fastapi import APIRouter
    from app.api.v1.endpoints import users, widget # 1. Import

    api_router = APIRouter()
    api_router.include_router(users.router, prefix="/users", tags=["Users"])
    api_router.include_router(widget.router, prefix="/widgets", tags=["Widgets"]) # 2. Include
    ```

---

## Part 2: The Frontend (3 Steps)

The frontend is responsible for providing the user interface to interact with the new resource.

### Step 1: Create the API Service
Create a dedicated module to handle all API calls for the new resource.

1.  **Create file**: `/frontend/src/services/api/widgets.js`
2.  **Add code**:
    ```javascript
    // /frontend/src/services/api/widgets.js
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    export const fetchWidgets = async () => {
        const response = await fetch(`${API_BASE_URL}/v1/widgets/`);
        // ... error handling ...
        return await response.json();
    };

    export const createWidget = async (widgetData) => {
        const response = await fetch(`${API_...}/v1/widgets/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(widgetData),
        });
        // ... error handling ...
        return await response.json();
    };

    // ... etc. for update, delete ...
    ```

### Step 2: Create the Page Component
Build the user-facing view to display and manage the resource.

1.  **Create file**: `/frontend/src/pages/WidgetsPage.js`
2.  **Add code**: This component will import the API service functions, manage state, and render the HTML.
    ```javascript
    // /frontend/src/pages/WidgetsPage.js
    import { fetchWidgets, createWidget } from '../services/api/widgets.js';

    export const WidgetsPage = () => {
        // Use setTimeout to add event listeners after initial render
        setTimeout(() => {
            const form = document.getElementById('create-widget-form');
            form.addEventListener('submit', async (e) => {
                // ... handle form submission, call createWidget ...
            });

            // Initial data fetch
            const widgets = await fetchWidgets();
            // ... render widgets to the page ...
        }, 0);

        return `
            <div class="p-8">
                <h1 class="text-4xl font-bold">Manage Widgets</h1>
                <form id="create-widget-form">
                    <!-- Form inputs -->
                </form>
                <div id="widgets-list">
                    <!-- Widgets will be rendered here -->
                </div>
            </div>
        `;
    };
    ```

### Step 3: Add the Page to the Router
Make the new page accessible via a URL.

1.  **Edit file**: `/frontend/src/router/index.js`
2.  **Modify code**:
    ```javascript
    // /frontend/src/router/index.js
    import { HomePage } from '../pages/HomePage.js';
    import { WidgetsPage } from '../pages/WidgetsPage.js'; // 1. Import

    const routes = {
        '/': HomePage,
        '/widgets': WidgetsPage, // 2. Add route
    };
    // ... rest of file
    ```
3.  **Add a link**: For easy navigation, add a link to the new page in a shared component like `/frontend/src/components/Header.js`.
