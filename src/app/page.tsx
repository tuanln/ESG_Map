'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/common/Header'
import Sidebar from '@/components/common/Sidebar'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useAirQuality } from '@/hooks/useAirQuality'
import { useDisasters } from '@/hooks/useDisasters'
import { useFires } from '@/hooks/useFires'
import { useConflicts } from '@/hooks/useConflicts'
import { LAYER_CONFIGS } from '@/utils/constants'
import { LayerConfig } from '@/types/esg'

const Globe3D = dynamic(() => import('@/components/map/Globe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-esg-darker">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-esg-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [layers, setLayers] = useState<LayerConfig[]>(
    LAYER_CONFIGS.map(l => ({ ...l, enabled: true })) // Enable all layers by default
  )

  const { earthquakes, loading: eqLoading } = useEarthquakes()
  const { stations, loading: aqLoading, avgAQI } = useAirQuality()
  const { disasters, loading: disLoading } = useDisasters()
  const { fires, loading: fireLoading } = useFires()
  const { conflicts, loading: confLoading } = useConflicts()

  const handleToggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, enabled: !l.enabled } : l))
  }

  const isLayerOn = (id: string) => layers.find(l => l.id === id)?.enabled ?? false

  const anyLoading = eqLoading || aqLoading || disLoading || fireLoading || confLoading

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      <Sidebar
        layers={layers}
        onToggleLayer={handleToggleLayer}
        stats={{
          stationsCount: stations.length,
          earthquakesCount: earthquakes.length,
          avgAQI,
          disastersCount: disasters.length,
          firesCount: fires.length,
          conflictsCount: conflicts.length,
        }}
        isOpen={sidebarOpen}
      />

      <main className={`fixed top-12 bottom-0 right-0 transition-all duration-300 ${sidebarOpen ? 'left-72' : 'left-0'}`}>
        <Globe3D
          airQualityStations={stations}
          earthquakes={earthquakes}
          disasters={disasters}
          fires={fires}
          conflicts={conflicts}
          showAirQuality={isLayerOn('air-quality')}
          showEarthquakes={isLayerOn('earthquakes')}
          showDisasters={isLayerOn('disasters')}
          showFires={isLayerOn('fires')}
          showConflicts={isLayerOn('conflicts')}
        />

        {/* Loading overlay */}
        {anyLoading && (
          <div className="absolute top-4 right-4 bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-esg-border flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-300">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Bottom stats bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
            {isLayerOn('air-quality') && stations.length > 0 && (
              <StatBadge color="text-esg-blue" count={stations.length} label="trạm AQI" />
            )}
            {isLayerOn('earthquakes') && earthquakes.length > 0 && (
              <StatBadge color="text-esg-red" count={earthquakes.length} label="động đất" />
            )}
            {isLayerOn('disasters') && disasters.length > 0 && (
              <StatBadge color="text-orange-400" count={disasters.length} label="thiên tai" />
            )}
            {isLayerOn('fires') && fires.length > 0 && (
              <StatBadge color="text-yellow-400" count={fires.length} label="cháy rừng" />
            )}
            {isLayerOn('conflicts') && conflicts.length > 0 && (
              <StatBadge color="text-red-400" count={conflicts.length} label="xung đột" />
            )}
          </div>

          <div className="bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-esg-border text-[10px] text-slate-500 pointer-events-auto">
            OpenAQ &bull; USGS &bull; GDACS &bull; NASA &bull; ACLED
          </div>
        </div>
      </main>
    </div>
  )
}

function StatBadge({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div className="bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-esg-border text-xs text-slate-300">
      <span className={`${color} font-medium`}>{count}</span> {label}
    </div>
  )
}
