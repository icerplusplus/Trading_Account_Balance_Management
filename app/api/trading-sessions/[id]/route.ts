import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    
    const updateData = {
      date,
      hour,
      balance,
      token: token || '',
      kpi,
      penalty,
      updated_at: new Date()
    }
    
    const result = await db.collection('trading_sessions')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating trading session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}