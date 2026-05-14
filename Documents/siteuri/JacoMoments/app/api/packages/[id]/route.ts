import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, price, duration, features, isPopular } = await req.json()

    const updated = await prisma.package.update({
      where: { id: params.id },
      data: {
        name,
        price: Number(price),
        duration,
        features: JSON.stringify(features),
        isPopular,
      },
    })

    return NextResponse.json({ ...updated, features: JSON.parse(updated.features) })
  } catch {
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}