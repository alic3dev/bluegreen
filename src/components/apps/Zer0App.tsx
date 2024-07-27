import type { Note, Octave } from 'zer0'

import type { Settings, ProvidedSettings } from '../../contexts'
import type { BaseProject, Project } from '../../utils/project'

import React from 'react'
import { utils } from 'zer0'

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
  const [_project, setProject] = React.useState<BaseProject>(
    (): BaseProject => {
      const savedProjectId = window.localStorage.getItem(
        LOCAL_STORAGE_KEY_SELECTED_PROJECT,
      )

      if (savedProjectId) {
        const savedProject = window.localStorage.getItem(
          `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${savedProjectId}`,
        )

        if (savedProject) {
          try {
            return {
              ...defaultProject,
              ...JSON.parse(savedProject),
            }
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
    },
  )

  const project = React.useMemo<Project>(() => {
    const scaleNotes: Note[] = utils.getScaleInKey(
      _project.scale,
      _project.scaleKey,
    )

    const frequencyRootValue: number =
      utils.frequencyRoots[_project.frequencyRoot]

    const frequencies: number[] = utils
      .createNoteTable(0, 10, frequencyRootValue)
      .map((octave: Octave): number[] =>
        scaleNotes.map((note: Note): number => octave[note]),
      )
      .flat()
      .sort((a: number, b: number): number => a - b)

    return {
      ..._project,
      setProject,
      scaleNotes,
      frequencies,
      frequencyRootValue,
    }
  }, [_project])

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

  React.useEffect((): void => {
    if (settings.autoSave) {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_SELECTED_PROJECT,
        _project.id,
      )

      window.localStorage.setItem(
        `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${_project.id}`,
        JSON.stringify(_project),
      )
    }
  }, [settings.autoSave, _project])

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
