"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getHourDisplay, formatCurrency, calculatePenalty } from '@/lib/trading-utils'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { TradingSession } from '@/types/trading'

interface TradingInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hour: number
  kpi: number
  onSubmit: (data: { balance: number; token: string }) => void
  previousLoss?: number
  existingSession?: TradingSession | null
}

export function TradingInputModal({ 
  open, 
  onOpenChange, 
  hour, 
  kpi, 
  onSubmit,
  previousLoss = 0,
  existingSession = null
}: TradingInputModalProps) {
  const [balance, setBalance] = useState(existingSession?.balance?.toString() || '')
  const [token, setToken] = useState(existingSession?.token || '')
  const [loading, setLoading] = useState(false)

  // Update form when existingSession changes
  useEffect(() => {
    if (existingSession) {
      setBalance(existingSession.balance.toString())
      setToken(existingSession.token || '')
    } else {
      setBalance('')
      setToken('')
    }
  }, [existingSession])

  const requiredAmount = previousLoss > 0 ? calculatePenalty(previousLoss, kpi) : kpi
  const balanceNum = parseFloat(balance) || 0
  // Allow negative numbers, only check minimum for positive entries when there's a previous loss
  const isValidAmount = existingSession || balanceNum !== 0 || previousLoss === 0 || balanceNum >= requiredAmount

  const handleSubmit = async () => {
    if (!balance) {
      toast.error('Vui lòng nhập số dư!')
      return
    }

    // Only enforce minimum requirement for new entries with previous loss
    if (!existingSession && previousLoss > 0 && balanceNum > 0 && balanceNum < requiredAmount) {
      toast.error(`Số dư tối thiểu phải là ${formatCurrency(requiredAmount)}!`)
      return
    }

    setLoading(true)
    try {
      await onSubmit({ balance: balanceNum, token })
      onOpenChange(false)
      setBalance('')
      setToken('')
    } catch (error) {
      toast.error('Lỗi khi lưu dữ liệu!')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setBalance('')
    setToken('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {existingSession ? 'Chỉnh Sửa' : 'Nhập'} Kết Quả Trading
          </DialogTitle>
          <DialogDescription>
            Khung giờ: <strong>{getHourDisplay(hour)}</strong>
          </DialogDescription>
        </DialogHeader>

        {previousLoss > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Cảnh Báo Penalty</span>
            </div>
            <p className="text-sm text-red-600">
              Khung giờ trước bạn bị lỗ {formatCurrency(previousLoss)}. 
              Khung giờ này bạn cần lãi tối thiểu: <strong>{formatCurrency(requiredAmount)}</strong>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="balance" className="text-sm font-medium">
              Số Dư Sau Trading ($) *
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Nhập số dư (âm nếu lỗ, dương nếu lãi)"
              className="mt-1"
            />
            <div className="flex items-center justify-between mt-1">
              {!existingSession && previousLoss > 0 && (
                <Badge variant={isValidAmount ? "default" : "destructive"} className="text-xs">
                  Tối thiểu: {formatCurrency(requiredAmount)}
                </Badge>
              )}
              {balanceNum !== 0 && (
                <span className={`text-sm font-medium ${balanceNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balanceNum)}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="token" className="text-sm font-medium">
              Token/Coin Đã Trade
            </Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="VD: BTC, ETH, BNB..."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !balance}
            className={existingSession 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }
          >
            {loading ? 'Đang lưu...' : existingSession ? 'Cập Nhật' : 'Lưu Kết Quả'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}