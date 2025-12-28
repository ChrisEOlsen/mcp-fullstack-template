import os
import subprocess
from mcp.server.fastmcp import FastMCP
from jinja2 import Environment, FileSystemLoader
from typing import List
from pydantic import BaseModel

# Initialize FastMCP
mcp = FastMCP("Backend MCP")

# --- Configuration ---
# Matches your cli.py paths
TEMPLATES_DIR = "/workspace/backend/app/templates"
WORKSPACE_DIR = "/workspace"
templates_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

# --- Helper Functions (Copied/Adapted from cli.py) ---
def to_pascal_case(snake_case: str) -> str: 
    return "".join(word.capitalize() for word in snake_case.split('_'))

def to_plural(snake_case: str) -> str:
    if snake_case.endswith('y'): return snake_case[:-1] + 'ies'
    if snake_case.endswith('s'): return snake_case + 'es'
    return snake_case + 's'

def type_to_sqlalchemy(field_type: str) -> str:
    mapping = {"string": "String", "text": "Text", "integer": "Integer", "float": "Float", "boolean": "Boolean", "date": "Date", "datetime": "DateTime", "uuid": "Uuid"}
    return mapping.get(field_type, "String")

def type_to_pydantic(field_type: str) -> str:
    mapping = {"string": "str", "text": "str", "integer": "int", "float": "float", "boolean": "bool", "date": "date", "datetime": "datetime", "uuid": "UUID"}
    return mapping.get(field_type, "str")

# --- MCP Tools ---

@mcp.tool()
def create_resource(resource_name: str, fields: List[str]):
    """
    Scaffolds the data layer: backend models, schemas, CRUD, endpoints, and frontend API handlers.
    Args:
        resource_name: The singular snake_case name (e.g., 'product_item').
        fields: List of fields in 'name:type:required' format (e.g. ['title:string:true']).
    """
    # Parse fields locally since we can't share the 'Field' class easily with pure strings input
    parsed_fields = []
    for f in fields:
        parts = f.split(':')
        if len(parts) != 3: 
            return f"Error: Field '{f}' must be in 'name:type:required' format."
        name, ftype, req = parts[0].strip(), parts[1].strip(), parts[2].strip().lower()
        if ftype not in ["string", "text", "integer", "float", "boolean", "date", "datetime", "uuid"]:
            return f"Error: Invalid field type: {ftype}"
        parsed_fields.append({"name": name, "type": ftype, "required": req in ['true', '1', 't', 'y', 'yes']})

    ctx = {
        "resource_name_snake": resource_name,
        "resource_name_pascal": to_pascal_case(resource_name),
        "resource_name_plural_snake": to_plural(resource_name),
        "fields": parsed_fields,
        "type_to_sqlalchemy": type_to_sqlalchemy,
        "type_to_pydantic": type_to_pydantic
    }

    base_paths = {
        "backend": os.path.join(WORKSPACE_DIR, "backend/app"),
        "frontend": os.path.join(WORKSPACE_DIR, "frontend/src")
    }

    # Using f-strings carefully to avoid syntax errors in python versions < 3.12 
    # (cli.py used nested quotes inside f-strings which works in newer python, keeping it safe here)
    r_snake = ctx["resource_name_snake"]
    r_plural = ctx["resource_name_plural_snake"]

    files_to_generate = {
        "backend/model.py.j2": os.path.join(base_paths["backend"], f"models/{r_snake}.py"),
        "backend/schema.py.j2": os.path.join(base_paths["backend"], f"db/schemas/{r_snake}.py"),
        "backend/crud.py.j2": os.path.join(base_paths["backend"], f"crud/crud_{r_snake}.py"),
        "backend/endpoint.py.j2": os.path.join(base_paths["backend"], f"api/v1/endpoints/{r_plural}.py"),
        "frontend/api_index.js.j2": os.path.join(base_paths["frontend"], f"pages/api/{r_plural}/index.js"),
        "frontend/api_id.js.j2": os.path.join(base_paths["frontend"], f"pages/api/{r_plural}/[{r_snake}_id].js"),
    }
    
    generated_list = []
    for template_name, output_path in files_to_generate.items():
        template = templates_env.get_template(template_name)
        rendered_content = template.render(ctx)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w") as f: 
            f.write(rendered_content)
        # Fix permissions so local user can edit
        try: os.chmod(output_path, 0o666)
        except: pass
        generated_list.append(output_path)

    # --- Modify backend router ---
    routers_file_path = os.path.join(base_paths["backend"], "api/v1/routers.py")
    if os.path.exists(routers_file_path):
        with open(routers_file_path, "r+") as f:
            content = f.read()
            new_import = f"from app.api.v1.endpoints import {r_plural}"
            if new_import not in content:
                lines = content.splitlines()
                imports = [line for line in lines if line.startswith("from")]
                other_lines = [line for line in lines if not line.startswith("from") and line.strip()]
                
                if new_import not in imports:
                    imports.append(new_import)
                    imports.sort()
                
                content = "\n".join(imports) + "\n\n" + "\n".join(other_lines)
            
            new_router = f"api_router.include_router({r_plural}.router)"
            if new_router not in content:
                content += f"\n{new_router}"
            
            f.seek(0); f.write(content); f.truncate()

    # --- Modify models/__init__.py ---
    models_init_path = os.path.join(base_paths["backend"], "models/__init__.py")
    if os.path.exists(models_init_path):
        new_model_import = f"from .{r_snake} import {ctx['resource_name_pascal']}"
        with open(models_init_path, "r+") as f:
            lines = f.read().splitlines()
            if new_model_import not in lines:
                f.write(f"\n{new_model_import}")

    return f"Created resource {resource_name}. Generated {len(generated_list)} files."

@mcp.tool()
def apply_migrations(message: str = "New migration"):
    """
    Generates and applies database migrations using Alembic.
    """
    try:
        # Run revision
        result_rev = subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", message],
            capture_output=True, text=True, cwd=os.path.join(WORKSPACE_DIR, "backend")
        )
        if result_rev.returncode != 0:
            return f"Error creating revision: {result_rev.stderr}"

        # Run upgrade
        result_up = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True, text=True, cwd=os.path.join(WORKSPACE_DIR, "backend")
        )
        if result_up.returncode != 0:
            return f"Error applying migrations: {result_up.stderr}"

        return "Database migrations applied successfully."
    except Exception as e:
        return f"Unexpected error: {str(e)}"

if __name__ == "__main__":
    mcp.run()