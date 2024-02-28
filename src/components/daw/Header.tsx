import React from 'react'
import { Link } from 'react-router-dom'
import {
  CiFloppyDisk,
  CiFolderOn,
  CiPlay1,
  CiSettings,
  CiSquarePlus,
  CiStop1,
  CiUndo,
} from 'react-icons/ci'

import { TapBpm } from './TapBpm'
import { TrackInfo } from './SharedTypes'

import { Project, ProjectContext } from '../../contexts'

import styles from './Header.module.scss'

export function Header({
  trackInfo,
  playing,
  setPlaying,
  actions,
}: {
  trackInfo: TrackInfo
  playing: boolean
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>
  actions: {
    new: () => void
    open: () => void
    save: () => void
    settings: () => void
  }
}): JSX.Element {
  const project: Project = React.useContext(ProjectContext)

  const reset = React.useCallback(
    (): void =>
      Object.values(trackInfo.registeredResets).forEach(
        (subReset: () => void): void => subReset(),
      ),
    [trackInfo.registeredResets],
  )

  const registerTapBpmStep = React.useCallback(
    (step: () => void): void => {
      trackInfo.registeredSteps.TAP_BPM_STEP = step
    },
    [trackInfo.registeredSteps],
  )

  const unregisterTapBpmStep = React.useCallback((): void => {
    delete trackInfo.registeredSteps.TAP_BPM_STEP
  }, [trackInfo.registeredSteps])

  const onProjectNameChangeTimeout = React.useRef<number | null>(null)
  const onProjectNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (onProjectNameChangeTimeout.current) {
      clearTimeout(onProjectNameChangeTimeout.current)
      onProjectNameChangeTimeout.current = null
    }

    onProjectNameChangeTimeout.current = setTimeout(
      (): void =>
        project.setProject(
          (prevProject: Project): Project => ({
            ...prevProject,
            name: event.target.value,
          }),
        ),
      250,
    )
  }

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        <Link to="/">ゼロ</Link>
      </h1>
      {/* <h1 className={styles.title}>ZER0</h1> */}
      {/* ブルーグリーン - ゼロ */}

      <input
        className={styles['project-title']}
        type="text"
        defaultValue={project.name}
        onChange={onProjectNameChange}
        placeholder="Set a project title"
        name="Project Title"
      />

      <div className={styles['project-controls']}>
        <button
          className={styles['project-control-save']}
          title="Save"
          onClick={actions.save}
        >
          <CiFloppyDisk />
        </button>

        <button
          className={styles['project-control-open']}
          title="Open"
          onClick={actions.open}
        >
          <CiFolderOn />
        </button>

        <button
          className={styles['project-control-new']}
          title="New"
          onClick={actions.new}
        >
          <CiSquarePlus />
        </button>
      </div>

      <div className={styles.spacer} />

      <button
        onClick={(): void =>
          setPlaying((prevPlaying: boolean): boolean => !prevPlaying)
        }
        className={playing ? styles.stop : styles.play}
      >
        {playing ? <CiStop1 /> : <CiPlay1 />}
      </button>
      <button onClick={reset} className={styles.reset}>
        <CiUndo />
      </button>
      <label className={styles['bpm-wrapper']}>
        <span className={styles['bpm-text']}>BPM</span>
        <input
          type="number"
          min={1}
          name="BPM"
          className={styles.bpm}
          autoComplete="off"
          value={project.bpm}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
            const newBPM: number = event.target.valueAsNumber

            if (!isNaN(newBPM) && newBPM > 0) {
              project.setProject(
                (prevProject: Project): Project => ({
                  ...prevProject,
                  bpm: newBPM,
                }),
              )
            }
          }}
        />
      </label>

      <TapBpm
        registerStep={registerTapBpmStep}
        unregisterStep={unregisterTapBpmStep}
        onTapped={(bpm: number): void => {
          project.setProject(
            (prevProject: Project): Project => ({
              ...prevProject,
              bpm: Math.round(bpm),
            }),
          )
        }}
      />

      <div className={styles.spacer} />
      <div className={styles.spacer} />

      <input
        type="range"
        min={0}
        max={1000}
        title="Gain"
        autoComplete="off"
        // defaultValue={audioRef.current.gain.gain.value * 1000}
        // onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
        //   audioRef.current.gain.gain.value = event.target.valueAsNumber / 1000
        // }}
        style={{ visibility: 'hidden' }}
      />

      <div className={styles['project-controls']}>
        <button
          className={styles['project-control-settings']}
          title="Settings"
          onClick={actions.settings}
        >
          <CiSettings />
        </button>
      </div>
    </div>
  )
}
