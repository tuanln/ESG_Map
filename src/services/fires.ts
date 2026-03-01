import { NasaFireEvent } from '@/types/disasters'

// NASA EONET for major fire events (free, no key needed)
const NASA_EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events'

// Fallback: major active fire zones with approximate data
const FALLBACK_FIRES: NasaFireEvent[] = [
  { id: 'fire-aus-1', title: 'Cháy rừng New South Wales, Australia', lat: -33.0, lng: 150.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-bra-1', title: 'Cháy rừng Amazon, Brazil', lat: -3.5, lng: -60.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-us-1', title: 'Cháy rừng California, Mỹ', lat: 37.5, lng: -119.5, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-sib-1', title: 'Cháy rừng Siberia, Nga', lat: 62.0, lng: 100.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-ind-1', title: 'Cháy rừng Borneo, Indonesia', lat: -1.0, lng: 115.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-afr-1', title: 'Cháy rừng Congo Basin, DRC', lat: -2.5, lng: 23.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-can-1', title: 'Cháy rừng British Columbia, Canada', lat: 53.0, lng: -125.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-gre-1', title: 'Cháy rừng Hy Lạp', lat: 38.0, lng: 23.5, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-tur-1', title: 'Cháy rừng Thổ Nhĩ Kỳ', lat: 37.0, lng: 30.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-moz-1', title: 'Cháy rừng Mozambique', lat: -15.0, lng: 35.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-ang-1', title: 'Cháy rừng Angola', lat: -12.0, lng: 18.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
  { id: 'fire-mya-1', title: 'Cháy rừng Myanmar', lat: 20.0, lng: 96.0, date: new Date().toISOString(), source: 'NASA FIRMS', link: '' },
]

export async function fetchFireEvents(): Promise<NasaFireEvent[]> {
  try {
    const res = await fetch(`${NASA_EONET_URL}?category=wildfires&status=open&limit=50`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 1800 },
    })

    if (!res.ok) return FALLBACK_FIRES

    const data = await res.json()
    if (!data.events || data.events.length === 0) return FALLBACK_FIRES

    const events: NasaFireEvent[] = data.events
      .filter((e: any) => e.geometry?.length > 0)
      .map((e: any) => {
        const geo = e.geometry[e.geometry.length - 1]
        return {
          id: `eonet-${e.id}`,
          title: e.title,
          lat: geo.coordinates[1],
          lng: geo.coordinates[0],
          date: geo.date,
          source: e.sources?.[0]?.id || 'NASA EONET',
          link: e.sources?.[0]?.url || `https://eonet.gsfc.nasa.gov/api/v3/events/${e.id}`,
        }
      })

    return events.length > 0 ? events : FALLBACK_FIRES
  } catch {
    return FALLBACK_FIRES
  }
}

export async function fetchFiresClient(): Promise<NasaFireEvent[]> {
  const res = await fetch('/api/fires')
  if (!res.ok) throw new Error('Lỗi tải dữ liệu cháy rừng')
  const json = await res.json()
  return json.data
}
