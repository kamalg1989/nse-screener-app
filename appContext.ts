// app/store/appContext.ts

import React from 'react'

export interface AppContextType {
  isDarkMode: boolean
  setIsDarkMode: (mode: boolean) => void
}

export const AppContext = React.createContext<AppContextType>({
  isDarkMode: false,
  setIsDarkMode: () => {},
})

export function useAppContext() {
  const context = React.useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider')
  }
  return context
}
