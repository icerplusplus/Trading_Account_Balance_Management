import { TradingSession } from '@/types/trading'

export function calculatePenalty(previousLoss: number, kpi: number): number {
  return Math.abs(previousLoss) + (2 * kpi)
}

export function getHourDisplay(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

export function getTodayDate(): string {
  // Get Vietnam timezone date
  const vietnamTime = new Date().toLocaleString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit", 
    day: "2-digit"
  })
  return vietnamTime
}

export function getCurrentHour(): number {
  // Get Vietnam timezone hour
  const vietnamTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    hour: "2-digit"
  })
  return parseInt(vietnamTime)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

export function getBalanceColor(balance: number): {
  bg: string
  text: string
  border: string
} {
  if (balance > 0) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200'
    }
  } else if (balance < 0) {
    return {
      bg: 'bg-red-50', 
      text: 'text-red-800',
      border: 'border-red-200'
    }
  } else {
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200'
    }
  }
}