import { useEffect, useState } from 'react'
import { runBacktestForDate } from '../screener/backtester'
import { BacktestResult } from '../screener/screener'
import { useSettings } from '../context/SettingsContext'

export function useHomeScreenData() {
  const { settings } = useSettings()

  const [backtest, setBacktest] = useState<BacktestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null)

  // Get yesterday's date (last available data)
  const getLastAvailableDate = (): string => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    return yesterday.toISOString().split('T')[0]
  }

  const runScreener = async (dateStr: string = getLastAvailableDate()) => {
    console.log(`[HomeScreen] Running screener for ${dateStr}`)
    setLoading(true)
    try {
      const result = await runBacktestForDate(dateStr)
      const filtered = result.top3.filter((a) => a.rr >= settings.alertThresholdRR)
      console.log(`[HomeScreen] Got ${result.top3.length} alerts`)
      setBacktest(result)
      setLastUpdated(dateStr)
    } catch (error) {
      console.error(`[HomeScreen] Screener error:`, error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-run on launch
  useEffect(() => {
    runScreener()
  }, [])

  // Background check every 15 mins
  useEffect(() => {
    const timer = setInterval(async () => {
      console.log(`[HomeScreen] Background check...`)
      const latestDate = getLastAvailableDate()
      if (latestDate !== lastUpdated) {
        console.log(`[HomeScreen] New data available: ${latestDate}`)
        await runScreener(latestDate)
      }
    }, 15 * 60 * 1000) // 15 minutes

    setUpdateTimer(timer)
    return () => clearInterval(timer)
  }, [lastUpdated])

  const manualRefresh = async () => {
    await runScreener()
  }

  return {
    backtest,
    loading,
    lastUpdated,
    manualRefresh,
  }
}
