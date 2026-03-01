import { ESGCategory } from './news'

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
