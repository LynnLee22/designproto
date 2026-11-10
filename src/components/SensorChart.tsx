import { useEffect, useRef, useState } from "react"
import type { Reading } from "../lib/device"
import { FULL_DEG, getLightLevel, SENSOR_MAX } from "../product"

type Props = {
  readings: Reading[]
}

const HEIGHT = 200
const LEFT = 40
const RIGHT = 72
const TOP = 8
const BOTTOM = 20
const GAUGE_WIDTH = 240
const GAUGE_HEIGHT = 200
const GAUGE_X = 70
const GAUGE_Y = 126

function polarPoint(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: GAUGE_X + Math.sin(radians) * radius,
    y: GAUGE_Y - Math.cos(radians) * radius,
  }
}

function arcPath(startAngle: number, endAngle: number, radius: number) {
  const start = polarPoint(startAngle, radius)
  const end = polarPoint(endAngle, radius)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
}

function TiltGauge({ value }: { value?: number }) {
  const angle = Math.min(SENSOR_MAX, Math.max(0, value ?? 0))
  const ticks = [0, 15, 30, 45]
  const offLabel = polarPoint(0, 96)
  const fullLabel = polarPoint(FULL_DEG, 96)

  return (
    <div className="tilt-gauge">
      <svg
        viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
        role="img"
        aria-label={`현재 기울기 ${Math.round(angle)}도`}
      >
        <path
          d={arcPath(0, FULL_DEG, 72)}
          className="gauge-active-arc"
        />
        {ticks.map((tick) => {
          const start = polarPoint(tick, 68)
          const end = polarPoint(tick, 78)
          const label = polarPoint(tick, 91)

          return (
            <g key={tick}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="gauge-tick"
              />
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                className="chart-label"
              >
                {tick}°
              </text>
            </g>
          )
        })}
        <text
          x={offLabel.x + 8}
          y={offLabel.y - 2}
          className="chart-label t-caption"
        >
          꺼짐
        </text>
        <text
          x={fullLabel.x + 5}
          y={fullLabel.y + 7}
          className="chart-label t-caption"
        >
          최대
        </text>
        <rect
          x={GAUGE_X - 7}
          y={GAUGE_Y - 60}
          width="14"
          height="120"
          className="gauge-bar"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${GAUGE_X}px ${GAUGE_Y}px`,
          }}
        />
      </svg>
    </div>
  )
}

export default function SensorChart({ readings }: Props) {
  const graphRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = graphRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const plotEnd = Math.max(LEFT, width - RIGHT)
  const plotWidth = Math.max(0, plotEnd - LEFT)
  const plotHeight = HEIGHT - TOP - BOTTOM
  const current = readings.at(-1)?.value
  const level = current === undefined ? 0 : getLightLevel(current)
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
  const latestPoint = points.split(" ").at(-1)?.split(",")

  const yFor = (value: number) =>
    TOP + plotHeight - (value / SENSOR_MAX) * plotHeight

  return (
    <section className="chart-section" aria-label="기울기 변화">
      <div className="sensor-chart-layout">
        <TiltGauge value={current} />

        <div ref={graphRef} className="chart-container">
          {readings.length === 0 ? (
            <p className="t-body chart-empty">
              센서를 연결하면 기울기가 여기에 그려집니다.
            </p>
          ) : (
            <svg
              width={width}
              height={HEIGHT}
              viewBox={`0 0 ${width} ${HEIGHT}`}
              role="img"
              aria-label={`기울기 추이, 현재 ${Math.round(current ?? 0)}도, LED 밝기 ${Math.round(level * 100)}%`}
            >
              {[0, 15, 30, 45].map((tick) => {
                const y = yFor(tick)
                return (
                  <g key={tick}>
                    {tick !== FULL_DEG && (
                      <line
                        x1={LEFT}
                        x2={plotEnd}
                        y1={y}
                        y2={y}
                        className="chart-grid-line"
                      />
                    )}
                    <text
                      x={LEFT - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="chart-label"
                    >
                      {tick}°
                    </text>
                  </g>
                )
              })}

              {[{ value: FULL_DEG, label: "최대 밝기" }].map((reference) => {
                const y = yFor(reference.value)
                return (
                  <g key={reference.value}>
                    <line
                      x1={LEFT}
                      x2={plotEnd}
                      y1={y}
                      y2={y}
                      className="chart-reference-line"
                    />
                    <text
                      x={plotEnd + 8}
                      y={y + 4}
                      className="chart-label t-caption"
                    >
                      {reference.label}
                    </text>
                  </g>
                )
              })}

              <polyline points={points} className="chart-line" />
              {latestPoint && (
                <rect
                  x={Number(latestPoint[0]) - 3}
                  y={Number(latestPoint[1]) - 3}
                  width="6"
                  height="6"
                  className="chart-last-point"
                />
              )}
              <text
                x={LEFT}
                y={HEIGHT - 2}
                textAnchor="start"
                className="chart-label"
              >
                −30s
              </text>
              <text
                x={plotEnd}
                y={HEIGHT - 2}
                textAnchor="end"
                className="chart-label"
              >
                지금
              </text>
            </svg>
          )}
        </div>
      </div>
    </section>
  )
}
