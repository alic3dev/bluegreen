import type { BarData } from './Bar'

import type {
  Project,
  ProjectTrack,
  ProjectSynthTrack,
  BaseProject,
} from '../../utils/project'
import type { Position } from '../../utils/general'

import React from 'react'
import { Synth } from 'zer0'

import { Bar } from './Bar'

import { generateBar } from '../../utils/general'

import styles from './Track.module.scss'

export interface SynthTrackOptions {
  title: string
  id: string

  defaultSynthId?: string
  defaultChannelId?: string

  registerStep: (stepFunc: () => void) => void
  registerReset: (resetFunc: () => void) => void

  unregisterStep: () => void
  unregisterReset: () => void

  remove: () => void
}

export interface SynthTrackProps {
  project: Project
  options: SynthTrackOptions
  synths: Synth[]
}

export function SynthTrack({
  project,
  options,
  synths,
}: SynthTrackProps): JSX.Element {
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<BaseProject>> } = project

  const [synth, setSynth] = React.useState<Synth>(() => {
    return (
      synths.find((synth) => synth.id === options.defaultSynthId) ??
      synths[synths.length - 1]
    )
  })

  const polyphony: number = synth.getPolyphony()

  function constrainBarData(
    bars: BarData[],
    minimumOctave: number = 2,
    octaveRange: number = 3,
  ): BarData[] {
    return bars.map((barData: BarData) => {
      return {
        notes: barData.notes.map((polyphony: number[][]): number[][] =>
          polyphony.map((notes: number[]): number[] =>
            notes.map(
              (note: number): number =>
                (note % ((project.frequencies.length / 11) * octaveRange)) +
                (project.frequencies.length / 11) * minimumOctave,
            ),
          ),
        ),
        repeat: barData.repeat,
      }
    })
  }

  const [bars, setBars] = React.useState<BarData[]>((): BarData[] => {
    const savedTrack: ProjectSynthTrack | undefined = project.tracks.find(
      (track: ProjectTrack): boolean => track.id === options.id,
    ) as ProjectSynthTrack

    return savedTrack
      ? savedTrack.bars
      : constrainBarData(
          new Array<null>(4)
            .fill(null)
            .map((): BarData => generateBar(project.frequencies, 4, polyphony)),
        )
  })

  React.useEffect((): void => {
    // TODO: Defer this
    setProject((prevProject: BaseProject): BaseProject => {
      const tracks: ProjectTrack[] = prevProject.tracks.map(
        (track: ProjectTrack): ProjectTrack => ({
          ...track,
        }),
      )
      const prevTrackIndex: number = tracks.findIndex(
        (track) => track.id === options.id,
      )

      const updatedTrack: ProjectSynthTrack = {
        id: options.id,
        name: options.title,
        synthId: synth.id,
        bars,
      }

      if (prevTrackIndex === -1) {
        tracks.push(updatedTrack)
      } else {
        tracks[prevTrackIndex] = updatedTrack
      }

      return { ...prevProject, tracks }
    })
  }, [setProject, bars, options.id, options.title, synth])

  const [position, setPosition] = React.useState<Position>({
    bar: 0,
    beat: 0,
    repeated: 0,
  })

  const step = React.useCallback((): void => {
    const notes: number[][] = bars[position.bar].notes[position.beat]

    // FIXME: Add polyphony

    for (let i: number = 0; i < notes[0].length; i++) {
      if (notes[0][i] > -1 && notes[0][i] < project.frequencies.length) {
        synth.playNote(
          project.frequencies[notes[0][i]],
          i / notes[0].length,
          1 / notes[0].length,
        )
      }
    }

    setPosition((prevPosition: Position): Position => {
      const newPosition: Position = { ...prevPosition }

      newPosition.beat++

      if (newPosition.beat >= bars[newPosition.bar].notes.length) {
        newPosition.beat = 0
        newPosition.repeated++
      }

      if (bars[newPosition.bar].repeat !== -1) {
        if (newPosition.repeated > bars[newPosition.bar].repeat) {
          newPosition.repeated = 0
          newPosition.bar++
        }

        if (newPosition.bar >= bars.length) {
          newPosition.bar = 0
        }
      }

      return newPosition
    })
  }, [bars, position, synth, project.frequencies])

  const reset = React.useCallback(
    (): void =>
      setPosition({
        bar: 0,
        beat: 0,
        repeated: 0,
      }),
    [],
  )

  React.useEffect((): (() => void) => {
    options.registerStep(step)

    return (): void => options.unregisterStep()
  }, [options, step])

  React.useEffect((): (() => void) => {
    options.registerReset(reset)

    return (): void => options.unregisterReset()
  }, [options, reset])

  return (
    <div className={styles.track}>
      <div className={styles.info}>
        <div className={styles.title}>
          <h3>{options.title}</h3>
          <button onClick={options.remove} title="Remove">
            -
          </button>
        </div>

        <div className={styles['controls']}>
          <label>
            Synth
            <select
              name={`${options.id}-synth`}
              autoComplete="off"
              value={synth.id}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const newSynth: Synth =
                  synths.find((synth) => synth.id === event.target.value) ??
                  synths[0]

                if (newSynth === synth) return

                setSynth(newSynth)

                setProject((prevProject: BaseProject): BaseProject => {
                  const tracks: ProjectTrack[] = prevProject.tracks.map(
                    (track: ProjectTrack): ProjectTrack => ({
                      ...track,
                    }),
                  )
                  const prevTrackIndex: number = tracks.findIndex(
                    (track) => track.id === options.id,
                  )

                  const updatedTrack: ProjectSynthTrack = {
                    id: options.id,
                    name: options.title,
                    synthId: newSynth.id,
                    bars,
                  }

                  if (prevTrackIndex === -1) {
                    tracks.push(updatedTrack)
                  } else {
                    tracks[prevTrackIndex] = updatedTrack
                  }

                  return { ...prevProject, tracks }
                })
              }}
            >
              {synths.map(
                (synth: Synth): JSX.Element => (
                  <option key={synth.id} value={synth.id}>
                    {synth.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Bars
            <input
              type="number"
              defaultValue={bars.length}
              min={1}
              name={`${options.id}-bars`}
              autoComplete="off"
              className={styles['number-input']}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                const barCount: number = parseInt(event.target.value ?? 0)

                if (position.bar > barCount - 1) {
                  setPosition({
                    bar: barCount - 1,
                    beat: 0,
                    repeated: 0,
                  })
                }

                if (barCount > bars.length) {
                  setBars((prevBars: BarData[]): BarData[] => [
                    ...prevBars,
                    ...constrainBarData(
                      new Array(barCount - bars.length)
                        .fill(null)
                        .map(
                          (): BarData =>
                            generateBar(project.frequencies, 4, polyphony),
                        ),
                    ),
                  ])
                } else if (barCount < bars.length) {
                  setBars((prevBars: BarData[]): BarData[] =>
                    prevBars.slice(0, barCount),
                  )
                }
              }}
            />
          </label>
        </div>
      </div>

      {bars.map(
        (bar: BarData, barIndex: number): JSX.Element => (
          <Bar
            bar={bar}
            barIndex={barIndex}
            setBars={setBars}
            frequencies={project.frequencies}
            position={position}
            setPosition={setPosition}
            polyphony={polyphony}
            key={barIndex}
          />
        ),
      )}
    </div>
  )
}
