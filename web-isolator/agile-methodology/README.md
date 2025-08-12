# Web Isolator 애자일 방법론

ABMAD-method와 task-master-ai를 활용한 Web Isolator 프로젝트 관리

## ABMAD Method 적용

### A - Analyze (분석)
- **문제 정의**: 포트 충돌, 환경 불일치, 설정 번거로움, 코드 수정 부담
- **목표 설정**: Zero Port Collision, 코드 수정 최소화, Single Entry Point, 10분 온보딩
- **기술 스택 분석**: React, FastAPI, Nginx, Docker Compose 조합 최적화

### B - Breakdown (분해)
프로젝트를 다음 에픽으로 분해:
1. **Core Infrastructure**: 네트워크, 컨테이너 기반 구조
2. **CLI Tool**: 프로젝트 관리 명령어 도구
3. **Reverse Proxy**: Nginx 동적 설정 관리
4. **Project Templates**: React + FastAPI 스캐폴딩
5. **Security & TLS**: HTTPS 지원
6. **Documentation**: 사용자 가이드

### M - Manage (관리)
스프린트별 관리:
- **Sprint 1 (PoC)**: 핵심 CLI 3종 구현
- **Sprint 2 (Alpha)**: 다중 프로젝트 라우팅
- **Sprint 3 (Beta)**: 크로스 플랫폼 지원
- **Sprint 4 (GA)**: 플러그인 시스템

### A - Adapt (적응)
지속적 개선:
- 사용자 피드백 기반 CLI UX 개선
- 성능 모니터링 및 최적화
- 새로운 프레임워크 템플릿 추가

### D - Deploy (배포)
배포 전략:
- GitHub Releases를 통한 버전 관리
- pip 패키지로 CLI 배포
- Docker Hub에 Nginx 이미지 배포

## Task Master AI 적용

### 지능형 작업 분해
각 에픽을 구현 가능한 최소 단위로 자동 분해:

```yaml
Epic: Core Infrastructure
Tasks:
  - Docker 네트워크 생성 스크립트
  - 컨테이너 간 통신 테스트
  - 네트워크 격리 검증
```

### 우선순위 자동 조정
의존성 기반 작업 순서 결정:
1. 네트워크 인프라 → CLI 기본 구조 → 템플릿 시스템
2. 리스크 기반 우선순위: 핵심 기능 우선, 선택 기능 후순위

### 진행률 추적
- 각 스프린트별 완료율 자동 계산
- 블로커 작업 자동 식별 및 알림
- 번다운 차트 생성

## 스프린트 계획

### Sprint 1: PoC (2025-08)
**목표**: 기본 동작 증명
- [ ] Docker 네트워크 설정
- [ ] 기본 CLI 구조 (`init`, `up`, `stop`)
- [ ] 단일 프로젝트 테스트

### Sprint 2: Alpha (2025-09)  
**목표**: 다중 프로젝트 지원
- [ ] Nginx 동적 설정 생성
- [ ] 도메인 라우팅 구현
- [ ] 기본 HTTPS 지원

### Sprint 3: Beta (2025-10)
**목표**: 플랫폼 호환성
- [ ] Windows/WSL 지원
- [ ] Traefik 옵션 추가
- [ ] 성능 최적화

### Sprint 4: GA (2025-11)
**목표**: 프로덕션 준비
- [ ] 플러그인 시스템
- [ ] 완전한 문서화
- [ ] 통합 테스트 스위트

## 데일리 스탠드업 템플릿

### 어제 한 일
- 완료된 작업 항목
- 발견된 이슈

### 오늘 할 일  
- 계획된 작업 항목
- 예상 소요 시간

### 블로커
- 의존성 대기 항목
- 기술적 난제

## 회고 프로세스

### What Went Well (잘된 점)
- 성공한 구현 방식
- 효과적인 도구/프로세스

### What Could Be Improved (개선점)
- 비효율적인 부분
- 놓친 요구사항

### Action Items (액션 아이템)
- 다음 스프린트 개선 사항
- 프로세스 변경 계획

## 정의 완료 (Definition of Done)

각 작업 항목이 완료되려면:
- [ ] 코드 작성 완료
- [ ] 단위 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트
- [ ] 통합 테스트 검증

## 메트릭 및 KPI

### 개발 메트릭
- 스프린트 완료율
- 코드 커버리지
- 버그 발견율

### 제품 메트릭  
- 10분 온보딩 성공률
- 포트 충돌 발생 빈도
- 평균 응답 시간 (Nginx 경유)