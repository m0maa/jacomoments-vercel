import { NextRequest, NextResponse } from 'next/server'
import { prisma, DEMO_PHOTOS } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')

    const photos = await prisma.photo.findMany({
      where: featured === 'true' ? { featured: true } : undefined,
      include: { tags: true },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(photos)
  } catch {
    return NextResponse.json(DEMO_PHOTOS)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { filename, url, category, tags } = await req.json()

    const photo = await prisma.photo.create({
      data: {
        filename,
        url,
        category: category || 'nunta',
        tags: {
          connectOrCreate: (tags || []).map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    })

    return NextResponse.json(photo)
  } catch {
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
  }
}