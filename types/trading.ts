export interface TradingSession {
    _id?: string
    date: string // YYYY-MM-DD format
    hour: number // 0-23
    balance: number // positive for profit, negative for loss
    token?: string // coin/token traded
    kpi: number // hourly KPI target
    penalty?: number // penalty amount if previous hour was loss
    created_at: Date
    updated_at: Date
  }
  
  export interface DailySchedule {
    _id?: string
    date: string // YYYY-MM-DD format
    trading_hours: number[] // array of hours (0-23)
    kpi_per_hour: number
    min_hours: number
    created_at: Date
  }
  
  export interface Statistics {
    daily_balance: number
    monthly_balance: number
    yearly_balance: number
    total_sessions: number
    profit_sessions: number
    loss_sessions: number
  }