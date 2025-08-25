"""
Base provider interface for Web Isolator 2.0
Defines the contract for isolation providers (Docker, VM, etc.)
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from enum import Enum


class ProviderStatus(Enum):
    """Provider service status"""
    RUNNING = "running"
    STOPPED = "stopped" 
    STARTING = "starting"
    STOPPING = "stopping"
    ERROR = "error"
    BUILDING = "building"


class ServiceInfo:
    """Service information returned by providers"""
    
    def __init__(self, 
                 service_id: str,
                 name: str,
                 status: ProviderStatus,
                 port_mappings: Optional[Dict[int, int]] = None,
                 environment: Optional[Dict[str, str]] = None,
                 metadata: Optional[Dict[str, Any]] = None):
        self.service_id = service_id
        self.name = name
        self.status = status
        self.port_mappings = port_mappings or {}
        self.environment = environment or {}
        self.metadata = metadata or {}


class NetworkInfo:
    """Network information returned by providers"""
    
    def __init__(self,
                 network_id: str,
                 name: str,
                 driver: str,
                 subnet: Optional[str] = None,
                 metadata: Optional[Dict[str, Any]] = None):
        self.network_id = network_id
        self.name = name
        self.driver = driver
        self.subnet = subnet
        self.metadata = metadata or {}


class IsolationProvider(ABC):
    """
    Abstract base class for isolation providers.
    
    This interface allows Web Isolator to support different isolation
    technologies (Docker, VMs, etc.) through a unified API.
    """
    
    def __init__(self, provider_name: str):
        self.provider_name = provider_name
    
    @property
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available on the system"""
        pass
    
    @abstractmethod
    def get_version(self) -> str:
        """Get provider version information"""
        pass
    
    # Network management
    @abstractmethod
    def create_network(self, name: str, driver: str = "bridge", 
                      subnet: Optional[str] = None, **kwargs) -> NetworkInfo:
        """Create a new network"""
        pass
    
    @abstractmethod
    def delete_network(self, network_name: str) -> bool:
        """Delete a network"""
        pass
    
    @abstractmethod
    def list_networks(self) -> List[NetworkInfo]:
        """List all networks managed by this provider"""
        pass
    
    @abstractmethod
    def network_exists(self, network_name: str) -> bool:
        """Check if a network exists"""
        pass
    
    # Service management
    @abstractmethod
    def start_service(self, 
                     service_name: str,
                     image: Optional[str] = None,
                     dockerfile_path: Optional[str] = None,
                     command: Optional[str] = None,
                     port_mappings: Optional[Dict[int, int]] = None,
                     environment: Optional[Dict[str, str]] = None,
                     network_name: Optional[str] = None,
                     working_dir: Optional[str] = None,
                     volumes: Optional[Dict[str, str]] = None,
                     **kwargs) -> ServiceInfo:
        """Start a service"""
        pass
    
    @abstractmethod
    def stop_service(self, service_name: str) -> bool:
        """Stop a running service"""
        pass
    
    @abstractmethod
    def restart_service(self, service_name: str) -> bool:
        """Restart a service"""
        pass
    
    @abstractmethod
    def remove_service(self, service_name: str) -> bool:
        """Remove a service (stop and delete)"""
        pass
    
    @abstractmethod
    def get_service_status(self, service_name: str) -> ProviderStatus:
        """Get the status of a specific service"""
        pass
    
    @abstractmethod
    def list_services(self) -> List[ServiceInfo]:
        """List all services managed by this provider"""
        pass
    
    @abstractmethod
    def service_exists(self, service_name: str) -> bool:
        """Check if a service exists"""
        pass
    
    # Logs and monitoring
    @abstractmethod
    def get_service_logs(self, service_name: str, lines: int = 100, 
                        follow: bool = False) -> List[str]:
        """Get logs from a service"""
        pass
    
    @abstractmethod
    def get_service_stats(self, service_name: str) -> Dict[str, Any]:
        """Get resource usage stats for a service"""
        pass
    
    # Build operations
    @abstractmethod
    def build_image(self, dockerfile_path: str, image_tag: str, 
                   build_context: str = ".", **kwargs) -> bool:
        """Build an image from Dockerfile"""
        pass
    
    @abstractmethod
    def image_exists(self, image_name: str) -> bool:
        """Check if an image exists locally"""
        pass
    
    @abstractmethod
    def pull_image(self, image_name: str) -> bool:
        """Pull an image from registry"""
        pass
    
    # Project-level operations
    def start_project(self, project_name: str, services: List[Dict[str, Any]], 
                     networks: Optional[List[Dict[str, Any]]] = None) -> Dict[str, ServiceInfo]:
        """
        Start all services for a project.
        This is a convenience method that orchestrates multiple service starts.
        """
        networks = networks or []
        started_services = {}
        
        # Create networks first
        for network in networks:
            network_name = f"{project_name}-{network['name']}"
            if not self.network_exists(network_name):
                self.create_network(
                    name=network_name,
                    driver=network.get('driver', 'bridge'),
                    subnet=network.get('subnet')
                )
        
        # Start services
        for service in services:
            service_name = f"{project_name}-{service['name']}"
            network_name = f"{project_name}-network" if networks else None
            
            try:
                service_info = self.start_service(
                    service_name=service_name,
                    image=service.get('image'),
                    dockerfile_path=service.get('dockerfile_path'),
                    command=service.get('command'),
                    port_mappings={service.get('port', 80): service.get('port', 80)} if service.get('port') else {},
                    environment=service.get('environment', {}),
                    network_name=network_name
                )
                started_services[service['name']] = service_info
            except Exception as e:
                # Rollback: stop already started services
                for started_name in started_services:
                    self.stop_service(f"{project_name}-{started_name}")
                raise Exception(f"Failed to start service {service['name']}: {e}")
        
        return started_services
    
    def stop_project(self, project_name: str, services: List[Dict[str, Any]]) -> bool:
        """Stop all services for a project"""
        success = True
        
        for service in services:
            service_name = f"{project_name}-{service['name']}"
            if not self.stop_service(service_name):
                success = False
        
        return success
    
    def remove_project(self, project_name: str, services: List[Dict[str, Any]], 
                      networks: Optional[List[Dict[str, Any]]] = None) -> bool:
        """Remove all services and networks for a project"""
        networks = networks or []
        success = True
        
        # Remove services
        for service in services:
            service_name = f"{project_name}-{service['name']}"
            if not self.remove_service(service_name):
                success = False
        
        # Remove networks
        for network in networks:
            network_name = f"{project_name}-{network['name']}"
            if not self.delete_network(network_name):
                success = False
        
        return success
    
    # Health check
    def health_check(self) -> Dict[str, Any]:
        """Perform a health check of the provider"""
        return {
            "provider": self.provider_name,
            "available": self.is_available,
            "version": self.get_version() if self.is_available else None,
            "services_count": len(self.list_services()) if self.is_available else 0,
            "networks_count": len(self.list_networks()) if self.is_available else 0
        }


class ProviderError(Exception):
    """Base exception for provider-related errors"""
    pass


class ProviderUnavailableError(ProviderError):
    """Raised when a provider is not available on the system"""
    pass


class ServiceError(ProviderError):
    """Raised when a service operation fails"""
    pass


class NetworkError(ProviderError):
    """Raised when a network operation fails"""
    pass