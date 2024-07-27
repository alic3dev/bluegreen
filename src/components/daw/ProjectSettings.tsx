import type { Note, ScaleName } from 'zer0'

import type { BaseProject, Project } from '../../utils/project'

import React from 'react'
import { utils } from 'zer0'

import styles from './ProjectSettings.module.scss'
import { FrequencyRootName } from 'zer0/src/utils'

export function ProjectSettings({
  project,
}: {
  project: Project
}): React.ReactNode {
  return (
    <div>
      <h5 className={styles.name}>{project.name}</h5>

      <div className={styles['tabbed-content']}>
        <div className={styles['tabbed-controls']}>
          <label>
            Frequency Root{' '}
            <select
              defaultValue={project.frequencyRoot}
              name="project-scale-key"
              onChange={(event: React.FormEvent<HTMLSelectElement>): void => {
                const frequencyRoot: FrequencyRootName = event.currentTarget
                  .value as FrequencyRootName

                project.setProject(
                  (prevProject: BaseProject): BaseProject => ({
                    ...prevProject,
                    frequencyRoot,
                  }),
                )
              }}
            >
              {utils.frequencyRootNames.map(
                (frequencyRoot: FrequencyRootName): React.ReactNode => (
                  <option value={frequencyRoot} key={frequencyRoot}>
                    {frequencyRoot}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Scale{' '}
            <select
              defaultValue={project.scale}
              name="project-scale"
              onChange={(event: React.FormEvent<HTMLSelectElement>): void => {
                const scale: ScaleName = event.currentTarget.value as ScaleName

                project.setProject(
                  (prevProject: BaseProject): BaseProject => ({
                    ...prevProject,
                    scale,
                  }),
                )
              }}
            >
              {utils.scaleNames.map(
                (scaleName: ScaleName): React.ReactNode => (
                  <option value={scaleName} key={scaleName}>
                    {scaleName}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Scale Key{' '}
            <select
              defaultValue={project.scaleKey}
              name="project-scale-key"
              onChange={(event: React.FormEvent<HTMLSelectElement>): void => {
                const scaleKey: Note = event.currentTarget.value as Note

                project.setProject(
                  (prevProject: BaseProject): BaseProject => ({
                    ...prevProject,
                    scaleKey,
                  }),
                )
              }}
            >
              {utils.notes.map(
                (note: Note): React.ReactNode => (
                  <option value={note} key={note}>
                    {note}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}
