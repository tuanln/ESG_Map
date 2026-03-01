export function formatTime(timestamp: number | string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTimeAgo(timestamp: number | string): string {
  const now = Date.now()
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export function formatMagnitude(mag: number): string {
  return `M${mag.toFixed(1)}`
}

export function formatAQI(aqi: number): string {
  return `AQI ${Math.round(aqi)}`
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'B' : 'N'
  const lngDir = lng >= 0 ? 'Đ' : 'T'
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`
}

export function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN')
}

export function formatDepth(depth: number): string {
  return `${depth.toFixed(1)} km`
}
