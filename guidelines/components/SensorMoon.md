# SensorMoon

검은 바탕 정가운데에 있는 흰색 원형 센서 표시. 기울기값에 따라 원의 채움과 glow가 바뀐다.

- 이미지 파일 없이 `<div class="sensor-orb">`를 CSS로 그린다
- 위치: 화면 정가운데. 감싸는 `<section aria-label="센서 반응">`은 min-height 70vh, flex 세로 정렬로 가로 세로 가운데. 소제목 없음
- 센서값은 기울기 각도, 단위 도(°), DB 값은 소수일 수 있다. 화면에는 정수로 반올림해 표시한다. 켤 때 세워 둔 자세가 0°이고 어느 쪽으로 기울여도 양수이며 실제 범위는 0°~47° 정도
- `level = clamp(value / 45, 0, 1)`을 `.sensor-orb`의 `--level` 스타일 변수로 전달한다. LED 상태와 그래프도 같은 밝기 변환을 쓴다
- 윤곽선은 1px `--ink`, 채움은 흰색의 `level` 투명도, glow는 흰색이며 크기와 투명도가 `level × 48px`에 비례한다
- 0° 또는 값이 없으면 채움과 glow가 없고 윤곽선만 보인다. 45° 이상이면 흰색으로 완전히 채워진다
- 원 아래 space-6 간격으로 현재 각도 숫자 `t-value`, 바로 뒤 "°" `t-label` `--ink-muted` (값 없으면 "—")
- 그 아래 space-2 간격으로 0° 또는 값 없음은 "LED 꺼짐", 양수는 "LED 밝기 NN%" `t-caption` `--ink-muted`
- `role="img"`, aria label에는 현재 기울기와 밝기 비율을 포함한다
