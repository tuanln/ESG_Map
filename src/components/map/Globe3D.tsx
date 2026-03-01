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

// Create SDF shape icon for map markers via canvas
function createShapeIcon(
  shape: 'square' | 'triangle' | 'star' | 'diamond',
  size: number = 64
): { width: number; height: number; data: Uint8Array } {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'

  const cx = size / 2
  const cy = size / 2
  const m = 6

  switch (shape) {
    case 'square': {
      const s = size - m * 2
      const r = 5
      ctx.beginPath()
      ctx.moveTo(m + r, m)
      ctx.lineTo(m + s - r, m)
      ctx.quadraticCurveTo(m + s, m, m + s, m + r)
      ctx.lineTo(m + s, m + s - r)
      ctx.quadraticCurveTo(m + s, m + s, m + s - r, m + s)
      ctx.lineTo(m + r, m + s)
      ctx.quadraticCurveTo(m, m + s, m, m + s - r)
      ctx.lineTo(m, m + r)
      ctx.quadraticCurveTo(m, m, m + r, m)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'triangle': {
      ctx.beginPath()
      ctx.moveTo(cx, m)
      ctx.lineTo(size - m, size - m)
      ctx.lineTo(m, size - m)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'star': {
      const outerR = cx - m
      const innerR = outerR * 0.45
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? outerR : innerR
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'diamond': {
      const r = cx - m
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.7, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r * 0.7, cy)
      ctx.closePath()
      ctx.fill()
      break
    }
  }

  const imgData = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: new Uint8Array(imgData.data.buffer) }
}

// Helper to safely remove layers and sources
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

    map.on('load', () => {
      // Register custom SDF shape icons for color tinting
      const shapes = ['square', 'triangle', 'star', 'diamond'] as const
      shapes.forEach(shape => {
        const icon = createShapeIcon(shape, 64)
        map.addImage(`shape-${shape}`, icon, { sdf: true })
      })
      setMapLoaded(true)
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Close popup helper
  const closePopup = () => {
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
  }

  // Show popup helper
  const showPopup = (map: maplibregl.Map, lngLat: [number, number], html: string) => {
    closePopup()
    popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
      .setLngLat(lngLat)
      .setHTML(`<div style="font-family:sans-serif;font-size:13px;">${html}</div>`)
      .addTo(map)
  }

  // === LAYER 1: Air Quality (■ Square markers) ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'aq-symbols')
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
      id: 'aq-symbols',
      type: 'symbol',
      source: 'aq-src',
      layout: {
        'icon-image': 'shape-square',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.18, 5, 0.3, 10, 0.45],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': ['get', 'color'],
        'icon-opacity': 0.85,
        'icon-halo-color': 'rgba(255,255,255,0.3)',
        'icon-halo-width': 1,
      },
    })

    map.on('click', 'aq-symbols', (e) => {
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
    map.on('mouseenter', 'aq-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'aq-symbols', () => { map.getCanvas().style.cursor = '' })
  }, [airQualityStations, showAirQuality, mapLoaded])

  // === LAYER 2: Earthquakes (● Circle markers - seismic waves) ===
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
      layout: { 'text-field': ['concat', 'M', ['to-string', ['get', 'mag']]], 'text-size': 10, 'text-offset': [0, -1.5], 'text-allow-overlap': true },
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

  // === LAYER 3: Disasters (▲ Triangle markers - warning) ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'dis-labels')
    safeRemoveLayer(map, 'dis-symbols')
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
      id: 'dis-symbols',
      type: 'symbol',
      source: 'dis-src',
      layout: {
        'icon-image': 'shape-triangle',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.22, 5, 0.38, 10, 0.55],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': ['get', 'color'],
        'icon-opacity': 0.8,
        'icon-halo-color': ['get', 'color'],
        'icon-halo-width': 1.5,
      },
    })

    map.addLayer({
      id: 'dis-labels', type: 'symbol', source: 'dis-src',
      layout: { 'text-field': ['get', 'typeLabel'], 'text-size': 9, 'text-offset': [0, -1.8], 'text-allow-overlap': true },
      paint: { 'text-color': '#fff', 'text-halo-color': '#000', 'text-halo-width': 1 },
      minzoom: 3,
    })

    map.on('click', 'dis-symbols', (e) => {
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
    map.on('mouseenter', 'dis-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'dis-symbols', () => { map.getCanvas().style.cursor = '' })
  }, [disasters, showDisasters, mapLoaded])

  // === LAYER 4: Fires (★ Star markers) ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'fire-symbols')
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
      id: 'fire-symbols',
      type: 'symbol',
      source: 'fire-src',
      layout: {
        'icon-image': 'shape-star',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.2, 5, 0.35, 10, 0.5],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': '#f97316',
        'icon-opacity': 0.85,
        'icon-halo-color': '#ef4444',
        'icon-halo-width': 2,
      },
    })

    map.on('click', 'fire-symbols', (e) => {
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
    map.on('mouseenter', 'fire-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'fire-symbols', () => { map.getCanvas().style.cursor = '' })
  }, [fires, showFires, mapLoaded])

  // === LAYER 5: Conflicts (◆ Diamond markers) ===
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    safeRemoveLayer(map, 'conf-labels')
    safeRemoveLayer(map, 'conf-symbols')
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
      id: 'conf-symbols',
      type: 'symbol',
      source: 'conf-src',
      layout: {
        'icon-image': 'shape-diamond',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 2, 0.22, 5, 0.38, 10, 0.55],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': ['get', 'color'],
        'icon-opacity': 0.8,
        'icon-halo-color': 'rgba(255,255,255,0.4)',
        'icon-halo-width': 1,
      },
    })

    map.addLayer({
      id: 'conf-labels', type: 'symbol', source: 'conf-src',
      layout: { 'text-field': '⚔', 'text-size': 12, 'text-offset': [0, -1.5], 'text-allow-overlap': true },
      paint: {},
      minzoom: 3,
    })

    map.on('click', 'conf-symbols', (e) => {
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
    map.on('mouseenter', 'conf-symbols', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'conf-symbols', () => { map.getCanvas().style.cursor = '' })
  }, [conflicts, showConflicts, mapLoaded])

  return <div ref={mapContainer} className="w-full h-full" />
}
