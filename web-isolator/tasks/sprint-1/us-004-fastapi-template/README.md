# US-004: FastAPI 프로젝트 템플릿

## 개요
FastAPI 기반의 표준화된 백엔드 API 프로젝트 템플릿을 생성합니다.

## 목표
- 즉시 실행 가능한 FastAPI 프로젝트 제공
- CORS 및 기본 미들웨어 설정
- Docker 기반 개발 환경 지원

## Acceptance Criteria
- [ ] FastAPI 최신 버전 기반 템플릿 제공
- [ ] CORS 설정이 기본으로 포함됨
- [ ] `uvicorn --reload` 명령어로 즉시 실행 가능
- [ ] OpenAPI 문서 자동 생성
- [ ] 헬스체크 엔드포인트 포함 (`/health`)
- [ ] 환경변수 기반 설정 관리

## Definition of Done
- [ ] FastAPI 프로젝트 구조 생성
- [ ] requirements.txt 작성
- [ ] 기본 라우터 및 미들웨어 설정
- [ ] Docker 설정 파일 포함
- [ ] API 문서 확인 테스트 작성

## 구현 파일
- `templates/fastapi/`: FastAPI 템플릿 디렉터리
- `cli/templates.py`: 템플릿 생성 로직