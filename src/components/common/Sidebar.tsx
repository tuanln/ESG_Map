'use client'

import { LayerConfig } from '@/types/esg'
import { getAQILevel } from '@/utils/constants'

interface SidebarProps {
  layers: LayerConfig[]
  onToggleLayer: (layerId: string) => void
  stats: {
    stationsCount: number
    earthquakesCount: number
    avgAQI: number
    disastersCount: number
    firesCount: number
    conflictsCount: number
  }
  isOpen: boolean
}

export default function Sidebar({ layers, onToggleLayer, stats, isOpen }: SidebarProps) {
  if (!isOpen) return null

  const aqiLevel = getAQILevel(stats.avgAQI)

  return (
    <aside className="fixed top-12 left-0 z-40 w-72 h-[calc(100vh-48px)] bg-esg-darker/95 backdrop-blur-md border-r border-esg-border overflow-y-auto">
      {/* Stats */}
      <div className="p-4 border-b border-esg-border">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Tổng quan
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Trạm quan trắc"
            value={stats.stationsCount.toString()}
            color="text-esg-blue"
          />
          <StatCard
            label="Động đất (7 ngày)"
            value={stats.earthquakesCount.toString()}
            color="text-esg-red"
          />
          <StatCard
            label="AQI trung bình"
            value={stats.avgAQI > 0 ? stats.avgAQI.toString() : '—'}
            color={`text-[${aqiLevel.color}]`}
            subtitle={stats.avgAQI > 0 ? aqiLevel.label : undefined}
          />
          <StatCard
            label="Thiên tai"
            value={stats.disastersCount.toString()}
            color="text-orange-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <StatCard
            label="Cháy rừng"
            value={stats.firesCount.toString()}
            color="text-esg-yellow"
          />
          <StatCard
            label="Xung đột"
            value={stats.conflictsCount.toString()}
            color="text-red-400"
          />
        </div>
      </div>

      {/* Layers */}
      <div className="p-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Lớp dữ liệu
        </h2>
        <div className="space-y-1">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onToggleLayer(layer.id)}
              className={`layer-toggle w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                layer.enabled
                  ? 'bg-esg-card border border-esg-border'
                  : 'hover:bg-esg-card/50 border border-transparent'
              }`}
            >
              {/* Toggle indicator */}
              <div
                className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  layer.enabled
                    ? `border-[${layer.color}] bg-[${layer.color}]`
                    : 'border-slate-500 bg-transparent'
                }`}
                style={{
                  borderColor: layer.enabled ? layer.color : undefined,
                  backgroundColor: layer.enabled ? layer.color : undefined,
                }}
              />

              {/* Icon + text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{layer.icon}</span>
                  <span className={`text-sm font-medium ${layer.enabled ? 'text-white' : 'text-slate-400'}`}>
                    {layer.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {layer.description}
                </p>
              </div>

              {/* Status badge */}
              {layer.enabled && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-esg-green/10 text-esg-green font-medium">
                  BẬT
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AQI Legend */}
      <div className="p-4 border-t border-esg-border">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Thang AQI
        </h2>
        <div className="space-y-1.5">
          {[
            { range: '0-50', label: 'Tốt', color: '#22c55e' },
            { range: '51-100', label: 'Trung bình', color: '#eab308' },
            { range: '101-150', label: 'Nhóm nhạy cảm', color: '#f97316' },
            { range: '151-200', label: 'Không lành mạnh', color: '#ef4444' },
            { range: '201-300', label: 'Rất xấu', color: '#a855f7' },
            { range: '301+', label: 'Nguy hại', color: '#7f1d1d' },
          ].map((item) => (
            <div key={item.range} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-400">{item.range}</span>
              <span className="text-[11px] text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earthquake Legend */}
      <div className="p-4 border-t border-esg-border">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Cường độ động đất
        </h2>
        <div className="space-y-1.5">
          {[
            { range: '< 4.0', label: 'Nhỏ', color: '#22c55e' },
            { range: '4.0-4.9', label: 'Nhẹ', color: '#eab308' },
            { range: '5.0-5.9', label: 'Trung bình', color: '#f97316' },
            { range: '6.0-6.9', label: 'Mạnh', color: '#ef4444' },
            { range: '7.0-7.9', label: 'Rất mạnh', color: '#dc2626' },
            { range: '8.0+', label: 'Cực mạnh', color: '#7f1d1d' },
          ].map((item) => (
            <div key={item.range} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-400">{item.range}</span>
              <span className="text-[11px] text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-esg-border">
        <p className="text-[10px] text-slate-500 text-center">
          Nguồn: OpenAQ, USGS, NASA, GDACS
          <br />
          ESG Map v1.0 - 2026
        </p>
      </div>
    </aside>
  )
}

function StatCard({
  label,
  value,
  color,
  subtitle,
}: {
  label: string
  value: string
  color: string
  subtitle?: string
}) {
  return (
    <div className="bg-esg-card rounded-lg p-2.5 border border-esg-border">
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-[9px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
