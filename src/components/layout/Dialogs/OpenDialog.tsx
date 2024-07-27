import type { Project } from '../../../utils/project'

import React from 'react'
import { CiMenuKebab, CiSquareChevRight } from 'react-icons/ci'
import { SampleKit, Synth } from 'zer0'

import {
  LOCAL_STORAGE_KEY_PROJECT_CHANNELS_PREFIX,
  LOCAL_STORAGE_KEY_PROJECT_PREFIX,
  LOCAL_STORAGE_KEY_SELECTED_PROJECT,
} from '../../../utils/constants'

import { ConfirmDialog, Dialog, DialogHeader, DialogFooter } from '.'

import styles from './OpenDialog.module.scss'

export function OpenDialog({
  project,
  close,
  addDialog,
}: {
  project: Project
  close: (closeBase: boolean, ...dialogs: JSX.Element[]) => void
  addDialog: (dialog: JSX.Element) => void
}): JSX.Element {
  const [dialogKey] = React.useState<string>((): string => crypto.randomUUID())

  const savedProjectKeys: string[] = []

  for (let i: number = 0; i < window.localStorage.length; i++) {
    const currentLocalStorageKey: string | null = window.localStorage.key(i)

    if (
      currentLocalStorageKey &&
      currentLocalStorageKey.startsWith(LOCAL_STORAGE_KEY_PROJECT_PREFIX)
    ) {
      savedProjectKeys.push(currentLocalStorageKey)
    }
  }

  const savedProjects: Project[] = savedProjectKeys
    .map((projectId: string): Project | null => {
      const savedProjectString: string =
        window.localStorage.getItem(projectId) ?? ''

      if (!savedProjectString) return null

      try {
        return JSON.parse(savedProjectString)
      } catch {
        return null
      }
    })
    .filter(
      (savedProject: Project | null): boolean => !!savedProject,
    ) as Project[]

  const onOpenProject = (savedProject: Project): void => {
    const confirmOpenDialog: JSX.Element = (
      <ConfirmDialog
        key={crypto.randomUUID()}
        title={`Open ${savedProject.name}`}
        onCancel={(): void => close(false, confirmOpenDialog)}
        onConfirm={(): void => {
          close(true, confirmOpenDialog)

          // TODO: ('Implement this! :)  In a better way... NO RELOADS!!!')

          project.setProject(savedProject)
          window.location.reload()
        }}
      >
        <p>Are you sure you want to open {savedProject.name}</p>
        <p className="small">
          (All unsaved changes to the current project will be lost.)
        </p>
      </ConfirmDialog>
    )

    addDialog(confirmOpenDialog)
  }

  const onDeleteProject = (savedProject: Project): void => {
    const confirmDeleteDialog: JSX.Element = (
      <ConfirmDialog
        key={crypto.randomUUID()}
        title={`Delete ${savedProject.name}`}
        onCancel={(): void => close(false, confirmDeleteDialog)}
        onConfirm={(): void => {
          const currentProjectKey: string = `${LOCAL_STORAGE_KEY_PROJECT_PREFIX}${savedProject.id}`

          const localStorageKeys: Record<
            'project' | 'synth' | 'sampleKit' | 'channel',
            string[]
          > = {
            project: [],
            synth: [],
            sampleKit: [],
            channel: [],
          }

          const projects: string[] = []

          for (let i: number = 0; i < window.localStorage.length; i++) {
            const key: string | null = window.localStorage.key(i)

            if (!key) continue

            if (key.startsWith(Synth.localStorageKeyPrefix)) {
              localStorageKeys.synth.push(
                key.substring(Synth.localStorageKeyPrefix.length),
              )
            } else if (key.startsWith(SampleKit.localStorageKeyPrefix)) {
              localStorageKeys.sampleKit.push(
                key.substring(SampleKit.localStorageKeyPrefix.length),
              )
            } else if (
              key !== currentProjectKey &&
              key.startsWith(LOCAL_STORAGE_KEY_PROJECT_PREFIX)
            ) {
              localStorageKeys.project.push(
                key.substring(LOCAL_STORAGE_KEY_PROJECT_PREFIX.length),
              )

              const storedProject: string | null =
                window.localStorage.getItem(key)

              if (storedProject) {
                projects.push(storedProject)
              }
            }
          }

          for (const synthKey of localStorageKeys.synth) {
            if (
              !projects.find((projectString: string): boolean =>
                projectString.includes(synthKey),
              )
            ) {
              window.localStorage.removeItem(
                `${Synth.localStorageKeyPrefix}${synthKey}`,
              )
            }
          }

          for (const sampleKitKey of localStorageKeys.sampleKit) {
            if (
              !projects.find((projectString: string): boolean =>
                projectString.includes(sampleKitKey),
              )
            ) {
              window.localStorage.removeItem(
                `${SampleKit.localStorageKeyPrefix}${sampleKitKey}`,
              )
            }
          }

          window.localStorage.removeItem(currentProjectKey)
          window.localStorage.removeItem(
            `${LOCAL_STORAGE_KEY_PROJECT_CHANNELS_PREFIX}${savedProject.id}`,
          )

          if (savedProject.id === project.id) {
            if (localStorageKeys.project.length) {
              window.localStorage.setItem(
                LOCAL_STORAGE_KEY_SELECTED_PROJECT,
                localStorageKeys.project[0],
              )
            } else {
              window.localStorage.removeItem(LOCAL_STORAGE_KEY_SELECTED_PROJECT)
            }
          }

          // TODO: ('Implement this! :)  In a better way... NO RELOADS!!!')

          close(true, confirmDeleteDialog)
          window.location.reload()
        }}
      >
        <p>Are you sure you want to delete {savedProject.name}</p>
        <p className="small">
          (You will no longer be able to access or recover this project.)
        </p>
      </ConfirmDialog>
    )

    addDialog(confirmDeleteDialog)
  }

  const onProjectOptions = (savedProject: Project): void => {
    const projectOptionsDialog: JSX.Element = (
      <Dialog key={crypto.randomUUID()}>
        <DialogHeader>Project Options: {savedProject.id}</DialogHeader>
        <button onClick={() => alert('TODO: Not implemented')}>Rename</button>
        <button onClick={() => onDeleteProject(savedProject)}>Delete</button>
        <DialogFooter>
          <button onClick={() => close(false, projectOptionsDialog)} autoFocus>
            Cancel
          </button>
        </DialogFooter>
      </Dialog>
    )

    addDialog(projectOptionsDialog)
  }

  return (
    <Dialog key={dialogKey}>
      <DialogHeader>Open a project</DialogHeader>
      {savedProjects.map(
        (savedProject: Project): JSX.Element => (
          <div key={savedProject.id} className={styles['dialog-open-project']}>
            <div className={styles['dialog-open-project-title']}>
              {project.id === savedProject.id ? (
                <div className={styles['dialog-open-icon']} title="Current">
                  <CiSquareChevRight />
                </div>
              ) : (
                <div className={styles['dialog-open-icon']} />
              )}
              <button
                className={styles['dialog-open-name']}
                onClick={(): void => onOpenProject(savedProject)}
              >
                {savedProject.name}
              </button>
            </div>
            <button
              className={styles['dialog-open-project-button-menu']}
              onClick={(): void => onProjectOptions(savedProject)}
            >
              <CiMenuKebab />
            </button>
          </div>
        ),
      )}
      <DialogFooter>
        <button onClick={() => close(true)} autoFocus>
          Cancel
        </button>
      </DialogFooter>
    </Dialog>
  )
}
