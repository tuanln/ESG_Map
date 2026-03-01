'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/common/Header'
import { CountryProfile } from '@/types/news'
import { getScoreColor, getScoreLabel } from '@/services/esgScore'

const CONFLICT_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Thấp', color: '#22c55e' },
  medium: { label: 'Trung bình', color: '#eab308' },
  high: { label: 'Cao', color: '#f97316' },
  critical: { label: 'Nghiêm trọng', color: '#ef4444' },
}

export default function CountryPage() {
  const [countries, setCountries] = useState<CountryProfile[]>([])
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'total' | 'environment' | 'social' | 'governance'>('total')

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(d => {
        setCountries(d.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sorted = [...countries].sort((a, b) => {
    if (sortBy === 'total') return b.esgScore.total - a.esgScore.total
    return b.esgScore[sortBy] - a.esgScore[sortBy]
  })

  return (
    <div className="min-h-screen bg-esg-darker">
      <Header onToggleSidebar={() => {}} sidebarOpen={false} />

      <main className="pt-14 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Hồ Sơ ESG Quốc Gia</h1>
        <p className="text-sm text-slate-400 mb-6">So sánh điểm ESG giữa các quốc gia trên thế giới</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Country list */}
            <div className="lg:col-span-2">
              {/* Sort buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'total' as const, label: 'Tổng ESG' },
                  { key: 'environment' as const, label: '🌿 E' },
                  { key: 'social' as const, label: '👥 S' },
                  { key: 'governance' as const, label: '🏛️ G' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      sortBy === s.key ? 'bg-esg-card text-white border border-esg-border' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Country table */}
              <div className="bg-esg-card rounded-xl border border-esg-border overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_60px_60px_60px_70px_80px] gap-2 px-4 py-2.5 bg-esg-darker/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div>#</div>
                  <div>Quốc gia</div>
                  <div className="text-center">E</div>
                  <div className="text-center">S</div>
                  <div className="text-center">G</div>
                  <div className="text-center">ESG</div>
                  <div className="text-center">Xung đột</div>
                </div>

                {sorted.map((c, i) => {
                  const cl = CONFLICT_LABELS[c.conflicts.level]
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCountry(c)}
                      className={`w-full grid grid-cols-[40px_1fr_60px_60px_60px_70px_80px] gap-2 px-4 py-3 text-left hover:bg-esg-darker/30 transition-colors border-t border-esg-border/50 ${
                        selectedCountry?.code === c.code ? 'bg-esg-darker/50' : ''
                      }`}
                    >
                      <span className="text-xs text-slate-500">{i + 1}</span>
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.region}</p>
                      </div>
                      <ScoreBadge score={c.esgScore.environment} />
                      <ScoreBadge score={c.esgScore.social} />
                      <ScoreBadge score={c.esgScore.governance} />
                      <div className="flex justify-center">
                        <span
                          className="text-sm font-bold px-2 py-0.5 rounded"
                          style={{ color: getScoreColor(c.esgScore.total), backgroundColor: getScoreColor(c.esgScore.total) + '15' }}
                        >
                          {c.esgScore.total}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: cl.color, backgroundColor: cl.color + '15' }}>
                          {cl.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Country detail */}
            <div className="lg:col-span-1">
              {selectedCountry ? (
                <CountryDetail country={selectedCountry} />
              ) : (
                <div className="bg-esg-card rounded-xl border border-esg-border p-6 text-center sticky top-16">
                  <p className="text-slate-400 text-sm">Chọn một quốc gia để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex justify-center">
      <span className="text-xs font-medium" style={{ color: getScoreColor(score) }}>
        {score}
      </span>
    </div>
  )
}

function CountryDetail({ country }: { country: CountryProfile }) {
  const { esgScore } = country
  const cl = CONFLICT_LABELS[country.conflicts.level]

  return (
    <div className="bg-esg-card rounded-xl border border-esg-border p-5 sticky top-16 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{country.name}</h2>
        <p className="text-xs text-slate-400">{country.nameEn} &bull; {country.region}</p>
      </div>

      {/* ESG Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Điểm ESG Tổng</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: getScoreColor(esgScore.total) }}>
              {esgScore.total}
            </span>
            <span className="text-xs text-slate-500">/100</span>
            <span className="text-xs">{esgScore.trend === 'up' ? '📈' : esgScore.trend === 'down' ? '📉' : '➡️'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">{getScoreLabel(esgScore.total)}</p>

        {/* E/S/G Bars */}
        {[
          { label: 'Môi trường (E)', score: esgScore.environment, icon: '🌿' },
          { label: 'Xã hội (S)', score: esgScore.social, icon: '👥' },
          { label: 'Quản trị (G)', score: esgScore.governance, icon: '🏛️' },
        ].map(item => (
          <div key={item.label} className="mb-2.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{item.icon} {item.label}</span>
              <span className="font-medium" style={{ color: getScoreColor(item.score) }}>{item.score}</span>
            </div>
            <div className="w-full bg-esg-darker rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${item.score}%`, backgroundColor: getScoreColor(item.score) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Air Quality */}
      <div className="border-t border-esg-border pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chất lượng không khí</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">AQI trung bình</span>
          <span className="text-lg font-bold" style={{ color: country.airQuality.avgAQI > 100 ? '#ef4444' : country.airQuality.avgAQI > 50 ? '#eab308' : '#22c55e' }}>
            {country.airQuality.avgAQI}
          </span>
        </div>
        <p className="text-[10px] text-slate-500">{country.airQuality.stations} trạm quan trắc</p>
      </div>

      {/* Disasters */}
      <div className="border-t border-esg-border pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Thiên tai</h3>
        <p className="text-sm text-slate-300">{country.disasters.count} sự kiện ghi nhận</p>
        {country.disasters.recent.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {country.disasters.recent.map((d, i) => (
              <li key={i} className="text-xs text-slate-400">&bull; {d}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Conflicts */}
      <div className="border-t border-esg-border pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Xung đột</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded" style={{ color: cl.color, backgroundColor: cl.color + '15' }}>
            {cl.label}
          </span>
          <span className="text-xs text-slate-400">{country.conflicts.events} sự kiện</span>
        </div>
      </div>

      {/* Source */}
      <div className="border-t border-esg-border pt-3">
        <p className="text-[9px] text-slate-600">
          Nguồn: World Bank, UNDP, Yale EPI, Climate Watch
        </p>
      </div>
    </div>
  )
}
