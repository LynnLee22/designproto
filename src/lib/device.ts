import { DEVICE_ID, MAX_POINTS } from "../product"
import { db, IS_DEMO_MODE } from "./supabase"

export type Reading = {
  id: number
  value: number
  created_at: string
}
export type Status = "disconnected" | "connecting" | "connected" | "error"

type ConnectOptions = {
  onInit: (rows: Reading[]) => void
  onReading: (row: Reading) => void
  onStatus: (status: Status) => void
}

let pollTimer: ReturnType<typeof setInterval> | null = null

export async function connectSensor({
  onInit,
  onReading,
  onStatus,
}: ConnectOptions): Promise<void> {
  await disconnectSensor()
  onStatus("connecting")

  if (IS_DEMO_MODE || !db) {
    onStatus("error")
    return
  }
  const client = db

  let rows: Reading[]
  try {
    const { data, error } = await client
      .from("Reading")
      .select("id, value, created_at")
      .order("id", { ascending: false })
      .limit(MAX_POINTS)

    if (error) {
      onStatus("error")
      return
    }

    rows = (data ?? []) as Reading[]
  } catch {
    onStatus("error")
    return
  }

  onInit(rows.reverse())
  let lastId = rows.at(-1)?.id ?? 0
  let polling = false
  onStatus("connected")

  pollTimer = setInterval(async () => {
    if (polling) return
    polling = true

    try {
      const { data, error } = await client
        .from("Reading")
        .select("id, value, created_at")
        .gt("id", lastId)
        .order("id", { ascending: true })
        .limit(MAX_POINTS)

      if (error) {
        onStatus("error")
        return
      }

      for (const row of (data ?? []) as Reading[]) {
        lastId = Math.max(lastId, row.id)
        onReading(row)
      }
      onStatus("connected")
    } catch {
      onStatus("error")
    } finally {
      polling = false
    }
  }, 1000)
}

export async function disconnectSensor(): Promise<void> {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export async function setLedPower(on: boolean): Promise<boolean> {
  if (IS_DEMO_MODE || !db) return false

  const { error } = await db
    .from("device_state")
    .update({ led_on: on, updated_at: new Date().toISOString() })
    .eq("device_id", DEVICE_ID)

  return !error
}

export async function loadPower(): Promise<boolean> {
  if (IS_DEMO_MODE || !db) return false

  const { data, error } = await db
    .from("device_state")
    .select("led_on")
    .eq("device_id", DEVICE_ID)
    .maybeSingle()

  return error ? false : Boolean(data?.led_on)
}
