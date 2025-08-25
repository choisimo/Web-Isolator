"""
Core configuration management for Web Isolator 2.0
"""
import os
from pathlib import Path
from typing import Optional

from .database import DatabaseManager


class ConfigManager:
    """Global configuration manager for Web Isolator"""
    
    _instance: Optional['ConfigManager'] = None
    
    def __new__(cls) -> 'ConfigManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.isolator_dir = Path.home() / ".isolator"
        self.isolator_dir.mkdir(exist_ok=True)
        
        self.db_path = self.isolator_dir / "isolator.db"
        self.config_path = self.isolator_dir / "config.json"
        
        self.db = DatabaseManager(str(self.db_path))
        self._initialized = True
    
    def get_or_create_default_workspace(self) -> str:
        """Get or create the default workspace"""
        workspace = self.db.get_current_workspace()
        if not workspace:
            # Create default workspace
            workspace_id = self.db.create_workspace(
                name="Default Workspace",
                description="Default workspace for Web Isolator projects"
            )
            return workspace_id
        return workspace['id']