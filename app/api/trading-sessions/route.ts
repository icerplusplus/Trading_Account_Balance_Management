import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { TradingSession } from '@/types/trading'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('trading_app')
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (date) {
      const sessions = await db.collection('trading_sessions')
        .find({ date })
        .sort({ hour: 1 })
        .toArray()
      
      return NextResponse.json(sessions)
    } else {
      const sessions = await db.collection('trading_sessions')
        .find({})
        .sort({ date: -1, hour: -1 })
        .limit(100)
        .toArray()
      
      return NextResponse.json(sessions)
    }
  } catch (error) {
    console.error('Error fetching trading sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('trading_app')
    
    const body = await request.json()
    const { date, hour, balance, token, kpi } = body
    
    // Check if previous hour had a loss to calculate penalty
    const previousHour = hour - 1
    let penalty = 0
    
    if (previousHour >= 0) {
      const prevSession = await db.collection('trading_sessions')
        .findOne({ date, hour: previousHour })
      
      if (prevSession && prevSession.balance < 0) {
        penalty = Math.abs(prevSession.balance) + (2 * kpi)
      }
    }
    
    const session: Omit<TradingSession, '_id'> = {
      date,
      hour,
      balance,
      token: token || '',
      kpi,
      penalty,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    const result = await db.collection('trading_sessions')
      .replaceOne({ date, hour }, session, { upsert: true })
    
    return NextResponse.json({ success: true, id: result.upsertedId })
  } catch (error) {
    console.error('Error creating trading session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}