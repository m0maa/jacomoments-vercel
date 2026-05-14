import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const defaultPackages = [
  { id: 'sedinteFoto-0', name: 'MINI SESSION', category: 'sedinteFoto', categoryTitle: 'ȘEDINȚE FOTO', price: 50, duration: '30–45 minute', features: JSON.stringify(['10–15 fotografii editate', 'Livrare online', 'Portrete / cuplu / familie']), isPopular: false, order: 0 },
  { id: 'sedinteFoto-1', name: 'PREMIUM SESSION', category: 'sedinteFoto', categoryTitle: 'ȘEDINȚE FOTO', price: 100, duration: '1–2 ore', features: JSON.stringify(['25–40 fotografii editate profesional', 'Locație la alegere', 'Livrare online + selecție extinsă']), isPopular: true, order: 1 },
  { id: 'botezuri-0', name: 'BASIC BAPTISM', category: 'botezuri', categoryTitle: 'BOTEZURI', price: 250, duration: 'Ceremonie', features: JSON.stringify(['Fotografiere ceremonie biserică', 'Fotografii cu familia și invitații', '100+ fotografii editate', 'Livrare online prin link privat']), isPopular: false, order: 0 },
  { id: 'botezuri-1', name: 'PREMIUM BAPTISM', category: 'botezuri', categoryTitle: 'BOTEZURI', price: 350, duration: 'Acoperire completă', features: JSON.stringify(['Pregătiri, biserică, restaurant', '200+ fotografii editate', 'Cadre artistice & detalii', 'Preview rapid pentru social media']), isPopular: true, order: 1 },
  { id: 'nunti-0', name: 'WEDDING DAY', category: 'nunti', categoryTitle: 'NUNȚI', price: 500, duration: 'Acoperire eveniment', features: JSON.stringify(['Pregătiri + ceremonie + petrecere', '300+ fotografii editate profesional', 'Livrare online HD', 'Momente spontane și cadre artistice']), isPopular: false, order: 0 },
  { id: 'nunti-1', name: 'PREMIUM WEDDING', category: 'nunti', categoryTitle: 'NUNȚI', price: 700, duration: 'Acoperire extinsă', features: JSON.stringify(['Ședință foto mire & mireasă', '500+ fotografii editate', 'Preview rapid în 24–48h', 'Galerie online premium']), isPopular: true, order: 1 },
  { id: 'evenimente-0', name: 'EVENT BASIC', category: 'evenimente', categoryTitle: 'EVENIMENTE PRIVATE', price: 100, duration: '1–2 ore', features: JSON.stringify(['Majorate / aniversări / petreceri private', '50+ fotografii editate']), isPopular: false, order: 0 },
  { id: 'evenimente-1', name: 'EVENT PREMIUM', category: 'evenimente', categoryTitle: 'EVENIMENTE PRIVATE', price: 200, duration: 'Acoperire extinsă', features: JSON.stringify(['Cadre atmosferice & invitați', '100+ fotografii editate', 'Livrare online']), isPopular: true, order: 1 },
]

export async function POST() {
  try {
    const admin = await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: { username: 'admin', password: 'Admin123' },
    })

    for (const pkg of defaultPackages) {
      await prisma.package.upsert({
        where: { id: pkg.id },
        update: {},
        create: pkg,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin and packages initialized',
      admin: { username: admin.username },
    })
  } catch (error) {
    console.error('Error initializing:', error)
    return NextResponse.json(
      { error: 'Failed to initialize', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const adminCount = await prisma.admin.count()
    return NextResponse.json({
      initialized: adminCount > 0,
      count: adminCount,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 })
  }
}
