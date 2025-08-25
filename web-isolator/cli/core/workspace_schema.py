"""
Simplified Workspace schema for Web Isolator 2.0 (without Pydantic)
"""
import json
from typing import Dict, List, Any, Optional
from datetime import datetime


class WorkspaceSchemaValidator:
    """Workspace schema validator without external dependencies"""
    
    SUPPORTED_VERSIONS = ['2.0']
    SUPPORTED_PROVIDERS = ['docker', 'vm']
    SUPPORTED_SERVICE_TYPES = ['react', 'fastapi', 'postgresql', 'redis', 'nginx']
    
    @classmethod
    def validate_workspace(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate workspace data structure"""
        errors = []
        
        # Check required fields
        if 'version' not in data:
            errors.append("Missing required field: version")
        elif data['version'] not in cls.SUPPORTED_VERSIONS:
            errors.append(f"Unsupported version: {data['version']}. Supported: {cls.SUPPORTED_VERSIONS}")
        
        if 'workspace' not in data:
            errors.append("Missing required field: workspace")
            if errors:
                raise ValueError("; ".join(errors))
            return data
        
        workspace = data['workspace']
        
        # Validate workspace fields
        if 'name' not in workspace:
            errors.append("Missing required field: workspace.name")
        elif not isinstance(workspace['name'], str) or not workspace['name'].strip():
            errors.append("workspace.name must be a non-empty string")
        
        # Validate projects
        projects = workspace.get('projects', [])
        if not isinstance(projects, list):
            errors.append("workspace.projects must be a list")
        else:
            for i, project in enumerate(projects):
                project_errors = cls._validate_project(project, f"projects[{i}]")
                errors.extend(project_errors)
        
        if errors:
            raise ValueError("; ".join(errors))
        
        return data
    
    @classmethod
    def _validate_project(cls, project: Dict[str, Any], path: str) -> List[str]:
        """Validate project structure"""
        errors = []
        
        # Required fields
        required_fields = ['name', 'path']
        for field in required_fields:
            if field not in project:
                errors.append(f"Missing required field: {path}.{field}")
            elif not isinstance(project[field], str) or not project[field].strip():
                errors.append(f"{path}.{field} must be a non-empty string")
        
        # Validate provider
        provider = project.get('provider', 'docker')
        if provider not in cls.SUPPORTED_PROVIDERS:
            errors.append(f"{path}.provider must be one of: {cls.SUPPORTED_PROVIDERS}")
        
        # Validate services
        services = project.get('services', [])
        if not isinstance(services, list):
            errors.append(f"{path}.services must be a list")
        else:
            for i, service in enumerate(services):
                service_errors = cls._validate_service(service, f"{path}.services[{i}]")
                errors.extend(service_errors)
        
        return errors
    
    @classmethod
    def _validate_service(cls, service: Dict[str, Any], path: str) -> List[str]:
        """Validate service structure"""
        errors = []
        
        # Required fields
        required_fields = ['name', 'type']
        for field in required_fields:
            if field not in service:
                errors.append(f"Missing required field: {path}.{field}")
            elif not isinstance(service[field], str) or not service[field].strip():
                errors.append(f"{path}.{field} must be a non-empty string")
        
        # Validate service type
        service_type = service.get('type')
        if service_type and service_type not in cls.SUPPORTED_SERVICE_TYPES:
            errors.append(f"{path}.type should be one of: {cls.SUPPORTED_SERVICE_TYPES}")
        
        # Validate port
        port = service.get('port')
        if port is not None and (not isinstance(port, int) or port < 1 or port > 65535):
            errors.append(f"{path}.port must be an integer between 1 and 65535")
        
        # Validate environment
        environment = service.get('environment', {})
        if not isinstance(environment, dict):
            errors.append(f"{path}.environment must be a dictionary")
        else:
            for key, value in environment.items():
                if not isinstance(key, str) or not isinstance(value, str):
                    errors.append(f"{path}.environment entries must be string key-value pairs")
                    break
        
        return errors
    
    @classmethod
    def create_example_workspace(cls) -> Dict[str, Any]:
        """Create example workspace structure"""
        return {
            "version": "2.0",
            "workspace": {
                "name": "Example Development Environment",
                "description": "Example workspace for Web Isolator 2.0",
                "projects": [
                    {
                        "name": "ecommerce-app",
                        "path": "./projects/ecommerce",
                        "provider": "docker",
                        "services": [
                            {
                                "name": "frontend",
                                "type": "react",
                                "port": 3000,
                                "image": "node:18-alpine",
                                "environment": {
                                    "NODE_ENV": "development",
                                    "REACT_APP_API_URL": "http://api.ecommerce-app.local"
                                }
                            },
                            {
                                "name": "backend", 
                                "type": "fastapi",
                                "port": 8000,
                                "image": "python:3.11-slim",
                                "environment": {
                                    "ENVIRONMENT": "development",
                                    "DATABASE_URL": "postgresql://user:pass@db:5432/ecommerce"
                                }
                            },
                            {
                                "name": "database",
                                "type": "postgresql", 
                                "port": 5432,
                                "image": "postgres:15-alpine",
                                "environment": {
                                    "POSTGRES_DB": "ecommerce",
                                    "POSTGRES_USER": "user",
                                    "POSTGRES_PASSWORD": "password"
                                }
                            }
                        ],
                        "networks": [
                            {
                                "name": "ecommerce-network",
                                "driver": "bridge"
                            }
                        ]
                    }
                ]
            }
        }
    
    @classmethod
    def validate_json(cls, json_str: str) -> Dict[str, Any]:
        """Validate workspace JSON string"""
        try:
            data = json.loads(json_str)
            return cls.validate_workspace(data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")
    
    @classmethod
    def to_json(cls, workspace_data: Dict[str, Any], indent: int = 2) -> str:
        """Convert workspace data to JSON string"""
        return json.dumps(workspace_data, indent=indent, ensure_ascii=False)


class WorkspaceConverter:
    """Convert between database format and workspace.json format"""
    
    @staticmethod
    def db_to_workspace(workspace_data: Dict[str, Any], projects_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert database format to workspace.json format"""
        workspace = {
            "version": "2.0",
            "workspace": {
                "id": workspace_data.get('id'),
                "name": workspace_data.get('name', 'Unnamed Workspace'),
                "description": workspace_data.get('description', ''),
                "created_at": workspace_data.get('created_at'),
                "updated_at": workspace_data.get('updated_at'),
                "projects": []
            }
        }
        
        for project in projects_data:
            project_config = {
                "id": project.get('id'),
                "name": project.get('name'),
                "path": project.get('path'),
                "provider": project.get('provider', 'docker'),
                "services": project.get('services', []),
                "networks": project.get('networks', []),
                "metadata": json.loads(project.get('metadata', '{}'))
            }
            
            workspace["workspace"]["projects"].append(project_config)
        
        return workspace
    
    @staticmethod
    def workspace_to_db(workspace_json: Dict[str, Any]) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Convert workspace.json format to database format"""
        workspace_data = workspace_json["workspace"]
        
        db_workspace = {
            "id": workspace_data.get('id'),
            "name": workspace_data.get('name'),
            "description": workspace_data.get('description', ''),
            "created_at": workspace_data.get('created_at'),
            "updated_at": workspace_data.get('updated_at')
        }
        
        db_projects = []
        for project in workspace_data.get('projects', []):
            db_project = {
                "id": project.get('id'),
                "name": project.get('name'),
                "path": project.get('path'),
                "provider": project.get('provider', 'docker'),
                "services": project.get('services', []),
                "networks": project.get('networks', []),
                "metadata": json.dumps(project.get('metadata', {}))
            }
            db_projects.append(db_project)
        
        return db_workspace, db_projects