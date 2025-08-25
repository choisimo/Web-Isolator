"""
FastAPI server for Web Isolator 2.0 Control Plane
"""
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = FastAPI(
    title="Web Isolator 2.0 Control Plane",
    description="API server for managing containerized development environments",
    version="2.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite/Next.js dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class ProjectCreate(BaseModel):
    workspace_id: str
    name: str
    path: str
    provider: str = "docker"


class ServiceCreate(BaseModel):
    name: str
    type: str
    port: Optional[int] = None
    image: Optional[str] = None
    dockerfile_path: Optional[str] = None
    command: Optional[str] = None
    environment: Dict[str, str] = {}


class EnvironmentVariableSet(BaseModel):
    key: str
    value: str
    is_secret: bool = False


class WorkspaceImport(BaseModel):
    workspace_data: Dict[str, Any]
    overwrite: bool = False


# Global instances (will be initialized on startup)
database_manager = None
workspace_manager = None
provider_factory = None


async def get_database():
    """Dependency to get database manager"""
    return database_manager


async def get_workspace_manager():
    """Dependency to get workspace manager"""
    return workspace_manager


async def get_provider_factory():
    """Dependency to get provider factory"""
    return provider_factory


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global database_manager, workspace_manager, provider_factory
    
    try:
        # Import modules (with fallback)
        try:
            from core.database import DatabaseManager
            from core.workspace_manager import WorkspaceManager
            from providers.factory import ProviderFactory
        except ImportError:
            print("Warning: Could not import all modules. Running in minimal mode.")
            return
        
        # Initialize components
        database_manager = DatabaseManager()
        workspace_manager = WorkspaceManager(database_manager)
        provider_factory = ProviderFactory()
        
        print("✅ Web Isolator 2.0 Control Plane started successfully")
        print(f"✅ Database: {database_manager.db_path}")
        
        # Check provider availability
        providers = provider_factory.list_available_providers()
        for name, available in providers.items():
            status = "✅" if available else "❌"
            print(f"{status} Provider {name}: {'available' if available else 'unavailable'}")
            
    except Exception as e:
        print(f"❌ Failed to initialize Control Plane: {e}")
        # Continue running in minimal mode


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "version": "2.0.0",
        "components": {
            "database": database_manager is not None,
            "workspace_manager": workspace_manager is not None,
            "provider_factory": provider_factory is not None
        }
    }
    
    if provider_factory:
        try:
            status["providers"] = provider_factory.list_available_providers()
        except:
            status["providers"] = {}
    
    return status


# Workspace endpoints
@app.get("/api/workspaces")
async def list_workspaces(db=Depends(get_database)):
    """List all workspaces"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        workspaces = db.list_workspaces()
        return workspaces
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workspaces")
async def create_workspace(workspace: WorkspaceCreate, db=Depends(get_database)):
    """Create a new workspace"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        workspace_id = db.create_workspace(workspace.name, workspace.description)
        return {"id": workspace_id, "name": workspace.name, "description": workspace.description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/workspaces/{workspace_id}")
async def get_workspace(workspace_id: str, db=Depends(get_database)):
    """Get workspace by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        workspace = db.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        return workspace
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/workspaces/current")
async def get_current_workspace(db=Depends(get_database)):
    """Get current/default workspace"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        workspace = db.get_current_workspace()
        if not workspace:
            raise HTTPException(status_code=404, detail="No workspace found")
        return workspace
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/workspaces/{workspace_id}")
async def delete_workspace(workspace_id: str, db=Depends(get_database)):
    """Delete a workspace"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.delete_workspace(workspace_id)
        return {"message": "Workspace deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Project endpoints
@app.get("/api/projects")
async def list_projects(workspace_id: Optional[str] = None, db=Depends(get_database)):
    """List projects, optionally filtered by workspace"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        projects = db.list_projects(workspace_id)
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects")
async def create_project(project: ProjectCreate, db=Depends(get_database)):
    """Create a new project"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        project_id = db.create_project(
            workspace_id=project.workspace_id,
            name=project.name,
            path=project.path,
            provider=project.provider
        )
        return {
            "id": project_id,
            "workspace_id": project.workspace_id,
            "name": project.name,
            "path": project.path,
            "provider": project.provider
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, db=Depends(get_database)):
    """Get project with full data (services, environment variables, etc.)"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        project = db.get_project_full_data(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/by-name/{project_name}")
