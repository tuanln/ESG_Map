import { CountryProfile, ESGScore } from '@/types/news'

// Curated ESG data for major countries
// Sources: World Bank, UNDP, Climate Watch, Yale EPI
const COUNTRY_DATA: CountryProfile[] = [
  // Việt Nam
  { code: 'VN', name: 'Việt Nam', nameEn: 'Vietnam', region: 'Đông Nam Á',
    esgScore: { total: 52, environment: 45, social: 58, governance: 53, trend: 'up' },
    airQuality: { avgAQI: 120, stations: 3 },
    disasters: { count: 5, recent: ['Bão số 3', 'Lũ miền Trung'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  // Major economies
  { code: 'US', name: 'Hoa Kỳ', nameEn: 'United States', region: 'Bắc Mỹ',
    esgScore: { total: 62, environment: 55, social: 68, governance: 63, trend: 'stable' },
    airQuality: { avgAQI: 52, stations: 50 },
    disasters: { count: 12, recent: ['Cháy rừng California', 'Bão Florida'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'CN', name: 'Trung Quốc', nameEn: 'China', region: 'Đông Á',
    esgScore: { total: 48, environment: 38, social: 52, governance: 55, trend: 'up' },
    airQuality: { avgAQI: 110, stations: 10 },
    disasters: { count: 8, recent: ['Động đất Tứ Xuyên', 'Lũ lụt Hà Nam'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'JP', name: 'Nhật Bản', nameEn: 'Japan', region: 'Đông Á',
    esgScore: { total: 72, environment: 68, social: 78, governance: 70, trend: 'stable' },
    airQuality: { avgAQI: 45, stations: 8 },
    disasters: { count: 15, recent: ['Động đất Noto', 'Bão Typhoon'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'DE', name: 'Đức', nameEn: 'Germany', region: 'Châu Âu',
    esgScore: { total: 78, environment: 75, social: 82, governance: 77, trend: 'stable' },
    airQuality: { avgAQI: 38, stations: 5 },
    disasters: { count: 2, recent: ['Lũ lụt Rhine'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'GB', name: 'Anh', nameEn: 'United Kingdom', region: 'Châu Âu',
    esgScore: { total: 76, environment: 72, social: 80, governance: 76, trend: 'stable' },
    airQuality: { avgAQI: 42, stations: 4 },
    disasters: { count: 1, recent: [] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'FR', name: 'Pháp', nameEn: 'France', region: 'Châu Âu',
    esgScore: { total: 74, environment: 70, social: 78, governance: 74, trend: 'stable' },
    airQuality: { avgAQI: 55, stations: 4 },
    disasters: { count: 3, recent: ['Cháy rừng Provence'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  // High pollution countries
  { code: 'IN', name: 'Ấn Độ', nameEn: 'India', region: 'Nam Á',
    esgScore: { total: 38, environment: 25, social: 42, governance: 48, trend: 'up' },
    airQuality: { avgAQI: 220, stations: 6 },
    disasters: { count: 18, recent: ['Lũ lụt Assam', 'Nắng nóng Delhi'] },
    conflicts: { level: 'medium', events: 5 }, news: [] },

  { code: 'BD', name: 'Bangladesh', nameEn: 'Bangladesh', region: 'Nam Á',
    esgScore: { total: 35, environment: 28, social: 38, governance: 40, trend: 'stable' },
    airQuality: { avgAQI: 210, stations: 2 },
    disasters: { count: 10, recent: ['Lũ lụt Sylhet', 'Động đất M5.3'] },
    conflicts: { level: 'medium', events: 3 }, news: [] },

  { code: 'PK', name: 'Pakistan', nameEn: 'Pakistan', region: 'Nam Á',
    esgScore: { total: 32, environment: 22, social: 35, governance: 38, trend: 'down' },
    airQuality: { avgAQI: 245, stations: 2 },
    disasters: { count: 8, recent: ['Lũ lụt Sindh'] },
    conflicts: { level: 'high', events: 8 }, news: [] },

  // Conflict zones
  { code: 'UA', name: 'Ukraine', nameEn: 'Ukraine', region: 'Đông Âu',
    esgScore: { total: 28, environment: 30, social: 22, governance: 32, trend: 'down' },
    airQuality: { avgAQI: 65, stations: 1 },
    disasters: { count: 2, recent: [] },
    conflicts: { level: 'critical', events: 15 }, news: [] },

  { code: 'SD', name: 'Sudan', nameEn: 'Sudan', region: 'Bắc Phi',
    esgScore: { total: 18, environment: 20, social: 12, governance: 22, trend: 'down' },
    airQuality: { avgAQI: 95, stations: 0 },
    disasters: { count: 3, recent: ['Hạn hán Darfur'] },
    conflicts: { level: 'critical', events: 10 }, news: [] },

  { code: 'MM', name: 'Myanmar', nameEn: 'Myanmar', region: 'Đông Nam Á',
    esgScore: { total: 22, environment: 30, social: 15, governance: 20, trend: 'down' },
    airQuality: { avgAQI: 85, stations: 0 },
    disasters: { count: 5, recent: ['Bão Mocha'] },
    conflicts: { level: 'critical', events: 8 }, news: [] },

  // ASEAN
  { code: 'TH', name: 'Thái Lan', nameEn: 'Thailand', region: 'Đông Nam Á',
    esgScore: { total: 55, environment: 48, social: 60, governance: 58, trend: 'stable' },
    airQuality: { avgAQI: 112, stations: 3 },
    disasters: { count: 4, recent: ['Lũ lụt miền Nam'] },
    conflicts: { level: 'low', events: 1 }, news: [] },

  { code: 'ID', name: 'Indonesia', nameEn: 'Indonesia', region: 'Đông Nam Á',
    esgScore: { total: 48, environment: 38, social: 52, governance: 55, trend: 'up' },
    airQuality: { avgAQI: 145, stations: 3 },
    disasters: { count: 20, recent: ['Động đất Sulawesi', 'Núi lửa Merapi'] },
    conflicts: { level: 'low', events: 2 }, news: [] },

  { code: 'SG', name: 'Singapore', nameEn: 'Singapore', region: 'Đông Nam Á',
    esgScore: { total: 82, environment: 78, social: 85, governance: 83, trend: 'up' },
    airQuality: { avgAQI: 38, stations: 2 },
    disasters: { count: 0, recent: [] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'KR', name: 'Hàn Quốc', nameEn: 'South Korea', region: 'Đông Á',
    esgScore: { total: 70, environment: 62, social: 75, governance: 72, trend: 'stable' },
    airQuality: { avgAQI: 78, stations: 5 },
    disasters: { count: 3, recent: ['Bão nhiệt đới'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  // Middle East
  { code: 'AE', name: 'UAE', nameEn: 'United Arab Emirates', region: 'Trung Đông',
    esgScore: { total: 60, environment: 45, social: 65, governance: 70, trend: 'up' },
    airQuality: { avgAQI: 95, stations: 2 },
    disasters: { count: 1, recent: ['Lũ lụt Dubai'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  { code: 'SA', name: 'Ả Rập Xê Út', nameEn: 'Saudi Arabia', region: 'Trung Đông',
    esgScore: { total: 45, environment: 30, social: 48, governance: 58, trend: 'up' },
    airQuality: { avgAQI: 125, stations: 1 },
    disasters: { count: 2, recent: [] },
    conflicts: { level: 'medium', events: 2 }, news: [] },

  // Africa
  { code: 'NG', name: 'Nigeria', nameEn: 'Nigeria', region: 'Tây Phi',
    esgScore: { total: 30, environment: 25, social: 30, governance: 35, trend: 'stable' },
    airQuality: { avgAQI: 155, stations: 1 },
    disasters: { count: 6, recent: ['Lũ lụt Lagos'] },
    conflicts: { level: 'high', events: 6 }, news: [] },

  // Oceania
  { code: 'AU', name: 'Australia', nameEn: 'Australia', region: 'Châu Đại Dương',
    esgScore: { total: 68, environment: 58, social: 78, governance: 68, trend: 'stable' },
    airQuality: { avgAQI: 32, stations: 3 },
    disasters: { count: 5, recent: ['Cháy rừng NSW'] },
    conflicts: { level: 'low', events: 0 }, news: [] },

  // South America
  { code: 'BR', name: 'Brazil', nameEn: 'Brazil', region: 'Nam Mỹ',
    esgScore: { total: 50, environment: 42, social: 52, governance: 55, trend: 'stable' },
    airQuality: { avgAQI: 75, stations: 2 },
    disasters: { count: 7, recent: ['Cháy rừng Amazon', 'Lũ lụt Rio Grande do Sul'] },
    conflicts: { level: 'medium', events: 3 }, news: [] },
]

export function getCountryProfile(code: string): CountryProfile | null {
  return COUNTRY_DATA.find(c => c.code === code.toUpperCase()) || null
}

export function getAllCountries(): CountryProfile[] {
  return COUNTRY_DATA.sort((a, b) => b.esgScore.total - a.esgScore.total)
}

export function getCountriesByRegion(region: string): CountryProfile[] {
  return COUNTRY_DATA.filter(c => c.region === region)
}

export function getTopCountries(limit: number = 10): CountryProfile[] {
  return [...COUNTRY_DATA].sort((a, b) => b.esgScore.total - a.esgScore.total).slice(0, limit)
}

export function getBottomCountries(limit: number = 10): CountryProfile[] {
  return [...COUNTRY_DATA].sort((a, b) => a.esgScore.total - b.esgScore.total).slice(0, limit)
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 50) return '#eab308'
  if (score >= 30) return '#f97316'
  return '#ef4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Xuất sắc'
  if (score >= 70) return 'Tốt'
  if (score >= 50) return 'Trung bình'
  if (score >= 30) return 'Yếu'
  return 'Nghiêm trọng'
}
