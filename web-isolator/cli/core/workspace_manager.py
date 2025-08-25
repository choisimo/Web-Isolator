"""
Workspace import/export functionality for Web Isolator 2.0
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

from .workspace_schema import WorkspaceSchemaValidator, WorkspaceConverter
from .database import DatabaseManager


class WorkspaceManager:
    """Manages workspace import/export operations"""
    
    def __init__(self, db: DatabaseManager):
        self.db = db
        self.validator = WorkspaceSchemaValidator()
        self.converter = WorkspaceConverter()
    
    def export_workspace(self, workspace_id: Optional[str] = None, include_secrets: bool = False) -> Dict[str, Any]:
        """Export workspace to workspace.json format"""
        # Get workspace or use current/default
        if workspace_id:
            workspace = self.db.get_workspace(workspace_id)
            if not workspace:
                raise ValueError(f"Workspace with ID {workspace_id} not found")
        else:
            workspace = self.db.get_current_workspace()
            if not workspace:
                raise ValueError("No workspace found")
        
        # Get all projects in the workspace
        projects = self.db.list_projects(workspace['id'])
        
        # Build full project data with services and environment variables
        full_projects = []
        for project in projects:
            full_project = self.db.get_project_full_data(project['id'])
            
            # Handle secrets in environment variables
            if not include_secrets:
                for service in full_project.get('services', []):
                    env = service.get('environment', {})
                    for key, value in env.items():
                        if self._is_secret_key(key) or value == "***ENCRYPTED***":
                            service['environment'][key] = "$$PLACEHOLDER$$"
            
            full_projects.append(full_project)
        
        # Convert to workspace.json format
        workspace_json = self.converter.db_to_workspace(workspace, full_projects)
        
        # Validate the exported data
        self.validator.validate_workspace(workspace_json)
        
        return workspace_json
    
    def import_workspace(self, workspace_data: Dict[str, Any], overwrite: bool = False) -> tuple[str, int]:
        """Import workspace from workspace.json format"""
        # Validate the workspace data
        validated_data = self.validator.validate_workspace(workspace_data)
        
        # Convert to database format
        db_workspace, db_projects = self.converter.workspace_to_db(validated_data)
        
        # Check if workspace already exists
        workspace_name = db_workspace['name']
        existing_workspaces = self.db.list_workspaces()
        existing_workspace = next((w for w in existing_workspaces if w['name'] == workspace_name), None)
        
        if existing_workspace and not overwrite:
            raise ValueError(f"Workspace '{workspace_name}' already exists. Use overwrite=True to replace it.")
        
        # Delete existing workspace if overwriting
        if existing_workspace and overwrite:
            self.db.delete_workspace(existing_workspace['id'])
        
        # Create new workspace
        workspace_id = self.db.create_workspace(
            name=db_workspace['name'],
            description=db_workspace.get('description', '')
        )
        
        # Import projects
        project_count = 0
        for project_data in db_projects:
            # Check for existing project by name
            existing_project = self.db.get_project_by_name(project_data['name'])
            if existing_project and not overwrite:
                print(f"Warning: Project '{project_data['name']}' already exists, skipping...")
                continue
            elif existing_project and overwrite:
                self.db.delete_project(existing_project['id'])
            
            # Create project
            project_id = self.db.create_project(
                workspace_id=workspace_id,
                name=project_data['name'],
                path=project_data['path'],
                provider=project_data.get('provider', 'docker')
            )
            
            # Create services
            for service_data in project_data.get('services', []):
                service_id = self.db.create_service(
                    project_id=project_id,
                    name=service_data['name'],
                    service_type=service_data['type'],
                    port=service_data.get('port'),
                    image=service_data.get('image'),
                    dockerfile_path=service_data.get('dockerfile_path'),
                    command=service_data.get('command')
                )
                
                # Set environment variables
                for key, value in service_data.get('environment', {}).items():
                    # Skip placeholder values
                    if value == "$$PLACEHOLDER$$":
                        print(f"Warning: Environment variable {key} has placeholder value, skipping...")
                        continue
                    
                    is_secret = self._is_secret_key(key)
                    self.db.set_environment_variable(service_id, key, value, is_secret)
            
            # Create networks
            for network_data in project_data.get('networks', []):
                self.db.create_network(
                    project_id=project_id,
                    name=network_data['name'],
                    driver=network_data.get('driver', 'bridge'),
                    subnet=network_data.get('subnet')
                )
            
            project_count += 1
        
        return workspace_id, project_count
    
    def export_to_file(self, file_path: str, workspace_id: Optional[str] = None, include_secrets: bool = False):
        """Export workspace to a JSON file"""
        workspace_data = self.export_workspace(workspace_id, include_secrets)
        
        file_path_obj = Path(file_path)
        file_path_obj.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path_obj, 'w', encoding='utf-8') as f:
            json.dump(workspace_data, f, indent=2, ensure_ascii=False)
    
    def import_from_file(self, file_path: str, overwrite: bool = False) -> tuple[str, int]:
        """Import workspace from a JSON file"""
        file_path_obj = Path(file_path)
        
        if not file_path_obj.exists():
            raise FileNotFoundError(f"Workspace file not found: {file_path}")
        
        try:
            with open(file_path_obj, 'r', encoding='utf-8') as f:
                workspace_data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON file: {e}")
        
        return self.import_workspace(workspace_data, overwrite)
    
    def _is_secret_key(self, key: str) -> bool:
        """Determine if an environment variable key represents a secret"""
        secret_indicators = [
            'secret', 'password', 'key', 'token', 'api_key', 'auth',
            'private', 'credential', 'pass', 'pwd'
        ]
        return any(indicator in key.lower() for indicator in secret_indicators)
    
    def validate_workspace_file(self, file_path: str) -> bool:
        """Validate a workspace file without importing"""
        try:
            file_path_obj = Path(file_path)
            with open(file_path_obj, 'r', encoding='utf-8') as f:
                workspace_data = json.load(f)
            
            self.validator.validate_workspace(workspace_data)
            return True
        except Exception as e:
            raise ValueError(f"Validation failed: {e}")
    
    def create_example_workspace_file(self, file_path: str):
        """Create an example workspace.json file"""
        example_workspace = self.validator.create_example_workspace()
        
        file_path_obj = Path(file_path)
        file_path_obj.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path_obj, 'w', encoding='utf-8') as f:
            json.dump(example_workspace, f, indent=2, ensure_ascii=False)