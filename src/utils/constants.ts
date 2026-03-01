import { AQILevel, LayerConfig, MapViewState } from '@/types/esg'

// === Map defaults ===
export const DEFAULT_VIEW_STATE: MapViewState = {
  longitude: 106.6297,   // Hà Nội center
  latitude: 16.0474,     // Việt Nam center
  zoom: 2.5,
  pitch: 25,
  bearing: 0,
}

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// === AQI Levels (US EPA standard) ===
export const AQI_LEVELS: AQILevel[] = [
  { label: 'Tốt', color: '#22c55e', min: 0, max: 50, description: 'Chất lượng không khí tốt' },
  { label: 'Trung bình', color: '#eab308', min: 51, max: 100, description: 'Chấp nhận được' },
  { label: 'Không tốt cho nhóm nhạy cảm', color: '#f97316', min: 101, max: 150, description: 'Nhóm nhạy cảm nên hạn chế ra ngoài' },
  { label: 'Không lành mạnh', color: '#ef4444', min: 151, max: 200, description: 'Mọi người bắt đầu bị ảnh hưởng' },
  { label: 'Rất không lành mạnh', color: '#a855f7', min: 201, max: 300, description: 'Cảnh báo sức khỏe nghiêm trọng' },
  { label: 'Nguy hại', color: '#7f1d1d', min: 301, max: 500, description: 'Tình trạng khẩn cấp' },
]

// === Earthquake magnitude colors ===
export const MAGNITUDE_COLORS: Record<string, string> = {
  minor: '#22c55e',     // < 4.0
  light: '#eab308',     // 4.0 - 4.9
  moderate: '#f97316',  // 5.0 - 5.9
  strong: '#ef4444',    // 6.0 - 6.9
  major: '#dc2626',     // 7.0 - 7.9
  great: '#7f1d1d',     // 8.0+
}

export function getMagnitudeColor(mag: number): string {
  if (mag < 4) return MAGNITUDE_COLORS.minor
  if (mag < 5) return MAGNITUDE_COLORS.light
  if (mag < 6) return MAGNITUDE_COLORS.moderate
  if (mag < 7) return MAGNITUDE_COLORS.strong
  if (mag < 8) return MAGNITUDE_COLORS.major
  return MAGNITUDE_COLORS.great
}

export function getMagnitudeRadius(mag: number): number {
  return Math.max(4, Math.pow(2, mag - 2))
}

// === Layer configs ===
export const LAYER_CONFIGS: LayerConfig[] = [
  {
    id: 'air-quality',
    name: 'Chất lượng không khí',
    icon: '🌫️',
    color: '#3b82f6',
    enabled: true,
    description: 'AQI, PM2.5, PM10, CO2 từ OpenAQ',
  },
  {
    id: 'earthquakes',
    name: 'Động đất',
    icon: '🌍',
    color: '#ef4444',
    enabled: true,
    description: 'Động đất M4.5+ từ USGS',
  },
  {
    id: 'disasters',
    name: 'Thiên tai',
    icon: '🌀',
    color: '#f97316',
    enabled: false,
    description: 'Bão, lũ, núi lửa từ GDACS',
  },
  {
    id: 'fires',
    name: 'Cháy rừng',
    icon: '🔥',
    color: '#eab308',
    enabled: false,
    description: 'Phát hiện cháy từ NASA FIRMS',
  },
  {
    id: 'conflicts',
    name: 'Xung đột',
    icon: '⚔️',
    color: '#dc2626',
    enabled: false,
    description: 'Xung đột & biểu tình từ ACLED',
  },
]

// === AQI helper ===
export function getAQILevel(aqi: number): AQILevel {
  return AQI_LEVELS.find(l => aqi >= l.min && aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1]
}

export function getAQIColor(aqi: number): string {
  return getAQILevel(aqi).color
}

// === API endpoints ===
export const API_URLS = {
  USGS_EARTHQUAKES: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
  OPENAQ_LATEST: 'https://api.openaq.org/v2/latest',
  AQICN_FEED: 'https://api.waqi.info/feed',
  AQICN_MAP_BOUNDS: 'https://api.waqi.info/v2/map/bounds',
  GDACS_RSS: 'https://www.gdacs.org/xml/rss.xml',
  NASA_EONET: 'https://eonet.gsfc.nasa.gov/api/v3/events',
  NASA_FIRMS: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
}

// === Refresh intervals (ms) ===
export const REFRESH_INTERVALS = {
  AIR_QUALITY: 10 * 60 * 1000,    // 10 phút
  EARTHQUAKES: 5 * 60 * 1000,     // 5 phút
  DISASTERS: 15 * 60 * 1000,      // 15 phút
  FIRES: 30 * 60 * 1000,          // 30 phút
  CONFLICTS: 60 * 60 * 1000,      // 1 giờ
}
