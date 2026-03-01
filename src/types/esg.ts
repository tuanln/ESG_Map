// === Air Quality Types ===
export interface AirQualityStation {
  id: string
  name: string
  lat: number
  lng: number
  aqi: number
  pm25?: number
  pm10?: number
  co?: number
  so2?: number
  no2?: number
  o3?: number
  timestamp: string
  source: 'openaq' | 'aqicn'
}

export interface AQILevel {
  label: string
  color: string
  min: number
  max: number
  description: string
}

// === Earthquake Types ===
export interface Earthquake {
  id: string
  title: string
  lat: number
  lng: number
  depth: number
  magnitude: number
  place: string
  time: number
  url: string
  tsunami: boolean
  type: string
}

// === Layer Types ===
export type LayerType = 'air-quality' | 'earthquakes' | 'disasters' | 'fires' | 'conflicts'

export interface LayerConfig {
  id: LayerType
  name: string
  icon: string
  color: string
  enabled: boolean
  description: string
}

// === Map Types ===
export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

// === Country Types ===
export interface CountryESGData {
  code: string
  name: string
  eScore: number
  sScore: number
  gScore: number
  totalScore: number
  airQualityAvg: number
  recentDisasters: number
  conflictLevel: 'low' | 'medium' | 'high' | 'critical'
}

// === API Response Types ===
export interface ApiResponse<T> {
  data: T
  timestamp: string
  source: string
  count: number
}
