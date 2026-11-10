import { useEffect, useState } from "react"
import ConnectionControl from "./components/ConnectionControl"
import PowerToggle from "./components/PowerToggle"
import ProductHeader from "./components/ProductHeader"
import SensorChart from "./components/SensorChart"
import SensorMoon from "./components/SensorMoon"
import {
  connectSensor,
  disconnectSensor,
  type Reading,
  type Status,
} from "./lib/device"
import { getLightLevel, MAX_POINTS } from "./product"

export default function App() {
  const [status, setStatus] = useState<Status>("disconnected")
  const [power, setPower] = useState(false)
  const [readings, setReadings] = useState<Reading[]>([])
  const latestValue = readings.at(-1)?.value
  const level = latestValue === undefined ? 0 : getLightLevel(latestValue)

  useEffect(() => {
    return () => {
      void disconnectSensor()
    }
  }, [])

  useEffect(() => {
    setPower(level > 0)
  }, [level])

  const handleConnect = async () => {
    await connectSensor({
      onInit: setReadings,
      onReading: (reading) => {
        setReadings((current) => [...current, reading].slice(-MAX_POINTS))
      },
      onStatus: setStatus,
    })
  }

  const handleDisconnect = async () => {
    await disconnectSensor()
    setStatus("disconnected")
  }

  return (
    <main className="app-shell">
      <ProductHeader />

      <SensorMoon value={latestValue} power={power} />

      <div className="lower-grid">
        <section className="controls" aria-label="조명 제어">
          <ConnectionControl
            status={status}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <PowerToggle power={power} level={level} />
        </section>

        <SensorChart readings={readings} />
      </div>
    </main>
  )
}
