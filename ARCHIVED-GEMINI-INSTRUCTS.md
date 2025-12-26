# Instructions for Adding New Features

This document outlines the manual steps required to add different types of features, leveraging the established BFF (Backend-for-Frontend) pattern with signed requests and Next.js middleware for authentication/authorization.

## Table of Contents
1.  Adding a New API Resource (Backend Endpoint + Frontend Handler)
2.  Adding a User Login Protected Endpoint
3.  Adding an Admin-Only Protected Endpoint

---

### 1. Adding a New API Resource (Backend Endpoint + Frontend Handler)

This involves creating a new model, schema, CRUD operations, a new endpoint in the FastAPI backend, and corresponding API handlers (`index.js` and `[id].js`) in the Next.js frontend to securely communicate with it.

**Backend Steps:**

a.  **Create SQLAlchemy Model File:**
    Create a new Python file in `backend/app/models/`, for example, `backend/app/models/my_resource.py`:

    ```python
    # backend/app/models/my_resource.py
    from sqlalchemy import Column, Integer, String, Boolean, DateTime
    from sqlalchemy.ext.declarative import declarative_base
    from datetime import datetime

    Base = declarative_base()

    class MyResource(Base):
        __tablename__ = "my_resources"

        id = Column(Integer, primary_key=True, index=True)
        title = Column(String, index=True, nullable=False)
        description = Column(String, nullable=True)
        is_active = Column(Boolean, default=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ```

b.  **Add Model to `backend/app/models/__init__.py`:**
    Open `backend/app/models/__init__.py` and add an import for your new model:

    ```python
    # backend/app/models/__init__.py
    from .user import User
    from .my_resource import MyResource # Add this line
    ```

c.  **Create Pydantic Schema File:**
    Create a new Python file in `backend/app/db/schemas/`, for example, `backend/app/db/schemas/my_resource.py`:

    ```python
    # backend/app/db/schemas/my_resource.py
    from pydantic import BaseModel, Field
    from datetime import datetime
    from typing import Optional

    class MyResourceBase(BaseModel):
        title: str = Field(..., example="My Resource Title")
        description: Optional[str] = Field(None, example="A brief description of my resource.")
        is_active: bool = Field(True, example=True)

    class MyResourceCreate(MyResourceBase):
        pass # No additional fields needed for creation beyond base

    class MyResourceUpdate(MyResourceBase):
        title: Optional[str] = None
        description: Optional[str] = None
        is_active: Optional[bool] = None

    class MyResourceInDBBase(MyResourceBase):
        id: int
        created_at: datetime
        updated_at: datetime

        class Config:
            from_attributes = True

    class MyResource(MyResourceInDBBase):
        pass # Use this for API responses
    ```

d.  **Create CRUD Operations File (Leveraging CRUDBase):**
    Create a new Python file in `backend/app/crud/`, for example, `backend/app/crud/crud_my_resource.py`:

    ```python
    # backend/app/crud/crud_my_resource.py
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.db.base import CRUDBase
    from app.models.my_resource import MyResource
    from app.db.schemas.my_resource import MyResourceCreate, MyResourceUpdate
    from typing import Optional, List

    class CRUDMyResource(CRUDBase[MyResource, MyResourceCreate, MyResourceUpdate]):
        # You can add custom CRUD methods here if needed, e.g., get_by_title
        async def get_by_title(self, db: AsyncSession, *, title: str) -> Optional[MyResource]:
            # Example of a custom method
            from sqlalchemy.future import select # Import here to avoid circular dependency if MyResource is also in this file
            statement = select(self.model).where(self.model.title == title)
            result = await db.execute(statement)
            return result.scalar_one_or_none()

    my_resource_crud = CRUDMyResource(MyResource)
    ```

