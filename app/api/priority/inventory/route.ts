import { NextRequest, NextResponse } from 'next/server'
import { fetchInventory } from '@/lib/priority'

export async function GET(req: NextRequest) {
  const partName = req.nextUrl.searchParams.get('part') ?? undefined

  if (!process.env.PRIORITY_BASE_URL || process.env.PRIORITY_BASE_URL.includes('YOUR-COMPANY')) {
    return NextResponse.json([])
  }

  try {
    const rows = await fetchInventory(partName)
    return NextResponse.json(rows)
  } catch (err: any) {
    console.error('Priority inventory error:', err.message)
    return NextResponse.json([])
  }
}
