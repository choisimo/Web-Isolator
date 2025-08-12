"""
Docker 네트워크 관리
"""

import docker
from typing import List, Dict, Optional
from ..exceptions import IsolatorError, NetworkError

class NetworkManager:
    """Docker 네트워크 관리 클래스"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            raise IsolatorError(f"Docker 연결 실패: {e}")
    
    def network_exists(self, name: str) -> bool:
        """네트워크 존재 여부 확인"""
        try:
            self.client.networks.get(name)
            return True
        except docker.errors.NotFound:
            return False
        except Exception as e:
            raise NetworkError(f"네트워크 조회 실패: {e}")
    
    def create_network(self, name: str, driver: str = "bridge") -> str:
        """네트워크 생성"""
        try:
            if self.network_exists(name):
                raise NetworkError(f"네트워크 '{name}'가 이미 존재합니다")
            
            network = self.client.networks.create(
                name=name,
                driver=driver,
                labels={"isolator.managed": "true"}
            )
            return network.id
        except docker.errors.APIError as e:
            raise NetworkError(f"네트워크 생성 실패: {e}")
    
    def remove_network(self, name: str, force: bool = False) -> None:
        """네트워크 삭제"""
        try:
            network = self.client.networks.get(name)
            
            if not force:
                containers = self.get_network_containers(name)
                if containers:
                    raise NetworkError(f"네트워크를 사용 중인 컨테이너가 있습니다: {containers}")
            
            network.remove()
        except docker.errors.NotFound:
            raise NetworkError(f"네트워크 '{name}'를 찾을 수 없습니다")
        except docker.errors.APIError as e:
            raise NetworkError(f"네트워크 삭제 실패: {e}")
    
    def get_network_info(self, name: str) -> Dict:
        """네트워크 정보 조회"""
        try:
            network = self.client.networks.get(name)
            return network.attrs
        except docker.errors.NotFound:
            raise NetworkError(f"네트워크 '{name}'를 찾을 수 없습니다")
        except Exception as e:
            raise NetworkError(f"네트워크 정보 조회 실패: {e}")
    
    def get_network_containers(self, name: str) -> List[str]:
        """네트워크에 연결된 컨테이너 목록"""
        try:
            network = self.client.networks.get(name)
            containers = []
            
            for container_id, container_info in network.attrs.get('Containers', {}).items():
                container_name = container_info.get('Name', container_id[:12])
                containers.append(container_name)
            
            return containers
        except docker.errors.NotFound:
            return []
        except Exception as e:
            raise NetworkError(f"네트워크 컨테이너 조회 실패: {e}")
    
    def list_networks(self) -> List[Dict]:
        """네트워크 목록 조회"""
        try:
            networks = self.client.networks.list()
            return [
                {
                    'Name': network.name,
                    'Id': network.id,
                    'Driver': network.attrs.get('Driver', 'unknown'),
                    'Scope': network.attrs.get('Scope', 'unknown'),
                    'Created': network.attrs.get('Created', 'unknown')
                }
                for network in networks
            ]
        except Exception as e:
            raise NetworkError(f"네트워크 목록 조회 실패: {e}")
    
    def ensure_network_exists(self, name: str = "local_dev_network") -> str:
        """네트워크가 존재하지 않으면 생성"""
        if not self.network_exists(name):
            return self.create_network(name)
        else:
            network_info = self.get_network_info(name)
            return network_info['Id']
    
    def cleanup_network(self, name: str = "local_dev_network") -> None:
        """개발 네트워크 정리"""
        if self.network_exists(name):
            containers = self.get_network_containers(name)
            if not containers:
                self.remove_network(name)