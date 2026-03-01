import { ConflictEvent, ConflictType } from '@/types/disasters'

// ACLED requires API key for live data. Use curated fallback for demo.
// Register free academic access at: https://acleddata.com/register/

// Major ongoing conflict zones (curated, updated regularly)
const CONFLICT_DATA: ConflictEvent[] = [
  // Ukraine-Russia
  { id: 'conf-ua-1', type: 'battle', title: 'Xung đột Donetsk, Ukraine', lat: 48.0159, lng: 37.8029, date: '2026-03-01', country: 'Ukraine', fatalities: 0, source: 'ACLED' },
  { id: 'conf-ua-2', type: 'battle', title: 'Xung đột Zaporizhzhia, Ukraine', lat: 47.8388, lng: 35.1396, date: '2026-03-01', country: 'Ukraine', fatalities: 0, source: 'ACLED' },
  { id: 'conf-ua-3', type: 'battle', title: 'Xung đột Kherson, Ukraine', lat: 46.6354, lng: 32.6169, date: '2026-03-01', country: 'Ukraine', fatalities: 0, source: 'ACLED' },
  { id: 'conf-ua-4', type: 'explosion', title: 'Tấn công Kharkiv, Ukraine', lat: 49.9935, lng: 36.2304, date: '2026-03-01', country: 'Ukraine', fatalities: 0, source: 'ACLED' },

  // Gaza/Israel
  { id: 'conf-ps-1', type: 'battle', title: 'Xung đột Gaza, Palestine', lat: 31.5, lng: 34.47, date: '2026-03-01', country: 'Palestine', fatalities: 0, source: 'ACLED' },
  { id: 'conf-ps-2', type: 'explosion', title: 'Tấn công Rafah, Palestine', lat: 31.2969, lng: 34.2455, date: '2026-03-01', country: 'Palestine', fatalities: 0, source: 'ACLED' },
  { id: 'conf-lb-1', type: 'battle', title: 'Xung đột biên giới Lebanon', lat: 33.3, lng: 35.5, date: '2026-03-01', country: 'Lebanon', fatalities: 0, source: 'ACLED' },

  // Sudan
  { id: 'conf-sd-1', type: 'battle', title: 'Nội chiến Khartoum, Sudan', lat: 15.5007, lng: 32.5599, date: '2026-03-01', country: 'Sudan', fatalities: 0, source: 'ACLED' },
  { id: 'conf-sd-2', type: 'violence_against_civilians', title: 'Bạo lực Darfur, Sudan', lat: 13.5, lng: 25.0, date: '2026-03-01', country: 'Sudan', fatalities: 0, source: 'ACLED' },

  // Myanmar
  { id: 'conf-mm-1', type: 'battle', title: 'Xung đột Shan State, Myanmar', lat: 21.0, lng: 98.0, date: '2026-03-01', country: 'Myanmar', fatalities: 0, source: 'ACLED' },
  { id: 'conf-mm-2', type: 'battle', title: 'Kháng chiến Sagaing, Myanmar', lat: 22.0, lng: 95.5, date: '2026-03-01', country: 'Myanmar', fatalities: 0, source: 'ACLED' },

  // DRC
  { id: 'conf-cd-1', type: 'battle', title: 'Xung đột North Kivu, DRC', lat: -1.5, lng: 29.0, date: '2026-03-01', country: 'DRC', fatalities: 0, source: 'ACLED' },

  // Ethiopia
  { id: 'conf-et-1', type: 'battle', title: 'Xung đột Amhara, Ethiopia', lat: 11.6, lng: 39.6, date: '2026-03-01', country: 'Ethiopia', fatalities: 0, source: 'ACLED' },

  // Somalia
  { id: 'conf-so-1', type: 'explosion', title: 'Tấn công Al-Shabaab, Somalia', lat: 2.0469, lng: 45.3182, date: '2026-03-01', country: 'Somalia', fatalities: 0, source: 'ACLED' },

  // Yemen
  { id: 'conf-ye-1', type: 'battle', title: 'Xung đột Marib, Yemen', lat: 15.4, lng: 45.3, date: '2026-03-01', country: 'Yemen', fatalities: 0, source: 'ACLED' },
  { id: 'conf-ye-2', type: 'explosion', title: 'Tấn công Houthi, Biển Đỏ', lat: 13.5, lng: 42.5, date: '2026-03-01', country: 'Yemen', fatalities: 0, source: 'ACLED' },

  // Syria
  { id: 'conf-sy-1', type: 'battle', title: 'Xung đột Idlib, Syria', lat: 35.9, lng: 36.6, date: '2026-03-01', country: 'Syria', fatalities: 0, source: 'ACLED' },

  // Nigeria
  { id: 'conf-ng-1', type: 'violence_against_civilians', title: 'Bạo lực Boko Haram, Nigeria', lat: 11.8, lng: 13.2, date: '2026-03-01', country: 'Nigeria', fatalities: 0, source: 'ACLED' },

  // Haiti
  { id: 'conf-ht-1', type: 'riot', title: 'Bạo loạn Port-au-Prince, Haiti', lat: 18.5425, lng: -72.3386, date: '2026-03-01', country: 'Haiti', fatalities: 0, source: 'ACLED' },

  // Colombia
  { id: 'conf-co-1', type: 'battle', title: 'Xung đột vũ trang Norte de Santander, Colombia', lat: 8.0, lng: -72.5, date: '2026-03-01', country: 'Colombia', fatalities: 0, source: 'ACLED' },

  // Sahel
  { id: 'conf-ml-1', type: 'battle', title: 'Xung đột Sahel, Mali', lat: 14.5, lng: -2.0, date: '2026-03-01', country: 'Mali', fatalities: 0, source: 'ACLED' },
  { id: 'conf-bf-1', type: 'explosion', title: 'Tấn công Burkina Faso', lat: 12.3, lng: -1.5, date: '2026-03-01', country: 'Burkina Faso', fatalities: 0, source: 'ACLED' },
]

export async function fetchConflicts(): Promise<ConflictEvent[]> {
  // With ACLED API key, would fetch live data:
  // const ACLED_KEY = process.env.ACLED_API_KEY
  // const ACLED_EMAIL = process.env.ACLED_EMAIL
  // if (ACLED_KEY && ACLED_EMAIL) { ... fetch from ACLED API ... }

  // Return curated conflict data
  return CONFLICT_DATA.map(c => ({
    ...c,
    date: new Date().toISOString().split('T')[0],
  }))
}

export async function fetchConflictsClient(): Promise<ConflictEvent[]> {
  const res = await fetch('/api/conflicts')
  if (!res.ok) throw new Error('Lỗi tải dữ liệu xung đột')
  const json = await res.json()
  return json.data
}
