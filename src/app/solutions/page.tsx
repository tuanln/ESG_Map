'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/common/Header'
import {
  Solution,
  SolutionCategory,
  SolutionStats,
  SolutionsSummary,
  SOLUTION_CATEGORY_LABELS,
  SOLUTION_CATEGORY_COLORS,
  SOLUTION_CATEGORY_ICONS,
  SOLUTION_STATUS_LABELS,
  SOLUTION_SCALE_LABELS,
} from '@/types/solutions'

type FilterCategory = SolutionCategory | 'all'

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [stats, setStats] = useState<SolutionStats | null>(null)
  const [summary, setSummary] = useState<SolutionsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterCategory>('all')

  useEffect(() => {
    fetch('/api/solutions?summary=true')
      .then(r => r.json())
      .then(data => {
        setSolutions(data.data || [])
        setStats(data.stats || null)
        setSummary(data.summary || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? solutions
    : solutions.filter(s => s.category === filter)

  const categories: FilterCategory[] = ['all', 'renewable-energy', 'green-transport', 'sustainable-agriculture', 'waste-management']

  return (
    <div className="min-h-screen bg-esg-darker">
      <Header onToggleSidebar={() => {}} sidebarOpen={false} />

      <main className="pt-14 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Giải Pháp ESG</h1>
        <p className="text-sm text-slate-400 mb-6">Các giải pháp công nghệ xanh và phát triển bền vững từ Việt Nam và thế giới</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left sidebar: AI Summary + Stats */}
            <div className="lg:col-span-1 space-y-5">
              {/* AI Trends Summary */}
              {summary && (
                <div className="bg-esg-card rounded-xl border border-esg-border p-5 sticky top-16">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs">AI</div>
                    <h2 className="text-sm font-semibold text-white">Xu Hướng Giải Pháp ESG</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 ml-auto">
                      {summary.generatedBy === 'gemini' ? 'Gemini AI' : 'Mẫu'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary.summary}</p>

                  <div className="space-y-3">
                    {summary.trends.map((t, i) => (
                      <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: SOLUTION_CATEGORY_COLORS[t.category] }}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs">{SOLUTION_CATEGORY_ICONS[t.category]}</span>
                          <span className="text-xs font-medium text-white">{t.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Vietnam Focus */}
                  <div className="mt-4 bg-esg-darker/50 rounded-lg p-3 border border-esg-border/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs">🇻🇳</span>
                      <span className="text-xs font-semibold text-white">Trọng tâm Việt Nam</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{summary.vietnamFocus}</p>
                  </div>

                  <p className="text-[9px] text-slate-600 mt-3 text-right">
                    Tạo lúc: {new Date(summary.generatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Stats */}
              {stats && (
                <div className="bg-esg-card rounded-xl border border-esg-border p-5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thống kê</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="Tổng giải pháp" value={stats.total} color="text-white" />
                    <MiniStat label="Đang hoạt động" value={stats.byStatus.active} color="text-esg-green" />
                    <MiniStat label="Đang triển khai" value={stats.byStatus.planned} color="text-esg-yellow" />
                    <MiniStat label="Quy mô toàn cầu" value={stats.byScale.global} color="text-esg-blue" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-esg-border/50 space-y-1.5">
                    {(Object.keys(stats.byCategory) as SolutionCategory[]).map(cat => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {SOLUTION_CATEGORY_ICONS[cat]} {SOLUTION_CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-xs font-medium" style={{ color: SOLUTION_CATEGORY_COLORS[cat] }}>
                          {stats.byCategory[cat]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Solutions grid */}
            <div className="lg:col-span-2">
              {/* Filter tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      filter === cat
                        ? 'bg-esg-card text-white border border-esg-border'
                        : 'text-slate-400 hover:text-white hover:bg-esg-card/50'
                    }`}
                  >
                    {cat === 'all' ? '📋 Tất cả' : `${SOLUTION_CATEGORY_ICONS[cat]} ${SOLUTION_CATEGORY_LABELS[cat]}`}
                    <span className="ml-1 text-slate-500">
                      ({cat === 'all' ? solutions.length : solutions.filter(s => s.category === cat).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Solutions cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(solution => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">Không có giải pháp cho danh mục này</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          Nguồn: World Bank, IEA, UNDP, IRENA, EVN, FAO, UNEP
          <br />
          AI phân tích: Google Gemini &bull; Dữ liệu curated từ các dự án thực tế
        </div>
      </main>
    </div>
  )
}

function SolutionCard({ solution }: { solution: Solution }) {
  const catColor = SOLUTION_CATEGORY_COLORS[solution.category]

  return (
    <div className="bg-esg-card rounded-xl border border-esg-border p-4 hover:border-slate-500/50 transition-colors group">
      {/* Category + Status badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: catColor + '15', color: catColor }}
        >
          {SOLUTION_CATEGORY_ICONS[solution.category]} {SOLUTION_CATEGORY_LABELS[solution.category]}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          solution.status === 'active' ? 'bg-green-600/15 text-green-400' :
          solution.status === 'planned' ? 'bg-yellow-600/15 text-yellow-400' :
          'bg-blue-600/15 text-blue-400'
        }`}>
          {SOLUTION_STATUS_LABELS[solution.status]}
        </span>
        <span className="text-[10px] text-slate-500 ml-auto">{solution.year}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-1.5 leading-snug">
        {solution.title}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-3">
        {solution.description}
      </p>

      {/* Impact */}
      <div className="bg-esg-darker/50 rounded-lg px-3 py-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">Tác động:</span>
          <span className="text-xs font-medium text-esg-green">{solution.impact}</span>
        </div>
      </div>

      {/* Footer: Country + Scale + Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{solution.country}</span>
          <span className="text-[10px] text-slate-600">&bull;</span>
          <span className="text-[10px] text-slate-500">{SOLUTION_SCALE_LABELS[solution.scale]}</span>
        </div>
        {solution.link && (
          <a
            href={solution.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-esg-blue hover:text-blue-400 transition-colors"
          >
            Chi tiết &rarr;
          </a>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-esg-darker/50 rounded-lg p-2">
      <p className="text-[9px] text-slate-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}
