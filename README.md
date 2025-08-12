# Project Isolator

개발 환경 격리를 위한 통합 플랫폼 - 다중 프로젝트 로컬 개발 환경 관리 시스템

## 개요

Project Isolator는 다수의 React + Python 프로젝트를 포트 충돌 없이 동시에 실행할 수 있도록 하는 통합 개발 플랫폼입니다. Nginx 리버스 프록시와 Docker Compose를 활용하여 효율적인 로컬 개발 환경을 제공합니다.

## 프로젝트 구조

```
project-isolator/
├── local-dev-forge/          # React 프론트엔드 대시보드
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   │   ├── ui/          # 기본 UI 라이브러리
│   │   │   ├── Dashboard.tsx # 메인 대시보드
│   │   │   ├── Header.tsx   # 헤더 컴포넌트
│   │   │   └── Sidebar.tsx  # 사이드바 컴포넌트
│   │   ├── App.tsx          # 메인 앱 컴포넌트
│   │   └── main.tsx         # 진입점
│   ├── package.json         # 의존성 관리
│   └── vite.config.ts       # Vite 설정
└── web-isolator/            # 백엔드 시스템
    ├── cli/                 # CLI 도구
    │   ├── commands/        # CLI 명령어
    │   └── utils/           # 유틸리티
    ├── nginx/               # Nginx 설정
    │   └── conf.d/          # 프로젝트별 설정
    ├── templates/           # 프로젝트 템플릿
    │   ├── react-next/      # Next.js 템플릿
    │   └── fastapi/         # FastAPI 템플릿
    ├── docs/                # 문서화
    ├── agile-methodology/   # 애자일 방법론
    └── tasks/               # 개발 작업 관리
```

## 기술 스택

### 프론트엔드 (local-dev-forge)
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **TypeScript** - 타입 안전성
- **React** - UI 라이브러리
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트
- **Tailwind CSS** - 유틸리티 CSS 프레임워크

### 백엔드 시스템 (web-isolator)
- **Python** - CLI 도구 및 백엔드 로직
- **Docker & Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시 서버
- **FastAPI** - API 서버 템플릿
- **Next.js** - 프론트엔드 템플릿

## 빠른 시작

### 1. 환경 설정
```bash
# 프론트엔드 의존성 설치
cd local-dev-forge
npm install

# 백엔드 CLI 도구 설치
cd ../web-isolator
python -m pip install -e ./cli
```

### 2. 개발 서버 실행
```bash
# 프론트엔드 개발 서버 시작
cd local-dev-forge
npm run dev

# 새 프로젝트 생성 (CLI)
cd ../web-isolator
isolator init myblog

# 모든 프로젝트 시작
isolator up

# 모든 프로젝트 중지
isolator stop
```

## 주요 기능

### 프론트엔드 대시보드
- **프로젝트 관리**: 생성, 시작, 중지, 모니터링
- **실시간 상태 표시**: 프로젝트 상태 및 포트 정보
- **로그 뷰어**: 실시간 로그 모니터링
- **리소스 모니터링**: CPU, 메모리 사용량 추적

### CLI 도구
- **프로젝트 초기화**: 템플릿 기반 프로젝트 생성
- **네트워크 관리**: 포트 할당 및 프록시 설정
- **컨테이너 관리**: Docker 컨테이너 라이프사이클 관리

### 템플릿 시스템
- **React + Next.js**: 현대적인 프론트엔드 스택
- **FastAPI**: Python 기반 고성능 API 서버
- **커스터마이즈 가능**: 프로젝트 요구사항에 맞춘 템플릿 수정

## 문서

- [시작하기 가이드](./web-isolator/docs/getting-started.md)
- [CLI 참조 문서](./web-isolator/docs/cli-reference.md)
- [애자일 방법론](./web-isolator/agile-methodology/README.md)
- [작업 관리](./web-isolator/tasks/README.md)

## 개발 로드맵

### Phase 1 - 기본 기능 (완료)
- [x] 기본 CLI 구조
- [x] React 대시보드 템플릿
- [x] Nginx 프록시 설정

### Phase 2 - 고급 기능 (진행 중)
- [ ] 실시간 모니터링 대시보드
- [ ] 자동 포트 할당
- [ ] 로그 집계 시스템

### Phase 3 - 확장 기능 (계획)
- [ ] 다중 환경 지원 (dev, staging, prod)
- [ ] 프로젝트 템플릿 마켓플레이스
- [ ] 팀 협업 기능

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.