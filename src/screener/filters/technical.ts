import { OHLC } from '../config/defaults'
import { calculateEMA, calculateSMA, getLastEMA, getLastSMA } from '../utils/calculation'

export interface TechnicalMetrics {
  ema20: number | null
  ema50: number | null
  sma200: number | null
  closeAboveEMA20: boolean
  closeAboveEMA50: boolean
  closeAboveSMA200: boolean
  uptrend: boolean
  passesFilter: boolean
}

export function filterTechnical(bars: OHLC[]): TechnicalMetrics {
  if (bars.length < 200) {
    return {
      ema20: null,
      ema50: null,
      sma200: null,
      closeAboveEMA20: false,
      closeAboveEMA50: false,
      closeAboveSMA200: false,
      uptrend: false,
      passesFilter: false
    }
  }

  const closes = bars.map(b => b.close)
  const lastClose = closes[closes.length - 1]

  const ema20 = getLastEMA(closes, 20)
  const ema50 = getLastEMA(closes, 50)
  const sma200 = getLastSMA(closes, 200)

  const closeAboveEMA20 = ema20 !== null && lastClose > ema20
  const closeAboveEMA50 = ema50 !== null && lastClose > ema50
  const closeAboveSMA200 = sma200 !== null && lastClose > sma200

  const uptrend = closeAboveEMA20 && closeAboveEMA50 && closeAboveSMA200
  const passesFilter = uptrend

  return {
    ema20,
    ema50,
    sma200,
    closeAboveEMA20,
    closeAboveEMA50,
    closeAboveSMA200,
    uptrend,
    passesFilter
  }
}

export function getTechnicalScore(metrics: TechnicalMetrics): number {
  if (!metrics.passesFilter) return 0
  
  let score = 0
  if (metrics.closeAboveEMA20) score += 3
  if (metrics.closeAboveEMA50) score += 3
  if (metrics.closeAboveSMA200) score += 4
  
  return score
}