e.  **Create FastAPI Endpoint File:**
    Create a new Python file in `backend/app/api/v1/endpoints/`, for example, `backend/app/api/v1/endpoints/my_resources.py`:

    ```python
    # backend/app/api/v1/endpoints/my_resources.py
    from fastapi import APIRouter, Depends, HTTPException
    from sqlalchemy.ext.asyncio import AsyncSession
    from typing import List

    from app.db.connections import get_session
    from app.db.schemas.my_resource import MyResource, MyResourceCreate, MyResourceUpdate
    from app.crud.crud_my_resource import my_resource_crud

    router = APIRouter()

    @router.post("/", response_model=MyResource)
    async def create_my_resource(
        resource_in: MyResourceCreate,
        db: AsyncSession = Depends(get_session)
    ):
        return await my_resource_crud.create(db=db, obj_in=resource_in)

    @router.get("/{resource_id}", response_model=MyResource)
    async def read_my_resource(
        resource_id: int,
        db: AsyncSession = Depends(get_session)
    ):
        resource = await my_resource_crud.get(db=db, resource_id=resource_id)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return resource

    @router.get("/", response_model=List[MyResource])
    async def read_my_resources(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_session)
    ):
        return await my_resource_crud.get_multi(db=db, skip=skip, limit=limit)

    @router.put("/{resource_id}", response_model=MyResource)
    async def update_my_resource(
        resource_id: int,
        resource_in: MyResourceUpdate,
        db: AsyncSession = Depends(get_session)
    ):
        resource = await my_resource_crud.get(db=db, resource_id=resource_id)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return await my_resource_crud.update(db=db, db_obj=resource, obj_in=resource_in)

    @router.delete("/{resource_id}", response_model=MyResource)
    async def delete_my_resource(
        resource_id: int,
        db: AsyncSession = Depends(get_session)
    ):
        resource = await my_resource_crud.delete(db=db, id=resource_id) # Use .delete from CRUDBase
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return resource
    ```

f.  **Include Router in `backend/app/api/v1/routers.py`:**
    Open `backend/app/api/v1/routers.py` and add an import for your new endpoint, then include its router:

    ```python
    # backend/app/api/v1/routers.py
    from fastapi import APIRouter
    from app.api.v1.endpoints import users
    from app.api.v1.endpoints import hello
    from app.api.v1.endpoints import my_resources # Add this line (plural for resource)

    api_router = APIRouter()
    api_router.include_router(users.router, prefix="/users", tags=["Users"])
    api_router.include_router(hello.router, prefix="/hello", tags=["Hello"])
    api_router.include_router(my_resources.router, prefix="/my_resources", tags=["MyResources"]) # Add this line
    ```

g.  **Run Database Migrations:**
    After creating the model, you need to generate and apply a new Alembic migration to update your PostgreSQL database schema.

    ```bash
    # This command creates a new migration script
    docker compose exec backend alembic revision --autogenerate -m "Create my_resources table"

    # This command applies the pending migrations to the database
    docker compose exec backend alembic upgrade head
    ```

h.  **Restart Backend Service:**
    Rebuild and restart your `backend` Docker service to pick up the new endpoint and apply any code changes.

    ```bash
    docker compose restart backend
    ```

**Frontend Steps:**

a.  **Create Next.js API Handler (`index.js` for collection operations):**
    Create a new directory `frontend/src/pages/api/my_resources/` and then create `frontend/src/pages/api/my_resources/index.js`:

    ```javascript
    // frontend/src/pages/api/my_resources/index.js
    import { signedFetch } from "@/lib/signedFetch";
    // import { isAuthenticated } from "@/lib/auth"; // Uncomment and use for user authentication
    // import { isAdmin } from "@/lib/auth"; // Uncomment and use for admin authentication

    export default async function handler(req, res) {
      // if (!await isAuthenticated(req)) { // Example user authentication check
      //   return res.status(401).json({ error: "Unauthorized: Login required." });
      // }
      // if (!await isAdmin(req)) { // Example admin authentication check
      //   return res.status(403).json({ error: "Forbidden: Admin access required." });
      // }

      if (req.method === 'GET') {
        return handleGet(req, res);
      }

      if (req.method === 'POST') {
        return handlePost(req, res);
      }

      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    async function handleGet(req, res) {
      try {
        const backendResponse = await signedFetch("/my_resources");
        const data = await backendResponse.json();
        if (!backendResponse.ok) {
          return res.status(backendResponse.status).json({ error: data.detail || 'Failed to fetch my_resources' });
        }
        return res.status(200).json(data);
      } catch (err) {
        console.error("Error fetching my_resources:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }

    async function handlePost(req, res) {
      try {
        const backendResponse = await signedFetch("/my_resources", {
          method: 'POST',
          body: JSON.stringify(req.body),
        });
        const data = await backendResponse.json();
        if (!backendResponse.ok) {
          return res.status(backendResponse.status).json({ error: data.detail || 'Failed to create my_resource' });
        }
        return res.status(201).json(data);
      } catch (err) {
        console.error("Error creating my_resource:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    ```

