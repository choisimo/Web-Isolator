# Web Isolator

로컬 개발 환경 격리를 위한 **Web Isolator** - Nginx 리버스 프록시와 Docker Compose를 활용한 로컬 개발 플랫폼

## 개요
Web Isolator는 다수의 React + Python 프로젝트를 포트 충돌 없이 동시에 실행하도록 돕는 로컬 개발 플랫폼입니다.

## 프로젝트 구조
```
web-isolator/
├── cli/                    # CLI 도구
├── nginx/                  # Nginx 설정
│   └── conf.d/            # 프로젝트별 설정 파일
├── templates/             # 프로젝트 템플릿
│   ├── react-next/        # Next.js 템플릿
│   └── fastapi/           # FastAPI 템플릿
├── docs/                  # 문서화
├── agile-methodology/     # 애자일 방법론 문서
└── tasks/                 # 개별 작업 폴더
```

## 빠른 시작
```bash
# CLI 도구 설치
python -m pip install -e ./cli

# 새 프로젝트 생성
isolator init myblog

# 모든 프로젝트 시작
isolator up

# 모든 프로젝트 중지
isolator stop
```

## 문서
- [Getting Started](./docs/getting-started.md)
- [Agile Methodology](./agile-methodology/README.md)
- [Tasks Overview](./tasks/README.md)