import { NextResponse } from 'next/server'
import { fetchDisastersGDACS } from '@/services/disasters'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const disasters = await fetchDisastersGDACS()
    return NextResponse.json({
      data: disasters,
      timestamp: new Date().toISOString(),
      source: 'GDACS',
      count: disasters.length,
    })
  } catch (error) {
    console.error('Disasters API error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu thiên tai' },
      { status: 500 }
    )
  }
}
