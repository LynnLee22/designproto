import { useEffect, useRef, useState } from "react"
import type { Reading } from "../lib/device"
import { SENSOR_MAX } from "../product"

type Props = {
  readings: Reading[]
}

const HEIGHT = 200
const LEFT = 40
const RIGHT = 8
const TOP = 8
const BOTTOM = 20

export default function SensorChart({ readings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const plotWidth = Math.max(0, width - LEFT - RIGHT)
  const plotHeight = HEIGHT - TOP - BOTTOM
  const points = readings
    .map((reading, index) => {
      const x =
        LEFT +
        (readings.length <= 1
          ? plotWidth
          : (index / (readings.length - 1)) * plotWidth)
      const normalized = Math.min(1, Math.max(0, reading.value / SENSOR_MAX))
      const y = TOP + plotHeight - normalized * plotHeight
      return `${x},${y}`
    })
    .join(" ")
  const current = readings.at(-1)?.value

  return (
    <section className="chart-section" aria-label="실시간 센서값">
      <div ref={containerRef} className="chart-container">
        {readings.length === 0 ? (
          <p className="t-body chart-empty">
            센서를 연결하면 값이 여기에 그려집니다.
          </p>
        ) : (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="img"
            aria-label={`센서값 추이, 현재 ${current?.toLocaleString("ko-KR")}`}
          >
            {[SENSOR_MAX, SENSOR_MAX / 2, 0].map((tick) => {
              const y = TOP + plotHeight - (tick / SENSOR_MAX) * plotHeight
              return (
                <g key={tick}>
                  <line
                    x1={LEFT}
                    x2={width - RIGHT}
                    y1={y}
                    y2={y}
                    className="chart-grid-line"
                  />
                  <text
                    x={LEFT - RIGHT}
                    y={y + 4}
                    textAnchor="end"
                    className="chart-label"
                  >
                    {Math.round(tick).toLocaleString("ko-KR")}
                  </text>
                </g>
              )
            })}
            <polyline points={points} className="chart-line" />
            <text
              x={LEFT}
              y={HEIGHT - 2}
              textAnchor="start"
              className="chart-label"
            >
              −60s
            </text>
            <text
              x={width - RIGHT}
              y={HEIGHT - 2}
              textAnchor="end"
              className="chart-label"
            >
              지금
            </text>
          </svg>
        )}
      </div>
    </section>
  )
}
