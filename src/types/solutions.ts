import { ESGCategory } from './news'

// === Standards Types ===

export type StandardType = 'iso-37122' | 'breeam'

export type ISO37122Domain =
  | 'economy' | 'education' | 'energy' | 'environment' | 'finance'
  | 'governance' | 'health' | 'recreation' | 'safety' | 'shelter'
  | 'solid-waste' | 'telecom-innovation' | 'transportation'
  | 'urban-planning' | 'wastewater' | 'water'

export type BREEAMCategory = 'GO' | 'SE' | 'RE' | 'LE' | 'TM'

export interface StandardInfo {
  type: StandardType
  domains?: ISO37122Domain[]
  categories?: BREEAMCategory[]
}

// === Solution Types ===

export type SolutionCategory = 'renewable-energy' | 'green-transport' | 'sustainable-agriculture' | 'waste-management'

export interface Solution {
  id: string
  title: string
  description: string
  category: SolutionCategory
  country: string
  region: string
  impact: string
  scale: 'local' | 'national' | 'global'
  status: 'active' | 'planned' | 'completed'
  link?: string
  year: number
  esgAlignment: ESGCategory[]
  standards?: StandardInfo[]
}

export interface SolutionStats {
  total: number
  byCategory: Record<SolutionCategory, number>
  byScale: Record<string, number>
  byStatus: Record<string, number>
}

export interface SolutionsSummary {
  summary: string
  trends: { title: string; description: string; category: SolutionCategory }[]
  vietnamFocus: string
  generatedAt: string
  generatedBy: 'gemini' | 'sample'
}

// === Labels & Colors ===

export const SOLUTION_CATEGORY_LABELS: Record<SolutionCategory, string> = {
  'renewable-energy': 'Năng lượng tái tạo',
  'green-transport': 'Giao thông xanh',
  'sustainable-agriculture': 'Nông nghiệp bền vững',
  'waste-management': 'Quản lý rác thải',
}

export const SOLUTION_CATEGORY_COLORS: Record<SolutionCategory, string> = {
  'renewable-energy': '#22c55e',
  'green-transport': '#3b82f6',
  'sustainable-agriculture': '#eab308',
  'waste-management': '#a855f7',
}

export const SOLUTION_CATEGORY_ICONS: Record<SolutionCategory, string> = {
  'renewable-energy': '⚡',
  'green-transport': '🚆',
  'sustainable-agriculture': '🌾',
  'waste-management': '♻️',
}

export const SOLUTION_STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động',
  planned: 'Đang triển khai',
  completed: 'Hoàn thành',
}

export const SOLUTION_SCALE_LABELS: Record<string, string> = {
  local: 'Địa phương',
  national: 'Quốc gia',
  global: 'Toàn cầu',
}

export const STANDARD_TYPE_LABELS: Record<StandardType, string> = {
  'iso-37122': 'ISO 37122',
  'breeam': 'BREEAM',
}

export const STANDARD_TYPE_COLORS: Record<StandardType, string> = {
  'iso-37122': '#06b6d4',
  'breeam': '#f59e0b',
}

export const ISO_DOMAIN_LABELS: Record<ISO37122Domain, string> = {
  'economy': 'Kinh tế',
  'education': 'Giáo dục',
  'energy': 'Năng lượng',
  'environment': 'Môi trường',
  'finance': 'Tài chính',
  'governance': 'Quản trị',
  'health': 'Y tế',
  'recreation': 'Giải trí',
  'safety': 'An toàn',
  'shelter': 'Nhà ở',
  'solid-waste': 'Chất thải rắn',
  'telecom-innovation': 'Viễn thông & Đổi mới',
  'transportation': 'Giao thông',
  'urban-planning': 'Quy hoạch đô thị',
  'wastewater': 'Nước thải',
  'water': 'Nước sạch',
}

export const BREEAM_CATEGORY_LABELS: Record<BREEAMCategory, string> = {
  'GO': 'Governance',
  'SE': 'Social & Economic',
  'RE': 'Resources & Energy',
  'LE': 'Land Use & Ecology',
  'TM': 'Transport & Movement',
}
