import type { Settings, ProvidedSettings } from '../../contexts'
import type { Project } from '../../utils/project'

import React from 'react'

import { Interface } from '../daw'
import { RequestAudio } from '../RequestAudio'

import { defaultSettings, SettingsContext } from '../../contexts'

import { defaultProject } from '../../utils/project'

import {
  LOCAL_STORAGE_KEY_SETTINGS,
  LOCAL_STORAGE_KEY_SELECTED_PROJECT,
  LOCAL_STORAGE_KEY_PROJECT_PREFIX,
} from '../../utils/constants'
import { canCreateAudioContext } from '../../utils/canCreateAudioContext'

function Zer0Daw(): JSX.Element {
  const [_project, setProject] = React.useState<Project>((): Project => {
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

  const project = React.useMemo<Project>(
    () => ({ ..._project, setProject }),
    [_project],
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

  React.useEffect((): void => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEY_SETTINGS,
      JSON.stringify(settings),
    )

    const savedSettings = window.localStorage.getItem(
      LOCAL_STORAGE_KEY_SETTINGS,
    )

    if (!savedSettings) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify({ autoSave: settings.autoSave }),
      )

      return
    }

    try {
      const parsedSettings: Partial<Settings> = JSON.parse(savedSettings)

      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify({ ...parsedSettings, autoSave: settings.autoSave }),
      )
    } catch {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SETTINGS,
        JSON.stringify({ autoSave: settings.autoSave }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoSave])

  React.useEffect((): void => {
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
    <SettingsContext.Provider value={settingsProviderValue}>
      <Interface project={project} />
    </SettingsContext.Provider>
  )
}

export function Zer0App(): JSX.Element {
  const [_canCreateAudioContext, setCanCreateAudioContext] =
    React.useState<boolean>(canCreateAudioContext())

  return _canCreateAudioContext ? (
    <Zer0Daw />
  ) : (
    <RequestAudio setCanCreateAudioContext={setCanCreateAudioContext} />
  )
}
