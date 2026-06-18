import { useState } from 'react'
import { runBacktestForDate } from '../screener/backtester'

export function useBacktest() {
  const [backtest, setBacktest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runBacktest = async (dateStr: string) => {
    console.log(`[useBacktest] Starting backtest for ${dateStr}`)
    setLoading(true)
    setBacktest(null)

    try {
      const result = await runBacktestForDate(dateStr)
      console.log(`[useBacktest] Result received:`, result)
      setBacktest(result)
    } catch (error) {
      console.error(`[useBacktest] Error:`, error)
      setBacktest(null)
    } finally {
      setLoading(false)
    }
  }

  return { backtest, loading, runBacktest }
}