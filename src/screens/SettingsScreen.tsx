import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native'
import { useSettings } from '../context/SettingsContext'
import SettingRow from '../components/SettingRow'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 4, borderRadius: 6, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f3f4f6', marginTop: 12 },
  button: { marginHorizontal: 16, marginVertical: 8, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  resetBtn: { backgroundColor: '#ef4444', marginBottom: 20 },
  exportBtn: { backgroundColor: '#10b981' },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  versionText: { textAlign: 'center', paddingVertical: 16, color: '#9ca3af', fontSize: 12 },
})

type Tab = 'liquidity' | 'technical' | 'quality' | 'entry' | 'risk' | 'home' | 'backtest' | 'data' | 'about'

const TABS: { key: Tab; label: string }[] = [
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'technical', label: 'Technical' },
  { key: 'quality', label: 'Quality' },
  { key: 'entry', label: 'Entry' },
  { key: 'risk', label: 'Risk' },
  { key: 'home', label: 'Home' },
  { key: 'backtest', label: 'Backtest' },
  { key: 'data', label: 'Data' },
  { key: 'about', label: 'About' },
]

export default function SettingsScreen() {
  const { settings, updateSetting, resetToDefaults } = useSettings()
  const [activeTab, setActiveTab] = useState<Tab>('liquidity')

  const handleReset = () => {
    Alert.alert('Reset to Defaults?', 'This will reset all settings to their default values.', [
      { text: 'Cancel', onPress: () => {} },
      { text: 'Reset', onPress: resetToDefaults, style: 'destructive' },
    ])
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'liquidity':
        return (
          <>
            <Text style={styles.sectionTitle}>Liquidity Filter</Text>
            <SettingRow
              label="Min Daily Turnover"
              description="Minimum average daily turnover in last 20 bars"
              type="input"
              value={settings.minDailyTurnover}
              onChange={(v) => updateSetting('minDailyTurnover', v)}
              inputKeyboardType="numeric"
              suffix=" ₹"
            />
            <SettingRow
              label="Lookback Bars"
              description="Number of bars to calculate average turnover"
              type="input"
              value={settings.lookbackBars}
              onChange={(v) => updateSetting('lookbackBars', v)}
              inputKeyboardType="numeric"
            />
          </>
        )
      case 'technical':
        return (
          <>
            <Text style={styles.sectionTitle}>Technical Filter</Text>
            <SettingRow
              label="Required Min Bars"
              description="Minimum bars needed for technical analysis"
              type="input"
              value={settings.requiredMinBars}
              onChange={(v) => updateSetting('requiredMinBars', v)}
              inputKeyboardType="numeric"
            />
            <SettingRow
              label="Base Range Threshold"
              description="Max range as % of close (0.2 = 20%)"
              type="slider"
              value={settings.baseRangeThreshold}
              onChange={(v) => updateSetting('baseRangeThreshold', v)}
              sliderMin={0.1}
              sliderMax={0.5}
              sliderStep={0.05}
              suffix=""
            />
            <SettingRow
              label="Valid Bars %"
              description="% of last 20 bars that must be in base range"
              type="slider"
              value={settings.validBarsPercent}
              onChange={(v) => updateSetting('validBarsPercent', v)}
              sliderMin={30}
              sliderMax={100}
              sliderStep={10}
              suffix="%"
            />
            <SettingRow
              label="EMA Alignment"
              description="Require close > EMA50 > SMA200"
              type="toggle"
              value={settings.emaAlignmentEnabled}
              onChange={(v) => updateSetting('emaAlignmentEnabled', v)}
            />
          </>
        )
      case 'quality':
        return (
          <>
            <Text style={styles.sectionTitle}>Base Quality Filter</Text>
            <SettingRow
              label="Lookback Period"
              description="Bars to check for prior upmove"
              type="input"
              value={settings.baseQualityLookback}
              onChange={(v) => updateSetting('baseQualityLookback', v)}
              inputKeyboardType="numeric"
            />
            <SettingRow
              label="Min Prior Upmove"
              description="Minimum upward move required"
              type="slider"
              value={settings.minPriorUpmove}
              onChange={(v) => updateSetting('minPriorUpmove', v)}
              sliderMin={5}
              sliderMax={50}
              sliderStep={5}
              suffix="%"
            />
            <SettingRow
              label="Max Giveback"
              description="Maximum pullback from peak allowed"
              type="slider"
              value={settings.maxGiveback}
              onChange={(v) => updateSetting('maxGiveback', v)}
              sliderMin={10}
              sliderMax={50}
              sliderStep={5}
              suffix="%"
            />
            <SettingRow
              label="Max Vol Dry-up"
              description="Max ratio of peak to current volume"
              type="slider"
              value={settings.maxVolDryup}
              onChange={(v) => updateSetting('maxVolDryup', v)}
              sliderMin={1.0}
              sliderMax={2.0}
              sliderStep={0.1}
              suffix="x"
            />
          </>
        )
      case 'entry':
        return (
          <>
            <Text style={styles.sectionTitle}>Entry Technique</Text>
            <SettingRow
              label="PIN_BAR Wick Multiplier"
              description="Lower wick must be > (body × this value)"
              type="slider"
              value={settings.pinBarWickMultiplier}
              onChange={(v) => updateSetting('pinBarWickMultiplier', v)}
              sliderMin={1.5}
              sliderMax={3.0}
              sliderStep={0.5}
              suffix="x"
            />
            <SettingRow
              label="Allow NEUTRAL Entries"
              description="Include candlesticks that don't match patterns"
              type="toggle"
              value={settings.allowNeutralEntries}
              onChange={(v) => updateSetting('allowNeutralEntries', v)}
            />
          </>
        )
      case 'risk':
        return (
          <>
            <Text style={styles.sectionTitle}>Risk & Money Management</Text>
            <SettingRow
              label="Capital"
              description="Trading capital per trade setup"
              type="input"
              value={settings.capital}
              onChange={(v) => updateSetting('capital', v)}
              inputKeyboardType="numeric"
              suffix=" ₹"
            />
            <SettingRow
              label="Risk per Trade"
              description="% of capital to risk per trade"
              type="slider"
              value={settings.riskPercentPerTrade}
              onChange={(v) => updateSetting('riskPercentPerTrade', v)}
              sliderMin={0.5}
              sliderMax={5}
              sliderStep={0.5}
              suffix="%"
            />
            <SettingRow
              label="Target R-Multiple"
              description="Profit target as multiple of risk"
              type="slider"
              value={settings.targetRMultiple}
              onChange={(v) => updateSetting('targetRMultiple', v)}
              sliderMin={1.5}
              sliderMax={3.0}
              sliderStep={0.5}
              suffix="x"
            />
            <SettingRow
              label="Max Alerts per Run"
              description="Maximum top candidates to display"
              type="input"
              value={settings.maxAlertsPerRun}
              onChange={(v) => updateSetting('maxAlertsPerRun', v)}
              inputKeyboardType="numeric"
            />
          </>
        )
      case 'home':
        return (
          <>
            <Text style={styles.sectionTitle}>HomeScreen Config</Text>
            <SettingRow
              label="Auto-Run on Launch"
              description="Automatically run screener when app opens"
              type="toggle"
              value={settings.autoRunOnLaunch}
              onChange={(v) => updateSetting('autoRunOnLaunch', v)}
            />
            <SettingRow
              label="Background Refresh Interval"
              description="Check for new data every X minutes"
              type="input"
              value={settings.backgroundRefreshInterval}
              onChange={(v) => updateSetting('backgroundRefreshInterval', v)}
              inputKeyboardType="numeric"
              suffix=" mins"
            />
            <SettingRow
              label="Alert Threshold RR"
              description="Minimum Risk:Reward to display"
              type="slider"
              value={settings.alertThresholdRR}
              onChange={(v) => updateSetting('alertThresholdRR', v)}
              sliderMin={1.0}
              sliderMax={3.0}
              sliderStep={0.5}
              suffix="x"
            />
          </>
        )
      case 'backtest':
        return (
          <>
            <Text style={styles.sectionTitle}>BacktestScreen Config</Text>
            <SettingRow
              label="Show All Candidates"
              description="Show all qualified stocks (not just top 3)"
              type="toggle"
              value={settings.showAllCandidates}
              onChange={(v) => updateSetting('showAllCandidates', v)}
            />
          </>
        )
      case 'data':
        return (
          <>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <TouchableOpacity style={[styles.button, styles.exportBtn]}>
              <Text style={styles.buttonText}>📥 Export Alerts as CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.exportBtn]}>
              <Text style={styles.buttonText}>🔄 Clear Cache</Text>
            </TouchableOpacity>
          </>
        )
      case 'about':
        return (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>NSE Swing Screener</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
                Automated swing trading screener for NSE equities with multi-timeframe analysis and risk management.
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Version 1.0.0</Text>
            </View>
          </>
        )
      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <FlatList
          data={TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.key)}
              style={[styles.tab, activeTab === item.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === item.key && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {renderContent()}

        {/* Reset Button */}
        <TouchableOpacity onPress={handleReset} style={[styles.button, styles.resetBtn]}>
          <Text style={styles.buttonText}>⚠️ Reset to Defaults</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Made with ❤️ for swing traders</Text>
      </ScrollView>
    </View>
  )
}