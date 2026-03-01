'use client'

import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AirQualityStation, Earthquake } from '@/types/esg'
import { Disaster, NasaFireEvent, ConflictEvent, DISASTER_TYPE_LABELS, ALERT_COLORS, CONFLICT_TYPE_LABELS, CONFLICT_TYPE_COLORS } from '@/types/disasters'
import { DEFAULT_VIEW_STATE, MAP_STYLE, getAQIColor, getMagnitudeColor, getMagnitudeRadius } from '@/utils/constants'
import { formatMagnitude, formatTimeAgo, formatDepth } from '@/utils/formatters'

interface Globe3DProps {
  airQualityStations: AirQualityStation[]
  earthquakes: Earthquake[]
  disasters: Disaster[]
  fires: NasaFireEvent[]
  conflicts: ConflictEvent[]
  showAirQuality: boolean
  showEarthquakes: boolean
  showDisasters: boolean
  showFires: boolean
  showConflicts: boolean
}

// Helper to safely add a layer (removes existing first)
function safeRemoveLayer(map: maplibregl.Map, layerId: string) {
  if (map.getLayer(layerId)) map.removeLayer(layerId)
}
function safeRemoveSource(map: maplibregl.Map, sourceId: string) {
  if (map.getSource(sourceId)) map.removeSource(sourceId)
}

