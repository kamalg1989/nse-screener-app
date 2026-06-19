import { OHLC } from '../config/defaults'

export interface LiquidityMetrics {
  avgVolume: number
  avgTurnover: number
  passesFilter: boolean
}

const MIN_AVG_VOLUME = 500000 // 500k shares
const MIN_AVG_TURNOVER = 1000000 // ₹10 lakh

export function checkLiquidity(bars: OHLC[]): LiquidityMetrics {
  if (bars.length === 0) {
    return { avgVolume: 0, avgTurnover: 0, passesFilter: false }
  }

  const volumes = bars.map(b => b.volume || 0)
  const turnover = bars.map((b, i) => {
    const closePrice = b.close || 0
    return (b.volume || 0) * closePrice
  })

  const avgVolume = volumes.reduce((a, b) => a + b, 0) / bars.length
  const avgTurnover = turnover.reduce((a, b) => a + b, 0) / bars.length

  const passesFilter = avgVolume >= MIN_AVG_VOLUME && avgTurnover >= MIN_AVG_TURNOVER

  return { avgVolume, avgTurnover, passesFilter }
}

export function getLiquidityScore(metrics: LiquidityMetrics): number {
  if (!metrics.passesFilter) return 0
  
  const volumeScore = Math.min(metrics.avgVolume / (MIN_AVG_VOLUME * 2), 1)
  const turnoverScore = Math.min(metrics.avgTurnover / (MIN_AVG_TURNOVER * 2), 1)
  
  return (volumeScore * 0.5 + turnoverScore * 0.5) * 10
}