b.  **Create Next.js API Handler (`[id].js` for item operations):**
    Create `frontend/src/pages/api/my_resources/[my_resource_id].js`:

    ```javascript
    // frontend/src/pages/api/my_resources/[my_resource_id].js
    import { signedFetch } from "@/lib/signedFetch";
    // import { isAuthenticated } from "@/lib/auth"; // Uncomment and use for user authentication
    // import { isAdmin } from "@/lib/auth"; // Uncomment and use for admin authentication

    export default async function handler(req, res) {
      // if (!await isAuthenticated(req)) { // Example user authentication check
      //   return res.status(401).json({ error: "Unauthorized: Login required." });
      // }
      // if (!await isAdmin(req)) { // Example admin authentication check
      //   return res.status(403).json({ error: "Forbidden: Admin access required." });
      // }

      const { my_resource_id } = req.query;

      if (req.method === 'GET') {
        return handleGet(req, res, my_resource_id);
      }

      if (req.method === 'PUT') {
        return handlePut(req, res, my_resource_id);
      }

      if (req.method === 'DELETE') {
        return handleDelete(req, res, my_resource_id);
      }

      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    async function handleGet(req, res, my_resource_id) {
      try {
        const backendResponse = await signedFetch(`/my_resources/${my_resource_id}`);
        const data = await backendResponse.json();
        if (!backendResponse.ok) {
          return res.status(backendResponse.status).json({ error: data.detail || 'Failed to fetch my_resource' });
        }
        return res.status(200).json(data);
      } catch (err) {
        console.error(`Error fetching my_resource ${my_resource_id}:`, err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }

    async function handlePut(req, res, my_resource_id) {
      try {
        const backendResponse = await signedFetch(`/my_resources/${my_resource_id}`, {
          method: 'PUT',
          body: JSON.stringify(req.body),
        });
        const data = await backendResponse.json();
        if (!backendResponse.ok) {
          return res.status(backendResponse.status).json({ error: data.detail || 'Failed to update my_resource' });
        }
        return res.status(200).json(data);
      } catch (err) {
        console.error(`Error updating my_resource ${my_resource_id}:`, err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }

    async function handleDelete(req, res, my_resource_id) {
      try {
        const backendResponse = await signedFetch(`/my_resources/${my_resource_id}`, {
          method: 'DELETE',
        });
        if (!backendResponse.ok) {
          const data = await backendResponse.json().catch(() => ({}));
          return res.status(backendResponse.status).json({ error: data.detail || 'Failed to delete my_resource' });
        }
        return res.status(204).end(); // No content to return on successful deletion
      } catch (err) {
        console.error(`Error deleting my_resource ${my_resource_id}:`, err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
    ```

c.  **Create a Frontend Page/Component (Optional):**
    You can now call `/api/my_resources` or `/api/my_resources/[id]` from any Next.js page or component (e.g., in `frontend/src/pages/my_resources.js` or a React component).

    ```javascript
    // frontend/src/pages/my_resources.js (Example usage)
    import React, { useState, useEffect } from 'react';

    const MyResourcesPage = () => {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchData = async () => {
                const fetchOptions = { method: 'GET' }; // Adjust method for POST/PUT/DELETE
                try {
                    const response = await fetch('/api/my_resources', fetchOptions);
                    const json = await response.json();
                    setData(json);
                } catch (error) {
                    console.error('Error fetching resource:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, []);

        if (loading) return <p>Loading...</p>;

        return (
            <div>
                <h1>My Resources Data</h1>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    };

    export default MyResourcesPage;
    ```

d.  **Restart Frontend Service:**
    Rebuild and restart your `frontend` Docker service.

---

### 2. Adding a User Login Protected Endpoint

This protects a frontend API handler (and its corresponding backend endpoint) so that only authenticated users can access it.

**Frontend Steps:**

