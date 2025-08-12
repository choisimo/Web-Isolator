# Tasks Overview

Web Isolator 프로젝트의 모든 작업을 스프린트와 에픽별로 체계적으로 관리합니다.

## 폴더 구조

```
tasks/
├── sprint-1/                          # PoC (2025-08)
│   ├── epic-1-core-infrastructure/    # 핵심 인프라
│   ├── epic-2-project-templates/      # 프로젝트 템플릿
│   ├── us-001-docker-network/         # Docker 네트워크 생성
│   ├── us-002-cli-structure/          # CLI 구조 설계
│   ├── us-003-react-template/         # React 템플릿
│   └── us-004-fastapi-template/       # FastAPI 템플릿
├── sprint-2/                          # Alpha (2025-09)
│   ├── epic-3-reverse-proxy/          # 리버스 프록시 관리
│   ├── epic-4-security-tls/           # 보안 및 TLS
│   ├── us-005-nginx-dynamic/          # Nginx 동적 설정
│   ├── us-006-domain-routing/         # 도메인 라우팅
│   └── us-007-https-support/          # HTTPS 지원
├── sprint-3/                          # Beta (2025-10)
│   ├── epic-5-cross-platform/        # 크로스 플랫폼 지원
│   ├── us-008-windows-support/        # Windows 지원
│   └── us-009-traefik-mode/           # Traefik 모드
└── sprint-4/                          # GA (2025-11)
    ├── epic-6-plugin-system/          # 플러그인 시스템
    ├── us-010-database-plugins/       # DB 플러그인
    └── us-011-documentation/          # 문서화
```

## 스프린트별 작업 현황

### Sprint 1: PoC (핵심 기능 구현)
**목표**: 기본 CLI 명령어와 단일 프로젝트 실행 증명

| User Story | Priority | Points | Status |
|------------|----------|--------|--------|
| US-001: Docker 네트워크 생성 | Must Have | 5 | Pending |
| US-002: CLI 구조 설계 | Must Have | 8 | Pending |
| US-003: React 템플릿 | Must Have | 5 | Pending |
| US-004: FastAPI 템플릿 | Must Have | 3 | Pending |

**Total**: 21 story points

### Sprint 2: Alpha (다중 프로젝트 지원)
**목표**: 여러 프로젝트 동시 실행 및 도메인 라우팅

| User Story | Priority | Points | Status |
|------------|----------|--------|--------|
| US-005: Nginx 동적 설정 | Must Have | 13 | Pending |
| US-006: 도메인 라우팅 | Must Have | 8 | Pending |
| US-007: HTTPS 지원 | Should Have | 13 | Pending |

**Total**: 34 story points

### Sprint 3: Beta (플랫폼 호환성)
**목표**: Windows 지원 및 고급 기능

| User Story | Priority | Points | Status |
|------------|----------|--------|--------|
| US-008: Windows 지원 | Should Have | 21 | Pending |
| US-009: Traefik 모드 | Could Have | 13 | Pending |

**Total**: 34 story points

### Sprint 4: GA (완성도 향상)
**목표**: 플러그인 시스템 및 문서화

| User Story | Priority | Points | Status |
|------------|----------|--------|--------|
| US-010: DB 플러그인 | Could Have | 21 | Pending |
| US-011: 문서화 | Must Have | 13 | Pending |

**Total**: 34 story points

## 에픽별 목표

### Epic 1: Core Infrastructure
Docker 네트워크와 기본 컨테이너 관리 시스템 구축

### Epic 2: Project Templates  
React + FastAPI 프로젝트 스캐폴딩 시스템

### Epic 3: Reverse Proxy Management
Nginx 기반 동적 라우팅 및 설정 관리

### Epic 4: Security & TLS
HTTPS 지원 및 보안 강화

### Epic 5: Cross-Platform Support
Windows, macOS, Linux 호환성 확보

### Epic 6: Plugin System
확장 가능한 플러그인 아키텍처 구현

## 작업 진행 방법

각 폴더에는 다음 파일들이 포함됩니다:

1. **README.md**: 작업 개요 및 목표
2. **tasks.md**: 세부 작업 목록
3. **acceptance-criteria.md**: 완료 기준
4. **implementation.md**: 구현 가이드
5. **tests.md**: 테스트 시나리오

## 의존성 관리

작업 간 의존성은 다음과 같이 관리됩니다:

```
US-001 (Docker Network) 
  ↓
US-002 (CLI Structure)
  ↓
US-003, US-004 (Templates) [병렬]
  ↓
US-005 (Nginx Dynamic)
  ↓
US-006, US-007 (Routing, HTTPS) [병렬]
```

## 작업 시작하기

1. 현재 스프린트 폴더로 이동
2. 해당 User Story 폴더 확인
3. README.md 읽기
4. tasks.md에서 세부 작업 확인
5. 구현 시작