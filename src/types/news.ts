export interface NewsArticle {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  category: ESGCategory
  imageUrl?: string
}

export type ESGCategory = 'environment' | 'social' | 'governance' | 'general'

export interface AISummary {
  date: string
  summary: string
  highlights: SummaryHighlight[]
  generatedBy: 'gemini' | 'sample'
  generatedAt: string
}

export interface SummaryHighlight {
  title: string
  category: ESGCategory
  severity: 'info' | 'warning' | 'critical'
  description: string
}

export const ESG_CATEGORY_LABELS: Record<ESGCategory, string> = {
  environment: 'Môi trường',
  social: 'Xã hội',
  governance: 'Quản trị',
  general: 'Tổng hợp',
}

export const ESG_CATEGORY_COLORS: Record<ESGCategory, string> = {
  environment: '#22c55e',
  social: '#3b82f6',
  governance: '#a855f7',
  general: '#64748b',
}

export const ESG_CATEGORY_ICONS: Record<ESGCategory, string> = {
  environment: '🌿',
  social: '👥',
  governance: '🏛️',
  general: '📰',
}

// Country ESG Profile
export interface CountryProfile {
  code: string
  name: string
  nameEn: string
  region: string
  esgScore: ESGScore
  airQuality: { avgAQI: number; stations: number }
  disasters: { count: number; recent: string[] }
  conflicts: { level: 'low' | 'medium' | 'high' | 'critical'; events: number }
  news: NewsArticle[]
}

export interface ESGScore {
  total: number      // 0-100
  environment: number // 0-100
  social: number     // 0-100
  governance: number // 0-100
  trend: 'up' | 'down' | 'stable'
}
