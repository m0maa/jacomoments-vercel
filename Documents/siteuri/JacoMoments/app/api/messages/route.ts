import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()

    const saved = await prisma.message.create({
      data: { name, email, phone, subject, message },
    })

    return NextResponse.json({ success: true, id: saved.id })
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}