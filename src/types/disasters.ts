export interface Disaster {
  id: string
  title: string
  description: string
  type: DisasterType
  alertLevel: 'Green' | 'Orange' | 'Red'
  lat: number
  lng: number
  date: string
  dateModified: string
  country: string
  severity: string
  population: string
  link: string
  icon: string
}

export type DisasterType = 'EQ' | 'TC' | 'FL' | 'VO' | 'DR' | 'WF'

export interface NasaFireEvent {
  id: string
  title: string
  lat: number
  lng: number
  date: string
  source: string
  link: string
}

export interface ConflictEvent {
  id: string
  type: ConflictType
  title: string
  lat: number
  lng: number
  date: string
  country: string
  fatalities: number
  source: string
}

export type ConflictType = 'battle' | 'protest' | 'riot' | 'violence_against_civilians' | 'explosion' | 'strategic'

export const DISASTER_TYPE_LABELS: Record<DisasterType, string> = {
  EQ: 'Động đất',
  TC: 'Bão nhiệt đới',
  FL: 'Lũ lụt',
  VO: 'Núi lửa',
  DR: 'Hạn hán',
  WF: 'Cháy rừng',
}

export const DISASTER_TYPE_ICONS: Record<DisasterType, string> = {
  EQ: '🌍',
  TC: '🌀',
  FL: '🌊',
  VO: '🌋',
  DR: '☀️',
  WF: '🔥',
}

export const ALERT_COLORS: Record<string, string> = {
  Green: '#22c55e',
  Orange: '#f97316',
  Red: '#ef4444',
}

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  battle: 'Giao tranh',
  protest: 'Biểu tình',
  riot: 'Bạo loạn',
  violence_against_civilians: 'Bạo lực dân sự',
  explosion: 'Nổ/Tấn công',
  strategic: 'Chiến lược',
}

export const CONFLICT_TYPE_COLORS: Record<ConflictType, string> = {
  battle: '#ef4444',
  protest: '#eab308',
  riot: '#f97316',
  violence_against_civilians: '#dc2626',
  explosion: '#b91c1c',
  strategic: '#7c3aed',
}
