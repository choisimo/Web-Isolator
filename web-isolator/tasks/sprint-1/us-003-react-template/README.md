# US-003: React 프로젝트 템플릿

## 개요
Next.js 14 App Router 기반의 표준화된 React 프로젝트 템플릿을 생성합니다.

## 목표
- 즉시 실행 가능한 React 프로젝트 제공
- 환경변수 기반 API 연동 설정
- Docker 기반 개발 환경 지원

## Acceptance Criteria
- [ ] Next.js 14 App Router 기반 템플릿 제공
- [ ] 환경변수로 API 엔드포인트 설정 가능
- [ ] `npm run dev` 명령어로 즉시 실행 가능
- [ ] Hot reload 정상 동작
- [ ] TypeScript 기본 설정 포함
- [ ] ESLint, Prettier 설정 포함

## Definition of Done
- [ ] 템플릿 디렉터리 구조 생성
- [ ] package.json 및 설정 파일 작성
- [ ] 샘플 페이지 및 컴포넌트 작성
- [ ] Docker 설정 파일 포함
- [ ] 템플릿 생성 테스트 작성

## 구현 파일
- `templates/react-next/`: React 템플릿 디렉터리
- `cli/templates.py`: 템플릿 생성 로직