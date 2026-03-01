import { NextResponse } from 'next/server'
import { fetchConflicts } from '@/services/conflicts'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const conflicts = await fetchConflicts()
    return NextResponse.json({
      data: conflicts,
      timestamp: new Date().toISOString(),
      source: 'ACLED',
      count: conflicts.length,
    })
  } catch (error) {
    console.error('Conflicts API error:', error)
    return NextResponse.json(
      { error: 'Không thể tải dữ liệu xung đột' },
      { status: 500 }
    )
  }
}
