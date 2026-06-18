import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'

import HomeScreen from '../screens/HomeScreen'
import ScreenerScreen from '../screens/ScreenerScreen'
import BacktestScreen from '../screens/BacktestScreen'
import HistoryScreen from '../screens/HistoryScreen'
import SettingsScreen from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons: { [key: string]: string } = {
              Home: focused ? 'home' : 'home-outline',
              Screener: focused ? 'search' : 'search-outline',
              Backtest: focused ? 'calendar' : 'calendar-outline',
              History: focused ? 'time' : 'time-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            }
            return <Ionicons name={icons[route.name] || 'help'} size={size} color={color} />
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#999',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Screener" component={ScreenerScreen} />
        <Tab.Screen name="Backtest" component={BacktestScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
