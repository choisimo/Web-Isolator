# Sprint Planning

## Sprint 1: PoC (2025-08-13 ~ 2025-08-31)

### Sprint Goal
핵심 CLI 명령어 3종(`init`, `up`, `stop`)을 구현하여 기본 동작을 증명한다.

### Sprint Backlog

#### Epic 1: Core Infrastructure
**Points**: 13

##### US-001: Docker 네트워크 생성
- **As a** 개발자
- **I want** 격리된 Docker 네트워크를 자동으로 생성하고 관리하고 싶다
- **So that** 여러 프로젝트 간 네트워크 충돌을 방지할 수 있다

**Tasks**:
- [ ] `local_dev_network` 생성 스크립트 작성
- [ ] 네트워크 존재 여부 확인 로직
- [ ] 네트워크 정리 기능 구현

**Acceptance Criteria**:
- [ ] 네트워크가 없으면 자동 생성
- [ ] 기존 네트워크 재사용
- [ ] 네트워크 삭제 시 안전 확인

##### US-002: 기본 CLI 구조 설계
- **As a** 개발자  
- **I want** 직관적인 CLI 명령어를 사용하고 싶다
- **So that** 복잡한 Docker 명령어를 외우지 않아도 된다

**Tasks**:
- [ ] Typer 기반 CLI 프레임워크 설정
- [ ] `isolator init` 명령어 구현
- [ ] `isolator up` 명령어 구현  
- [ ] `isolator stop` 명령어 구현

**Acceptance Criteria**:
- [ ] 모든 명령어가 도움말 제공
- [ ] 오류 시 명확한 메시지 출력
- [ ] 진행 상황 실시간 표시

#### Epic 2: Project Templates
**Points**: 8

##### US-003: React 프로젝트 템플릿
- **As a** 프론트엔드 개발자
- **I want** 표준화된 React 프로젝트를 빠르게 생성하고 싶다  
- **So that** 매번 보일러플레이트를 작성하지 않아도 된다

**Tasks**:
- [ ] Next.js App Router 템플릿 작성
- [ ] 환경변수 설정 파일 생성
- [ ] Docker 설정 파일 생성

**Acceptance Criteria**:
- [ ] `npm run dev`로 즉시 실행 가능
- [ ] 환경변수로 API 엔드포인트 설정
- [ ] Hot reload 정상 동작

##### US-004: FastAPI 프로젝트 템플릿  
- **As a** 백엔드 개발자
- **I want** 표준화된 FastAPI 프로젝트를 빠르게 생성하고 싶다
- **So that** API 개발에만 집중할 수 있다

**Tasks**:
- [ ] FastAPI 프로젝트 구조 생성
- [ ] CORS 설정 포함
- [ ] Docker 설정 파일 생성
- [ ] 헬스체크 엔드포인트 추가

**Acceptance Criteria**:
- [ ] `uvicorn`으로 즉시 실행 가능
- [ ] OpenAPI 문서 자동 생성
- [ ] CORS 정상 동작

### Sprint Review Criteria
- [ ] 단일 프로젝트 생성 및 실행 가능
- [ ] 도메인 접근 정상 동작
- [ ] 컨테이너 정리 기능 동작

### Risks & Mitigations
- **Risk**: Docker Desktop 버전 호환성 이슈
  - **Mitigation**: 최소 요구사항 명시 및 버전 체크 추가
  
- **Risk**: 로컬 권한(sudo) 관련 문제
  - **Mitigation**: 권한 요청 전 명확한 안내 메시지

## Sprint 2: Alpha (2025-09-01 ~ 2025-09-30)

### Sprint Goal  
다중 프로젝트 라우팅과 기본 HTTPS를 지원하여 실제 사용 가능한 수준으로 발전시킨다.

### Sprint Backlog

#### Epic 3: Reverse Proxy Management
**Points**: 21

##### US-005: Nginx 동적 설정 생성
- **As a** 시스템 관리자
- **I want** 프로젝트별 Nginx 설정이 자동으로 생성되길 원한다
- **So that** 수동으로 설정 파일을 관리하지 않아도 된다

**Tasks**:
- [ ] Nginx 설정 템플릿 엔진 구현
- [ ] 프로젝트별 `.conf` 파일 생성
- [ ] 동적 리로드 메커니즘 구현

##### US-006: 도메인 라우팅 구현
- **As a** 개발자
- **I want** `project-name.local` 형태로 프로젝트에 접근하고 싶다
- **So that** 포트 번호를 기억하지 않아도 된다

**Tasks**:
- [ ] `/etc/hosts` 자동 패치 기능
- [ ] 도메인별 라우팅 규칙 생성
- [ ] 서브도메인 지원 (`api.project-name.local`)

#### Epic 4: Security & TLS  
**Points**: 13

##### US-007: HTTPS 지원
- **As a** 개발자
- **I want** 로컬에서도 HTTPS를 사용하고 싶다
- **So that** 프로덕션과 동일한 환경에서 테스트할 수 있다

**Tasks**:
- [ ] mkcert 통합
- [ ] 자체 서명 인증서 자동 생성
- [ ] Nginx SSL 설정 자동 적용

### Sprint Review Criteria
- [ ] 3개 이상 프로젝트 동시 실행
- [ ] 도메인별 정상 라우팅
- [ ] HTTPS 접근 가능

## Sprint 3: Beta (2025-10-01 ~ 2025-10-31)

### Sprint Goal
Windows/WSL 지원과 Traefik 옵션을 추가하여 플랫폼 호환성을 확보한다.

### Sprint Backlog

#### Epic 5: Cross-Platform Support
**Points**: 21

##### US-008: Windows 지원
- **As a** 윈도우 사용자
- **I want** 윈도우에서도 동일하게 동작하길 원한다
- **So that** 팀 전체가 동일한 도구를 사용할 수 있다

##### US-009: Traefik 모드 지원  
- **As a** 고급 사용자
- **I want** Traefik을 사용한 동적 라우팅을 선택할 수 있다
- **So that** 더 유연한 설정이 가능하다

### Sprint Review Criteria
- [ ] Windows에서 정상 동작
- [ ] Traefik 모드 선택 가능
- [ ] 성능 지표 목표 달성

## Sprint 4: GA (2025-11-01 ~ 2025-11-30)

### Sprint Goal
플러그인 시스템과 완전한 문서화를 통해 프로덕션 준비를 완료한다.

### Sprint Backlog

#### Epic 6: Plugin System
**Points**: 34

##### US-010: 데이터베이스 플러그인
- **As a** 풀스택 개발자  
- **I want** PostgreSQL, Redis 등을 쉽게 추가하고 싶다
- **So that** 완전한 개발 환경을 구성할 수 있다

##### US-011: 완전한 문서화
- **As a** 신규 사용자
- **I want** 명확한 가이드와 예제를 보고 싶다
- **So that** 빠르게 시작할 수 있다

### Sprint Review Criteria
- [ ] 플러그인 시스템 동작
- [ ] 10분 온보딩 달성
- [ ] 완전한 문서 세트 제공

## Retrospective Template

### Sprint 1 회고

#### What Went Well
- Docker 네트워크 설정이 예상보다 단순함
- Typer CLI 프레임워크가 직관적임
- 템플릿 생성 로직이 재사용 가능함

#### What Could Be Improved  
- 에러 핸들링이 부족함
- 테스트 커버리지가 낮음
- 문서가 코드와 동기화되지 않음

#### Action Items
- 에러 핸들링 표준화
- 테스트 주도 개발 도입  
- 문서 자동 생성 도구 검토