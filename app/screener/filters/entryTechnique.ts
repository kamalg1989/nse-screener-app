import { OHLC } from '../config/defaults'
import { getClosePosition, getBodyPct, getLowerWickPct } from '../utils/calculation'

export type EntryPattern = 'HH_HL' | 'INSIDE_BAR' | 'PIN_BAR' | 'TREND_BAR' | 'NONE'

export interface EntryMetrics {
  pattern: EntryPattern
  entryPrice: number | null
  stopLoss: number | null
  confidence: number
  isValid: boolean
}

export function detectEntryTechnique(bars: OHLC[]): EntryPattern {
  if (bars.length < 2) return 'NONE'

  const current = bars[bars.length - 1]
  const prev = bars[bars.length - 2]

  // HH-HL: Higher High, Higher Low
  if (current.high > prev.high && current.low > prev.low) {
    return 'HH_HL'
  }

  // Inside Bar
  if (current.high < prev.high && current.low > prev.low) {
    return 'INSIDE_BAR'
  }

  // Pin Bar: Long lower wick, small body
  const lowerWickPct = getLowerWickPct(current)
  const bodyPct = getBodyPct(current)
  if (lowerWickPct > 0.4 && bodyPct < 0.3) {
    return 'PIN_BAR'
  }

  // Trend Bar: Strong close in top/bottom of range
  const closePos = getClosePosition(current)
  if (closePos > 0.7 || closePos < 0.3) {
    return 'TREND_BAR'
  }

  return 'NONE'
}

export function resolveEntry(bars: OHLC[], pattern: EntryPattern, tickSize: number): EntryMetrics {
  if (bars.length < 2 || pattern === 'NONE') {
    return {
      pattern: 'NONE',
      entryPrice: null,
      stopLoss: null,
      confidence: 0,
      isValid: false
    }
  }

  const current = bars[bars.length - 1]
  const prev = bars[bars.length - 2]
  let entryPrice: number | null = null
  let stopLoss: number | null = null
  let confidence = 0

  switch (pattern) {
    case 'HH_HL':
      entryPrice = current.high + (tickSize * 0.05)
      stopLoss = prev.low - (tickSize * 0.05)
      confidence = 0.7
      break

    case 'INSIDE_BAR':
      entryPrice = current.high + (tickSize * 0.05)
      stopLoss = current.low - (tickSize * 0.05)
      confidence = 0.6
      break

    case 'PIN_BAR':
      entryPrice = current.high + (tickSize * 0.05)
      stopLoss = current.low - (tickSize * 0.05)
      confidence = 0.65
      break

    case 'TREND_BAR':
      entryPrice = current.high + (tickSize * 0.05)
      stopLoss = current.low - (tickSize * 0.05)
      confidence = 0.5
      break
  }

  return {
    pattern,
    entryPrice,
    stopLoss,
    confidence,
    isValid: entryPrice !== null && stopLoss !== null
  }
}