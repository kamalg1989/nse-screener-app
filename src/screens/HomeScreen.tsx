import React, { useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, PanResponder, Dimensions } from 'react-native'
import { useHomeScreenData } from '../hooks/useHomeScreenData'
import StockCard from '../components/StockCard'
import StockDetailModal from '../components/StockDetailModal'
import { Alert } from '../screener/screener'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  lastUpdated: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  summaryBox: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  summaryText: { fontSize: 14, color: '#1e3a8a', fontWeight: '600' },
  carouselContainer: { marginBottom: 16 },
  carouselTrack: { flexDirection: 'row' },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#3b82f6' },
  buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 20 },
  button: { flex: 1, backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
})

export default function HomeScreen() {
  const { backtest, loading, lastUpdated, manualRefresh } = useHomeScreenData()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleCardPress = (alert: Alert) => {
    setSelectedAlert(alert)
    setModalVisible(true)
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      const newIndex = currentCardIndex - 1
      setCurrentCardIndex(newIndex)
      scrollViewRef.current?.scrollTo({ x: newIndex * (Dimensions.get('window').width - 32 + 32), animated: true })
    }
  }

  const handleNextCard = () => {
    if (backtest && currentCardIndex < backtest.top3.length - 1) {
      const newIndex = currentCardIndex + 1
      setCurrentCardIndex(newIndex)
      scrollViewRef.current?.scrollTo({ x: newIndex * (Dimensions.get('window').width - 32 + 32), animated: true })
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 NSE Swing Screener</Text>
        <Text style={styles.lastUpdated}>Last Updated: {lastUpdated || 'Loading...'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 8, color: '#6b7280' }}>Running screener...</Text>
        </View>
      ) : backtest && backtest.top3.length > 0 ? (
        <>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>⭐ {backtest.top3.length} alerts | 📈 {backtest.candidatesCount} candidates</Text>
          </View>

          {/* Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const contentOffsetX = event.nativeEvent.contentOffset.x
                const newIndex = Math.round(contentOffsetX / (Dimensions.get('window').width - 32 + 32))
                setCurrentCardIndex(newIndex)
              }}
              style={styles.carouselTrack}
            >
              {backtest.top3.map((alert, idx) => (
                <View key={`card-${idx}`} style={{ width: Dimensions.get('window').width - 32 + 32 }}>
                  <StockCard alert={alert} onPress={() => handleCardPress(alert)} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {backtest.top3.map((_, idx) => (
              <View key={`dot-${idx}`} style={[styles.dot, idx === currentCardIndex && styles.dotActive]} />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handlePrevCard} disabled={currentCardIndex === 0} style={[styles.button, currentCardIndex === 0 && { opacity: 0.5 }]}>
              <Text style={styles.buttonText}>← Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextCard} disabled={currentCardIndex === backtest.top3.length - 1} style={[styles.button, currentCardIndex === backtest.top3.length - 1 && { opacity: 0.5 }]}>
              <Text style={styles.buttonText}>Next →</Text>
            </TouchableOpacity>
          </View>

          {/* Refresh button */}
          <TouchableOpacity onPress={manualRefresh} style={[styles.button, { marginHorizontal: 16, marginBottom: 20 }]}>
            <Text style={styles.buttonText}>🔄 Manual Refresh</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No alerts found</Text>
          <TouchableOpacity onPress={manualRefresh} style={[styles.button, { marginHorizontal: 16, marginTop: 16 }]}>
            <Text style={styles.buttonText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Detail Modal */}
      {selectedAlert && (
        <StockDetailModal
          alert={selectedAlert}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </ScrollView>
  )
}
