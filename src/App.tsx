import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

type IconName = "dashboard" | "chart" | "sensor" | "settings"
type SensorSample = { id: string | number | null; angle: number; receivedAt: Date }
type ReadingRow = Record<string, unknown> & {
  id?: string | number
  value: number | string
  created_at?: string
}

const TABLE_NAME = "Reading"
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

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

function linePath(samples: SensorSample[]) {
  return samples
    .map((sample, index) => {
      const x =
        samples.length === 1 ? 900 : 26 + (index / (samples.length - 1)) * 874
      const y = 137.5 - sample.angle * 3.25
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류"
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
  const [samples, setSamples] = useState<SensorSample[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState("Supabase 연결을 확인하는 중")

  useEffect(() => {
    if (!supabase) {
      setConnectionMessage(".env의 Supabase URL 또는 anon key가 없습니다")
      return
    }

    let active = true
    let initialLoaded = false
    let pendingRows: ReadingRow[] = []

    const toSample = (row: ReadingRow, fallbackTime: number): SensorSample | null => {
      const angle = Number(row.value)
      if (row.value === null || row.value === undefined || !Number.isFinite(angle)) {
        return null
      }

      const parsedTime = row.created_at ? new Date(row.created_at) : null
      return {
        id: row.id ?? row.created_at ?? null,
        angle,
        receivedAt:
          parsedTime && Number.isFinite(parsedTime.getTime())
            ? parsedTime
            : new Date(fallbackTime),
      }
    }

    const appendRows = (rows: ReadingRow[]) => {
      const now = Date.now()
      const additions = rows
        .map((row, index) => toSample(row, now + index))
        .filter((sample): sample is SensorSample => sample !== null)
      if (!active || additions.length === 0) return

      setSamples((current) => {
        const keys = new Set(
          current.map((sample) =>
            sample.id === null
              ? `${sample.receivedAt.getTime()}:${sample.angle}`
              : String(sample.id),
          ),
        )
        const unique = additions.filter((sample) => {
          const key =
            sample.id === null
              ? `${sample.receivedAt.getTime()}:${sample.angle}`
              : String(sample.id)
          if (keys.has(key)) return false
          keys.add(key)
          return true
        })
        return [...current, ...unique].slice(-100)
      })
    }

    const channel = supabase
      .channel("reading-dashboard-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE_NAME },
        (payload) => {
          const row = payload.new as ReadingRow
          if (!initialLoaded) pendingRows.push(row)
          else appendRows([row])
        },
      )
      .subscribe((status) => {
        if (!active) return
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
          setConnectionMessage("Supabase Realtime 연결됨")
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsConnected(false)
          setConnectionMessage("Realtime 구독 실패 · Supabase 설정을 확인하세요")
        } else if (status === "CLOSED") {
          setIsConnected(false)
        }
      })

    const loadLatest = async () => {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("id", { ascending: false })
        .limit(100)
      if (error) throw error

      const rows = [...(data ?? [])].reverse() as ReadingRow[]
      const now = Date.now()
      const history = rows
        .map((row, index) =>
          toSample(row, now - (rows.length - index - 1) * 1000),
        )
        .filter((sample): sample is SensorSample => sample !== null)

      if (!active) return
      setSamples(history.slice(-100))
      initialLoaded = true
      appendRows(pendingRows)
      pendingRows = []
    }

    void loadLatest().catch((error: unknown) => {
      if (active) setConnectionMessage(`Supabase 조회 실패: ${errorText(error)}`)
    })

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [])

  const latest = samples.at(-1)
  const previous = samples.at(-2)
  const formatAngle = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`
  const formatDelta = (current: number | undefined, before: number | undefined) =>
    current === undefined || before === undefined
      ? "Δ --"
      : `Δ ${current - before >= 0 ? "+" : ""}${(current - before).toFixed(1)}°`
  const timestampLabel = (sample: SensorSample) =>
    sample.receivedAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  const timeTicks = ["가장 오래된 값", "75개 전", "50개 전", "25개 전", "최신"]
  const anglePath = samples.length ? linePath(samples) : ""

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
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" : "bg-slate-500"}`} />
            </div>
            <p className="text-sm font-semibold">Supabase Reading</p>
            <p className="mt-1 text-xs text-slate-500">Realtime INSERT</p>
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
                Supabase 최신 센서 데이터 모니터링
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${isConnected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />
            <span className={`text-xs font-bold ${isConnected ? "text-emerald-700" : "text-slate-500"}`}>
              {isConnected ? "Realtime 연결됨" : "Realtime 연결 중"}
            </span>
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
                {latest ? timestampLabel(latest) : "--:--:--"}
              </span>
            </div>
          </section>

          <section className="grid gap-5">
            <div className="sm:max-w-[640px]">
              <ValueCard
                label="기울기"
                value={latest ? formatAngle(latest.angle) : "--.-"}
                tone="blue"
                trend={formatDelta(latest?.angle, previous?.angle)}
              />
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <h3 className="text-base font-bold">최근 센서값</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Supabase 최신 100개 · 새 행이 들어오면 즉시 갱신
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pr-1 text-xs font-semibold text-slate-500">
                  <i className="h-2 w-2 rounded-full bg-[#527cff]" />
                  기울기
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500">
                  {samples.length} / 100개
                </span>
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
                  aria-label="Supabase 최신 100개 기울기 그래프"
                >
                  <defs>
                    <linearGradient id="angleFill" x1="0" y1="0" x2="0" y2="1">
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
                  {samples.length > 0 ? (
                    <>
                      <path
                        d={`${anglePath} L 900 235 L 26 235 Z`}
                        fill="url(#angleFill)"
                      />
                      <path
                        d={anglePath}
                        fill="none"
                        stroke="#527cff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#lineGlow)"
                      />
                      <circle
                        cx="900"
                        cy={137.5 - latest!.angle * 3.25}
                        r="4.5"
                        fill="white"
                        stroke="#527cff"
                        strokeWidth="3"
                      />
                    </>
                  ) : (
                    <text x="463" y="142" textAnchor="middle" fill="#94a3b8" fontSize="13">
                      저장된 센서값이 없습니다
                    </text>
                  )}
                  <g fill="#94a3b8" fontSize="10.5" fontWeight="600">
                    {timeTicks.map((sample, index) => (
                      <text key={index} x={26 + index * 218.5} y="263" textAnchor="middle">
                        {sample}
                      </text>
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </section>

          <footer className="mt-5 flex flex-col gap-2 px-1 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" aria-live="polite">
              {connectionMessage}
            </p>
            <p>
              메모리 버퍼{" "}
              <strong className="font-semibold text-slate-500">최근 {samples.length} / 100개</strong>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
