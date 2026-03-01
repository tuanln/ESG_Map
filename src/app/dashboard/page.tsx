'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/common/Header'
import { AirQualityStation, Earthquake } from '@/types/esg'
import { Disaster, ConflictEvent, NasaFireEvent, DISASTER_TYPE_LABELS, ALERT_COLORS, CONFLICT_TYPE_LABELS } from '@/types/disasters'
import { getAQILevel, getAQIColor } from '@/utils/constants'
import { formatTimeAgo, formatMagnitude } from '@/utils/formatters'

export default function DashboardPage() {
  const [stations, setStations] = useState<AirQualityStation[]>([])
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [fires, setFires] = useState<NasaFireEvent[]>([])
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/air-quality').then(r => r.json()),
      fetch('/api/earthquakes').then(r => r.json()),
      fetch('/api/disasters').then(r => r.json()),
      fetch('/api/fires').then(r => r.json()),
      fetch('/api/conflicts').then(r => r.json()),
    ]).then(([aq, eq, dis, fire, conf]) => {
      setStations(aq.data || [])
      setEarthquakes(eq.data || [])
      setDisasters(dis.data || [])
      setFires(fire.data || [])
      setConflicts(conf.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const avgAQI = stations.length > 0
    ? Math.round(stations.reduce((s, st) => s + st.aqi, 0) / stations.length)
    : 0
  const aqiLevel = getAQILevel(avgAQI)
  const maxMag = earthquakes.length > 0 ? Math.max(...earthquakes.map(e => e.magnitude)) : 0

  // Top 10 most polluted cities
  const topPolluted = [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 10)
  // Top 10 cleanest cities
  const topClean = [...stations].sort((a, b) => a.aqi - b.aqi).slice(0, 10)
  // Recent earthquakes
  const recentEQ = [...earthquakes].sort((a, b) => b.time - a.time).slice(0, 10)
  // Critical disasters (Orange/Red)
  const criticalDisasters = disasters.filter(d => d.alertLevel !== 'Green').slice(0, 10)

  // Disaster type breakdown
  const disasterByType: Record<string, number> = {}
  disasters.forEach(d => {
    const label = DISASTER_TYPE_LABELS[d.type] || d.type
    disasterByType[label] = (disasterByType[label] || 0) + 1
  })

  // Conflict by country
  const conflictByCountry: Record<string, number> = {}
  conflicts.forEach(c => {
    conflictByCountry[c.country] = (conflictByCountry[c.country] || 0) + 1
  })

  return (
    <div className="min-h-screen bg-esg-darker">
      <Header onToggleSidebar={() => {}} sidebarOpen={false} />

      <main className="pt-14 px-4 md:px-8 pb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Bảng Phân Tích ESG</h1>
        <p className="text-sm text-slate-400 mb-6">Tổng hợp dữ liệu Môi trường - Xã hội - Quản trị toàn cầu</p>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <SummaryCard label="Trạm AQI" value={stations.length} icon="🌫️" color="bg-blue-500/10 text-blue-400" />
              <SummaryCard label="AQI Trung bình" value={avgAQI} icon="💨" color="bg-yellow-500/10 text-yellow-400" subtitle={aqiLevel.label} />
              <SummaryCard label="Động đất" value={earthquakes.length} icon="🌍" color="bg-red-500/10 text-red-400" subtitle={`Max ${formatMagnitude(maxMag)}`} />
              <SummaryCard label="Thiên tai" value={disasters.length} icon="🌀" color="bg-orange-500/10 text-orange-400" />
              <SummaryCard label="Cháy rừng" value={fires.length} icon="🔥" color="bg-amber-500/10 text-amber-400" />
              <SummaryCard label="Xung đột" value={conflicts.length} icon="⚔️" color="bg-red-600/10 text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Polluted Cities */}
              <DashboardPanel title="🏭 Top 10 Thành Phố Ô Nhiễm Nhất">
                <div className="space-y-2">
                  {topPolluted.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-esg-card/50">
                      <span className="text-xs text-slate-500 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{s.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.pm25 && <span className="text-xs text-slate-400">PM2.5: {s.pm25}</span>}
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: getAQIColor(s.aqi) + '20', color: getAQIColor(s.aqi) }}
                        >
                          AQI {s.aqi}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardPanel>

              {/* Top Clean Cities */}
              <DashboardPanel title="🌿 Top 10 Thành Phố Sạch Nhất">
                <div className="space-y-2">
                  {topClean.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-esg-card/50">
                      <span className="text-xs text-slate-500 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{s.name}</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: getAQIColor(s.aqi) + '20', color: getAQIColor(s.aqi) }}
                      >
                        AQI {s.aqi}
                      </span>
                    </div>
                  ))}
                </div>
              </DashboardPanel>

              {/* Recent Earthquakes */}
              <DashboardPanel title="🌍 Động Đất Gần Đây">
                <div className="space-y-2">
                  {recentEQ.map((eq) => (
                    <a key={eq.id} href={eq.url} target="_blank" rel="noopener"
                       className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-esg-card/50 group">
                      <span className="text-sm font-bold text-red-400 w-12 text-center">
                        {formatMagnitude(eq.magnitude)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate group-hover:text-white">{eq.place}</p>
                        <p className="text-xs text-slate-500">{formatTimeAgo(eq.time)}</p>
                      </div>
                      {eq.tsunami && (
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">TSUNAMI</span>
                      )}
                    </a>
                  ))}
                </div>
              </DashboardPanel>

              {/* Critical Disasters */}
              <DashboardPanel title="🚨 Thiên Tai Nghiêm Trọng">
                <div className="space-y-2">
                  {criticalDisasters.map((d) => (
                    <a key={d.id} href={d.link} target="_blank" rel="noopener"
                       className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-esg-card/50 group">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: ALERT_COLORS[d.alertLevel] + '20', color: ALERT_COLORS[d.alertLevel] }}
                      >
                        {d.alertLevel}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate group-hover:text-white">
                          {d.title.substring(0, 60)}{d.title.length > 60 ? '...' : ''}
                        </p>
                        <p className="text-xs text-slate-500">{d.country} &bull; {DISASTER_TYPE_LABELS[d.type]}</p>
                      </div>
                    </a>
                  ))}
                  {criticalDisasters.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Không có thiên tai nghiêm trọng</p>
                  )}
                </div>
              </DashboardPanel>

              {/* Disaster Type Breakdown */}
              <DashboardPanel title="📊 Thiên Tai Theo Loại">
                <div className="space-y-3">
                  {Object.entries(disasterByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{type}</span>
                        <span className="text-slate-400 font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-esg-darker rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (count / Math.max(...Object.values(disasterByType))) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardPanel>

              {/* Conflict Zones */}
              <DashboardPanel title="⚔️ Vùng Xung Đột">
                <div className="space-y-2">
                  {Object.entries(conflictByCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                    <div key={country} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-esg-card/50">
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{country}</p>
                      </div>
                      <span className="text-xs font-medium text-red-400">{count} sự kiện</span>
                    </div>
                  ))}
                </div>
              </DashboardPanel>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-500">
              Dữ liệu từ: WAQI/AQICN &bull; USGS &bull; GDACS &bull; NASA EONET/FIRMS &bull; ACLED
              <br />
              ESG Map v1.0 &bull; Cập nhật tự động mỗi 5-15 phút
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ label, value, icon, color, subtitle }: {
  label: string; value: number; icon: string; color: string; subtitle?: string
}) {
  return (
    <div className={`rounded-xl p-4 border border-esg-border ${color} bg-esg-card`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function DashboardPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-esg-card rounded-xl border border-esg-border p-4">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}
