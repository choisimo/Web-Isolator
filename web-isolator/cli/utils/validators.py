"""
프로젝트 이름 및 설정 검증
"""

import re
from pathlib import Path
from typing import List, Optional
from .exceptions import ValidationError

def validate_project_name(name: str) -> None:
    """
    프로젝트 이름 유효성 검증
    
    규칙:
    - 영문 소문자, 숫자, 하이픈만 허용
    - 3-63자 길이
    - 하이픈으로 시작/끝날 수 없음
    - 연속된 하이픈 불허용
    """
    if not name:
        raise ValidationError("프로젝트 이름이 비어있습니다.")
    
    if len(name) < 3 or len(name) > 63:
        raise ValidationError("프로젝트 이름은 3-63자 사이여야 합니다.")
    
    # DNS 호환 이름 패턴
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    if not re.match(pattern, name):
        raise ValidationError(
            "프로젝트 이름은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다. "
            "하이픈으로 시작하거나 끝날 수 없으며, 연속된 하이픈은 사용할 수 없습니다."
        )
    
    # 예약어 검사
    reserved_names = {
        'localhost', 'local', 'api', 'www', 'admin', 'root', 'system',
        'docker', 'nginx', 'redis', 'postgres', 'mysql', 'mongo'
    }
    
    if name.lower() in reserved_names:
        raise ValidationError(f"'{name}'은 예약된 이름입니다. 다른 이름을 선택하세요.")

def validate_template_type(template: str) -> None:
    """템플릿 타입 유효성 검증"""
    valid_templates = {'react', 'fastapi', 'fullstack'}
    
    if template not in valid_templates:
        raise ValidationError(
            f"지원하지 않는 템플릿 타입: {template}. "
            f"사용 가능한 타입: {', '.join(valid_templates)}"
        )

def validate_directory_path(path: Path) -> None:
    """디렉터리 경로 유효성 검증"""
    try:
        # 경로 해석 가능 여부 확인
        resolved_path = path.resolve()
        
        # 상위 디렉터리 존재 여부 확인
        if not resolved_path.parent.exists():
            raise ValidationError(f"상위 디렉터리가 존재하지 않습니다: {resolved_path.parent}")
        
        # 쓰기 권한 확인
        if resolved_path.parent.exists() and not resolved_path.parent.is_dir():
            raise ValidationError(f"상위 경로가 디렉터리가 아닙니다: {resolved_path.parent}")
            
    except OSError as e:
        raise ValidationError(f"잘못된 경로입니다: {e}")

def validate_port(port: int) -> None:
    """포트 번호 유효성 검증"""
    if not (1 <= port <= 65535):
        raise ValidationError(f"포트 번호는 1-65535 사이여야 합니다: {port}")
    
    # 예약된 포트 확인
    reserved_ports = {80, 443, 22, 53, 3306, 5432, 6379, 27017}
    if port in reserved_ports:
        raise ValidationError(f"포트 {port}는 시스템에서 사용하는 예약된 포트입니다.")

def validate_domain_name(domain: str) -> None:
    """도메인 이름 유효성 검증"""
    if not domain:
        raise ValidationError("도메인 이름이 비어있습니다.")
    
    # 기본 도메인 패턴 검증
    pattern = r'^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'
    if not re.match(pattern, domain):
        raise ValidationError("올바르지 않은 도메인 형식입니다.")
    
    # 길이 제한
    if len(domain) > 253:
        raise ValidationError("도메인 이름이 너무 깁니다 (최대 253자).")
    
    # 라벨별 검증
    labels = domain.split('.')
    for label in labels:
        if len(label) > 63:
            raise ValidationError(f"도메인 라벨이 너무 깁니다: {label} (최대 63자)")
        if label.startswith('-') or label.endswith('-'):
            raise ValidationError(f"도메인 라벨은 하이픈으로 시작하거나 끝날 수 없습니다: {label}")

def validate_docker_compose_file(file_path: Path) -> None:
    """Docker Compose 파일 유효성 검증"""
    if not file_path.exists():
        raise ValidationError(f"Docker Compose 파일이 존재하지 않습니다: {file_path}")
    
    if not file_path.is_file():
        raise ValidationError(f"Docker Compose 경로가 파일이 아닙니다: {file_path}")
    
    # 파일 확장자 확인
    valid_extensions = {'.yml', '.yaml'}
    if file_path.suffix not in valid_extensions:
        raise ValidationError(
            f"Docker Compose 파일의 확장자가 올바르지 않습니다: {file_path.suffix}. "
            f"지원하는 확장자: {', '.join(valid_extensions)}"
        )