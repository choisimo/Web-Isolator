# 서버 연동 가이드

이 문서는 Local Dev Forge 프론트엔드를 실제 서버와 연동하는 방법을 설명합니다.

## 환경 설정

### 1. 환경 변수 설정

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

### 2. 서버 요구사항

백엔드 서버는 다음 API 엔드포인트를 제공해야 합니다:

#### REST API 엔드포인트

**프로젝트 관리**
- `GET /api/projects` - 프로젝트 목록 조회
- `GET /api/projects/{id}` - 특정 프로젝트 조회
- `POST /api/projects` - 새 프로젝트 생성
- `DELETE /api/projects/{id}` - 프로젝트 삭제
- `POST /api/projects/{id}/start` - 프로젝트 시작
- `POST /api/projects/{id}/stop` - 프로젝트 중지
- `POST /api/projects/{id}/restart` - 프로젝트 재시작

**로그 관리**
- `GET /api/projects/{id}/logs/{service}` - 프로젝트 로그 조회
  - `service`: frontend, backend, database

**시스템 통계**
- `GET /api/system/stats` - 시스템 통계 조회

#### WebSocket 엔드포인트

**실시간 로그**
- `ws://localhost:8080/ws/logs/{projectId}/{service}` - 실시간 로그 스트림

**프로젝트 업데이트**
- `ws://localhost:8080/ws/projects` - 프로젝트 상태 변경 알림

### 3. API 응답 형식

모든 API 응답은 다음 형식을 따라야 합니다:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 4. WebSocket 메시지 형식

**프로젝트 업데이트**
```json
{
  "type": "project_updated",
  "payload": {
    // Project 객체
  }
}
```

**로그 엔트리**
```json
{
  "type": "log_entry",
  "payload": {
    "id": "unique-id",
    "timestamp": "2024-01-01T00:00:00Z",
    "level": "info",
    "source": "frontend",
    "message": "로그 메시지",
    "metadata": {}
  }
}
```

## 데이터 모델

### Project 타입

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'building';
  createdAt: string;
  updatedAt: string;
  frontend: {
    url: string;
    port: number;
    status: string;
    framework: string;
    buildCommand?: string;
    startCommand?: string;
  };
  backend: {
    url: string;
    port: number;
    status: string;
    framework: string;
    buildCommand?: string;
    startCommand?: string;
  };
  database?: {
    type: string;
    status: string;
    port?: number;
    connectionString?: string;
  };
  environment: {
    mode: string;
    variables: Record<string, string>;
  };
  resources: {
    cpu: { usage: number; limit: number };
    memory: { usage: number; limit: number };
    disk: { usage: number; limit: number };
  };
  logs: {
    frontend: LogEntry[];
    backend: LogEntry[];
    database?: LogEntry[];
  };
  config: {
    autoRestart: boolean;
    watchFiles: boolean;
    hotReload: boolean;
    ssl: boolean;
  };
}
```

### LogEntry 타입

```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}
```

### SystemStats 타입

```typescript
interface SystemStats {
  totalProjects: number;
  runningProjects: number;
  stoppedProjects: number;
  errorProjects: number;
  buildingProjects: number;
  systemResources: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      used: number;
      total: number;
      available: number;
    };
    disk: {
      used: number;
      total: number;
      available: number;
    };
  };
  networkPorts: {
    used: number[];
    available: number[];
    conflicts: number[];
  };
}
```

## 기능 설명

### 1. 실시간 연결

프론트엔드는 다음과 같은 방식으로 실시간 연결을 지원합니다:

- **WebSocket 자동 재연결**: 연결이 끊어지면 자동으로 재연결 시도
- **폴백 메커니즘**: WebSocket 연결 실패 시 HTTP 폴링으로 전환
- **실시간 로그 스트리밍**: 프로젝트 로그를 실시간으로 수신
- **프로젝트 상태 업데이트**: 프로젝트 상태 변경 시 즉시 UI 업데이트

### 2. 에러 핸들링

- **API 에러**: 네트워크 오류 및 서버 에러 처리
- **연결 상태 표시**: WebSocket 연결 상태를 UI에 표시
- **재시도 메커니즘**: 실패한 요청에 대한 수동/자동 재시도
- **사용자 알림**: 토스트 메시지를 통한 작업 결과 알림

### 3. 로딩 상태

- **전역 로딩**: 초기 데이터 로드 시 로딩 스피너 표시
- **개별 작업 로딩**: 프로젝트 시작/중지 등 개별 작업의 로딩 상태
- **실시간 데이터**: WebSocket 연결 상태 및 데이터 수신 표시

## 개발 시 주의사항

1. **환경 변수**: `.env` 파일이 git에 커밋되지 않도록 주의
2. **타입 안전성**: TypeScript 타입을 엄격하게 준수
3. **에러 처리**: 모든 API 호출에 적절한 에러 처리 구현
4. **메모리 관리**: WebSocket 연결 및 이벤트 리스너 정리
5. **성능**: 대량의 로그 데이터 처리 시 가상화 고려

## 테스트

### Mock 데이터 모드

서버가 없는 경우 자동으로 Mock 데이터 모드로 전환되어 개발을 계속할 수 있습니다.

### 실서버 연결 테스트

1. 서버를 실행합니다
2. 환경 변수가 올바르게 설정되었는지 확인합니다
3. 브라우저 개발자 도구에서 네트워크 탭을 확인하여 API 호출이 성공하는지 확인합니다
4. WebSocket 연결 상태를 UI에서 확인합니다

이제 프론트엔드가 실제 서버와 완전히 연동되어 프로젝트 관리, 실시간 로그 모니터링, 시스템 통계 확인 등의 모든 기능을 사용할 수 있습니다.