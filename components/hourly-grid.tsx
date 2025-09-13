"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getHourDisplay, getBalanceColor, formatCurrency } from '@/lib/trading-utils'
import { TradingSession, DailySchedule } from '@/types/trading'
import { TradingInputModal } from './trading-input-modal'
import { Clock, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface HourlyGridProps {
  schedule: DailySchedule
  sessions: TradingSession[]
  onSessionUpdate: (session: TradingSession) => void
}

export function HourlyGrid({ schedule, sessions, onSessionUpdate }: HourlyGridProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [inputModalOpen, setInputModalOpen] = useState(false)

  const getSessionForHour = (hour: number) => {
    return sessions.find(s => s.hour === hour)
  }

  const getPreviousHourLoss = (hour: number): number => {
    const prevHour = hour - 1
    if (prevHour < 0) return 0
    
    const prevSession = getSessionForHour(prevHour)
    return prevSession && prevSession.balance < 0 ? Math.abs(prevSession.balance) : 0
  }

  const handleHourClick = (hour: number) => {
    const existingSession = getSessionForHour(hour)
    if (existingSession) {
      // Show existing session details
      toast(`${getHourDisplay(hour)}: ${formatCurrency(existingSession.balance)}${existingSession.token ? ` (${existingSession.token})` : ''}`)
      return
    }

    setSelectedHour(hour)
    setInputModalOpen(true)
  }

  const handleSubmit = async (data: { balance: number; token: string }) => {
    if (selectedHour === null) return

    try {
      const response = await fetch('/api/trading-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: schedule.date,
          hour: selectedHour,
          balance: data.balance,
          token: data.token,
          kpi: schedule.kpi_per_hour
        })
      })

      if (response.ok) {
        const newSession: TradingSession = {
          date: schedule.date,
          hour: selectedHour,
          balance: data.balance,
          token: data.token,
          kpi: schedule.kpi_per_hour,
          created_at: new Date(),
          updated_at: new Date()
        }
        onSessionUpdate(newSession)
        toast.success(`Đã lưu kết quả trading ${getHourDisplay(selectedHour)}!`)
      } else {
        throw new Error('Failed to save session')
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {schedule.trading_hours.map((hour, index) => {
          const session = getSessionForHour(hour)
          const colors = session ? getBalanceColor(session.balance) : { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' }
          const isEmpty = !session

          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`${colors.bg} ${colors.border} border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden`}
                onClick={() => handleHourClick(hour)}
              >
                <div className="p-4 h-24 flex flex-col justify-between">
                  <div className="flex-1 flex items-center justify-center">
                    {session ? (
                      <div className={`text-lg font-bold ${colors.text} text-center`}>
                        {formatCurrency(session.balance)}
                      </div>
                    ) : (
                      <Plus className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {getHourDisplay(hour)}
                    </span>
                    {session?.token && (
                      <Badge variant="secondary" className="text-xs">
                        {session.token}
                      </Badge>
                    )}
                  </div>
                </div>
                {isEmpty && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>

      <TradingInputModal
        open={inputModalOpen}
        onOpenChange={setInputModalOpen}
        hour={selectedHour || 0}
        kpi={schedule.kpi_per_hour}
        onSubmit={handleSubmit}
        previousLoss={selectedHour ? getPreviousHourLoss(selectedHour) : 0}
      />
    </>
  )
}