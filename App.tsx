import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { openDatabase } from './app/db/sqlite'
import RootNavigator from './app/navigation/RootNavigator'
import { AppContext } from './app/store/appContext'
import { SettingsProvider } from './app/context/SettingsContext'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await openDatabase()
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') {
          console.warn('Notification permission denied')
        }
        setIsReady(true)
      } catch (err) {
        console.error('Bootstrap error:', err)
        setError(err instanceof Error ? err.message : 'Initialization failed')
        setIsReady(true)
      }
    }
    bootstrap()
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppContext.Provider value={{ isDarkMode, setIsDarkMode }}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {error && (
            <View style={{ backgroundColor: '#ff6b6b', padding: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 12 }}>⚠️ {error}</Text>
            </View>
          )}
          <RootNavigator />
        </AppContext.Provider>
      </SettingsProvider>
    </SafeAreaProvider>
  )
}