a.  **Follow "Adding a New API Resource" Steps (Backend & Frontend Handlers):**
    First, create your backend endpoint, model, schema, CRUD, and frontend API handlers (`index.js` and `[id].js`) as described in Section 1. Let's assume your frontend API handler is at `/api/my_user_data` (which translates to `/api/my_user_data/index.js` and optionally `/api/my_user_data/[my_user_data_id].js`).

b.  **Enable Authentication Check in Frontend API Handlers:**
    In `frontend/src/pages/api/my_user_data/index.js` (and `[my_user_data_id].js` if applicable), uncomment and use the `isAuthenticated` check:

    ```javascript
    // frontend/src/pages/api/my_user_data/index.js
    import { signedFetch } from "@/lib/signedFetch";
    import { isAuthenticated } from "@/lib/auth"; // Uncomment this line
    // import { isAdmin } from "@/lib/auth";

    export default async function handler(req, res) {
      if (!await isAuthenticated(req)) { // Uncomment this block
        return res.status(401).json({ error: "Unauthorized: Login required." });
      }
      // ... rest of the handler logic ...
    }
    ```

c.  **Add Frontend API Base Path to `AUTH_REQUIRED_ROUTES`:**
    Open `frontend/src/middleware.js` and add the base path of your new API resource to the `AUTH_REQUIRED_ROUTES` array.

    ```javascript
    // frontend/src/middleware.js
    // ... other imports and constants ...

    // --- MCP will insert AUTH_REQUIRED_ROUTES here ---
    const AUTH_REQUIRED_ROUTES = [
      "/api/my_user_data", // Add your new API base path here
      // ... existing user-protected routes ...
    ];

    // --- MCP will insert ADMIN_ROUTES here ---
    const ADMIN_ROUTES = []; // Keep this if no admin routes yet

    // ... rest of the middleware ...
    ```
    *   **Note**: If your frontend also has a page (`/my_user_data`) that displays this data, you should add that page path to `AUTH_REQUIRED_ROUTES` as well.

d.  **Restart Frontend Service:**
    Rebuild and restart your `frontend` Docker service. Now, any unauthenticated requests to `/api/my_user_data/*` (or `/my_user_data` page) will be redirected to `/login`.

---

### 3. Adding an Admin-Only Protected Endpoint

This protects a frontend API handler (and its corresponding backend endpoint) so that only authenticated *admin* users can access it.

a.  **Follow "Adding a New API Resource" Steps (Backend & Frontend Handlers):**
    First, create your backend endpoint, model, schema, CRUD, and frontend API handlers (`index.js` and `[id].js`) as described in Section 1. Let's assume your frontend API resource is at `/api/admin/reports`.

b.  **Enable Admin Authentication Check in Frontend API Handlers:**
    In `frontend/src/pages/api/admin/reports/index.js` (and `[admin_report_id].js` if applicable), uncomment and use the `isAdmin` check:

    ```javascript
    // frontend/src/pages/api/admin/reports/index.js
    import { signedFetch } from "@/lib/signedFetch";
    // import { isAuthenticated } from "@/lib/auth";
    import { isAdmin } from "@/lib/auth"; // Uncomment this line

    export default async function handler(req, res) {
      if (!await isAdmin(req)) { // Uncomment this block
        return res.status(403).json({ error: "Forbidden: Admin access required." });
      }
      // ... rest of the handler logic ...
    }
    ```

c.  **Add Frontend API Base Path to `ADMIN_ROUTES`:**
    Open `frontend/src/middleware.js` and add the base path of your new API resource to the `ADMIN_ROUTES` array.

    ```javascript
    // frontend/src/middleware.js
    // ... other imports and constants ...

    // --- MCP will insert AUTH_REQUIRED_ROUTES here ---
    const AUTH_REQUIRED_ROUTES = [
      // ... existing user-protected routes ...
    ];

    // --- MCP will insert ADMIN_ROUTES here ---
    const ADMIN_ROUTES = [
      "/api/admin/reports", // Add your new API base path here
      // ... existing admin-protected routes ...
    ];

    // ... rest of the middleware ...
    ```
    *   **Note**: If your frontend also has an admin page (`/admin/reports`) that displays this data, you should add that page path to `ADMIN_ROUTES` as well.

d.  **Restart Frontend Service:**
    Rebuild and restart your `frontend` Docker service. Now, any non-admin requests to `/api/admin/reports/*` (or `/admin/reports` page) will be redirected to `/login?role=admin`.
