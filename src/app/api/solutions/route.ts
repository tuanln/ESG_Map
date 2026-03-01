import { NextRequest, NextResponse } from 'next/server'
import { getAllSolutions, getSolutionsByCategory, getSolutionStats } from '@/services/solutions'
import { generateSolutionsSummary } from '@/services/aiSummary'
import { SolutionCategory } from '@/types/solutions'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: SolutionCategory[] = ['renewable-energy', 'green-transport', 'sustainable-agriculture', 'waste-management']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as SolutionCategory | null
    const includeSummary = searchParams.get('summary') === 'true'

    let solutions
    if (category && VALID_CATEGORIES.includes(category)) {
      solutions = getSolutionsByCategory(category)
    } else {
      solutions = getAllSolutions()
    }

    const stats = getSolutionStats()

    const response: any = {
      data: solutions,
      stats,
      total: solutions.length,
    }

    if (includeSummary) {
      response.summary = await generateSolutionsSummary()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Solutions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 })
  }
}
