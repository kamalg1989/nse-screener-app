import { OHLC } from '../config/defaults'

export interface BaseQualityMetrics {
  bodyRatio: number
  closePosition: number
  volumeRatio: number
  rangeRatio: number
  qualityScore: number
  isQualityBase: boolean
}

export function assessBaseQuality(bars: OHLC[]): BaseQualityMetrics {
  if (bars.length < 2) {
    return {
      bodyRatio: 0,
      closePosition: 0,
      volumeRatio: 0,
      rangeRatio: 0,
      qualityScore: 0,
      isQualityBase: false
    }
  }

  const current = bars[bars.length - 1]
  const prev = bars[bars.length - 2]
  
  const range = current.high - current.low
  const body = Math.abs(current.close - current.open)
  const bodyRatio = range > 0 ? body / range : 0
  
  const closePosition = range > 0 ? (current.close - current.low) / range : 0
  
  const avgVolume = bars.slice(-20).reduce((sum, b) => sum + (b.volume || 0), 0) / 20
  const volumeRatio = avgVolume > 0 ? (current.volume || 0) / avgVolume : 0
  
  const avgRange = bars.slice(-20).reduce((sum, b) => sum + (b.high - b.low), 0) / 20
  const rangeRatio = avgRange > 0 ? range / avgRange : 0
  
  const qualityScore = (bodyRatio * 0.3 + closePosition * 0.3 + volumeRatio * 0.2 + rangeRatio * 0.2) * 10
  
  const isQualityBase = bodyRatio > 0.4 && volumeRatio > 0.8 && rangeRatio > 0.9
  
  return {
    bodyRatio,
    closePosition,
    volumeRatio,
    rangeRatio,
    qualityScore,
    isQualityBase
  }
}

export function getBaseQualityLabel(metrics: BaseQualityMetrics): string {
  if (metrics.qualityScore >= 7) return 'HIGH'
  if (metrics.qualityScore >= 5) return 'MEDIUM'
  return 'LOW'
}