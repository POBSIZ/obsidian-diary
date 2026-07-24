## 변경 요약

- 무엇이 어떻게 바뀌었는지 1~3줄로 작성

## 배경 / 목적

- 왜 필요한 변경인지 1~2줄로 작성

## 필수 체크리스트

- [ ] 기존 기능 회귀 없음 (핵심 흐름 직접 확인)
- [ ] `npm run lint`를 실행해 성공했다.
- [ ] `npm run build`를 실행해 성공했다.
- [ ] 문서 또는 UI 변경 시 `npm run design:lint`를 실행해 성공했다.
- [ ] UI 변경 시 `design.md` 원칙 준수 (테마 우선, 기능 우선)
- [ ] 하드코딩 최소화, 공통 토큰(`styles.css`의 `:root`) 우선 사용
- [ ] Planner UI 변경 시 Yearly/Monthly grid/Monthly list/Daily/3-day/Sidebar 중 영향받는 뷰 확인
- [ ] 모바일 UI 변경 시 작은 화면과 소프트웨어 키보드가 열린 상태 확인
- [ ] 드래그/선택/클립보드 상호작용 회귀 없음 (`z-index`, `pointer-events` 포함)

## 빠른 테스트 결과

- 확인한 항목:
  - [ ] Yearly planner
  - [ ] Monthly grid planner
  - [ ] Monthly list planner
  - [ ] Daily planner
  - [ ] 3-day planner
  - [ ] Sidebar planner
  - [ ] Date/Range note 생성 및 열기
  - [ ] 칩/범위 바 클릭 및 파일 옵션 모달
- 스크린샷(선택): 

## 관련 이슈

- Closes #
