'use client'

import { useState, useEffect, useCallback } from 'react'
import { Earthquake } from '@/types/esg'
import { REFRESH_INTERVALS } from '@/utils/constants'

export function useEarthquakes() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/earthquakes')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json = await res.json()
      setEarthquakes(json.data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.EARTHQUAKES)
    return () => clearInterval(interval)
  }, [fetchData])

  return { earthquakes, loading, error, lastUpdate, refetch: fetchData }
}
