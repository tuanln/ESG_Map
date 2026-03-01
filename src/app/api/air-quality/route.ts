import { NextResponse } from 'next/server'
import { fetchAirQualityStations } from '@/services/airQuality'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stations = await fetchAirQualityStations()
    return NextResponse.json({
      data: stations,
      timestamp: new Date().toISOString(),
      source: 'WAQI/AQICN',
      count: stations.length,
    })
  } catch (error) {
    console.error('Air Quality API error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu chất lượng không khí' },
      { status: 500 }
    )
  }
}
