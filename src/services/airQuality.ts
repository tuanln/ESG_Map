import { AirQualityStation } from '@/types/esg'

const WAQI_TOKEN = process.env.AQICN_TOKEN || 'demo'

// Prioritized list of cities to query - focusing on most polluted and important cities
const PRIORITY_CITIES = [
  // Việt Nam (ưu tiên)
  'hanoi', 'hochiminh', 'danang',
  // Ô nhiễm nặng
  'delhi', 'beijing', 'lahore', 'dhaka', 'kolkata', 'mumbai',
  'shanghai', 'chengdu', 'jakarta', 'bangkok',
  // Major global cities
  'tokyo', 'seoul', 'singapore', 'london', 'paris', 'newyork',
  'losangeles', 'sydney', 'cairo', 'lagos', 'moscow', 'dubai',
  'istanbul', 'saopaulo', 'mexicocity', 'berlin',
  // More coverage
  'madrid', 'rome', 'toronto', 'chicago', 'kathmandu',
  'manila', 'kualalumpur', 'tehran', 'riyadh', 'nairobi',
  'johannesburg', 'bogota', 'lima', 'santiago', 'buenosaires',
  'amsterdam', 'brussels', 'stockholm', 'warsaw', 'prague',
  'vienna', 'budapest', 'bucharest', 'athens', 'lisbon',
  'sanfrancisco', 'seattle', 'houston', 'phoenix', 'boston',
  'vancouver', 'melbourne', 'auckland', 'perth',
  'osaka', 'taipei', 'guangzhou', 'shenzhen',
  'yangon', 'phnompenh', 'haiphong', 'cantho',
  'addisababa', 'accra', 'dakar', 'baghdad', 'karachi',
  'helsinki', 'oslo',
]

