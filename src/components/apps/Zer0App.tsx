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

export function Zer0App(): JSX.Element {
  const [project, setProject] = React.useState<Project>((): Project => {
    const savedProjectId = window.localStorage.getItem('ゼローProject')

    if (savedProjectId) {
      const savedProject = window.localStorage.getItem(
        `ゼローProject：${savedProjectId}`,
      )

      if (savedProject) {
        try {
          return JSON.parse(savedProject)
        } catch {
          window.localStorage.removeItem(`ゼローProject`)
          // TODO: May not want to remove this, could be recovered if corrupted
          window.localStorage.removeItem(`ゼローProject：${savedProjectId}`)
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
    const savedSettings = window.localStorage.getItem('ゼローSettings')

    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch {
        window.localStorage.removeItem('ゼローSettings')
      }
    }

    return defaultSettings
  })

  const settingsProviderValue = React.useMemo<Settings>(
    () => ({ ...settings, setSettings }),
    [settings],
  )

  React.useEffect(() => {
    if (settings.autoSave) {
      window.localStorage.setItem('ゼローSettings', JSON.stringify(settings))
    }
  }, [settings])

  React.useEffect(() => {
    if (settings.autoSave) {
      window.localStorage.setItem(`ゼローProject`, project.id)
      window.localStorage.setItem(
        `ゼローProject：${project.id}`,
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
