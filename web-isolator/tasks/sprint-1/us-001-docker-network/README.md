# US-001: Docker 네트워크 생성

## 개요
Web Isolator의 모든 컨테이너가 사용할 격리된 Docker 네트워크를 생성하고 관리하는 기능을 구현합니다.

## 목표
- 프로젝트 간 네트워크 격리 보장
- 컨테이너 간 통신 최적화
- 네트워크 생명주기 자동 관리

## Acceptance Criteria
- [ ] `local_dev_network`가 존재하지 않으면 자동 생성
- [ ] 이미 존재하는 네트워크는 재사용
- [ ] 네트워크 삭제 시 사용 중인 컨테이너가 있으면 경고
- [ ] 네트워크 생성/삭제 과정을 사용자에게 알림

## Definition of Done
- [ ] 단위 테스트 작성 및 통과
- [ ] 네트워크 관리 CLI 명령어 구현
- [ ] 에러 케이스 처리 완료
- [ ] 사용자 가이드 문서 작성

## 구현 파일
- `cli/network_manager.py`: 네트워크 관리 로직
- `tests/test_network_manager.py`: 단위 테스트
- `docs/network-setup.md`: 네트워크 설정 가이드