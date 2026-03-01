'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/common/Header'
import Sidebar from '@/components/common/Sidebar'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useAirQuality } from '@/hooks/useAirQuality'
import { LAYER_CONFIGS } from '@/utils/constants'
import { LayerConfig } from '@/types/esg'

// Dynamic import Globe3D to avoid SSR issues with MapLibre
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
  const [layers, setLayers] = useState<LayerConfig[]>(LAYER_CONFIGS)

  const { earthquakes, loading: eqLoading } = useEarthquakes()
  const { stations, loading: aqLoading, avgAQI } = useAirQuality()

  const handleToggleLayer = (layerId: string) => {
    setLayers(prev =>
      prev.map(l => l.id === layerId ? { ...l, enabled: !l.enabled } : l)
    )
  }

  const showAirQuality = useMemo(() => layers.find(l => l.id === 'air-quality')?.enabled ?? false, [layers])
  const showEarthquakes = useMemo(() => layers.find(l => l.id === 'earthquakes')?.enabled ?? false, [layers])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        layers={layers}
        onToggleLayer={handleToggleLayer}
        stats={{
          stationsCount: stations.length,
          earthquakesCount: earthquakes.length,
          avgAQI,
        }}
        isOpen={sidebarOpen}
      />

      {/* Map container */}
      <main
        className={`fixed top-12 bottom-0 right-0 transition-all duration-300 ${
          sidebarOpen ? 'left-72' : 'left-0'
        }`}
      >
        <Globe3D
          airQualityStations={stations}
          earthquakes={earthquakes}
          showAirQuality={showAirQuality}
          showEarthquakes={showEarthquakes}
        />

        {/* Loading overlay */}
        {(eqLoading || aqLoading) && (
          <div className="absolute top-4 right-4 bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-esg-border flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-esg-green border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-300">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Bottom stats bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {showAirQuality && stations.length > 0 && (
              <div className="bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-esg-border text-xs text-slate-300">
                <span className="text-esg-blue font-medium">{stations.length}</span> trạm AQI
              </div>
            )}
            {showEarthquakes && earthquakes.length > 0 && (
              <div className="bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-esg-border text-xs text-slate-300">
                <span className="text-esg-red font-medium">{earthquakes.length}</span> động đất (7 ngày)
              </div>
            )}
          </div>

          <div className="bg-esg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-esg-border text-[10px] text-slate-500 pointer-events-auto">
            Nguồn: OpenAQ &bull; USGS &bull; v1.0
          </div>
        </div>
      </main>
    </div>
  )
}
