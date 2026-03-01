import { NextResponse } from 'next/server'
import { getAllCountries, getCountryProfile } from '@/services/esgScore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const country = getCountryProfile(code)
    if (!country) {
      return NextResponse.json({ error: 'Không tìm thấy quốc gia' }, { status: 404 })
    }
    return NextResponse.json({ data: country })
  }

  const countries = getAllCountries()
  return NextResponse.json({
    data: countries,
    count: countries.length,
    timestamp: new Date().toISOString(),
  })
}
