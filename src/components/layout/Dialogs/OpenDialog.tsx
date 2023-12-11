import React from 'react'
import { CiMenuKebab, CiSquareChevRight } from 'react-icons/ci'

import { Project, ProjectContext } from '../../../contexts'

import { ConfirmDialog, Dialog, DialogHeader, DialogFooter } from '.'

import styles from './OpenDialog.module.scss'

export function OpenDialog({
  close,
  addDialog,
}: {
  close: (closeBase: boolean, ...dialogs: JSX.Element[]) => void
  addDialog: (dialog: JSX.Element) => void
}): JSX.Element {
  const project = React.useContext(ProjectContext)

  const savedProjectKeys: string[] = []

  for (let i: number = 0; i < window.localStorage.length; i++) {
    const currentLocalStorageKey: string | null = window.localStorage.key(i)

    if (
      currentLocalStorageKey &&
      currentLocalStorageKey.startsWith('ゼローProject：')
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

  const onOpenProject = (savedProject: Project) => {
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

  return (
    <Dialog key={crypto.randomUUID()}>
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
              onClick={() => alert('TODO: Implement project options')}
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
