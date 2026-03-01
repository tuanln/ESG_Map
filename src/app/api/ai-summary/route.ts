import { NextResponse } from 'next/server'
import { fetchAllNews } from '@/services/news'
import { generateAISummary } from '@/services/aiSummary'

export const dynamic = 'force-dynamic'

// Cache summary for 30 minutes
let cachedSummary: any = null
let cacheTime = 0
const CACHE_TTL = 30 * 60 * 1000

export async function GET() {
  try {
    if (cachedSummary && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedSummary)
    }

    const articles = await fetchAllNews()
    const summary = await generateAISummary(articles)

    cachedSummary = {
      data: summary,
      articlesCount: articles.length,
      timestamp: new Date().toISOString(),
    }
    cacheTime = Date.now()

    return NextResponse.json(cachedSummary)
  } catch (error) {
    console.error('AI Summary error:', error)
    return NextResponse.json({ error: 'Không thể tạo bản tóm tắt AI' }, { status: 500 })
  }
}