// Fallback data for when API is limited (demo token)
const FALLBACK_STATIONS: AirQualityStation[] = [
  { id: 'fb-hanoi', name: 'Hà Nội', lat: 21.0285, lng: 105.8542, aqi: 156, pm25: 78, pm10: 95, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-hcm', name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, aqi: 89, pm25: 32, pm10: 55, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-danang', name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, aqi: 52, pm25: 18, pm10: 30, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-delhi', name: 'New Delhi', lat: 28.6139, lng: 77.2090, aqi: 285, pm25: 180, pm10: 220, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-beijing', name: 'Bắc Kinh', lat: 39.9042, lng: 116.4074, aqi: 165, pm25: 88, pm10: 120, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-shanghai', name: 'Thượng Hải', lat: 31.2304, lng: 121.4737, aqi: 72, pm25: 42, pm10: 58, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, aqi: 45, pm25: 15, pm10: 28, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-seoul', name: 'Seoul', lat: 37.5665, lng: 126.9780, aqi: 78, pm25: 35, pm10: 52, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-bangkok', name: 'Bangkok', lat: 13.7563, lng: 100.5018, aqi: 112, pm25: 55, pm10: 72, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-jakarta', name: 'Jakarta', lat: -6.2088, lng: 106.8456, aqi: 145, pm25: 72, pm10: 90, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-singapore', name: 'Singapore', lat: 1.3521, lng: 103.8198, aqi: 38, pm25: 12, pm10: 22, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-london', name: 'London', lat: 51.5074, lng: -0.1278, aqi: 42, pm25: 14, pm10: 25, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-paris', name: 'Paris', lat: 48.8566, lng: 2.3522, aqi: 55, pm25: 20, pm10: 32, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050, aqi: 38, pm25: 12, pm10: 20, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-moscow', name: 'Moscow', lat: 55.7558, lng: 37.6173, aqi: 68, pm25: 28, pm10: 42, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-ny', name: 'New York', lat: 40.7128, lng: -74.0060, aqi: 52, pm25: 18, pm10: 30, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-la', name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aqi: 85, pm25: 38, pm10: 52, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-chicago', name: 'Chicago', lat: 41.8781, lng: -87.6298, aqi: 48, pm25: 16, pm10: 28, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, aqi: 95, pm25: 42, pm10: 110, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-cairo', name: 'Cairo', lat: 30.0444, lng: 31.2357, aqi: 168, pm25: 85, pm10: 150, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 198, pm25: 110, pm10: 155, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-dhaka', name: 'Dhaka', lat: 23.8103, lng: 90.4125, aqi: 210, pm25: 135, pm10: 180, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-lahore', name: 'Lahore', lat: 31.5204, lng: 74.3587, aqi: 245, pm25: 160, pm10: 200, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-kathmandu', name: 'Kathmandu', lat: 27.7172, lng: 85.3240, aqi: 175, pm25: 92, pm10: 130, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-istanbul', name: 'Istanbul', lat: 41.0082, lng: 28.9784, aqi: 62, pm25: 22, pm10: 38, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-manila', name: 'Manila', lat: 14.5995, lng: 120.9842, aqi: 105, pm25: 48, pm10: 68, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-kl', name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, aqi: 78, pm25: 32, pm10: 48, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-tehran', name: 'Tehran', lat: 35.6892, lng: 51.3890, aqi: 142, pm25: 70, pm10: 98, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-riyadh', name: 'Riyadh', lat: 24.7136, lng: 46.6753, aqi: 125, pm25: 58, pm10: 140, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-lagos', name: 'Lagos', lat: 6.5244, lng: 3.3792, aqi: 155, pm25: 78, pm10: 110, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-nairobi', name: 'Nairobi', lat: -1.2921, lng: 36.8219, aqi: 72, pm25: 28, pm10: 45, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-johannesburg', name: 'Johannesburg', lat: -26.2041, lng: 28.0473, aqi: 65, pm25: 24, pm10: 38, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-sydney', name: 'Sydney', lat: -33.8688, lng: 151.2093, aqi: 32, pm25: 8, pm10: 18, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-saopaulo', name: 'São Paulo', lat: -23.5505, lng: -46.6333, aqi: 75, pm25: 30, pm10: 48, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-mexicocity', name: 'Mexico City', lat: 19.4326, lng: -99.1332, aqi: 98, pm25: 42, pm10: 65, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-bogota', name: 'Bogotá', lat: 4.7110, lng: -74.0721, aqi: 82, pm25: 35, pm10: 52, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-lima', name: 'Lima', lat: -12.0464, lng: -77.0428, aqi: 88, pm25: 38, pm10: 55, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-buenos', name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, aqi: 45, pm25: 15, pm10: 25, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-madrid', name: 'Madrid', lat: 40.4168, lng: -3.7038, aqi: 48, pm25: 16, pm10: 28, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-rome', name: 'Rome', lat: 41.9028, lng: 12.4964, aqi: 52, pm25: 18, pm10: 32, timestamp: new Date().toISOString(), source: 'aqicn' },
  { id: 'fb-baghdad', name: 'Baghdad', lat: 33.3152, lng: 44.3661, aqi: 178, pm25: 95, pm10: 165, timestamp: new Date().toISOString(), source: 'aqicn' },
]

interface WAQIFeedResponse {
  status: string
  data: {
    aqi: number
    idx: number
    city: {
      geo: [number, number]
      name: string
    }
    iaqi?: Record<string, { v: number }>
    time?: { iso: string }
  }
}

async function fetchCityAQI(city: string): Promise<AirQualityStation | null> {
  try {
    const res = await fetch(`https://api.waqi.info/feed/${city}/?token=${WAQI_TOKEN}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null

    const data: WAQIFeedResponse = await res.json()
    if (data.status !== 'ok' || !data.data?.city?.geo) return null

    const d = data.data
    const aqi = typeof d.aqi === 'number' ? d.aqi : parseInt(String(d.aqi)) || 0
    if (aqi <= 0) return null

    return {
      id: `waqi-${d.idx}`,
      name: d.city.name,
      lat: d.city.geo[0],
      lng: d.city.geo[1],
      aqi,
      pm25: d.iaqi?.pm25?.v,
      pm10: d.iaqi?.pm10?.v,
      co: d.iaqi?.co?.v,
      so2: d.iaqi?.so2?.v,
      no2: d.iaqi?.no2?.v,
      o3: d.iaqi?.o3?.v,
      timestamp: d.time?.iso || new Date().toISOString(),
      source: 'aqicn',
    }
  } catch {
    return null
  }
}

// In-memory cache
let cachedStations: AirQualityStation[] | null = null
let cacheTime = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function fetchAirQualityStations(): Promise<AirQualityStation[]> {
  // Return cache if fresh
  if (cachedStations && Date.now() - cacheTime < CACHE_TTL) {
    return cachedStations
  }

  // Try fetching live data from WAQI (limited batch for demo token)
  const results: AirQualityStation[] = []
  // Only try first 16 cities with demo token to avoid excessive timeouts
  const citiesToTry = WAQI_TOKEN === 'demo' ? PRIORITY_CITIES.slice(0, 16) : PRIORITY_CITIES
  const batchSize = 8

  for (let i = 0; i < citiesToTry.length; i += batchSize) {
    const batch = citiesToTry.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fetchCityAQI))
    results.push(...batchResults.filter((r): r is AirQualityStation => r !== null))

    if (i + batchSize < citiesToTry.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // Always merge with fallback data, preferring live data over fallback
  const liveCoords = new Set(results.map(s => `${s.lat.toFixed(1)}_${s.lng.toFixed(1)}`))
  const fallback = FALLBACK_STATIONS.filter(s => {
    const key = `${s.lat.toFixed(1)}_${s.lng.toFixed(1)}`
    return !liveCoords.has(key)
  })
  // Update fallback timestamps to now
  const updatedFallback = fallback.map(s => ({ ...s, timestamp: new Date().toISOString() }))
  const merged = [...results, ...updatedFallback]

  cachedStations = dedup(merged)
  cacheTime = Date.now()
  return cachedStations
}

function dedup(stations: AirQualityStation[]): AirQualityStation[] {
  const seen = new Set<string>()
  return stations.filter(s => {
    const key = `${s.lat.toFixed(1)}_${s.lng.toFixed(1)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function fetchAirQualityClient(): Promise<AirQualityStation[]> {
  const res = await fetch('/api/air-quality')
  if (!res.ok) throw new Error('Lỗi tải dữ liệu chất lượng không khí')
  const json = await res.json()
  return json.data
}
