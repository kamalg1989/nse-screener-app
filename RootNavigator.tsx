// app/navigation/RootNavigator.tsx

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import Ionicons from '@react-native-vector-icons/ionicons'

import HomeScreen from '../screens/HomeScreen'
import ScreenerScreen from '../screens/ScreenerScreen'
import BacktestScreen from '../screens/BacktestScreen'
import HistoryScreen from '../screens/HistoryScreen'
import SettingsScreen from '../screens/SettingsScreen'
import DetailView from '../screens/DetailView'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          title: 'Today\'s Alerts',
        }}
      />
      <Stack.Screen
        name="DetailView"
        component={DetailView}
        options={{
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  )
}

function ScreenerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ScreenerMain"
        component={ScreenerScreen}
        options={{
          title: 'Screener',
        }}
      />
      <Stack.Screen
        name="DetailView"
        component={DetailView}
        options={{
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  )
}

function BacktestStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="BacktestMain"
        component={BacktestScreen}
        options={{
          title: 'Backtest',
        }}
      />
      <Stack.Screen
        name="DetailView"
        component={DetailView}
        options={{
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  )
}

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{
          title: 'Alert History',
        }}
      />
      <Stack.Screen
        name="DetailView"
        component={DetailView}
        options={{
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  )
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  )
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline'
            } else if (route.name === 'Screener') {
              iconName = focused ? 'search' : 'search-outline'
            } else if (route.name === 'Backtest') {
              iconName = focused ? 'calendar' : 'calendar-outline'
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline'
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline'
            } else {
              iconName = 'help'
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="Screener"
          component={ScreenerStack}
          options={{ title: 'Screener' }}
        />
        <Tab.Screen
          name="Backtest"
          component={BacktestStack}
          options={{ title: 'Backtest' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStack}
          options={{ title: 'History' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
