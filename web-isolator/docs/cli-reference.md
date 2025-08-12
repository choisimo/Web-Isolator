# CLI Reference

Web Isolator CLI 도구의 전체 명령어 레퍼런스입니다.

## 전역 옵션

모든 명령어에서 사용할 수 있는 옵션들:

```bash
isolator [COMMAND] [OPTIONS]

Global Options:
  --verbose, -v    상세 출력 모드
  --quiet, -q      조용한 모드 (에러만 출력)
  --help           도움말 표시
  --version        버전 정보 표시
```

## 명령어 목록

### `isolator init`
새 프로젝트를 생성합니다.

```bash
isolator init <project-name> [OPTIONS]

Arguments:
  project-name    프로젝트 이름 (필수)

Options:
  --template TEXT     템플릿 타입 [react|fastapi|fullstack] (기본값: fullstack)
  --directory PATH    생성할 디렉터리 (기본값: 현재 디렉터리/프로젝트명)
  --force, -f         기존 디렉터리 덮어쓰기
  --help              명령어 도움말
```

#### 사용 예시
```bash
# 풀스택 프로젝트 생성
isolator init my-blog

# React 프로젝트만 생성
isolator init my-frontend --template react

# 특정 디렉터리에 생성
isolator init my-project --directory /path/to/projects/my-project

# 기존 디렉터리 덮어쓰기
isolator init my-project --force
```

### `isolator init list-templates`
사용 가능한 템플릿 목록을 표시합니다.

```bash
isolator init list-templates

사용 가능한 템플릿:
  • react: Next.js 14 App Router 프로젝트
  • fastapi: FastAPI 백엔드 프로젝트
  • fullstack: React + FastAPI 풀스택 프로젝트
```

---

### `isolator up`
서비스를 시작합니다.

```bash
isolator up [OPTIONS]

Options:
  --project TEXT      특정 프로젝트만 시작
  --build             이미지 강제 재빌드
  --detach/--no-detach  백그라운드 실행 여부 (기본값: true)
  --help              명령어 도움말
```

#### 사용 예시
```bash
# 모든 서비스 시작
isolator up

# 특정 프로젝트만 시작
isolator up --project my-blog

# 이미지 재빌드 후 시작
isolator up --build

# 포어그라운드에서 실행
isolator up --no-detach
```

### `isolator up status`
실행 중인 서비스 상태를 확인합니다.

```bash
isolator up status

실행 중인 서비스:
  🟢 my-blog_web (healthy)
  🟢 my-blog_api (healthy)
  🟢 nginx-proxy (healthy)
```

---

### `isolator stop`
서비스를 중지합니다.

```bash
isolator stop [COMMAND] [OPTIONS]

Commands:
  all        모든 서비스 중지 (기본값)
  project    특정 프로젝트 중지

Options:
  --cleanup    볼륨과 네트워크도 함께 정리
  --force, -f  확인 없이 강제 중지
  --help       명령어 도움말
```

#### 사용 예시
```bash
# 모든 서비스 중지
isolator stop
isolator stop all

# 특정 프로젝트 중지
isolator stop project my-blog

# 볼륨까지 정리
isolator stop --cleanup

# 확인 없이 강제 중지
isolator stop --force
```

---

### `isolator network`
Docker 네트워크를 관리합니다.

```bash
isolator network [COMMAND] [OPTIONS]

Commands:
  create     네트워크 생성
  remove     네트워크 삭제
  list       네트워크 목록 표시
  status     네트워크 상태 확인

Options:
  --name TEXT     네트워크 이름 (기본값: local_dev_network)
  --driver TEXT   네트워크 드라이버 (기본값: bridge)
  --force, -f     강제 삭제
  --help          명령어 도움말
```

#### 사용 예시
```bash
# 기본 네트워크 생성
isolator network create

# 커스텀 네트워크 생성
isolator network create --name my-network --driver bridge

# 네트워크 목록 확인
isolator network list

# 네트워크 상태 확인
isolator network status

# 네트워크 삭제
isolator network remove
isolator network remove --force
```

---

### `isolator tls` (향후 구현)
HTTPS/TLS 설정을 관리합니다.

```bash
isolator tls [COMMAND] [OPTIONS]

Commands:
  enable     HTTPS 활성화
  disable    HTTPS 비활성화
  renew      인증서 갱신
  status     TLS 상태 확인

Options:
  --domain TEXT   도메인 지정
  --force, -f     기존 인증서 덮어쓰기
  --help          명령어 도움말
```

