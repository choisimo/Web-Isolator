"""
CLI 패키지 초기화
"""

__version__ = "1.0.0"
__author__ = "Web Isolator Team"
__description__ = "로컬 개발 환경 격리를 위한 Docker 기반 개발 플랫폼"

from .main import app

__all__ = ["app"]