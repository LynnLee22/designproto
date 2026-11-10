import type { CSSProperties } from "react"
import { getLightLevel } from "../product"

type Props = {
  value?: number
  power: boolean
}

export default function SensorMoon({ value, power }: Props) {
  const level = value === undefined ? 0 : getLightLevel(value)
  const percent = Math.round(level * 100)
  const label =
    value === undefined
      ? "센서값 대기 중"
      : `기울기 ${Math.round(value)}도, 밝기 ${percent}%`
  const brightnessText = power ? `LED 밝기 ${percent}%` : "LED 꺼짐"

  return (
    <section className="moon-section" aria-label="센서 반응">
      <div
        className="sensor-orb"
        style={{ "--level": level } as CSSProperties}
        role="img"
        aria-label={label}
      />
      <p className="sensor-value">
        <span className="t-value">
          {value === undefined
            ? "—"
            : Math.round(value).toLocaleString("ko-KR")}
        </span>
        {value !== undefined && <span className="t-label sensor-unit">°</span>}
      </p>
      <p className="t-caption brightness-status">{brightnessText}</p>
    </section>
  )
}
