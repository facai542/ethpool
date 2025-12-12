'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Gift, TrendingUp, Plus, Trash2, Save, AlertCircle } from 'lucide-react'

interface RewardTier {
  min_balance: number
  max_balance: number | null
  percentage: number
}

export default function RewardSettingsPage() {
  // 首次授权奖励
  const [firstAuthEnabled, setFirstAuthEnabled] = useState(true)
  const [firstAuthAmount, setFirstAuthAmount] = useState('10')

  // 定时奖励
  const [periodicEnabled, setPeriodicEnabled] = useState(true)
  const [tiers, setTiers] = useState<RewardTier[]>([
    { min_balance: 100, max_balance: 1000, percentage: 0.5 },
    { min_balance: 1001, max_balance: 5000, percentage: 0.8 },
    { min_balance: 5001, max_balance: null, percentage: 1.0 }
  ])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 加载配置
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/reward-settings')
      const data = await response.json()

      if (data.success) {
        if (data.data.first_authorization) {
          setFirstAuthEnabled(data.data.first_authorization.is_enabled)
          setFirstAuthAmount(String(data.data.first_authorization.config.reward_amount_usdt))
        }

        if (data.data.periodic_reward) {
          setPeriodicEnabled(data.data.periodic_reward.is_enabled)
          setTiers(data.data.periodic_reward.config.tiers)
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const saveFirstAuthSettings = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/reward-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_type: 'first_authorization',
          is_enabled: firstAuthEnabled,
          config: {
            reward_amount_usdt: parseFloat(firstAuthAmount),
            description: '首次授权成功奖励'
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '首次授权奖励设置已保存' })
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const savePeriodicSettings = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/reward-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_type: 'periodic_reward',
          is_enabled: periodicEnabled,
          config: {
            schedule: '0 */6 * * *',
            tiers: tiers
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '定时奖励设置已保存' })
      } else {
        setMessage({ type: 'error', text: data.error || '保存失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newMinBalance = lastTier.max_balance ? lastTier.max_balance + 1 : 10000

    setTiers([...tiers, {
      min_balance: newMinBalance,
      max_balance: newMinBalance + 1000,
      percentage: 1.0
    }])
  }

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index))
    }
  }

  const updateTier = (index: number, field: keyof RewardTier, value: number | null) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">奖励系统设置</h1>
        <p className="text-slate-400">配置首次授权奖励和定时奖励规则</p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* 首次授权奖励 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-cyan-400" />
              <div>
                <CardTitle>首次授权奖励</CardTitle>
                <CardDescription>用户首次授权成功后自动发放的奖励</CardDescription>
              </div>
            </div>
            <Switch 
              checked={firstAuthEnabled} 
              onCheckedChange={setFirstAuthEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-auth-amount">奖励金额（USDT）</Label>
            <div className="flex gap-2">
              <Input
                id="first-auth-amount"
                type="number"
                step="0.01"
                min="0"
                value={firstAuthAmount}
                onChange={(e) => setFirstAuthAmount(e.target.value)}
                disabled={!firstAuthEnabled}
                className="flex-1 bg-slate-700 border-slate-600"
                placeholder="例如：10"
              />
              <span className="flex items-center text-slate-400 px-3">USDT</span>
            </div>
            <p className="text-sm text-slate-400">
              系统将自动转换为等值的 ETH 发放到用户平台账户
            </p>
          </div>

          <Button
            onClick={saveFirstAuthSettings}
            disabled={loading || !firstAuthEnabled}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            <Save className="w-4 h-4 mr-2" />
            保存首次授权奖励设置
          </Button>
        </CardContent>
      </Card>

      {/* 定时奖励 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <CardTitle>定时奖励发放</CardTitle>
                <CardDescription>每日4次（每6小时）根据钱包余额自动发放奖励</CardDescription>
              </div>
            </div>
            <Switch 
              checked={periodicEnabled} 
              onCheckedChange={setPeriodicEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>奖励层级设置</Label>
            {tiers.map((tier, index) => (
              <div key={index} className="flex gap-2 items-center bg-slate-700/50 p-3 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-slate-400">最小余额</Label>
                    <Input
                      type="number"
                      value={tier.min_balance}
                      onChange={(e) => updateTier(index, 'min_balance', parseFloat(e.target.value))}
                      disabled={!periodicEnabled}
                      className="bg-slate-700 border-slate-600 text-sm"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">最大余额</Label>
                    <Input
                      type="number"
                      value={tier.max_balance || ''}
                      onChange={(e) => updateTier(index, 'max_balance', e.target.value ? parseFloat(e.target.value) : null)}
                      disabled={!periodicEnabled}
                      className="bg-slate-700 border-slate-600 text-sm"
                      placeholder="无上限"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">奖励比例 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={tier.percentage}
                      onChange={(e) => updateTier(index, 'percentage', parseFloat(e.target.value))}
                      disabled={!periodicEnabled}
                      className="bg-slate-700 border-slate-600 text-sm"
                      placeholder="0.5"
                    />
                  </div>
                </div>
                {tiers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTier(index)}
                    disabled={!periodicEnabled}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addTier}
            disabled={!periodicEnabled}
            className="w-full border-slate-600 hover:bg-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加奖励层级
          </Button>

          <div className="bg-slate-700/30 p-3 rounded-lg text-sm text-slate-300 space-y-1">
            <p className="font-medium">说明：</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>系统每6小时自动检查一次所有已授权用户</li>
              <li>根据用户钱包链上USDT余额计算奖励</li>
              <li>奖励金额 = 钱包余额 × 对应比例</li>
              <li>自动转换为等值ETH发放到平台账户</li>
              <li>最后一个层级的最大余额留空表示无上限</li>
            </ul>
          </div>

          <Button
            onClick={savePeriodicSettings}
            disabled={loading || !periodicEnabled}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            保存定时奖励设置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

