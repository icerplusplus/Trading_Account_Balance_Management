"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Statistics } from '@/types/trading'
import { formatCurrency } from '@/lib/trading-utils'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function StatisticsDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics')
      const data = await response.json()
      setStatistics(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!statistics) return null

  const stats = [
    {
      title: 'Daily Balance',
      value: statistics.daily_balance,
      icon: DollarSign,
      color: statistics.daily_balance >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Monthly Balance', 
      value: statistics.monthly_balance,
      icon: TrendingUp,
      color: statistics.monthly_balance >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Yearly Balance',
      value: statistics.yearly_balance,
      icon: BarChart3,
      color: statistics.yearly_balance >= 0 ? 'text-green-600' : 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {formatCurrency(stat.value)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.value >= 0 ? '+' : ''}{((stat.value / 1000) * 100).toFixed(1)}% vs baseline
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}