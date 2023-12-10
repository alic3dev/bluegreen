import React from 'react'

export interface Settings {
  autoSave: boolean

  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}

export const defaultSettings: Settings = {
  autoSave: true,

  setSettings() {},
}

export const SettingsContext = React.createContext<Settings>(defaultSettings)
