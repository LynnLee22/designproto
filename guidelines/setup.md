# Setup

## 스택
- React + TypeScript + Tailwind (Make 기본). shadcn 등 UI 라이브러리 컴포넌트는 쓰지 않는다 (기본 라운드, 테두리, 카드가 규칙과 충돌). 아래 컴포넌트 규칙대로 직접 만든다.
- `@supabase/supabase-js` v2. 차트는 라이브러리 없이 SVG로 그린다.

## 파일 구조
```
src/
  product.ts        // PRODUCT 슬롯 + DEVICE_ID + 센서 범위 + 밝기 변환
  lib/supabase.ts   // createClient
  lib/device.ts     // connectSensor, disconnectSensor, setLedPower, loadPower
  components/       // ProductHeader, ConnectionControl, PowerToggle, SensorMoon, SensorChart
  App.tsx           // AppShell + state
styles/globals.css  // 전역 토큰, 원형 오브제, 레이아웃 스타일
```

## product.ts
```ts
export const PRODUCT = {
  name: 'Tilt MONO',
  concept: '인터스텔라 TARS에서 온, 기울이면 켜지는 조명',
  description: '기울기의 변화에 따라 LED의 밝기가 변화합니다. 세워 두면 꺼지고, 45도까지 기울일수록 밝아집니다.',
};
export const DEVICE_ID = 'lamp-01';
export const SENSOR_MIN = 0;
export const SENSOR_MAX = 50;
export const FULL_DEG = 45;
export const MAX_POINTS = 60;
export const getLightLevel = (value: number) => Math.min(1, Math.max(0, value / FULL_DEG));
```

## Supabase
URL과 anon 키는 프로젝트 루트 `.env`의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`에서 읽는다. 브라우저에는 anon 키만 사용하고 service_role 키를 노출하지 않는다.

```ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const db = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

### 센서 테이블 (`upload.py`와 공유)

현재 프로젝트는 `Reading` 테이블을 사용한다. 업로더는 `value`를 insert하며 DB가 `id`와 `created_at`을 생성한다. 앱이 읽는 필수 컬럼은 다음과 같다.

```sql
create table "Reading" (
  id bigint generated always as identity primary key,
  value double precision not null,
  created_at timestamptz not null default now()
);
```

브라우저 anon 역할이 `Reading`을 select할 수 있도록 Supabase 권한/RLS 정책을 설정한다. Realtime publication은 사용하지 않는다.

### LED 기기 상태 테이블

아래 테이블은 추후 실제 전원 제어를 붙일 때 쓰는 API용이며, 현재 `PowerToggle` 화면은 상태만 표시하고 이 테이블을 수정하지 않는다.

```sql
create table device_state (
  device_id text primary key,
  led_on boolean not null default false,
  updated_at timestamptz not null default now()
);
```

### lib/device.ts — 이 시그니처를 유지
```ts
type Reading = { id: number; value: number; created_at: string };
type Status = 'disconnected' | 'connecting' | 'connected' | 'error';

// 최근 MAX_POINTS개를 id 내림차순 select 후 오래된 순으로 반환 → onInit
// 1초마다 id > 마지막 id인 Reading 행을 조회 → 각 행을 onReading으로 전달
// 초기 조회 성공 → 'connected', 조회 오류 → 'error'
connectSensor(opts: {
  onInit: (rows: Reading[]) => void;
  onReading: (row: Reading) => void;
  onStatus: (s: Status) => void;
}): Promise<void>;

disconnectSensor(): Promise<void>;          // 폴링 타이머 해제
setLedPower(on: boolean): Promise<boolean>; // device_state.led_on update, 성공 여부 반환
loadPower(): Promise<boolean>;              // 앱 시작 시 device_state.led_on 읽기
```

`setLedPower`, `loadPower`는 나중에 실제 제어를 붙일 때 사용하도록 남겨 두며 현재 화면에서는 호출하지 않는다. 화면의 `power`는 기울기 각도로 계산한 `level > 0`으로 채운다.

### 설정과 연결 상태
필수 환경 변수가 없으면 가상 센서값을 만들지 않고 연결 시 `error` 상태가 된다. 화면의 "연결됨"은 Supabase 초기 조회가 성공해 폴링이 시작됐다는 뜻이며 Arduino의 USB 연결 여부를 나타내지 않는다.

Arduino 업로더는 `python upload.py --port /dev/cu.usbmodemXXXX`로 별도 실행한다. 업로더는 9600 baud 시리얼 입력을 숫자로 파싱해 `Reading`에 `{ value }` 행으로 insert한다. 브라우저 앱은 새 id를 최대 1초 이내에 확인한다.
