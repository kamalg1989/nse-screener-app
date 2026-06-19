import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ScreenerSettings {
  // Liquidity
  minDailyTurnover: number
  lookbackBars: number

  // Technical
  requiredMinBars: number
  baseRangeThreshold: number
  validBarsPercent: number
  emaAlignmentEnabled: boolean

  // Base Quality
  baseQualityLookback: number
  minPriorUpmove: number
  maxGiveback: number
  maxVolDryup: number

  // Entry Technique
  pinBarWickMultiplier: number
  allowNeutralEntries: boolean
  preferredTechniques: string[]

  // Risk Management
  capital: number
  riskPercentPerTrade: number
  targetRMultiple: number
  maxAlertsPerRun: number

  // HomeScreen
  autoRunOnLaunch: boolean
  backgroundRefreshInterval: number // minutes
  alertThresholdRR: number

  // BacktestScreen
  defaultDuration: 'single' | '1m' | '3m' | '6m'
  showAllCandidates: boolean
}

const DEFAULT_SETTINGS: ScreenerSettings = {
  minDailyTurnover: 1000000000,
  lookbackBars: 20,
  requiredMinBars: 200,
  baseRangeThreshold: 0.2,
  validBarsPercent: 50,
  emaAlignmentEnabled: true,
  baseQualityLookback: 100,
  minPriorUpmove: 15,
  maxGiveback: 30,
  maxVolDryup: 1.3,
  pinBarWickMultiplier: 2,
  allowNeutralEntries: false,
  preferredTechniques: ['HH_HL', 'INSIDE_BAR', 'PIN_BAR', 'TREND_BAR'],
  capital: 400000,
  riskPercentPerTrade: 2,
  targetRMultiple: 2.0,
  maxAlertsPerRun: 3,
  autoRunOnLaunch: true,
  backgroundRefreshInterval: 15,
  alertThresholdRR: 2.0,
  defaultDuration: '1m',
  showAllCandidates: false,
}

interface SettingsContextType {
  settings: ScreenerSettings
  updateSetting: <K extends keyof ScreenerSettings>(key: K, value: ScreenerSettings[K]) => Promise<void>
  resetToDefaults: () => Promise<void>
  loading: boolean
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ScreenerSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('screenerSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        console.log('[Settings] Loaded from AsyncStorage')
      }
    } catch (error) {
      console.error('[Settings] Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async <K extends keyof ScreenerSettings>(key: K, value: ScreenerSettings[K]) => {
    try {
      const updated = { ...settings, [key]: value }
      setSettings(updated)
      await AsyncStorage.setItem('screenerSettings', JSON.stringify(updated))
      console.log(`[Settings] Updated ${key} = ${value}`)
    } catch (error) {
      console.error('[Settings] Update error:', error)
    }
  }

  const resetToDefaults = async () => {
    try {
      setSettings(DEFAULT_SETTINGS)
      await AsyncStorage.removeItem('screenerSettings')
      console.log('[Settings] Reset to defaults')
    } catch (error) {
      console.error('[Settings] Reset error:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetToDefaults, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = React.useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
