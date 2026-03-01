import { NewsArticle, ESGCategory } from '@/types/news'

// RSS feeds for ESG news (grouped by category)
const RSS_FEEDS: { url: string; source: string; category: ESGCategory }[] = [
  // Environment
  { url: 'https://www.theguardian.com/environment/rss', source: 'The Guardian', category: 'environment' },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC', category: 'environment' },
  { url: 'https://www.climatechangenews.com/feed/', source: 'Climate Change News', category: 'environment' },
  { url: 'https://phys.org/rss-feed/earth-news/environment/', source: 'Phys.org', category: 'environment' },
  // Social
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'social' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'social' },
  { url: 'https://reliefweb.int/updates/rss.xml', source: 'ReliefWeb', category: 'social' },
  // Governance
  { url: 'https://www.esgtoday.com/feed/', source: 'ESG Today', category: 'governance' },
  { url: 'https://www.greenbiz.com/rss', source: 'GreenBiz', category: 'governance' },
]

interface RSSItem {
  title?: string
  description?: string
  link?: string
  pubDate?: string
  enclosure?: { url?: string }
}

async function parseRSSFeed(feedUrl: string, source: string, category: ESGCategory): Promise<NewsArticle[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: NewsArticle[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    let count = 0

    while ((match = itemRegex.exec(xml)) !== null && count < 5) {
      const itemXml = match[1]
      const title = extractCDATA(itemXml, 'title')
      const description = extractCDATA(itemXml, 'description')
      const link = extractTag(itemXml, 'link')
      const pubDate = extractTag(itemXml, 'pubDate')
      const imageMatch = /url="([^"]*\.(jpg|jpeg|png|webp)[^"]*)"/.exec(itemXml)

      if (title && link) {
        items.push({
          id: `${source.toLowerCase().replace(/\s/g, '-')}-${count}`,
          title: cleanText(title),
          description: cleanText(description).substring(0, 200),
          link,
          pubDate: pubDate || new Date().toISOString(),
          source,
          category,
          imageUrl: imageMatch?.[1],
        })
        count++
      }
    }

    return items
  } catch {
    return []
  }
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = regex.exec(xml)
  return match ? match[1].trim() : ''
}

function extractCDATA(xml: string, tag: string): string {
  const raw = extractTag(xml, tag)
  return raw.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// In-memory cache
let cachedNews: NewsArticle[] | null = null
let cacheTime = 0
const CACHE_TTL = 8 * 60 * 60 * 1000 // 8 hours (aligned with cron 3x/day)

// Reset cache (used by cron)
export function resetNewsCache() {
  cachedNews = null
  cacheTime = 0
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  if (cachedNews && Date.now() - cacheTime < CACHE_TTL) {
    return cachedNews
  }

  const allArticles: NewsArticle[] = []
  const batchSize = 3

  for (let i = 0; i < RSS_FEEDS.length; i += batchSize) {
    const batch = RSS_FEEDS.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(f => parseRSSFeed(f.url, f.source, f.category))
    )
    results.forEach(articles => allArticles.push(...articles))
  }

  // Sort by date (newest first)
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  cachedNews = allArticles
  cacheTime = Date.now()
  return allArticles
}
