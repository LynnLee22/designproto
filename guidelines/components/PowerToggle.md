# PowerToggle

LED 상태 표시. 컨트롤 영역의 둘째 행 (첫 행과 space-6 간격, 구분선 없음).

- 한 행: 컨트롤 이름 "LED" `t-label` + 그 아래 "꺼짐" 또는 "밝기 NN%" `t-caption` `--ink-muted`
- 버튼이나 스위치가 아닌 `role="status"` 상태 표시
- 밝기는 기울기 각도로 계산한다. `level = clamp(value / 45, 0, 1)`. 0°는 "꺼짐", 양수는 `level × 100`을 반올림해 "밝기 NN%"로 표시한다
- 표시 텍스트와 센서 원 채움은 같은 `level`을 사용한다
- `setLedPower`, `loadPower`는 화면에서 호출하지 않는다. `lib/device.ts`에는 나중에 실제 제어를 붙일 때 사용하도록 남겨 둔다
