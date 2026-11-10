export const PRODUCT = {
  name: "Tilt MONO",
  concept: "인터스텔라 TARS에서 온, 기울이면 켜지는 조명",
  description:
    "기울기의 변화에 따라 LED의 밝기가 변화합니다. 세워 두면 꺼지고, 45도까지 기울일수록 밝아집니다.",
}
export const DEVICE_ID = "lamp-01"
export const SENSOR_MIN = 0
export const SENSOR_MAX = 50
export const DEAD_DEG = 3
export const FULL_DEG = 45
export const MAX_POINTS = 60

export function getLightLevel(value: number) {
  const t = Math.min(1, Math.max(0, (value - DEAD_DEG) / (FULL_DEG - DEAD_DEG)))
  return t * t
}
