# US-002: CLI 구조 설계

## 개요
Typer 기반의 직관적이고 사용하기 쉬운 CLI 도구를 설계하고 구현합니다.

## 목표
- 직관적인 명령어 체계 구축
- 일관된 사용자 경험 제공
- 확장 가능한 CLI 아키텍처

## Acceptance Criteria
- [ ] `isolator init <project-name>` 명령어로 프로젝트 생성
- [ ] `isolator up` 명령어로 모든 서비스 시작
- [ ] `isolator stop` 명령어로 모든 서비스 중지
- [ ] `isolator --help` 명령어로 도움말 제공
- [ ] 각 명령어 실행 시 진행 상황 표시
- [ ] 오류 발생 시 명확한 메시지와 해결 방법 제시

## Definition of Done
- [ ] Typer 기반 CLI 프레임워크 설정
- [ ] 모든 기본 명령어 구현
- [ ] 명령어별 헬프 메시지 작성
- [ ] CLI 테스트 스위트 작성
- [ ] 사용자 매뉴얼 작성

## 구현 파일
- `cli/main.py`: 메인 CLI 애플리케이션
- `cli/commands/`: 개별 명령어 모듈
- `tests/test_cli.py`: CLI 테스트