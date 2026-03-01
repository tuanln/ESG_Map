import { NextResponse } from 'next/server'
import { fetchAllNews } from '@/services/news'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const articles = await fetchAllNews()
    return NextResponse.json({
      data: articles,
      timestamp: new Date().toISOString(),
      source: 'RSS Aggregation',
      count: articles.length,
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ error: 'Không thể tải tin tức' }, { status: 500 })
  }
}
