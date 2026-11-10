type Props = {
  power: boolean
  level: number
}

export default function PowerToggle({ power, level }: Props) {
  const status = power ? `밝기 ${Math.round(level * 100)}%` : "꺼짐"

  return (
    <div className="control-row">
      <div>
        <p className="t-label control-name">LED</p>
        <p className="t-caption power-status" role="status">
          {status}
        </p>
      </div>
    </div>
  )
}
