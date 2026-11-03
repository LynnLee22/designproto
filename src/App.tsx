import { useState } from "react"

type IconName = "dashboard" | "chart" | "sensor" | "settings"

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    sensor: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M5.64 18.36a9 9 0 0 1 0-12.72M18.36 5.64a9 9 0 0 1 0 12.72M8.46 15.54a5 5 0 0 1 0-7.08M15.54 8.46a5 5 0 0 1 0 7.08" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.82 2.82-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.82-2.82.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1.04H3v-4h.08A1.7 1.7 0 0 0 4.6 8.92a1.7 1.7 0 0 0-.34-1.88L4.2 6.98l2.82-2.82.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.04V3h4v.04a1.7 1.7 0 0 0 1.04 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.82 2.82-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.52 1.04H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const pitchData = [
  5, 7, 4, 9, 12, 10, 15, 14, 18, 16, 21, 19, 24, 22, 18, 20, 17, 15, 19, 16,
  13, 14, 12, 10,
]
const rollData = [
  -5, -2, -4, 1, -1, 3, 0, 4, 2, 5, 3, 7, 4, 6, 2, 0, 3, -2, 1, -3, -1, -4, -2,
  -3,
]

function linePath(values: number[]) {
  return values
    .map((value, index) => {
      const x = 26 + (index / (values.length - 1)) * 874
      const y = 137.5 - value * 3.25
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function ValueCard({
  label,
  value,
  tone,
  trend,
}: {
  label: string
  value: string
  tone: "blue" | "mint"
  trend: string
}) {
  return (
    <article className={`value-card value-card--${tone}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`axis-dot axis-dot--${tone}`} />
          <p className="text-sm font-semibold text-slate-600">{label}</p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-500">
          DEGREE
        </span>
      </div>
      <div className="mt-7 flex items-end justify-between gap-4">
        <p className="tracking-tight text-slate-950">
          <span className="text-5xl font-bold sm:text-[3.5rem]">{value}</span>
          <span className="ml-1 text-2xl font-semibold text-slate-500">°</span>
        </p>
        <span className="mb-2 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          {trend}
        </span>
      </div>
    </article>
  )
}

export default function App() {
  const [range, setRange] = useState("1분")

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[228px] flex-col bg-[#111b2e] px-5 py-7 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4f7cff] shadow-lg shadow-blue-950/30">
            <span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight">IMU Monitor</p>
            <p className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-slate-400">
              MPU-6050
            </p>
          </div>
        </div>

        <nav className="mt-12 space-y-2" aria-label="주 메뉴">
          {[
            ["dashboard", "대시보드"],
            ["chart", "데이터 분석"],
            ["sensor", "센서 상태"],
          ].map(([icon, label], index) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                index === 0
                  ? "bg-[#263654] text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon name={icon as IconName} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                디바이스
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />
            </div>
            <p className="text-sm font-semibold">Arduino Uno</p>
            <p className="mt-1 text-xs text-slate-500">COM3 · 115200 baud</p>
          </div>
          <button
            className="flex w-full items-center gap-3 px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-white"
            type="button"
          >
            <Icon name="settings" />
            설정
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[228px]">
        <header className="flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111b2e] lg:hidden">
              <span className="h-3 w-3 rounded-full border-[3px] border-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">
                기울기 센서 대시보드
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                실시간 자세 및 움직임 모니터링
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-700">연결됨</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1320px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <section className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-[0.14em] text-[#4f7cff]">
                LIVE ORIENTATION
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">
                현재 센서값
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>마지막 업데이트</span>
              <span className="font-semibold text-slate-600">
                오늘 14:32:08
              </span>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <ValueCard
              label="피치 (Pitch)"
              value="+12.4"
              tone="blue"
              trend="↗ 0.8°"
            />
            <ValueCard
              label="롤 (Roll)"
              value="-3.7"
              tone="mint"
              trend="↘ 0.3°"
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <h3 className="text-base font-bold">시간에 따른 기울기 변화</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Pitch / Roll 각도 변화 추이
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 pr-1 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#527cff]" />
                    Pitch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#24bba7]" />
                    Roll
                  </span>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {["1분", "5분", "1시간"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRange(item)}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${
                        range === item
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 pb-3 pt-6 sm:px-7">
              <div className="chart-wrap">
                <div className="chart-y-labels" aria-hidden="true">
                  <span>30°</span>
                  <span>15°</span>
                  <span>0°</span>
                  <span>-15°</span>
                  <span>-30°</span>
                </div>
                <svg
                  className="h-[270px] w-full min-w-[620px]"
                  viewBox="0 0 926 275"
                  role="img"
                  aria-label="피치와 롤 각도의 예시 선 그래프"
                >
                  <defs>
                    <linearGradient id="pitchFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#527cff" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#527cff" stopOpacity="0" />
                    </linearGradient>
                    <filter
                      id="lineGlow"
                      x="-10%"
                      y="-30%"
                      width="120%"
                      height="160%"
                    >
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {[40, 88.75, 137.5, 186.25, 235].map((y) => (
                    <line
                      key={y}
                      x1="26"
                      x2="900"
                      y1={y}
                      y2={y}
                      stroke="#e8edf3"
                      strokeWidth="1"
                      strokeDasharray="4 5"
                    />
                  ))}
                  <line
                    x1="26"
                    x2="900"
                    y1="137.5"
                    y2="137.5"
                    stroke="#d2dae5"
                  />
                  <path
                    d={`${linePath(pitchData)} L 900 235 L 26 235 Z`}
                    fill="url(#pitchFill)"
                  />
                  <path
                    d={linePath(pitchData)}
                    fill="none"
                    stroke="#527cff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#lineGlow)"
                  />
                  <path
                    d={linePath(rollData)}
                    fill="none"
                    stroke="#24bba7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="900"
                    cy={137.5 - pitchData.at(-1)! * 3.25}
                    r="4.5"
                    fill="white"
                    stroke="#527cff"
                    strokeWidth="3"
                  />
                  <circle
                    cx="900"
                    cy={137.5 - rollData.at(-1)! * 3.25}
                    r="4.5"
                    fill="white"
                    stroke="#24bba7"
                    strokeWidth="3"
                  />
                  <g fill="#94a3b8" fontSize="10.5" fontWeight="600">
                    <text x="26" y="263" textAnchor="middle">
                      14:31:10
                    </text>
                    <text x="245" y="263" textAnchor="middle">
                      14:31:25
                    </text>
                    <text x="463" y="263" textAnchor="middle">
                      14:31:40
                    </text>
                    <text x="682" y="263" textAnchor="middle">
                      14:31:55
                    </text>
                    <text x="900" y="263" textAnchor="middle">
                      14:32:10
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          <footer className="mt-5 flex flex-col gap-2 px-1 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              샘플 데이터로 표시 중입니다. Arduino 연결 후 실시간 값으로
              대체됩니다.
            </p>
            <p>
              샘플링 주기{" "}
              <strong className="font-semibold text-slate-500">100 ms</strong>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
