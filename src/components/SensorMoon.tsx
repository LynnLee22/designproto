import type { CSSProperties } from "react"
import { DEAD_DEG, getLightLevel } from "../product"

type Props = {
  value?: number
  power: boolean
}

export default function SensorMoon({ value, power }: Props) {
  const level = value === undefined ? 0 : getLightLevel(value)
  const percent = Math.round(level * 100)
  const label = power ? `달 밝기 ${percent}%` : "달 꺼짐"
  const brightnessText =
    value === undefined || value <= DEAD_DEG
      ? "LED 꺼짐"
      : `LED 밝기 ${percent}%`

  return (
    <section className="moon-section" aria-label="달 상태">
      <div
        className="moon"
        data-power={power ? "on" : "off"}
        style={{ "--level": level } as CSSProperties}
        role="img"
        aria-label={label}
      >
        <img src="/images/moon.webp" alt="" />
      </div>
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
