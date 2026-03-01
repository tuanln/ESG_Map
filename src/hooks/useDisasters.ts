'use client'

import { useState, useEffect, useCallback } from 'react'
import { Disaster } from '@/types/disasters'
import { REFRESH_INTERVALS } from '@/utils/constants'

export function useDisasters() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/disasters')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json = await res.json()
      setDisasters(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.DISASTERS)
    return () => clearInterval(interval)
  }, [fetchData])

  return { disasters, loading, error, refetch: fetchData }
}
