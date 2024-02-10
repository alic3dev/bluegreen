import React from 'react'

export interface Settings {
  autoSave: boolean
}

export interface ProvidedSettings extends Settings {
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}

export const defaultSettings: Settings = {
  autoSave: true,
}

export const defaultProvidedSettings: ProvidedSettings = {
  ...defaultSettings,
  setSettings: () => {},
}

export const SettingsContext = React.createContext<ProvidedSettings>(
  defaultProvidedSettings,
)
