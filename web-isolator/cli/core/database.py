"""
Database manager for Web Isolator 2.0
Provides SQLite-based storage for workspaces, projects, services, and environment variables.
"""
import sqlite3
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from contextlib import contextmanager

from .encryption import SecretManager


class DatabaseManager:
    """Central database manager for all Web Isolator configuration data"""
    
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            isolator_dir = Path.home() / ".isolator"
            isolator_dir.mkdir(exist_ok=True)
            db_path = str(isolator_dir / "isolator.db")
        
        self.db_path = str(db_path)
        self.secret_manager = SecretManager()
        self._init_database()
    
    def _init_database(self):
        """Initialize database with required tables"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Workspaces table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workspaces (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Projects table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    workspace_id TEXT,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL,
                    provider TEXT DEFAULT 'docker',
                    status TEXT DEFAULT 'stopped',
                    metadata TEXT DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
                )
            """)
            
            # Services table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS services (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    port INTEGER,
                    image TEXT,
                    dockerfile_path TEXT,
                    command TEXT,
                    metadata TEXT DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            """)
            
            # Environment variables table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS environment_variables (
                    id TEXT PRIMARY KEY,
                    service_id TEXT,
                    key TEXT NOT NULL,
                    value TEXT NOT NULL,
                    is_secret BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
                )
            """)
            
            # Networks table (for Docker network management)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS networks (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    name TEXT NOT NULL,
                    driver TEXT DEFAULT 'bridge',
                    subnet TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            """)
            
            # Create indexes for better performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_services_project ON services(project_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_envvars_service ON environment_variables(service_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_networks_project ON networks(project_id)")
            
            conn.commit()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key constraints
        try:
            yield conn
        finally:
            conn.close()
    
    def _generate_id(self) -> str:
        """Generate a unique ID"""
        return str(uuid.uuid4())
    
    # Workspace operations
    def create_workspace(self, name: str, description: str = "") -> str:
        """Create a new workspace"""
        workspace_id = self._generate_id()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO workspaces (id, name, description)
                VALUES (?, ?, ?)
            """, (workspace_id, name, description))
            conn.commit()
        return workspace_id
    
    def get_workspace(self, workspace_id: str) -> Optional[Dict[str, Any]]:
        """Get workspace by ID"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM workspaces WHERE id = ?", (workspace_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_current_workspace(self) -> Optional[Dict[str, Any]]:
        """Get the current/default workspace"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM workspaces ORDER BY updated_at DESC LIMIT 1")
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def list_workspaces(self) -> List[Dict[str, Any]]:
        """List all workspaces"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM workspaces ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
    
    # Project operations
    def create_project(self, workspace_id: str, name: str, path: str, 
                      provider: str = "docker") -> str:
        """Create a new project"""
        project_id = self._generate_id()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO projects (id, workspace_id, name, path, provider)
                VALUES (?, ?, ?, ?, ?)
            """, (project_id, workspace_id, name, path, provider))
            conn.commit()
        return project_id
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project by ID"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_project_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get project by name"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE name = ?", (name,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def list_projects(self, workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List projects, optionally filtered by workspace"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if workspace_id:
                cursor.execute("SELECT * FROM projects WHERE workspace_id = ? ORDER BY name", (workspace_id,))
            else:
                cursor.execute("SELECT * FROM projects ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
    
    def update_project_status(self, project_id: str, status: str):
        """Update project status"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE projects 
                SET status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            """, (status, project_id))
            conn.commit()
    
    # Service operations
    def create_service(self, project_id: str, name: str, service_type: str,
                      port: Optional[int] = None, image: Optional[str] = None,
                      dockerfile_path: Optional[str] = None, 
                      command: Optional[str] = None) -> str:
        """Create a new service"""
        service_id = self._generate_id()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO services (id, project_id, name, type, port, image, dockerfile_path, command)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (service_id, project_id, name, service_type, port, image, dockerfile_path, command))
            conn.commit()
        return service_id
    
    def get_service(self, service_id: str) -> Optional[Dict[str, Any]]:
        """Get service by ID"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def list_services(self, project_id: str) -> List[Dict[str, Any]]:
        """List services for a project"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM services WHERE project_id = ? ORDER BY name", (project_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    # Environment variable operations
    def set_environment_variable(self, service_id: str, key: str, value: str, is_secret: bool = False):
        """Set an environment variable for a service"""
        # Encrypt value if it's a secret
        stored_value = self.secret_manager.encrypt(value) if is_secret else value
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Check if variable already exists
            cursor.execute("""
                SELECT id FROM environment_variables 
                WHERE service_id = ? AND key = ?
            """, (service_id, key))
            
            if cursor.fetchone():
                # Update existing
                cursor.execute("""
                    UPDATE environment_variables 
                    SET value = ?, is_secret = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE service_id = ? AND key = ?
                """, (stored_value, is_secret, service_id, key))
            else:
                # Create new
                var_id = self._generate_id()
                cursor.execute("""
                    INSERT INTO environment_variables (id, service_id, key, value, is_secret)
                    VALUES (?, ?, ?, ?, ?)
                """, (var_id, service_id, key, stored_value, is_secret))
            
            conn.commit()
    
    def get_environment_variables(self, service_id: str) -> Dict[str, str]:
        """Get all environment variables for a service (decrypted)"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT key, value, is_secret FROM environment_variables 
                WHERE service_id = ?
            """, (service_id,))
            
            env_vars = {}
            for row in cursor.fetchall():
                key, value, is_secret = row['key'], row['value'], row['is_secret']
                if is_secret:
                    try:
                        value = self.secret_manager.decrypt(value)
                    except Exception:
                        # If decryption fails, use placeholder
                        value = "***ENCRYPTED***"
                env_vars[key] = value
            
            return env_vars
    
    def delete_environment_variable(self, service_id: str, key: str):
        """Delete an environment variable"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                DELETE FROM environment_variables 
                WHERE service_id = ? AND key = ?
            """, (service_id, key))
            conn.commit()
    
    # Network operations
    def create_network(self, project_id: str, name: str, driver: str = "bridge", 
                      subnet: Optional[str] = None) -> str:
        """Create a network for a project"""
        network_id = self._generate_id()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO networks (id, project_id, name, driver, subnet)
                VALUES (?, ?, ?, ?, ?)
            """, (network_id, project_id, name, driver, subnet))
            conn.commit()
        return network_id
    
    def list_networks(self, project_id: str) -> List[Dict[str, Any]]:
        """List networks for a project"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM networks WHERE project_id = ?", (project_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    # Utility methods
    def get_project_full_data(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project with all related services and environment variables"""
        project = self.get_project(project_id)
        if not project:
            return None
        
        project['services'] = []
        services = self.list_services(project_id)
        
        for service in services:
            service['environment'] = self.get_environment_variables(service['id'])
            project['services'].append(service)
        
        project['networks'] = self.list_networks(project_id)
        
        return project
    
    def delete_project(self, project_id: str):
        """Delete a project and all related data"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            conn.commit()
    
    def delete_workspace(self, workspace_id: str):
        """Delete a workspace and all related data"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM workspaces WHERE id = ?", (workspace_id,))
            conn.commit()