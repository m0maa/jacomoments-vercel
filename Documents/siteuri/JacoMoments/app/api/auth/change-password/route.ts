import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await req.json()

    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin || admin.password !== currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    await prisma.admin.update({
      where: { username },
      data: { password: newPassword },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 })
  }
}