import { Disaster, DisasterType } from '@/types/disasters'

const GDACS_RSS_URL = 'https://www.gdacs.org/xml/rss.xml'

export async function fetchDisastersGDACS(): Promise<Disaster[]> {
  const res = await fetch(GDACS_RSS_URL, {
    next: { revalidate: 900 }, // 15 min cache
  })

  if (!res.ok) throw new Error('Lỗi tải dữ liệu thiên tai từ GDACS')

  const xml = await res.text()
  return parseGDACSXML(xml)
}

function parseGDACSXML(xml: string): Disaster[] {
  const disasters: Disaster[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]

    const title = extractTag(item, 'title')
    const description = extractTag(item, 'description')
    const link = extractTag(item, 'link')
    const pubDate = extractTag(item, 'pubDate')
    const lat = parseFloat(extractTag(item, 'geo:lat') || '0')
    const lng = parseFloat(extractTag(item, 'geo:long') || '0')
    const alertLevel = extractTag(item, 'gdacs:alertlevel') as Disaster['alertLevel'] || 'Green'
    const eventType = extractTag(item, 'gdacs:eventtype') as DisasterType || 'EQ'
    const eventId = extractTag(item, 'gdacs:eventid') || ''
    const severity = extractTag(item, 'gdacs:severity') || ''
    const population = extractTag(item, 'gdacs:population') || ''
    const country = extractTag(item, 'gdacs:country') || ''
    const dateModified = extractTag(item, 'gdacs:datemodified') || pubDate
    const icon = extractTag(item, 'gdacs:icon') || ''

    if (lat === 0 && lng === 0) continue

    disasters.push({
      id: `gdacs-${eventType}-${eventId}`,
      title: cleanHTML(title),
      description: cleanHTML(description),
      type: eventType,
      alertLevel,
      lat,
      lng,
      date: pubDate,
      dateModified,
      country,
      severity: cleanHTML(severity),
      population: cleanHTML(population),
      link,
      icon,
    })
  }

  return disasters
}

function extractTag(xml: string, tag: string): string {
  // Handle both self-closing and normal tags, and tags with attributes
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = regex.exec(xml)
  return match ? match[1].trim() : ''
}

function cleanHTML(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export async function fetchDisastersClient(): Promise<Disaster[]> {
  const res = await fetch('/api/disasters')
  if (!res.ok) throw new Error('Lỗi tải dữ liệu thiên tai')
  const json = await res.json()
  return json.data
}
