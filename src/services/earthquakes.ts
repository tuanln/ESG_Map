import { Earthquake } from '@/types/esg'
import { API_URLS } from '@/utils/constants'

export async function fetchEarthquakes(): Promise<Earthquake[]> {
  const res = await fetch(API_URLS.USGS_EARTHQUAKES, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Lỗi tải dữ liệu động đất từ USGS')

  const data = await res.json()

  return data.features.map((f: any) => ({
    id: f.id,
    title: f.properties.title,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    depth: f.geometry.coordinates[2],
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    url: f.properties.url,
    tsunami: f.properties.tsunami === 1,
    type: f.properties.type,
  }))
}

export async function fetchEarthquakesClient(): Promise<Earthquake[]> {
  const res = await fetch('/api/earthquakes')
  if (!res.ok) throw new Error('Lỗi tải dữ liệu động đất')
  const json = await res.json()
  return json.data
}
