import React from 'react'
import { Note, Octave, Synth, utils } from 'zer0'

import { ChannelWithOptions } from './ChannelList'
import { Bar, BarData } from './Bar'

import { generateBar, Position } from '../../utils/general'

import styles from './Track.module.scss'
import { Project, ProjectTrack, ProjectContext } from '../../contexts'

export interface TrackOptions {
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

// FIXME: Make this a context or sumfin
const scale: Note[] = utils.getScaleInKey('minor', 'G')
const frequencies: number[] = utils
  .createNoteTable(2, 4, utils.frequencyRoots.magic)
  .map((octave: Octave): number[] =>
    scale.map((note: Note): number => octave[note]),
  )
  .flat()
  .sort((a: number, b: number): number => a - b)

export function Track({
  options,
  channels,
  synths,
}: {
  options: TrackOptions
  channels: ChannelWithOptions[]
  synths: Synth[]
}): JSX.Element {
  const project = React.useContext(ProjectContext)

  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<Project>> } = project

  const [synth, setSynth] = React.useState<Synth>(() => {
    return (
      synths.find((synth) => synth.id === options.defaultSynthId) ?? synths[0]
    )
  })

  const polyphony: number = synth.getPolyphony()

  const [bars, setBars] = React.useState<BarData[]>((): BarData[] => {
    const savedTrack: ProjectTrack | undefined = project.tracks.find(
      (track) => track.id === options.id,
    )

    return savedTrack
      ? savedTrack.bars
      : new Array<number>(4)
          .fill(0)
          .map((): BarData => generateBar(frequencies, 4, polyphony))
  })

  React.useEffect((): void => {
    // TODO: Defer this
    setProject((prevProject) => {
      const tracks: ProjectTrack[] = prevProject.tracks.map((track) => ({
        ...track,
      }))
      const prevTrackIndex: number = tracks.findIndex(
        (track) => track.id === options.id,
      )

      const updatedTrack: ProjectTrack = {
        id: options.id,
        name: options.title,
        channelId: 'FIXME: Impleeeee',
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
      if (notes[0][i] > -1 && notes[0][i] < frequencies.length) {
        synth.playNote(
          frequencies[notes[0][i]],
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
  }, [bars, position, synth])

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

                setProject((prevProject) => {
                  const tracks: ProjectTrack[] = prevProject.tracks.map(
                    (track) => ({
                      ...track,
                    }),
                  )
                  const prevTrackIndex: number = tracks.findIndex(
                    (track) => track.id === options.id,
                  )

                  const updatedTrack: ProjectTrack = {
                    id: options.id,
                    name: options.title,
                    channelId: 'FIXME: Impleeeee',
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
            Channel
            <select name={`${options.id}-channel`} autoComplete="off">
              {channels.map(
                (channel: ChannelWithOptions): JSX.Element => (
                  <option key={channel.id} value={channel.name}>
                    {channel.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Bars
            <input
              type="number"
              defaultValue={4}
              min={1}
              name={`${options.id}-bars`}
              autoComplete="off"
              className={styles['number-input']}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                const barCount: number = parseInt(event.target.value ?? 0)

                if (barCount > bars.length) {
                  setBars((prevBars: BarData[]): BarData[] => [
                    ...prevBars,
                    ...new Array(barCount - bars.length)
                      .fill(null)
                      .map(
                        (): BarData => generateBar(frequencies, 4, polyphony),
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
            frequencies={frequencies}
            position={position}
            polyphony={polyphony}
            key={barIndex}
          />
        ),
      )}
    </div>
  )
}
