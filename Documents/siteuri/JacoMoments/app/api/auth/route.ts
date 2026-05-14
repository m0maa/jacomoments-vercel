import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin || admin.password !== password) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 500 })
  }
}