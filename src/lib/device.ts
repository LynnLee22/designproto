import type { RealtimeChannel } from "@supabase/supabase-js"
import { DEVICE_ID, MAX_POINTS } from "../product"
import { db, IS_DEMO_MODE } from "./supabase"

export type Reading = {
  value: number
  created_at: string
}
export type Status = "disconnected" | "connecting" | "connected" | "error"

type ConnectOptions = {
  onInit: (rows: Reading[]) => void
  onReading: (row: Reading) => void
  onStatus: (status: Status) => void
}

let channel: RealtimeChannel | null = null
let demoTimer: ReturnType<typeof setInterval> | null = null
let demoPower = false

function createDemoReading(step: number, time = new Date()): Reading {
  const phase = step % 24
  let angle = 0

  if (phase >= 4 && phase <= 11) {
    const progress = (phase - 3) / 9
    const eased = progress * progress * (3 - 2 * progress)
    angle = 46 * eased
  } else if (phase >= 12 && phase <= 15) {
    angle = 46
  } else if (phase >= 16) {
    const progress = (phase - 15) / 9
    const eased = progress * progress * (3 - 2 * progress)
    angle = 46 * (1 - eased)
  }

  const wobble = [0, 1, 0, -1][step % 4]
  const value = Math.min(46, Math.max(0, Math.round(angle + wobble)))

  return {
    value,
    created_at: time.toISOString(),
  }
}

export async function connectSensor({
  onInit,
  onReading,
  onStatus,
}: ConnectOptions): Promise<void> {
  await disconnectSensor()
  onStatus("connecting")

  if (IS_DEMO_MODE || !db) {
    const now = Date.now()
    let step = 24
    onInit(
      Array.from({ length: 24 }, (_, index) =>
        createDemoReading(index, new Date(now - (23 - index) * 500)),
      ),
    )
    onStatus("connected")
    demoTimer = setInterval(() => {
      onReading(createDemoReading(step))
      step += 1
    }, 500)
    return
  }

  const { data, error } = await db
    .from("sensor_readings")
    .select("value, created_at")
    .eq("device_id", DEVICE_ID)
    .order("created_at", { ascending: false })
    .limit(MAX_POINTS)

  if (error) {
    onStatus("error")
    return
  }

  onInit(([...(data ?? [])] as Reading[]).reverse())

  channel = db
    .channel(`sensor-readings-${DEVICE_ID}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "sensor_readings",
        filter: `device_id=eq.${DEVICE_ID}`,
      },
      (payload) => onReading(payload.new as Reading),
    )
    .subscribe((subscriptionStatus) => {
      if (subscriptionStatus === "SUBSCRIBED") onStatus("connected")
      if (
        subscriptionStatus === "CHANNEL_ERROR" ||
        subscriptionStatus === "TIMED_OUT"
      ) {
        onStatus("error")
      }
    })
}

export async function disconnectSensor(): Promise<void> {
  if (demoTimer) {
    clearInterval(demoTimer)
    demoTimer = null
  }

  if (channel && db) {
    await db.removeChannel(channel)
    channel = null
  }
}

export async function setLedPower(on: boolean): Promise<boolean> {
  if (IS_DEMO_MODE || !db) {
    demoPower = on
    return true
  }

  const { error } = await db
    .from("device_state")
    .update({ led_on: on, updated_at: new Date().toISOString() })
    .eq("device_id", DEVICE_ID)

  return !error
}

export async function loadPower(): Promise<boolean> {
  if (IS_DEMO_MODE || !db) return demoPower

  const { data, error } = await db
    .from("device_state")
    .select("led_on")
    .eq("device_id", DEVICE_ID)
    .maybeSingle()

  return error ? false : Boolean(data?.led_on)
}
