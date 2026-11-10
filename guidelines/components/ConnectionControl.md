# ConnectionControl

센서 데이터(Supabase) 조회 시작, 중지 버튼과 상태 표시. 컨트롤 영역의 첫 행.

- 한 행: 왼쪽 [컨트롤 이름 "센서" `t-label` + 그 아래 상태], 오른쪽 버튼. 박스 없이 바탕 위에 바로
- 상태 4개와 문구 (`t-label`, `role="status"`, 앞에 8×8 사각 점, 점과 글자 사이 space-1):
  - disconnected: "연결 안 됨" (`--ink-muted`, 점 `--off`)
  - connecting: "연결 중…" (`--ink-muted`, 점 `--brand`)
  - connected: "연결됨" (`--status-on`, 점 `--status-on`)
  - error: "연결 실패, 다시 시도" (`--danger`, 점 `--danger`)
- 버튼 (사각, radius 0, 테두리 없음, min-height 44px, 패딩 space-3 space-4, `t-label`):
  - 연결 전: "센서 연결", `--brand` 채움 + `--on-brand` 글자
  - 연결 후: "연결 끊기", `--ink` 채움 + `--surface` 글자
  - connecting 중 disabled (opacity .5)
- 연결 끊으면 차트와 LED는 마지막 값을 유지한 채 멈춘다
- 초기 `Reading` 조회가 성공하면 최근 60개를 표시하고, 1초마다 더 큰 id의 새 행을 확인한다
- "연결됨"은 Supabase 조회 성공 및 폴링 중이라는 뜻이다. Arduino USB 연결 상태는 별도 업로더에서 확인한다
- 연결 직후 5초 동안 상태 아래에 "램프를 세운 상태에서 켜야 0°가 맞습니다" `t-caption` `--ink-muted` 한 줄을 표시한다
