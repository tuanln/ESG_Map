'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConflictEvent } from '@/types/disasters'
import { REFRESH_INTERVALS } from '@/utils/constants'

export function useConflicts() {
  const [conflicts, setConflicts] = useState<ConflictEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/conflicts')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json = await res.json()
      setConflicts(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVALS.CONFLICTS)
    return () => clearInterval(interval)
  }, [fetchData])

  return { conflicts, loading, error, refetch: fetchData }
}
