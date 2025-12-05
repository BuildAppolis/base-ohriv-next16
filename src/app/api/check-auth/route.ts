import { NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getDemoSession()

    return NextResponse.json({
      authenticated: !!session && session.demoAccess === true
    })
  } catch (error) {
    return NextResponse.json({
      authenticated: false
    })
  }
}