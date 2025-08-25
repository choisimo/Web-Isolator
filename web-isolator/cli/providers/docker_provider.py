"""
Docker provider implementation for Web Isolator 2.0
"""
import subprocess
import json
import re
import time
from typing import Dict, List, Any, Optional
from .base import (
    IsolationProvider, ServiceInfo, NetworkInfo, ProviderStatus,
    ProviderError, ProviderUnavailableError, ServiceError, NetworkError
)


class DockerProvider(IsolationProvider):
    """Docker-based isolation provider"""
    
    def __init__(self):
        super().__init__("docker")
        self._docker_client = None
    
    @property
    def is_available(self) -> bool:
        """Check if Docker is available"""
        try:
            result = subprocess.run(
                ['docker', '--version'], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def get_version(self) -> str:
        """Get Docker version"""
        if not self.is_available:
            raise ProviderUnavailableError("Docker is not available")
        
        try:
            result = subprocess.run(
                ['docker', '--version'], 
                capture_output=True, 
                text=True, 
                timeout=5
            )
            return result.stdout.strip()
        except subprocess.TimeoutExpired:
            raise ProviderError("Timeout getting Docker version")
    
    def _run_docker_command(self, args: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Run a docker command and return the result"""
        if not self.is_available:
            raise ProviderUnavailableError("Docker is not available")
        
        try:
            cmd = ['docker'] + args
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if check and result.returncode != 0:
                raise ProviderError(f"Docker command failed: {result.stderr}")
            
            return result
        except subprocess.TimeoutExpired:
            raise ProviderError(f"Docker command timed out: {args}")
        except FileNotFoundError:
            raise ProviderUnavailableError("Docker command not found")
    
    # Network management
    def create_network(self, name: str, driver: str = "bridge", 
                      subnet: Optional[str] = None, **kwargs) -> NetworkInfo:
        """Create a Docker network"""
        args = ['network', 'create', '--driver', driver]
        
        if subnet:
            args.extend(['--subnet', subnet])
        
        # Add custom options
        for key, value in kwargs.items():
            args.extend([f'--{key.replace("_", "-")}', str(value)])
        
        args.append(name)
        
        try:
            result = self._run_docker_command(args)
            network_id = result.stdout.strip()
            
            return NetworkInfo(
                network_id=network_id,
                name=name,
                driver=driver,
                subnet=subnet,
                metadata=kwargs
            )
        except ProviderError as e:
            raise NetworkError(f"Failed to create network {name}: {e}")
    
    def delete_network(self, network_name: str) -> bool:
        """Delete a Docker network"""
        try:
            self._run_docker_command(['network', 'rm', network_name])
            return True
        except ProviderError:
            return False
    
    def list_networks(self) -> List[NetworkInfo]:
        """List Docker networks"""
        try:
            result = self._run_docker_command([
                'network', 'ls', '--format', 
                '{{.ID}}\\t{{.Name}}\\t{{.Driver}}\\t{{.Scope}}'
            ])
            
            networks = []
            for line in result.stdout.strip().split('\\n'):
                if line:
                    parts = line.split('\\t')
                    if len(parts) >= 3:
                        networks.append(NetworkInfo(
                            network_id=parts[0],
                            name=parts[1],
                            driver=parts[2],
                            metadata={'scope': parts[3] if len(parts) > 3 else 'local'}
                        ))
            
            return networks
        except ProviderError as e:
            raise NetworkError(f"Failed to list networks: {e}")
    
    def network_exists(self, network_name: str) -> bool:
        """Check if a network exists"""
        try:
            self._run_docker_command(['network', 'inspect', network_name])
            return True
        except ProviderError:
            return False
    
    # Service management
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
        """Start a Docker container"""
        
        args = ['run', '-d', '--name', service_name]
        
        # Port mappings
        if port_mappings:
            for host_port, container_port in port_mappings.items():
                args.extend(['-p', f'{host_port}:{container_port}'])
        
        # Environment variables
        if environment:
            for key, value in environment.items():
                args.extend(['-e', f'{key}={value}'])
        
        # Network
        if network_name:
            args.extend(['--network', network_name])
        
        # Working directory
        if working_dir:
            args.extend(['-w', working_dir])
        
        # Volumes
        if volumes:
            for host_path, container_path in volumes.items():
                args.extend(['-v', f'{host_path}:{container_path}'])
        
        # Custom options
        for key, value in kwargs.items():
            args.extend([f'--{key.replace("_", "-")}', str(value)])
        
        # Image or build from Dockerfile
        build_tag = None
        if dockerfile_path:
            # Build image first
            build_tag = f"{service_name}:latest"
            self.build_image(dockerfile_path, build_tag)
            args.append(build_tag)
        elif image:
            args.append(image)
        else:
            raise ServiceError("Either image or dockerfile_path must be provided")
        
        # Command
        if command:
            args.extend(command.split())
        
        try:
            result = self._run_docker_command(args)
            container_id = result.stdout.strip()
            
            # Wait a moment for container to start
            time.sleep(2)
            
            return ServiceInfo(
                service_id=container_id,
                name=service_name,
                status=self.get_service_status(service_name),
                port_mappings=port_mappings or {},
                environment=environment or {},
                metadata={'image': image or build_tag or 'unknown', 'dockerfile_path': dockerfile_path}
            )
        except ProviderError as e:
            raise ServiceError(f"Failed to start service {service_name}: {e}")
    
    def stop_service(self, service_name: str) -> bool:
        """Stop a Docker container"""
        try:
            self._run_docker_command(['stop', service_name])
            return True
        except ProviderError:
            return False
    
    def restart_service(self, service_name: str) -> bool:
        """Restart a Docker container"""
        try:
            self._run_docker_command(['restart', service_name])
            return True
        except ProviderError:
            return False
    
    def remove_service(self, service_name: str) -> bool:
        """Remove a Docker container"""
        try:
            # Stop first if running
            self.stop_service(service_name)
            # Remove container
            self._run_docker_command(['rm', service_name])
            return True
        except ProviderError:
            return False
    
    def get_service_status(self, service_name: str) -> ProviderStatus:
        """Get Docker container status"""
        try:
            result = self._run_docker_command([
                'inspect', service_name, '--format', '{{.State.Status}}'
            ])
            
            docker_status = result.stdout.strip().lower()
            
            # Map Docker status to ProviderStatus
            status_mapping = {
                'running': ProviderStatus.RUNNING,
                'exited': ProviderStatus.STOPPED,
                'created': ProviderStatus.STOPPED,
                'restarting': ProviderStatus.STARTING,
                'paused': ProviderStatus.STOPPED,
                'dead': ProviderStatus.ERROR
            }
            
            return status_mapping.get(docker_status, ProviderStatus.ERROR)
            
        except ProviderError:
            return ProviderStatus.ERROR
    
    def list_services(self) -> List[ServiceInfo]:
        """List Docker containers"""
        try:
            result = self._run_docker_command([
                'ps', '-a', '--format',
                '{{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Image}}\\t{{.Ports}}'
            ])
            
            services = []
            for line in result.stdout.strip().split('\\n'):
                if line:
                    parts = line.split('\\t')
                    if len(parts) >= 4:
                        container_id, name, status, image = parts[:4]
                        ports_str = parts[4] if len(parts) > 4 else ""
                        
                        # Parse port mappings
                        port_mappings = self._parse_port_mappings(ports_str)
                        
                        # Map status
                        provider_status = ProviderStatus.STOPPED
                        if 'Up' in status:
                            provider_status = ProviderStatus.RUNNING
                        elif 'Exited' in status:
                            provider_status = ProviderStatus.STOPPED
                        
                        services.append(ServiceInfo(
                            service_id=container_id,
                            name=name,
                            status=provider_status,
                            port_mappings=port_mappings,
                            metadata={'image': image, 'docker_status': status}
                        ))
            
            return services
        except ProviderError as e:
            raise ServiceError(f"Failed to list services: {e}")
    
    def service_exists(self, service_name: str) -> bool:
        """Check if a Docker container exists"""
        try:
            self._run_docker_command(['inspect', service_name])
            return True
        except ProviderError:
            return False
    
    def _parse_port_mappings(self, ports_str: str) -> Dict[int, int]:
        """Parse Docker port mappings string"""
        port_mappings = {}
        if not ports_str:
            return port_mappings
        
        # Parse port mappings like "0.0.0.0:8080->80/tcp"
        port_pattern = r'(?:[\d.]+:)?(\d+)->(\d+)/\w+'
        matches = re.findall(port_pattern, ports_str)
        
        for host_port, container_port in matches:
            port_mappings[int(host_port)] = int(container_port)
        
        return port_mappings
    
    # Logs and monitoring
    def get_service_logs(self, service_name: str, lines: int = 100, 
                        follow: bool = False) -> List[str]:
        """Get Docker container logs"""
        args = ['logs']
        if follow:
            args.append('-f')
        args.extend(['--tail', str(lines), service_name])
        
        try:
            result = self._run_docker_command(args)
            return result.stdout.split('\\n')
        except ProviderError as e:
            raise ServiceError(f"Failed to get logs for {service_name}: {e}")
    
    def get_service_stats(self, service_name: str) -> Dict[str, Any]:
        """Get Docker container stats"""
        try:
            result = self._run_docker_command([
                'stats', service_name, '--no-stream', '--format',
                '{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.NetIO}}\\t{{.BlockIO}}'
            ])
            
            parts = result.stdout.strip().split('\\t')
            if len(parts) >= 4:
                return {
                    'cpu_percent': parts[0],
                    'memory_usage': parts[1],
                    'network_io': parts[2],
                    'block_io': parts[3]
                }
            
            return {}
        except ProviderError:
            return {}
    
    # Build operations
    def build_image(self, dockerfile_path: str, image_tag: str, 
                   build_context: str = ".", **kwargs) -> bool:
        """Build Docker image"""
        args = ['build', '-t', image_tag, '-f', dockerfile_path]
        
        # Add build args
        for key, value in kwargs.items():
            if key == 'build_args':
                for arg_key, arg_value in value.items():
                    args.extend(['--build-arg', f'{arg_key}={arg_value}'])
            else:
                args.extend([f'--{key.replace("_", "-")}', str(value)])
        
        args.append(build_context)
        
        try:
            self._run_docker_command(args)
            return True
        except ProviderError as e:
            raise ServiceError(f"Failed to build image {image_tag}: {e}")
    
    def image_exists(self, image_name: str) -> bool:
        """Check if Docker image exists locally"""
        try:
            self._run_docker_command(['image', 'inspect', image_name])
            return True
        except ProviderError:
            return False
    
    def pull_image(self, image_name: str) -> bool:
        """Pull Docker image"""
        try:
            self._run_docker_command(['pull', image_name])
            return True
        except ProviderError:
            return False