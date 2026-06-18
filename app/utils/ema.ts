export function calculateEMA(bars: any[], period: number): number[] {
  if (bars.length === 0) return []

  const result: number[] = []
  const k = 2 / (period + 1) // Multiplier

  // Start with SMA as seed
  let sum = 0
  for (let i = 0; i < Math.min(period, bars.length); i++) {
    sum += bars[i].close
  }

  let ema = sum / Math.min(period, bars.length)
  result.push(ema)

  // Apply EMA formula
  for (let i = 1; i < bars.length; i++) {
    ema = bars[i].close * k + ema * (1 - k)
    result.push(ema)
  }

  return result
}

export function calculateSMA(bars: any[], period: number): number[] {
  if (bars.length === 0) return []

  const result: number[] = []

  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) {
        sum += bars[j].close
      }
      result.push(sum / period)
    }
  }

  return result
}