# Local Dev Forge

Project Isolator 프론트엔드 대시보드 - React 기반 개발 환경 관리 인터페이스

## 개요

Local Dev Forge는 Project Isolator의 프론트엔드 구성 요소로, 다중 프로젝트 개발 환경을 시각적으로 관리할 수 있는 웹 기반 대시보드입니다.

## 기능

### 핵심 기능
- **프로젝트 대시보드**: 모든 활성 프로젝트 상태 실시간 모니터링
- **프로젝트 관리**: 생성, 시작, 중지, 삭제 기능
- **리소스 모니터링**: CPU, 메모리, 네트워크 사용량 추적
- **로그 뷰어**: 실시간 로그 스트리밍 및 검색
- **포트 관리**: 자동 포트 할당 및 충돌 방지
- **실시간 WebSocket 연결**: 프로젝트 상태 및 로그 실시간 업데이트
- **에러 핸들링**: 자동 재연결 및 폴백 메커니즘

### UI 컴포넌트
- **현대적인 인터페이스**: shadcn/ui 기반 깔끔한 디자인
- **반응형 레이아웃**: 모바일 및 데스크톱 지원
- **다크 모드**: 개발자 친화적 테마
- **실시간 업데이트**: WebSocket 기반 실시간 데이터 동기화
- **Toast 알림**: 사용자 친화적 알림 시스템

## 기술 스택

- **Vite** - 빠른 개발 서버 및 빌드 도구
- **TypeScript** - 타입 안전성과 개발 생산성
- **React** - 선언적 UI 라이브러리
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트 라이브러리
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **@tanstack/react-query** - 서버 상태 관리 (미래 확장용)

## 개발 환경 설정

### 요구사항
- Node.js 18+ 또는 npm 호환 패키지 매니저
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 API 서버 주소 설정

# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린팅
npm run lint
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# API 서버 설정
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws

# 개발 환경 설정
VITE_NODE_ENV=development

# 로그 레벨
VITE_LOG_LEVEL=debug
```

## 서버 연동

### 자동 폴백 시스템

프론트엔드는 실제 서버 연결 여부에 따라 자동으로 작동 모드를 전환합니다:

- **실서버 모드**: 실제 API 서버와 연결된 경우
- **Mock 데이터 모드**: 서버 연결 실패 시 자동으로 Mock 데이터 사용

### 서버 요구사항

실제 서버와 연동하려면 다음 API 엔드포인트가 필요합니다:

- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `POST /api/projects/{id}/start` - 프로젝트 시작
- `POST /api/projects/{id}/stop` - 프로젝트 중지
- `GET /api/system/stats` - 시스템 통계
- `WS /ws/projects` - 실시간 프로젝트 업데이트
- `WS /ws/logs/{projectId}/{service}` - 실시간 로그 스트림

자세한 서버 연동 가이드는 [SERVER_INTEGRATION.md](./SERVER_INTEGRATION.md)를 참조하세요.

## 프로젝트 구조

```
src/
├── components/           # React 컴포넌트
│   ├── ui/              # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── Dashboard.tsx    # 메인 대시보드
│   ├── Header.tsx       # 헤더 컴포넌트
│   ├── LogViewer.tsx    # 로그 뷰어 컴포넌트
│   └── Sidebar.tsx      # 네비게이션 사이드바
├── hooks/               # 커스텀 React 훅
│   ├── useProject.ts    # 프로젝트 관리 훅
│   ├── useWebSocket.ts  # WebSocket 연결 훅
│   └── use-toast.ts     # Toast 알림 훅
├── lib/                 # 유틸리티 및 설정
│   ├── apiClient.ts     # API 클라이언트
│   └── utils.ts         # 공통 유틸리티
├── services/            # 비즈니스 로직
│   └── projectService.ts # 프로젝트 서비스
├── types/               # TypeScript 타입 정의
│   └── project.ts       # 프로젝트 관련 타입
├── App.tsx              # 루트 앱 컴포넌트
└── main.tsx             # 애플리케이션 진입점
```

## 주요 컴포넌트

### Dashboard.tsx
- 프로젝트 목록 및 상태 표시
- 빠른 액션 버튼 (시작, 중지, 재시작)
- 리소스 사용량 차트
- 실시간 상태 업데이트
- 에러 핸들링 및 알림

### LogViewer.tsx
- 실시간 로그 스트리밍
- 로그 레벨 및 서비스별 필터링
- 로그 검색 기능
- WebSocket/HTTP 모드 전환
- 로그 다운로드 및 복사

### 커스텀 훅

#### useProjects
```tsx
const {
  projects,
  isLoading,
  error,
  startProject,
  stopProject,
  createProject
} = useProjects();
```

#### useWebSocketLogs
```tsx
const {
  logs,
  isConnected,
  error,
  clearLogs
} = useWebSocketLogs({
  projectId: "project-id",
  service: "frontend"
});
```

## 개발 가이드

### 컴포넌트 개발
```tsx
// 새 컴포넌트 예시
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjects } from "@/hooks/useProject"

export function ProjectCard({ project }: { project: Project }) {
  const { startProject } = useProjects();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => startProject(project.id)}>
          시작
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 스타일링 가이드
- Tailwind CSS 유틸리티 클래스 사용
- shadcn/ui 컴포넌트 기본 스타일 활용
- 일관된 색상 팔레트 및 타이포그래피 적용

### 에러 핸들링
```tsx
// 에러 처리 예시
try {
  await startProject(projectId);
  toast({
    title: "프로젝트 시작",
    description: "프로젝트가 성공적으로 시작되었습니다."
  });
} catch (error) {
  toast({
    title: "오류 발생",
    description: "프로젝트를 시작할 수 없습니다.",
    variant: "destructive"
  });
}
```

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 정적 파일 생성 (dist/ 폴더)
# 웹 서버에 배포 가능

# 개발 모드 빌드 (디버깅용)
npm run build:dev
```

## 테스트

### 로컬 테스트
```bash
# 서버 없이 Mock 데이터로 테스트
npm run dev

# 실제 서버와 연결 테스트
# .env 파일에서 VITE_API_BASE_URL 설정 후
npm run dev
```

### WebSocket 연결 테스트
1. 브라우저 개발자 도구의 네트워크 탭에서 WS 연결 확인
2. 대시보드의 연결 상태 인디케이터 확인
3. 로그 뷰어에서 실시간 로그 수신 테스트

## 트러블슈팅

### 일반적인 문제

**API 연결 실패**
- `.env` 파일의 `VITE_API_BASE_URL` 확인
- 서버가 실행 중인지 확인
- CORS 설정 확인

**WebSocket 연결 실패**
- WebSocket URL 확인
- 방화벽 설정 확인
- HTTP 모드로 폴백 확인

**빌드 오류**
- Node.js 버전 확인 (18+ 필요)
- 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`

## 로드맵

### 완료된 기능
- [x] 실시간 모니터링 대시보드
- [x] 프로젝트 생성 및 관리
- [x] 로그 검색 및 필터링
- [x] WebSocket 실시간 연결
- [x] 에러 핸들링 및 폴백 시스템

### 근시일 내 개발 예정
- [ ] 프로젝트 설정 편집 모달
- [ ] 시스템 설정 관리
- [ ] 성능 최적화
- [ ] 테스트 코드 작성

### 장기 계획
- [ ] 플러그인 시스템
- [ ] 테마 커스터마이제이션
- [ ] 다국어 지원
- [ ] 모바일 앱 버전

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