---

### `isolator plugin` (향후 구현)
플러그인을 관리합니다.

```bash
isolator plugin [COMMAND] [OPTIONS]

Commands:
  list       설치된 플러그인 목록
  add        플러그인 추가
  remove     플러그인 제거
  update     플러그인 업데이트

Options:
  --name TEXT     플러그인 이름
  --version TEXT  플러그인 버전
  --help          명령어 도움말
```

#### 사용 예시 (향후)
```bash
# PostgreSQL 플러그인 추가
isolator plugin add postgres

# Redis 플러그인 추가
isolator plugin add redis

# 플러그인 목록 확인
isolator plugin list

# 플러그인 제거
isolator plugin remove postgres
```

## 설정 파일

### 전역 설정
Web Isolator는 다음 위치에서 설정 파일을 찾습니다:

- `~/.isolator/config.yml` (사용자 전역 설정)
- `./isolator.yml` (프로젝트별 설정)
- 환경변수 (`ISOLATOR_*`)

### 설정 예시
```yaml
# ~/.isolator/config.yml
default_template: fullstack
network_name: local_dev_network
proxy_type: nginx  # nginx 또는 traefik
log_level: info

# 도메인 설정
domain_suffix: .local
auto_hosts: true

# TLS 설정
tls_enabled: false
cert_path: ~/.isolator/certs

# 플러그인 설정
plugins:
  - postgres
  - redis
```

## 환경변수

Web Isolator는 다음 환경변수를 지원합니다:

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ISOLATOR_LOG_LEVEL` | 로그 레벨 | `info` |
| `ISOLATOR_NETWORK_NAME` | 네트워크 이름 | `local_dev_network` |
| `ISOLATOR_DOMAIN_SUFFIX` | 도메인 접미사 | `.local` |
| `ISOLATOR_PROXY_TYPE` | 프록시 타입 | `nginx` |
| `ISOLATOR_AUTO_HOSTS` | hosts 파일 자동 수정 | `true` |
| `ISOLATOR_TLS_ENABLED` | TLS 활성화 | `false` |

### 사용 예시
```bash
# 환경변수로 설정 오버라이드
export ISOLATOR_LOG_LEVEL=debug
export ISOLATOR_DOMAIN_SUFFIX=.dev

# 명령어 실행
isolator up
```

## 종료 코드

Web Isolator CLI는 다음 종료 코드를 사용합니다:

| 코드 | 의미 |
|------|------|
| 0 | 성공 |
| 1 | 일반적인 오류 |
| 2 | 잘못된 사용법 |
| 3 | Docker 연결 실패 |
| 4 | 네트워크 오류 |
| 5 | 파일 시스템 오류 |
| 6 | 권한 오류 |

## 로깅

### 로그 레벨
- `DEBUG`: 모든 디버그 정보
- `INFO`: 일반적인 정보 (기본값)
- `WARNING`: 경고 메시지
- `ERROR`: 오류 메시지만

### 로그 파일
로그는 다음 위치에 저장됩니다:
- `~/.isolator/logs/isolator.log`
- 프로젝트별: `{project}/.isolator/logs/`

### 로그 확인
```bash
# 최근 로그 확인
tail -f ~/.isolator/logs/isolator.log

# 특정 날짜 로그 확인
grep "2024-08-13" ~/.isolator/logs/isolator.log

# 에러 로그만 확인
grep "ERROR" ~/.isolator/logs/isolator.log
```

## 자동 완성

Bash/Zsh에서 탭 자동 완성을 활성화하려면:

```bash
# Bash
echo 'eval "$(_ISOLATOR_COMPLETE=bash_source isolator)"' >> ~/.bashrc

# Zsh  
echo 'eval "$(_ISOLATOR_COMPLETE=zsh_source isolator)"' >> ~/.zshrc

# 현재 세션에서 바로 활성화
source ~/.bashrc  # 또는 ~/.zshrc
```

## 디버깅 팁

### 상세 출력 모드
```bash
# 모든 Docker 명령어와 출력 확인
isolator up --verbose

# 디버그 레벨 로그
ISOLATOR_LOG_LEVEL=debug isolator up
```

### 트러블슈팅 명령어
```bash
# Docker 상태 확인
docker ps -a
docker network ls
docker volume ls

# 네트워크 상세 정보
docker network inspect local_dev_network

# 로그 확인
docker logs nginx-proxy
docker logs my-project_web
docker logs my-project_api
```