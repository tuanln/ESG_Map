'use client'

import { useState, useEffect, useCallback } from 'react'
import { AirQualityStation } from '@/types/esg'
import { REFRESH_INTERVALS } from '@/utils/constants'

export function useAirQuality() {
  const [stations, setStations] = useState<AirQualityStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/air-quality')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json = await res.json()
      setStations(json.data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.AIR_QUALITY)
    return () => clearInterval(interval)
  }, [fetchData])

  const avgAQI = stations.length > 0
    ? Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length)
    : 0

  return { stations, loading, error, lastUpdate, avgAQI, refetch: fetchData }
}
