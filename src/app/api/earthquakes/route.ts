import { NextResponse } from 'next/server'
import { fetchEarthquakes } from '@/services/earthquakes'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const earthquakes = await fetchEarthquakes()
    return NextResponse.json({
      data: earthquakes,
      timestamp: new Date().toISOString(),
      source: 'USGS',
      count: earthquakes.length,
    })
  } catch (error) {
    console.error('Earthquake API error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu động đất' },
      { status: 500 }
    )
  }
}
