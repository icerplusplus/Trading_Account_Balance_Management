import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { DailySchedule } from '@/types/trading'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('trading_app')
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }
    
    const schedule = await db.collection('daily_schedules')
      .findOne({ date })
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error fetching daily schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating daily schedule...')
    
    const client = await clientPromise
    console.log('MongoDB connected successfully')
    
    const db = client.db('trading_app')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { date, trading_hours, kpi_per_hour, min_hours } = body
    
    // Validate required fields
    if (!date || !trading_hours || !kpi_per_hour || !min_hours) {
      console.error('Missing required fields:', { date, trading_hours, kpi_per_hour, min_hours })
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    // Validate trading hours array
    if (!Array.isArray(trading_hours) || trading_hours.length === 0) {
      console.error('Invalid trading_hours:', trading_hours)
      return NextResponse.json(
        { error: 'Trading hours must be a non-empty array' }, 
        { status: 400 }
      )
    }
    
    if (trading_hours.length < min_hours) {
      console.error(`Insufficient hours: ${trading_hours.length} < ${min_hours}`)
      return NextResponse.json(
        { error: `Minimum ${min_hours} hours required` }, 
        { status: 400 }
      )
    }
    
    const schedule: Omit<DailySchedule, '_id'> = {
      date,
      trading_hours: trading_hours.sort((a: number, b: number) => a - b), // Sort hours
      kpi_per_hour: Number(kpi_per_hour),
      min_hours: Number(min_hours),
      created_at: new Date()
    }
    
    console.log('Schedule to save:', schedule)
    
    const result = await db.collection('daily_schedules')
      .replaceOne({ date }, schedule, { upsert: true })
    
    console.log('Save result:', result)
    
    return NextResponse.json({ 
      success: true, 
      id: result.upsertedId,
      schedule 
    })
  } catch (error) {
    console.error('Error creating daily schedule:', error)
    return NextResponse.json({ 
      error: 'Failed to create schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}