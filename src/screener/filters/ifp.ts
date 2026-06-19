import { OHLC } from '../config/defaults'

export interface IFPMetrics {
  volumeExpansion: number
  absorptionStrength: number
  climaxVolume: boolean
  ifpScore: number
  hasIFP: boolean
}

export function computeIFPScore(bars: OHLC[]): IFPMetrics {
  if (bars.length < 20) {
    return {
      volumeExpansion: 0,
      absorptionStrength: 0,
      climaxVolume: false,
      ifpScore: 0,
      hasIFP: false
    }
  }

  const current = bars[bars.length - 1]
  const avgVolume20 = bars.slice(-20).reduce((sum, b) => sum + (b.volume || 0), 0) / 20
  const avgVolume5 = bars.slice(-5).reduce((sum, b) => sum + (b.volume || 0), 0) / 5
  
  const volumeExpansion = avgVolume20 > 0 ? (current.volume || 0) / avgVolume20 : 0
  
  const range = current.high - current.low
  const closePosition = range > 0 ? (current.close - current.low) / range : 0
  const absorptionStrength = closePosition > 0.6 ? closePosition : 0
  
  const climaxVolume = (current.volume || 0) > avgVolume20 * 2
  
  let ifpScore = 0
  if (volumeExpansion > 1.5) ifpScore += 3
  if (absorptionStrength > 0.6) ifpScore += 3
  if (climaxVolume) ifpScore += 4
  
  const hasIFP = ifpScore >= 5
  
  return {
    volumeExpansion,
    absorptionStrength,
    climaxVolume,
    ifpScore,
    hasIFP
  }
}

export function getIFPLabel(metrics: IFPMetrics): string {
  if (metrics.ifpScore >= 9) return 'STRONG'
  if (metrics.ifpScore >= 6) return 'MODERATE'
  if (metrics.ifpScore >= 3) return 'WEAK'
  return 'NONE'
}