export default function Globe3D({
  airQualityStations, earthquakes, disasters, fires, conflicts,
  showAirQuality, showEarthquakes, showDisasters, showFires, showConflicts,
}: Globe3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [DEFAULT_VIEW_STATE.longitude, DEFAULT_VIEW_STATE.latitude],
      zoom: DEFAULT_VIEW_STATE.zoom,
      pitch: DEFAULT_VIEW_STATE.pitch,
      bearing: DEFAULT_VIEW_STATE.bearing,
      maxZoom: 18,
      minZoom: 1.5,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 200 }), 'bottom-left')

    map.on('load', () => setMapLoaded(true))

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Helper: close popup
  const closePopup = () => {
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
  }

  // Helper: show popup
  const showPopup = (map: maplibregl.Map, lngLat: [number, number], html: string) => {
    closePopup()
    popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
      .setLngLat(lngLat)
      .setHTML(`<div style="font-family:sans-serif;font-size:13px;">${html}</div>`)
      .addTo(map)
  }

  // === LAYER 1: Air Quality ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'aq-circles')
    safeRemoveSource(map, 'aq-src')
    if (!showAirQuality || !airQualityStations.length) return

    map.addSource('aq-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: airQualityStations.map(s => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
          properties: { name: s.name, aqi: s.aqi, pm25: s.pm25 ?? null, pm10: s.pm10 ?? null, color: getAQIColor(s.aqi), ts: s.timestamp },
        })),
      },
    })

    map.addLayer({
      id: 'aq-circles', type: 'circle', source: 'aq-src',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 5, 5, 10, 8],
        'circle-color': ['get', 'color'], 'circle-opacity': 0.75,
        'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,0.3)',
      },
    })

    map.on('click', 'aq-circles', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties!
      const c = (e.features[0].geometry as any).coordinates.slice()
      showPopup(map, c, `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f1f5f9">${p.name}</div>
        <span style="background:${p.color};color:white;padding:2px 8px;border-radius:4px;font-weight:600">AQI ${p.aqi}</span>
        ${p.pm25 ? `<div style="color:#94a3b8;margin-top:4px">PM2.5: <strong style="color:#e2e8f0">${p.pm25} µg/m³</strong></div>` : ''}
        ${p.pm10 ? `<div style="color:#94a3b8">PM10: <strong style="color:#e2e8f0">${p.pm10} µg/m³</strong></div>` : ''}
        <div style="color:#64748b;font-size:11px;margin-top:4px">${formatTimeAgo(p.ts)}</div>
      `)
    })
    map.on('mouseenter', 'aq-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'aq-circles', () => { map.getCanvas().style.cursor = '' })
  }, [airQualityStations, showAirQuality, mapLoaded])

  // === LAYER 2: Earthquakes ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'eq-labels')
    safeRemoveLayer(map, 'eq-circles')
    safeRemoveSource(map, 'eq-src')
    if (!showEarthquakes || !earthquakes.length) return

    map.addSource('eq-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: earthquakes.map(eq => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [eq.lng, eq.lat] },
          properties: { place: eq.place, mag: eq.magnitude, depth: eq.depth, time: eq.time, url: eq.url, tsunami: eq.tsunami, color: getMagnitudeColor(eq.magnitude), radius: getMagnitudeRadius(eq.magnitude) },
        })),
      },
    })

    map.addLayer({
      id: 'eq-circles', type: 'circle', source: 'eq-src',
      paint: { 'circle-radius': ['get', 'radius'], 'circle-color': ['get', 'color'], 'circle-opacity': 0.7, 'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(255,255,255,0.5)' },
    })
    map.addLayer({
      id: 'eq-labels', type: 'symbol', source: 'eq-src',
      layout: { 'text-field': ['concat', 'M', ['to-string', ['get', 'mag']]], 'text-size': 10, 'text-offset': [0, -1.5] },
      paint: { 'text-color': '#fff', 'text-halo-color': '#000', 'text-halo-width': 1 },
      minzoom: 3,
    })

    map.on('click', 'eq-circles', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties!
      const c = (e.features[0].geometry as any).coordinates.slice()
      showPopup(map, c, `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f1f5f9">${p.place}</div>
        <span style="background:${p.color};color:white;padding:2px 8px;border-radius:4px;font-weight:700;font-size:15px">${formatMagnitude(p.mag)}</span>
        ${p.tsunami ? ' <span style="background:#dc2626;color:white;padding:2px 6px;border-radius:4px;font-size:11px">TSUNAMI</span>' : ''}
        <div style="color:#94a3b8;margin-top:6px">Độ sâu: <strong style="color:#e2e8f0">${formatDepth(p.depth)}</strong></div>
        <div style="color:#94a3b8">Thời gian: <strong style="color:#e2e8f0">${formatTimeAgo(p.time)}</strong></div>
        <a href="${p.url}" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px;margin-top:4px;display:inline-block">Chi tiết USGS &rarr;</a>
      `)
    })
    map.on('mouseenter', 'eq-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'eq-circles', () => { map.getCanvas().style.cursor = '' })
  }, [earthquakes, showEarthquakes, mapLoaded])

  // === LAYER 3: Disasters (GDACS) ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'dis-circles')
    safeRemoveLayer(map, 'dis-labels')
    safeRemoveSource(map, 'dis-src')
    if (!showDisasters || !disasters.length) return

    map.addSource('dis-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: disasters.map(d => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
          properties: { title: d.title, type: d.type, typeLabel: DISASTER_TYPE_LABELS[d.type] || d.type, alert: d.alertLevel, color: ALERT_COLORS[d.alertLevel] || '#eab308', country: d.country, severity: d.severity, population: d.population, link: d.link, date: d.date },
        })),
      },
    })

    map.addLayer({
      id: 'dis-circles', type: 'circle', source: 'dis-src',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 5, 5, 8, 10, 12],
        'circle-color': ['get', 'color'], 'circle-opacity': 0.6,
        'circle-stroke-width': 2, 'circle-stroke-color': ['get', 'color'],
      },
    })

    map.addLayer({
      id: 'dis-labels', type: 'symbol', source: 'dis-src',
      layout: { 'text-field': ['get', 'typeLabel'], 'text-size': 9, 'text-offset': [0, -1.8] },
      paint: { 'text-color': '#fff', 'text-halo-color': '#000', 'text-halo-width': 1 },
      minzoom: 3,
    })

    map.on('click', 'dis-circles', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties!
      const c = (e.features[0].geometry as any).coordinates.slice()
      showPopup(map, c, `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f1f5f9">${p.title.substring(0, 80)}${p.title.length > 80 ? '...' : ''}</div>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <span style="background:${p.color};color:white;padding:2px 8px;border-radius:4px;font-weight:600;font-size:12px">${p.alert}</span>
          <span style="background:#334155;color:#e2e8f0;padding:2px 8px;border-radius:4px;font-size:12px">${p.typeLabel}</span>
        </div>
        ${p.country ? `<div style="color:#94a3b8">Quốc gia: <strong style="color:#e2e8f0">${p.country}</strong></div>` : ''}
        ${p.severity ? `<div style="color:#94a3b8">Mức độ: <strong style="color:#e2e8f0">${p.severity}</strong></div>` : ''}
        ${p.population ? `<div style="color:#94a3b8">Dân số ảnh hưởng: <strong style="color:#e2e8f0">${p.population}</strong></div>` : ''}
        <a href="${p.link}" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px;margin-top:4px;display:inline-block">Chi tiết GDACS &rarr;</a>
      `)
    })
    map.on('mouseenter', 'dis-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'dis-circles', () => { map.getCanvas().style.cursor = '' })
  }, [disasters, showDisasters, mapLoaded])

  // === LAYER 4: Fires ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'fire-circles')
    safeRemoveSource(map, 'fire-src')
    if (!showFires || !fires.length) return

    map.addSource('fire-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: fires.map(f => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
          properties: { title: f.title, date: f.date, source: f.source, link: f.link },
        })),
      },
    })

    map.addLayer({
      id: 'fire-circles', type: 'circle', source: 'fire-src',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 5, 7, 10, 10],
        'circle-color': '#f97316', 'circle-opacity': 0.7,
        'circle-stroke-width': 2, 'circle-stroke-color': '#ef4444',
      },
    })

    map.on('click', 'fire-circles', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties!
      const c = (e.features[0].geometry as any).coordinates.slice()
      showPopup(map, c, `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f1f5f9">${p.title}</div>
        <span style="background:#f97316;color:white;padding:2px 8px;border-radius:4px;font-size:12px">🔥 Cháy rừng</span>
        <div style="color:#94a3b8;margin-top:6px">Nguồn: <strong style="color:#e2e8f0">${p.source}</strong></div>
        <div style="color:#64748b;font-size:11px;margin-top:4px">${formatTimeAgo(p.date)}</div>
        ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" style="color:#3b82f6;font-size:12px;margin-top:4px;display:inline-block">Chi tiết &rarr;</a>` : ''}
      `)
    })
    map.on('mouseenter', 'fire-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'fire-circles', () => { map.getCanvas().style.cursor = '' })
  }, [fires, showFires, mapLoaded])

  // === LAYER 5: Conflicts ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'conf-labels')
    safeRemoveLayer(map, 'conf-circles')
    safeRemoveSource(map, 'conf-src')
    if (!showConflicts || !conflicts.length) return

    map.addSource('conf-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: conflicts.map(c => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
          properties: { title: c.title, type: c.type, typeLabel: CONFLICT_TYPE_LABELS[c.type] || c.type, color: CONFLICT_TYPE_COLORS[c.type] || '#ef4444', country: c.country, fatalities: c.fatalities, date: c.date, source: c.source },
        })),
      },
    })

    map.addLayer({
      id: 'conf-circles', type: 'circle', source: 'conf-src',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 5, 5, 8, 10, 12],
        'circle-color': ['get', 'color'], 'circle-opacity': 0.65,
        'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(255,255,255,0.4)',
      },
    })

    map.addLayer({
      id: 'conf-labels', type: 'symbol', source: 'conf-src',
      layout: { 'text-field': '⚔', 'text-size': 14, 'text-offset': [0, 0] },
      paint: {},
      minzoom: 3,
    })

    map.on('click', 'conf-circles', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties!
      const c = (e.features[0].geometry as any).coordinates.slice()
      showPopup(map, c, `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f1f5f9">${p.title}</div>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <span style="background:${p.color};color:white;padding:2px 8px;border-radius:4px;font-size:12px">${p.typeLabel}</span>
        </div>
        <div style="color:#94a3b8">Quốc gia: <strong style="color:#e2e8f0">${p.country}</strong></div>
        <div style="color:#94a3b8">Nguồn: <strong style="color:#e2e8f0">${p.source}</strong></div>
        <div style="color:#64748b;font-size:11px;margin-top:4px">${p.date}</div>
      `)
    })
    map.on('mouseenter', 'conf-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'conf-circles', () => { map.getCanvas().style.cursor = '' })
  }, [conflicts, showConflicts, mapLoaded])

  return <div ref={mapContainer} className="w-full h-full" />
}
