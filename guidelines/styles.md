# styles/globals.css 디자인 기준

현재 화면의 스타일 기준이다. 색상과 폰트 슬롯은 `:root`에서 관리한다. 실제 CSS는 이 값을 사용하며, 센서 원은 이미지 파일 없이 CSS로 그린다.

파일 위치:
- 폰트 `public/fonts/`: Pretendard-Regular, Medium, SemiBold, Bold (.woff2). IBM Plex Mono SemiBold 파일이 없으면 Google Fonts에서 불러온다.
- 센서 오브제는 별도 이미지 없이 `.sensor-orb` 원형 요소로 표시한다.

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@600&display=swap");

/* 메인 폰트 Pretendard */
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-Medium.woff2") format("woff2"); font-weight: 500; font-display: swap; }
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-SemiBold.woff2") format("woff2"); font-weight: 600; font-display: swap; }
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-Bold.woff2") format("woff2"); font-weight: 700; font-display: swap; }

:root {
  /* 학생 슬롯: 메인 컬러 (Tilt MONO: 알루미늄 회색) */
  --brand: #c9cdd2;
  --on-brand: #000000;
  /* 학생 슬롯: 폰트 (메인, 서브) */
  --font-sans: Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  --font-display: "IBM Plex Mono", Pretendard, monospace;

  --surface: #000000;
  --ink: #eef0f3;
  --ink-muted: #9a9ea7;
  --line: #2a2d33;
  --off: #5d6169;
  --moon-glow: #ffe9c4;
  --status-on: #4cc38a;
  --danger: #f97066;

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;
  color-scheme: dark;
}

body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--font-sans); }
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
button { border: 0; border-radius: 0; }

/* 타입: 자간, 행간 지정 없음 */
.t-display { font-family: var(--font-sans); font-size: 40px; font-weight: 700; }
.t-value   { font-family: var(--font-display); font-size: 48px; font-weight: 600; font-variant-numeric: tabular-nums; }
.t-body    { font-size: 16px; font-weight: 400; }
.t-label   { font-size: 14px; font-weight: 500; }
.t-caption { font-size: 12px; font-weight: 400; }
@media (max-width: 767px) { .t-display { font-size: 24px; } }

/* Sensor response circle */
.sensor-orb {
  --level: 0;
  width: min(72vw, 360px);
  aspect-ratio: 1;
  margin: 0 auto;
  border: 1px solid var(--ink);
  border-radius: 50%;
  background-color: rgb(255 255 255 / var(--level));
  box-shadow: 0 0 calc(var(--level) * 48px) rgb(255 255 255 / var(--level));
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
```

`--level`은 `clamp(value / 45, 0, 1)`이며 앱에서 인라인 CSS 변수로 전달한다. 0°에서는 투명한 원과 윤곽선만 보이고, 45° 이상에서는 흰색으로 채워지며 밝기에 비례해 glow가 커진다.
