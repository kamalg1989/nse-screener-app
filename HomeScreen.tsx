// app/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    // Load alerts from DB on mount
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    // TODO: Query alerts table for today
    console.log('Loading alerts...')
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // TODO: Run screener logic
      console.log('Running screener...')
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (e) {
      console.error('Screener failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Top 3</Text>
          {lastUpdated && (
            <Text style={styles.timestamp}>Updated {lastUpdated}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
          style={styles.refreshBtn}
        >
          {loading ? (
            <ActivityIndicator color="#2E7D32" />
          ) : (
            <Ionicons name="refresh" size={24} color="#2E7D32" />
          )}
        </TouchableOpacity>
      </View>

      {alerts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>No alerts yet</Text>
          <Text style={styles.emptySubtext}>Tap refresh to run screener</Text>
        </View>
      )}

      {alerts.map((alert: any, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.alertCard}
          onPress={() => navigation.navigate('DetailView', { symbol: alert.symbol })}
        >
          <View style={styles.alertHeader}>
            <Text style={styles.rank}>#{alert.rank}</Text>
            <Text style={styles.symbol}>{alert.symbol}</Text>
          </View>
          <View style={styles.alertMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Entry</Text>
              <Text style={styles.metricValue}>₹{alert.entry_price}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Target</Text>
              <Text style={styles.metricValue}>₹{alert.target}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>SL</Text>
              <Text style={styles.metricValue}>₹{alert.sl}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Stage</Text>
              <Text style={styles.metricValue}>{alert.base_stage}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  refreshBtn: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  alertCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginRight: 8,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  alertMetrics: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
})
