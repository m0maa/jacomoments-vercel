import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    })
    return NextResponse.json(
      packages.map((p) => ({ ...p, features: JSON.parse(p.features) }))
    )
  } catch {
    return NextResponse.json([])
  }
}