import { OHLC } from '../config/defaults'

export type BaseStage = 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'STAGE_4' | 'UNKNOWN'

export interface BaseStageMetrics {
  stage: BaseStage
  baseHeight: number
  baseDuration: number
  volatility: number
  confidence: number
}

export function classifyBaseStage(bars: OHLC[]): BaseStageMetrics {
  if (bars.length < 30) {
    return {
      stage: 'UNKNOWN',
      baseHeight: 0,
      baseDuration: 0,
      volatility: 0,
      confidence: 0
    }
  }

  const recent30 = bars.slice(-30)
  const highs = recent30.map(b => b.high)
  const lows = recent30.map(b => b.low)
  
  const maxHigh = Math.max(...highs)
  const minLow = Math.min(...lows)
  const baseHeight = maxHigh - minLow
  
  const closes = recent30.map(b => b.close)
  const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length
  const variance = closes.reduce((sum, c) => sum + Math.pow(c - avgClose, 2), 0) / closes.length
  const volatility = Math.sqrt(variance) / avgClose
  
  let stage: BaseStage = 'UNKNOWN'
  let confidence = 0
  
  if (volatility < 0.02) {
    stage = 'STAGE_1'
    confidence = 0.9
  } else if (volatility < 0.04 && baseHeight < avgClose * 0.05) {
    stage = 'STAGE_2'
    confidence = 0.8
  } else if (volatility < 0.06) {
    stage = 'STAGE_3'
    confidence = 0.7
  } else {
    stage = 'STAGE_4'
    confidence = 0.6
  }
  
  const baseDuration = 30 // Using fixed window for now
  
  return {
    stage,
    baseHeight,
    baseDuration,
    volatility,
    confidence
  }
}

export function getStageLabel(stage: BaseStage): string {
  const labels: Record<BaseStage, string> = {
    'STAGE_1': 'Accumulation',
    'STAGE_2': 'Consolidation',
    'STAGE_3': 'Markup',
    'STAGE_4': 'Distribution',
    'UNKNOWN': 'Unknown'
  }
  return labels[stage]
}