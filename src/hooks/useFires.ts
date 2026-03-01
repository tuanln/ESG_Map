'use client'

import { useState, useEffect, useCallback } from 'react'
import { NasaFireEvent } from '@/types/disasters'
import { REFRESH_INTERVALS } from '@/utils/constants'

export function useFires() {
  const [fires, setFires] = useState<NasaFireEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/fires')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json = await res.json()
      setFires(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.FIRES)
    return () => clearInterval(interval)
  }, [fetchData])

  return { fires, loading, error, refetch: fetchData }
}
