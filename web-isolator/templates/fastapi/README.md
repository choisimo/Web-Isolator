# {{PROJECT_NAME}} API

Web Isolator로 생성된 FastAPI 프로젝트입니다.

## 🚀 빠른 시작

### 로컬 개발
```bash
# 의존성 설치
pip install -r requirements.txt

# 개발 서버 시작
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker 사용
```bash
# 개발 환경
docker build -f Dockerfile.dev -t {{PROJECT_NAME}}-api:dev .
docker run -p 8000:8000 {{PROJECT_NAME}}-api:dev

# 프로덕션 환경
docker build -t {{PROJECT_NAME}}-api .
docker run -p 8000:8000 {{PROJECT_NAME}}-api
```

### Web Isolator 사용
```bash
# 프로젝트 디렉터리에서
isolator up
```

## 📚 API 문서

서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://api.{{PROJECT_NAME}}.local/docs
- **ReDoc**: http://api.{{PROJECT_NAME}}.local/redoc

## 🛠️ 주요 기능

### 엔드포인트
- `GET /`: 루트 엔드포인트
- `GET /health`: 헬스체크
- `GET /api/v1/health/`: 상세 헬스체크
- `GET /api/v1/items/`: 아이템 목록 조회
- `POST /api/v1/items/`: 새 아이템 생성
- `GET /api/v1/items/{id}`: 특정 아이템 조회
- `PUT /api/v1/items/{id}`: 아이템 수정
- `DELETE /api/v1/items/{id}`: 아이템 삭제

### 기본 설정
- **CORS**: 프론트엔드 도메인에서 접근 허용
- **환경변수**: `.env` 파일로 설정 관리
- **자동 문서화**: OpenAPI/Swagger 자동 생성
- **타입 검증**: Pydantic 모델 사용

## 🔧 개발 가이드

### 프로젝트 구조
```
app/
├── main.py              # 메인 애플리케이션
├── core/
│   └── config.py        # 설정 관리
├── api/
│   └── api_v1/
│       ├── api.py       # API 라우터
│       └── endpoints/   # 엔드포인트 모듈
│           ├── health.py
│           └── items.py
├── models/              # 데이터베이스 모델
├── schemas/             # Pydantic 스키마
└── tests/               # 테스트 코드
```

### 환경변수 설정
`.env` 파일을 생성하여 다음 변수들을 설정하세요:

```env
# 기본 설정
PROJECT_NAME={{PROJECT_NAME}}
ENVIRONMENT=development
DEBUG=true

# 보안
SECRET_KEY=your-secret-key-here

# 데이터베이스 (선택사항)
DATABASE_URL=sqlite:///./{{PROJECT_NAME}}.db

# CORS (필요시 수정)
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://{{PROJECT_NAME}}.local"]
```

### 새 엔드포인트 추가
1. `app/api/api_v1/endpoints/`에 새 모듈 생성
2. `app/api/api_v1/api.py`에 라우터 등록
3. 필요시 `app/schemas/`에 Pydantic 모델 정의

### 테스트 실행
```bash
pytest tests/
```

## 🔗 관련 링크
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [Web Isolator 가이드](../../docs/getting-started.md)