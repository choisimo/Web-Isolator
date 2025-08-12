# Getting Started with Web Isolator

Web Isolator를 사용하여 10분 안에 로컬 개발 환경을 설정하고 첫 번째 프로젝트를 실행해보세요.

## 🎯 시작하기 전에

### 필수 요구사항
- **Docker Desktop**: 4.0 이상
- **Python**: 3.8 이상
- **Git**: 최신 버전
- **운영체제**: macOS, Linux, Windows (WSL2 권장)

### 권장 도구
- **VS Code**: 코드 편집기
- **Node.js**: 18 이상 (React 개발용)

## 🚀 빠른 설치

### 1단계: Web Isolator 설치
```bash
# Git으로 프로젝트 클론
git clone https://github.com/your-org/web-isolator.git
cd web-isolator

# CLI 도구 설치
pip install -e ./cli
```

### 2단계: 설치 확인
```bash
isolator --version
# 출력: Web Isolator v1.0.0
```

## 🏃‍♂️ 첫 번째 프로젝트 생성

### 1단계: 새 프로젝트 생성
```bash
# 풀스택 프로젝트 생성
isolator init my-blog

# 또는 프론트엔드만
isolator init my-frontend --template react

# 또는 백엔드만
isolator init my-api --template fastapi
```

### 2단계: 프로젝트 시작
```bash
# 프로젝트 디렉터리로 이동
cd my-blog

# 모든 서비스 시작
isolator up
```

### 3단계: 브라우저에서 확인
- **프론트엔드**: http://my-blog.local
- **API 문서**: http://api.my-blog.local/docs
- **Nginx 대시보드**: http://localhost

## 📁 프로젝트 구조

생성된 풀스택 프로젝트는 다음과 같은 구조를 갖습니다:

```
my-blog/
├── frontend/                 # Next.js React 앱
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
├── backend/                  # FastAPI 서버
│   ├── app/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Dockerfile.dev
├── docker-compose.yml        # 개발 환경 설정
├── docker-compose.prod.yml   # 프로덕션 설정
└── .env                      # 환경변수
```

## 🔧 일반적인 작업

### 서비스 관리
```bash
# 모든 서비스 시작
isolator up

# 특정 프로젝트만 시작
isolator up --project my-blog

# 서비스 상태 확인
isolator status

# 모든 서비스 중지
isolator stop

# 볼륨까지 정리
isolator stop --cleanup
```

### 네트워크 관리
```bash
# 네트워크 상태 확인
isolator network status

# 네트워크 목록 보기
isolator network list

# 네트워크 수동 생성
isolator network create
```

### 개발 환경 설정
```bash
# 환경변수 편집
vim my-blog/.env

# 로그 확인
docker logs my-blog_web
docker logs my-blog_api

# 컨테이너 내부 접근
docker exec -it my-blog_web sh
docker exec -it my-blog_api bash
```

## 🌐 도메인 설정

Web Isolator는 자동으로 로컬 도메인을 설정합니다:

### 자동 설정되는 도메인
- `{project-name}.local` → 프론트엔드
- `api.{project-name}.local` → 백엔드 API
- `localhost` → Nginx 대시보드

### 수동 도메인 설정 (필요시)
```bash
# macOS/Linux
sudo vim /etc/hosts

# Windows
# 관리자 권한으로 C:\Windows\System32\drivers\etc\hosts 편집

# 추가할 내용
127.0.0.1 my-blog.local
127.0.0.1 api.my-blog.local
```

## 🔒 HTTPS 설정 (선택사항)

### mkcert를 사용한 로컬 HTTPS
```bash
# mkcert 설치 (macOS)
brew install mkcert

# 로컬 CA 설치
mkcert -install

# Web Isolator HTTPS 활성화
isolator tls enable
```

## 🛠️ 개발 가이드

### 프론트엔드 개발
```bash
# 프론트엔드 디렉터리로 이동
cd my-blog/frontend

# 의존성 설치
npm install

# 개발 서버 시작 (Docker 외부)
npm run dev

# 타입 체크
npm run type-check

# 린팅
npm run lint
```

### 백엔드 개발
```bash
# 백엔드 디렉터리로 이동
cd my-blog/backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 시작 (Docker 외부)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
pytest tests/
```

## 📊 모니터링 및 디버깅

### 서비스 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# 서비스 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f web
docker-compose logs -f api
```

### 성능 모니터링
```bash
# 리소스 사용량 확인
docker stats

# 네트워크 연결 확인
docker network ls
docker network inspect local_dev_network
```

## 🔥 트러블슈팅

### 일반적인 문제들

#### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :80
lsof -i :3000
lsof -i :8000

# 충돌하는 프로세스 종료
sudo kill -9 <PID>
```

#### Docker 권한 문제
```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 다시 로그인 필요
```

#### 도메인 접근 불가
```bash
# DNS 캐시 플러시
sudo dscacheutil -flushcache  # macOS
sudo systemctl restart systemd-resolved  # Linux
ipconfig /flushdns  # Windows
```

#### 컨테이너 빌드 실패
```bash
# Docker 캐시 정리
docker system prune -f

# 강제 재빌드
isolator up --build --force
```

## 🤝 도움 받기

### 문서 및 리소스
- [User Stories](../agile-methodology/user-stories.md)
- [Task Overview](../tasks/README.md)
- [CLI 레퍼런스](./cli-reference.md)

### 지원 채널
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussions**: 질문 및 사용법 문의
- **Slack**: 실시간 커뮤니티 지원

### 기여하기
Web Isolator는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🎉 축하합니다!

이제 Web Isolator를 사용하여 로컬 개발 환경을 설정했습니다. 다음 단계로:

1. **코드 수정**: 템플릿 코드를 원하는 대로 수정
2. **새 기능 추가**: API 엔드포인트나 React 컴포넌트 추가
3. **여러 프로젝트**: `isolator init`으로 추가 프로젝트 생성
4. **팀과 공유**: 설정을 팀원들과 공유하여 동일한 환경 구축

즐거운 개발 되세요! 🚀