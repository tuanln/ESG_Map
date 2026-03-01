import { NextResponse } from 'next/server'
import { fetchFireEvents } from '@/services/fires'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const fires = await fetchFireEvents()
    return NextResponse.json({
      data: fires,
      timestamp: new Date().toISOString(),
      source: 'NASA EONET/FIRMS',
      count: fires.length,
    })
  } catch (error) {
    console.error('Fires API error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu cháy rừng' },
      { status: 500 }
    )
  }
}
