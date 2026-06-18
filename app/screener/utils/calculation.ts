// app/screener/utils/calculation.ts

import { OHLC } from '../config/defaults'

export function calculateEMA(closes: number[], span: number): number[] {
  if (closes.length === 0) return []
  const k = 2 / (span + 1)
  const ema: number[] = [closes[0]]

  for (let i = 1; i < closes.length; i++) {
    ema.push(closes[i] * k + ema[i - 1] * (1 - k))
  }

  return ema
}

export function calculateSMA(closes: number[], period: number): number[] {
  if (closes.length < period) return []
  const sma: number[] = []

  for (let i = period - 1; i < closes.length; i++) {
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }

  return sma
}

export function getLastEMA(closes: number[], span: number): number | null {
  const ema = calculateEMA(closes, span)
  return ema.length > 0 ? ema[ema.length - 1] : null
}

export function getLastSMA(closes: number[], period: number): number | null {
  const sma = calculateSMA(closes, period)
  return sma.length > 0 ? sma[sma.length - 1] : null
}

export function getClosePosition(bar: OHLC): number {
  const range = bar.high - bar.low
  if (range <= 0) return 0
  return (bar.close - bar.low) / range
}

export function getBodyPct(bar: OHLC): number {
  const range = bar.high - bar.low
  if (range <= 0) return 0
  return Math.abs(bar.close - bar.open) / range
}

export function getLowerWickPct(bar: OHLC): number {
  const range = bar.high - bar.low
  if (range <= 0) return 0
  const lowerWick = Math.min(bar.open, bar.close) - bar.low
  return lowerWick / range
}

export function getBarRange(bar: OHLC): number {
  return bar.high - bar.low
}

export function getBarRangePct(bar: OHLC, reference: number = bar.low): number {
  if (reference <= 0) return 0
  return getBarRange(bar) / reference
}

export function calculateATR(bars: OHLC[], period: number = 14): number | null {
  if (bars.length < period) return null

  const trues: number[] = []
  for (let i = 1; i < bars.length; i++) {
    const curr = bars[i]
    const prev = bars[i - 1]

    const tr1 = curr.high - curr.low
    const tr2 = Math.abs(curr.high - prev.close)
    const tr3 = Math.abs(curr.low - prev.close)

    trues.push(Math.max(tr1, tr2, tr3))
  }

  const atr = trues.slice(-period).reduce((a, b) => a + b, 0) / period
  return atr
}

export function roundToTick(
  price: number,
  tick: number,
  mode: 'up' | 'down' | 'nearest' = 'nearest'
): number {
  if (tick <= 0) return Math.round(price * 10000) / 10000

  const steps = price / tick

  let rounded: number
  if (mode === 'up') {
    rounded = Math.ceil(steps) * tick
  } else if (mode === 'down') {
    rounded = Math.floor(steps) * tick
  } else {
    rounded = Math.round(steps) * tick
  }

  return Math.round(rounded * 10000) / 10000
}