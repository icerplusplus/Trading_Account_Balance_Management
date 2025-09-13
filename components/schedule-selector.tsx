"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getHourDisplay, getTodayDate } from '@/lib/trading-utils'
import { DailySchedule } from '@/types/trading'
import toast from 'react-hot-toast'

interface ScheduleSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScheduleCreated: (schedule: DailySchedule) => void
}

export function ScheduleSelector({ open, onOpenChange, onScheduleCreated }: ScheduleSelectorProps) {
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [kpiPerHour, setKpiPerHour] = useState(4)
  const [loading, setLoading] = useState(false)
  
  const minHours = 12
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const toggleHour = (hour: number) => {
    setSelectedHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    )
  }

  const handleSubmit = async () => {
    if (selectedHours.length < minHours) {
      toast.error(`Bạn cần chọn ít nhất ${minHours} giờ để trading!`)
      return
    }

    setLoading(true)
    try {
      console.log('Submitting schedule:', {
        date: getTodayDate(),
        trading_hours: selectedHours,
        kpi_per_hour: kpiPerHour,
        min_hours: minHours
      })
      
      const response = await fetch('/api/daily-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: getTodayDate(),
          trading_hours: selectedHours,
          kpi_per_hour: kpiPerHour,
          min_hours: minHours
        })
      })

      const responseData = await response.json()
      console.log('Response:', responseData)
      
      if (response.ok) {
        const schedule = {
          date: getTodayDate(),
          trading_hours: selectedHours,
          kpi_per_hour: kpiPerHour,
          min_hours: minHours,
          created_at: new Date()
        }
        onScheduleCreated(schedule)
        onOpenChange(false)
        toast.success('Lịch trading đã được thiết lập!')
      } else {
        throw new Error(responseData.error || 'Failed to create schedule')
      }
    } catch (error) {
      console.error('Schedule creation error:', error)
      toast.error(`Lỗi khi tạo lịch trading: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thiết Lập Lịch Trading
          </DialogTitle>
          <DialogDescription>
            Chọn các khung giờ bạn sẽ trading hôm nay. Tối thiểu {minHours} giờ.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="kpi" className="text-sm font-medium">
              KPI mỗi giờ ($)
            </Label>
            <Input
              id="kpi"
              type="number"
              value={kpiPerHour}
              onChange={(e) => setKpiPerHour(Number(e.target.value))}
              className="mt-1"
              min="1"
              step="0.1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">
                Chọn Khung Giờ Trading
              </Label>
              <Badge variant={selectedHours.length >= minHours ? "default" : "destructive"}>
                {selectedHours.length}/{minHours} giờ
              </Badge>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {hours.map(hour => (
                <Button
                  key={hour}
                  variant={selectedHours.includes(hour) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleHour(hour)}
                  className={`transition-all ${
                    selectedHours.includes(hour)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  {getHourDisplay(hour)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedHours.length < minHours}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? 'Đang lưu...' : 'Lưu Lịch Trading'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}