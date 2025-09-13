import { TradingSession } from '@/types/trading'

export function calculatePenalty(previousLoss: number, kpi: number): number {
  return Math.abs(previousLoss) + (2 * kpi)
}

export function getHourDisplay(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getCurrentHour(): number {
  return new Date().getHours()
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