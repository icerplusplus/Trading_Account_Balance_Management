import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Statistics } from '@/types/trading'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('trading_app')
    
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = today.substring(0, 7) // YYYY-MM
    const thisYear = today.substring(0, 4) // YYYY
    
    // Daily balance
    const dailySessions = await db.collection('trading_sessions')
      .find({ date: today })
      .toArray()
    const daily_balance = dailySessions.reduce((sum, session) => sum + session.balance, 0)
    
    // Monthly balance
    const monthlySessions = await db.collection('trading_sessions')
      .find({ date: { $regex: `^${thisMonth}` } })
      .toArray()
    const monthly_balance = monthlySessions.reduce((sum, session) => sum + session.balance, 0)
    
    // Yearly balance
    const yearlySessions = await db.collection('trading_sessions')
      .find({ date: { $regex: `^${thisYear}` } })
      .toArray()
    const yearly_balance = yearlySessions.reduce((sum, session) => sum + session.balance, 0)
    
    const total_sessions = yearlySessions.length
    const profit_sessions = yearlySessions.filter(s => s.balance > 0).length
    const loss_sessions = yearlySessions.filter(s => s.balance < 0).length
    
    const statistics: Statistics = {
      daily_balance,
      monthly_balance,
      yearly_balance,
      total_sessions,
      profit_sessions,
      loss_sessions
    }
    
    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}