import { useState } from "react"

type Props = {
  power: boolean
  onChange: (nextPower: boolean) => Promise<boolean>
}

export default function PowerToggle({ power, onChange }: Props) {
  const [failed, setFailed] = useState(false)

  const handleToggle = async () => {
    setFailed(false)
    const succeeded = await onChange(!power)
    setFailed(!succeeded)
  }

  return (
    <div>
      <div className="control-row">
        <div>
          <p className="t-label control-name">LED 전원</p>
          <p className="t-caption power-status">{power ? "켜짐" : "꺼짐"}</p>
        </div>
        <button
          className="power-switch"
          type="button"
          role="switch"
          aria-checked={power}
          aria-label="LED 전원"
          onClick={() => void handleToggle()}
        >
          <span className="switch-handle" />
        </button>
      </div>
      {failed && (
        <p className="t-caption power-error" role="status">
          전원 변경 실패, 다시 시도
        </p>
      )}
    </div>
  )
}
