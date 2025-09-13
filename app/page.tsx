"use client"

import { useEffect, useState } from 'react'
import { StatisticsDashboard } from '@/components/statistics-dashboard'
import { HourlyGrid } from '@/components/hourly-grid'
import { ScheduleSelector } from '@/components/schedule-selector'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TradingSession, DailySchedule } from '@/types/trading'
import { getTodayDate } from '@/lib/trading-utils'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Settings, BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TradingDashboard() {
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [sessions, setSessions] = useState<TradingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      await Promise.all([fetchSchedule(), fetchSessions()])
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/daily-schedule?date=${getTodayDate()}`)
      const data = await response.json()
      
      if (response.ok && data) {
        setSchedule(data)
      } else {
        // No schedule found, show schedule selector
        setScheduleModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      setScheduleModalOpen(true)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/trading-sessions?date=${getTodayDate()}`)
      const data = await response.json()
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleScheduleCreated = (newSchedule: DailySchedule) => {
    setSchedule(newSchedule)
  }

  const handleSessionUpdate = (newSession: TradingSession) => {
    setSessions(prev => {
      const existing = prev.find(s => s.hour === newSession.hour)
      if (existing) {
        return prev.map(s => s.hour === newSession.hour ? newSession : s)
      } else {
        return [...prev, newSession].sort((a, b) => a.hour - b.hour)
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trading Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  {getTodayDate()} • {schedule ? `${schedule.trading_hours.length} khung giờ` : 'Chưa thiết lập'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleModalOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Thiết Lập
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatisticsDashboard />
        </motion.div>

        {/* Trading Grid */}
        {schedule ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Khung Giờ Trading Hôm Nay
                </h2>
                <div className="ml-auto text-sm text-gray-600">
                  KPI: ${schedule.kpi_per_hour}/giờ
                </div>
              </div>
              
              <HourlyGrid
                schedule={schedule}
                sessions={sessions}
                onSessionUpdate={handleSessionUpdate}
              />
            </div>
          </motion.section>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50">
              <div className="text-gray-500 mb-4">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Chưa có lịch trading</h3>
                <p className="text-sm">Thiết lập lịch trading để bắt đầu</p>
              </div>
              <Button 
                onClick={() => setScheduleModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Thiết Lập Ngay
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      <ScheduleSelector
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        onScheduleCreated={handleScheduleCreated}
      />
    </div>
  )
}