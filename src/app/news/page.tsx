'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/common/Header'
import { NewsArticle, AISummary, ESG_CATEGORY_LABELS, ESG_CATEGORY_COLORS, ESG_CATEGORY_ICONS, ESGCategory } from '@/types/news'
import { formatTimeAgo } from '@/utils/formatters'

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [summary, setSummary] = useState<AISummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ESGCategory | 'all'>('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/news').then(r => r.json()),
      fetch('/api/ai-summary').then(r => r.json()),
    ]).then(([newsData, summaryData]) => {
      setArticles(newsData.data || [])
      setSummary(summaryData.data || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredArticles = filter === 'all'
    ? articles
    : articles.filter(a => a.category === filter)

  const categories: (ESGCategory | 'all')[] = ['all', 'environment', 'social', 'governance']

  return (
    <div className="min-h-screen bg-esg-darker">
      <Header onToggleSidebar={() => {}} sidebarOpen={false} />

      <main className="pt-14 px-4 md:px-8 pb-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Tin Tức ESG</h1>
        <p className="text-sm text-slate-400 mb-6">Tổng hợp tin tức Môi trường - Xã hội - Quản trị từ nguồn quốc tế</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: AI Summary */}
            <div className="lg:col-span-1">
              {summary && (
                <div className="bg-esg-card rounded-xl border border-esg-border p-5 mb-6 sticky top-16">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">AI</div>
                    <h2 className="text-sm font-semibold text-white">Tóm Tắt ESG Hôm Nay</h2>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 ml-auto">
                      {summary.generatedBy === 'gemini' ? 'Gemini AI' : 'Mẫu'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{summary.summary}</p>

                  <div className="space-y-3">
                    {summary.highlights.map((h, i) => (
                      <div key={i} className="border-l-2 pl-3 py-1" style={{ borderColor: ESG_CATEGORY_COLORS[h.category] }}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs">{ESG_CATEGORY_ICONS[h.category]}</span>
                          <span className="text-xs font-medium text-white">{h.title}</span>
                          {h.severity === 'critical' && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-red-600/20 text-red-400">Nghiêm trọng</span>
                          )}
                          {h.severity === 'warning' && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-600/20 text-yellow-400">Cảnh báo</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{h.description}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-slate-600 mt-4 text-right">
                    Tạo lúc: {new Date(summary.generatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>

            {/* Right: News Feed */}
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
                    {cat === 'all' ? '📋 Tất cả' : `${ESG_CATEGORY_ICONS[cat]} ${ESG_CATEGORY_LABELS[cat]}`}
                    <span className="ml-1 text-slate-500">
                      ({cat === 'all' ? articles.length : articles.filter(a => a.category === cat).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Articles */}
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <a
                    key={article.id}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-esg-card rounded-xl border border-esg-border p-4 hover:border-esg-blue/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: ESG_CATEGORY_COLORS[article.category] + '15',
                              color: ESG_CATEGORY_COLORS[article.category],
                            }}
                          >
                            {ESG_CATEGORY_LABELS[article.category]}
                          </span>
                          <span className="text-[10px] text-slate-500">{article.source}</span>
                          <span className="text-[10px] text-slate-600">&bull; {formatTimeAgo(article.pubDate)}</span>
                        </div>

                        <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors mb-1 line-clamp-2">
                          {article.title}
                        </h3>

                        {article.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{article.description}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-sm">Không có tin tức cho danh mục này</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          Nguồn: BBC, The Guardian, Al Jazeera, ReliefWeb, ESG Today, GreenBiz, Climate Change News
          <br />
          AI tóm tắt: Google Gemini &bull; Cập nhật mỗi 15 phút
        </div>
      </main>
    </div>
  )
}
