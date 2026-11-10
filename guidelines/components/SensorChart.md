# SensorChart

Supabase에서 조회한 기울기 각도 게이지와 선 그래프. 새 데이터는 1초 간격으로 확인한다. 라이브러리 없이 SVG.

- 소제목 없이 바탕 위에 바로. `<section aria-label="기울기 변화">`
- 센서값은 기울기 각도, 단위 도(°), 저장값은 소수일 수 있으며 숫자 라벨은 정수로 반올림한다. 켤 때 세워 둔 자세가 0°이고 어느 쪽으로 기울여도 양수이며 실제 범위는 0°~47° 정도
- `SENSOR_MIN` 0, `SENSOR_MAX` 50, `FULL_DEG` 45, `MAX_POINTS` 60
- 밝기: `level = clamp(value / FULL_DEG, 0, 1)`
- 웹(768px 이상)은 게이지 1 : 그래프 2 가로 배치, 모바일은 게이지 위 그래프 아래

## 기울기 게이지
- TARS처럼 세워진 사각 막대가 막대 가운데를 축으로 현재 각도만큼 오른쪽으로 기운다. 막대는 radius 0, 테두리 없음, `--ink` 채움, 폭 14 높이 120 정도
- 축 위쪽에 0°부터 오른쪽 50°까지 부채꼴 공간을 둔다. 0°, 15°, 30°, 45° 눈금선 `--line` 1px, 숫자 Pretendard 12px `--ink-muted`
- 0°~45° 구간 호는 `--brand` 2px. 0° 옆 "꺼짐", 45° 옆 "최대" `t-caption` `--ink-muted`
- 막대 회전 transition 300ms, reduced-motion이면 즉시

## 시간 그래프
- 데이터: `readings` 배열 (최대 `MAX_POINTS`, 넘치면 앞에서 제거). 새 점은 오른쪽 끝
- SVG 폭은 컨테이너 실제 폭(ResizeObserver), 높이 200, 여백 왼 40 / 오 72 / 위 8 / 아래 20
- 가로 최근 60개, 왼쪽 "−30s", 오른쪽 "지금"
- 세로 0°~50°, 눈금 0°, 15°, 30°, 45°, 그리드 `--line` 1px
- 기준선은 45° "최대 밝기". `--line` 1px 점선(4 4), 글자는 `t-caption` `--ink-muted`
- 선은 polyline `--brand` 2px, round join/cap, 채우기 없음. 마지막 점은 6×6 사각 `--brand`
- `role="img"`, `aria-label="기울기 추이, 현재 NN도, LED 밝기 NN%"`
- 데이터 없음: "센서를 연결하면 기울기가 여기에 그려집니다." `t-body` `--ink-muted` 가운데
