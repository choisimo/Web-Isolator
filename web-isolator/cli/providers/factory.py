"""
Provider factory for Web Isolator 2.0
Manages provider selection and instantiation
"""
import sys
import os
from typing import Dict, Optional, Type

# Add paths for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from base import IsolationProvider, ProviderUnavailableError
from docker_provider import DockerProvider


class ProviderFactory:
    """Factory for creating isolation providers"""
    
    _providers: Dict[str, Type[IsolationProvider]] = {
        'docker': DockerProvider,
    }
    
    _instances: Dict[str, IsolationProvider] = {}
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[IsolationProvider]):
        """Register a new provider"""
        cls._providers[name] = provider_class
    
    @classmethod
    def get_provider(cls, provider_name: str) -> IsolationProvider:
        """Get provider instance"""
        if provider_name not in cls._providers:
            raise ValueError(f"Unknown provider: {provider_name}")
        
        # Return cached instance if available
        if provider_name in cls._instances:
            return cls._instances[provider_name]
        
        # Create new instance
        provider_class = cls._providers[provider_name]
        provider = provider_class()
        
        # Check availability
        if not provider.is_available:
            raise ProviderUnavailableError(f"Provider {provider_name} is not available")
        
        # Cache and return
        cls._instances[provider_name] = provider
        return provider
    
    @classmethod
    def list_available_providers(cls) -> Dict[str, bool]:
        """List all providers and their availability"""
        availability = {}
        for name, provider_class in cls._providers.items():
            try:
                provider = provider_class()
                availability[name] = provider.is_available
            except Exception:
                availability[name] = False
        
        return availability
    
    @classmethod
    def get_default_provider(cls) -> IsolationProvider:
        """Get the first available provider"""
        availability = cls.list_available_providers()
        
        # Preferred order
        preferred_order = ['docker', 'vm']
        
        for provider_name in preferred_order:
            if provider_name in availability and availability[provider_name]:
                return cls.get_provider(provider_name)
        
        # Fallback to any available provider
        for provider_name, is_available in availability.items():
            if is_available:
                return cls.get_provider(provider_name)
        
        raise ProviderUnavailableError("No isolation providers are available")


def test_provider_factory():
    """Test the provider factory"""
    factory = ProviderFactory()
    
    print("Available providers:")
    for name, available in factory.list_available_providers().items():
        status = "✅" if available else "❌"
        print(f"  {status} {name}")
    
    try:
        provider = factory.get_default_provider()
        print(f"\\nUsing provider: {provider.provider_name}")
        print(f"Version: {provider.get_version()}")
        
        health = provider.health_check()
        print(f"Health check: {health}")
        
        return True
    except Exception as e:
        print(f"\\nError: {e}")
        return False


if __name__ == "__main__":
    test_provider_factory()