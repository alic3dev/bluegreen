import React from 'react'

import { Interface } from '../daw'

import {
  defaultProject,
  Project,
  ProjectContext,
  defaultSettings,
  Settings,
  SettingsContext,
} from '../../contexts'
import { ProvidedSettings } from '../../contexts/SettingsContext'

import {
  LOCAL_STORAGE_KEY_SETTINGS,
  LOCAL_STORAGE_KEY_SELECTED_PROJECT,
  LOCAL_STORAGE_KEY_PROJECT_PREFIX,
} from '../../utils/constants'

export function Zer0App(): JSX.Element {
  const [project, setProject] = React.useState<Project>((): Project => {
    const savedProjectId = window.localStorage.getItem(
      LOCAL_STORAGE_KEY_SELECTED_PROJECT,
    )

    if (savedProjectId) {
      const savedProject = window.localStorage.getItem(
        `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${savedProjectId}`,
      )

      if (savedProject) {
        try {
          return JSON.parse(savedProject)
        } catch {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY_SELECTED_PROJECT)
          // TODO: May not want to remove this, could be recovered if corrupted
          window.localStorage.removeItem(
            `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${savedProjectId}`,
          )
        }
      }
    }

    return defaultProject
  })

  const projectProviderValue = React.useMemo<Project>(
    () => ({ ...project, setProject }),
    [project],
  )

  const [settings, setSettings] = React.useState<Settings>((): Settings => {
    const savedSettings = window.localStorage.getItem(
      LOCAL_STORAGE_KEY_SETTINGS,
    )

    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) }
      } catch {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS)
      }
    }

    return defaultSettings
  })

  const settingsProviderValue = React.useMemo<ProvidedSettings>(
    (): ProvidedSettings => ({ ...settings, setSettings }),
    [settings],
  )

  React.useEffect(() => {
    // FIXME: Doesn't save the autoSave state when you disable autoSave...
    //        Which enables autoSave on next load since it wasn't saved...
    if (settings.autoSave) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify(settings),
      )
    }
  }, [settings])

  React.useEffect(() => {
    if (settings.autoSave) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SELECTED_PROJECT,
        project.id,
      )
      window.localStorage.setItem(
        `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${project.id}`,
        JSON.stringify(project),
      )
    }
  }, [settings.autoSave, project])

  return (
    <ProjectContext.Provider value={projectProviderValue}>
      <SettingsContext.Provider value={settingsProviderValue}>
        <Interface />
      </SettingsContext.Provider>
    </ProjectContext.Provider>
  )
}