async def get_project_by_name(project_name: str, db=Depends(get_database)):
    """Get project by name"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        project = db.get_project_by_name(project_name)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/projects/{project_id}/status")
async def update_project_status(project_id: str, status_update: Dict[str, str], db=Depends(get_database)):
    """Update project status"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        status = status_update.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Status field is required")
        
        db.update_project_status(project_id, status)
        return {"message": "Project status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, db=Depends(get_database)):
    """Delete a project"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.delete_project(project_id)
        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Service endpoints
@app.get("/api/projects/{project_id}/services")
async def list_services(project_id: str, db=Depends(get_database)):
    """List services for a project"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        services = db.list_services(project_id)
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{project_id}/services")
async def create_service(project_id: str, service: ServiceCreate, db=Depends(get_database)):
    """Create a new service"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        service_id = db.create_service(
            project_id=project_id,
            name=service.name,
            service_type=service.type,
            port=service.port,
            image=service.image,
            dockerfile_path=service.dockerfile_path,
            command=service.command
        )
        
        # Set environment variables
        for key, value in service.environment.items():
            db.set_environment_variable(service_id, key, value)
        
        return {"id": service_id, **service.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Environment variable endpoints
@app.get("/api/services/{service_id}/environment")
async def get_environment_variables(service_id: str, db=Depends(get_database)):
    """Get environment variables for a service"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        env_vars = db.get_environment_variables(service_id)
        return env_vars
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/services/{service_id}/environment")
async def set_environment_variable(service_id: str, env_var: EnvironmentVariableSet, db=Depends(get_database)):
    """Set an environment variable"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.set_environment_variable(service_id, env_var.key, env_var.value, env_var.is_secret)
        return {"message": "Environment variable set successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/services/{service_id}/environment/{key}")
async def delete_environment_variable(service_id: str, key: str, db=Depends(get_database)):
    """Delete an environment variable"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        db.delete_environment_variable(service_id, key)
        return {"message": "Environment variable deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Workspace import/export endpoints
@app.get("/api/workspaces/export")
async def export_workspace(
    workspace_id: Optional[str] = None,
    include_secrets: bool = False,
    wm=Depends(get_workspace_manager)
):
    """Export workspace to JSON"""
    if not wm:
        raise HTTPException(status_code=503, detail="Workspace manager not available")
    
    try:
        workspace_data = wm.export_workspace(workspace_id, include_secrets)
        return workspace_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workspaces/import")
async def import_workspace(import_data: WorkspaceImport, wm=Depends(get_workspace_manager)):
    """Import workspace from JSON"""
    if not wm:
        raise HTTPException(status_code=503, detail="Workspace manager not available")
    
    try:
        workspace_id, project_count = wm.import_workspace(
            import_data.workspace_data,
            import_data.overwrite
        )
        return {
            "workspace_id": workspace_id,
            "project_count": project_count,
            "message": "Workspace imported successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workspaces/validate")
async def validate_workspace(workspace_data: Dict[str, Any]):
    """Validate workspace JSON structure"""
    try:
        # Simple validation
        if not workspace_data.get("version"):
            return {"valid": False, "errors": ["Missing version field"]}
        
        if workspace_data["version"] != "2.0":
            return {"valid": False, "errors": ["Unsupported version"]}
        
        if not workspace_data.get("workspace", {}).get("name"):
            return {"valid": False, "errors": ["Missing workspace name"]}
        
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "errors": [str(e)]}


# Provider management endpoints
@app.get("/api/providers")
async def list_providers(pf=Depends(get_provider_factory)):
    """List available providers"""
    if not pf:
        raise HTTPException(status_code=503, detail="Provider factory not available")
    
    try:
        providers = pf.list_available_providers()
        return providers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/providers/{provider_name}/health")
async def provider_health_check(provider_name: str, pf=Depends(get_provider_factory)):
    """Get provider health information"""
    if not pf:
        raise HTTPException(status_code=503, detail="Provider factory not available")
    
    try:
        provider = pf.get_provider(provider_name)
        health = provider.health_check()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Simple main runner
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Web Isolator 2.0 Control Plane...")
    uvicorn.run(app, host="127.0.0.1", port=8000)