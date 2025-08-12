"""
예외 클래스 정의
"""

class IsolatorError(Exception):
    """Web Isolator 기본 예외 클래스"""
    pass

class NetworkError(IsolatorError):
    """네트워크 관련 예외"""
    pass

class DockerError(IsolatorError):
    """Docker 관련 예외"""
    pass

class TemplateError(IsolatorError):
    """템플릿 관련 예외"""
    pass

class ValidationError(IsolatorError):
    """검증 관련 예외"""
    pass

class ConfigError(IsolatorError):
    """설정 관련 예외"""
    pass

class NginxError(IsolatorError):
    """Nginx 관련 예외"""
    pass