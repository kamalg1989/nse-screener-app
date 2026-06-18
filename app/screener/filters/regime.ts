import { OHLC } from '../config/defaults'
import { getLastSMA } from '../utils/calculation'

export type MarketRegime = 'ADVANCE' | 'DISTRIBUTION' | 'DECLINE' | 'ACCUMULATION'

export interface RegimeMetrics {
  regime: MarketRegime
  regimeStrength: number
  trendDirection: 'UP' | 'DOWN' | 'NEUTRAL'
  confidence: number
}

export function detectMarketRegime(bars: OHLC[]): RegimeMetrics {
  if (bars.length < 200) {
    return {
      regime: 'NEUTRAL' as any,
      regimeStrength: 0,
      trendDirection: 'NEUTRAL',
      confidence: 0
    }
  }

  const closes = bars.map(b => b.close)
  const sma200 = getLastSMA(closes, 200)
  const lastClose = closes[closes.length - 1]
  
  if (sma200 === null) {
    return {
      regime: 'NEUTRAL' as any,
      regimeStrength: 0,
      trendDirection: 'NEUTRAL',
      confidence: 0
    }
  }

  // Calculate recent trend
  const recent20 = closes.slice(-20)
  const avgRecent = recent20.reduce((a, b) => a + b, 0) / 20
  
  const recent60 = closes.slice(-60)
  const avgRecent60 = recent60.reduce((a, b) => a + b, 0) / 60
  
  const trend20vs60 = avgRecent > avgRecent60 ? 1 : -1
  const trend200 = lastClose > sma200 ? 1 : -1
  
  let regime: MarketRegime = 'NEUTRAL' as any
  let regimeStrength = 0
  let trendDirection: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL'
  
  if (trend200 > 0 && trend20vs60 > 0) {
    regime = 'ADVANCE'
    regimeStrength = 0.9
    trendDirection = 'UP'
  } else if (trend200 > 0 && trend20vs60 < 0) {
    regime = 'DISTRIBUTION'
    regimeStrength = 0.6
    trendDirection = 'NEUTRAL'
  } else if (trend200 < 0 && trend20vs60 < 0) {
    regime = 'DECLINE'
    regimeStrength = 0.8
    trendDirection = 'DOWN'
  } else {
    regime = 'ACCUMULATION'
    regimeStrength = 0.5
    trendDirection = 'NEUTRAL'
  }
  
  const confidence = Math.abs((lastClose - sma200) / sma200) * 100
  
  return {
    regime,
    regimeStrength,
    trendDirection,
    confidence: Math.min(confidence, 1)
  }
}

export function getRegimeLabel(regime: MarketRegime): string {
  const labels: Record<MarketRegime, string> = {
    'ADVANCE': '📈 Strong Uptrend',
    'DISTRIBUTION': '⚖️ Distribution',
    'DECLINE': '📉 Strong Downtrend',
    'ACCUMULATION': '🔄 Accumulation'
  }
  return labels[regime]
}