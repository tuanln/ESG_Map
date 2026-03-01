'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AirQualityStation, Earthquake } from '@/types/esg'
import { DEFAULT_VIEW_STATE, MAP_STYLE, getAQIColor, getMagnitudeColor, getMagnitudeRadius } from '@/utils/constants'
import { formatMagnitude, formatTimeAgo, formatDepth, formatAQI } from '@/utils/formatters'

interface Globe3DProps {
  airQualityStations: AirQualityStation[]
  earthquakes: Earthquake[]
  showAirQuality: boolean
  showEarthquakes: boolean
}

export default function Globe3D({
  airQualityStations,
  earthquakes,
  showAirQuality,
  showEarthquakes,
}: Globe3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
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
      setMapLoaded(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
    }
  }, [])

  // Render Air Quality markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    // Remove existing AQ source/layer
    const map = mapRef.current
    if (map.getLayer('air-quality-circles')) map.removeLayer('air-quality-circles')
    if (map.getSource('air-quality')) map.removeSource('air-quality')

    if (!showAirQuality || airQualityStations.length === 0) return

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: airQualityStations.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: {
          id: s.id,
          name: s.name,
          aqi: s.aqi,
          pm25: s.pm25 ?? null,
          pm10: s.pm10 ?? null,
          color: getAQIColor(s.aqi),
          timestamp: s.timestamp,
        },
      })),
    }

    map.addSource('air-quality', { type: 'geojson', data: geojson })

    map.addLayer({
      id: 'air-quality-circles',
      type: 'circle',
      source: 'air-quality',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          2, 3,
          5, 5,
          10, 8,
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.75,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(255,255,255,0.3)',
      },
    })

    // Popup on click
    map.on('click', 'air-quality-circles', (e) => {
      if (!e.features?.[0]) return
      const props = e.features[0].properties!
      const coords = (e.features[0].geometry as any).coordinates.slice()

      if (popupRef.current) popupRef.current.remove()

      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #f1f5f9;">
              ${props.name}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="background: ${props.color}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                AQI ${props.aqi}
              </span>
            </div>
            ${props.pm25 ? `<div style="color: #94a3b8;">PM2.5: <strong style="color: #e2e8f0;">${props.pm25} µg/m³</strong></div>` : ''}
            ${props.pm10 ? `<div style="color: #94a3b8;">PM10: <strong style="color: #e2e8f0;">${props.pm10} µg/m³</strong></div>` : ''}
            <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
              ${formatTimeAgo(props.timestamp)}
            </div>
          </div>
        `)
        .addTo(map)
    })

    map.on('mouseenter', 'air-quality-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'air-quality-circles', () => { map.getCanvas().style.cursor = '' })

  }, [airQualityStations, showAirQuality, mapLoaded])

  // Render Earthquake markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current
    if (map.getLayer('earthquake-circles')) map.removeLayer('earthquake-circles')
    if (map.getLayer('earthquake-labels')) map.removeLayer('earthquake-labels')
    if (map.getSource('earthquakes')) map.removeSource('earthquakes')

    if (!showEarthquakes || earthquakes.length === 0) return

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: earthquakes.map(eq => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [eq.lng, eq.lat] },
        properties: {
          id: eq.id,
          title: eq.title,
          magnitude: eq.magnitude,
          depth: eq.depth,
          place: eq.place,
          time: eq.time,
          url: eq.url,
          tsunami: eq.tsunami,
          color: getMagnitudeColor(eq.magnitude),
          radius: getMagnitudeRadius(eq.magnitude),
        },
      })),
    }

    map.addSource('earthquakes', { type: 'geojson', data: geojson })

    map.addLayer({
      id: 'earthquake-circles',
      type: 'circle',
      source: 'earthquakes',
      paint: {
        'circle-radius': ['get', 'radius'],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255,255,255,0.5)',
      },
    })

    map.addLayer({
      id: 'earthquake-labels',
      type: 'symbol',
      source: 'earthquakes',
      layout: {
        'text-field': ['concat', 'M', ['to-string', ['get', 'magnitude']]],
        'text-size': 10,
        'text-offset': [0, -1.5],
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1,
      },
      minzoom: 3,
    })

    // Popup on click
    map.on('click', 'earthquake-circles', (e) => {
      if (!e.features?.[0]) return
      const props = e.features[0].properties!
      const coords = (e.features[0].geometry as any).coordinates.slice()

      if (popupRef.current) popupRef.current.remove()

      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #f1f5f9;">
              ${props.place}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="background: ${props.color}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 15px;">
                ${formatMagnitude(props.magnitude)}
              </span>
              ${props.tsunami ? '<span style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">TSUNAMI</span>' : ''}
            </div>
            <div style="color: #94a3b8;">Độ sâu: <strong style="color: #e2e8f0;">${formatDepth(props.depth)}</strong></div>
            <div style="color: #94a3b8;">Thời gian: <strong style="color: #e2e8f0;">${formatTimeAgo(props.time)}</strong></div>
            <a href="${props.url}" target="_blank" rel="noopener" style="color: #3b82f6; font-size: 12px; margin-top: 4px; display: inline-block;">
              Xem chi tiết USGS &rarr;
            </a>
          </div>
        `)
        .addTo(map)
    })

    map.on('mouseenter', 'earthquake-circles', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'earthquake-circles', () => { map.getCanvas().style.cursor = '' })

  }, [earthquakes, showEarthquakes, mapLoaded])

  return (
    <div ref={mapContainer} className="w-full h-full" />
  )
}
