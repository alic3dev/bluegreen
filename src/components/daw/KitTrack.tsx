import type {
  ProjectKitTrack,
  ProjectTrack,
  Project,
} from '../../utils/project'
import type { Position } from '../../utils/general'

import type { BarData } from './Bar'
import type { ChannelWithOptions } from './ChannelList'

import React from 'react'
import { Sample, SampleKit } from 'zer0'

import { Bar } from './Bar'

import { generateBar, generateBeat } from '../../utils/general'

export interface KitTrackOptions {
  title: string
  id: string

  defaultKitId?: string
  defaultChannelId?: string

  registerStep: (stepFunc: () => void) => void
  registerReset: (resetFunc: () => void) => void

  unregisterStep: () => void
  unregisterReset: () => void

  remove: () => void
}

export interface KitTrackProps {
  project: Project
  options: KitTrackOptions
  channels: ChannelWithOptions[]
  kits: SampleKit[]
}

import trackStyles from './Track.module.scss'

export function KitTrack({
  project,
  options,
  channels,
  kits,
}: KitTrackProps): JSX.Element {
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<Project>> } = project

  const [kit, setKit] = React.useState<SampleKit>(
    (): SampleKit =>
      kits.find((kit: SampleKit): boolean => kit.id === options.defaultKitId) ??
      kits[kits.length - 1],
  )

  const samples = React.useMemo<[string, Sample][]>(
    (): [string, Sample][] =>
      Object.keys(kit.samples).map((sampleKey: string): [string, Sample] => [
        sampleKey,
        kit.samples[sampleKey],
      ]),
    [kit],
  )

  const [bars, setBars] = React.useState<BarData[]>((): BarData[] => {
    const savedTrack: ProjectKitTrack | undefined = project.tracks.find(
      (track: ProjectTrack): boolean => track.id === options.id,
    ) as ProjectKitTrack

    return savedTrack
      ? savedTrack.bars
      : new Array<null>(4)
          .fill(null)
          .map((): BarData => generateBar([0, 1], 4, samples.length))
          .map(
            (bar: BarData): BarData => ({
              ...bar,
              notes: bar.notes.map((beat) =>
                beat.map((note) => note.map(() => -1)),
              ),
            }),
          )
  })

  React.useEffect((): void => {
    // TODO: Defer this
    setProject((prevProject: Project): Project => {
      const tracks: ProjectTrack[] = prevProject.tracks.map(
        (track: ProjectTrack): ProjectTrack => ({
          ...track,
        }),
      )
      const prevTrackIndex: number = tracks.findIndex(
        (track) => track.id === options.id,
      )

      const updatedTrack: ProjectKitTrack = {
        id: options.id,
        name: options.title,
        channelId: 'FIXME: Impleeeee',
        kitId: kit.id,
        bars,
      }

      if (prevTrackIndex === -1) {
        tracks.push(updatedTrack)
      } else {
        tracks[prevTrackIndex] = updatedTrack
      }

      return { ...prevProject, tracks }
    })
  }, [setProject, bars, options.id, options.title, kit])

  const [position, setPosition] = React.useState<Position>({
    bar: 0,
    beat: 0,
    repeated: 0,
  })

  const step = React.useCallback((): void => {
    const notes: number[][] = bars[position.bar].notes[position.beat]

    for (let p: number = 0; p < notes.length; p++) {
      for (let i: number = 0; i < notes[p].length; i++) {
        if (notes[p][i] > -1 && notes[p][i] < samples.length) {
          kit.play((60 / project.bpm) * (i / notes[p].length), {
            name: samples[p][0],
            gain: notes[p][i],
          })
        }
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
  }, [bars, position, kit, samples, project.bpm])

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
    <div className={trackStyles.track}>
      <div className={trackStyles.info}>
        <div className={trackStyles.title}>
          <h3>{options.title}</h3>
          <button onClick={options.remove} title="Remove">
            -
          </button>
        </div>

        <div className={trackStyles['controls']}>
          <label>
            Kit
            <select
              name={`${options.id}-kit`}
              autoComplete="off"
              value={kit.id}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                const newKit: SampleKit =
                  kits.find((kit) => kit.id === event.target.value) ?? kits[0]

                if (newKit === kit) return

                setKit(newKit)

                setProject((prevProject: Project): Project => {
                  const tracks: ProjectTrack[] = prevProject.tracks.map(
                    (track: ProjectTrack): ProjectTrack => ({
                      ...track,
                    }),
                  )
                  const prevTrackIndex: number = tracks.findIndex(
                    (track) => track.id === options.id,
                  )

                  const updatedTrack: ProjectKitTrack = {
                    id: options.id,
                    name: options.title,
                    channelId: 'FIXME: Impleeeee',
                    kitId: newKit.id,
                    bars: tracks[prevTrackIndex].bars,
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
              {kits.map(
                (kit: SampleKit): JSX.Element => (
                  <option key={kit.id} value={kit.id}>
                    {kit.name}
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
              defaultValue={bars.length}
              min={1}
              name={`${options.id}-bars`}
              autoComplete="off"
              className={trackStyles['number-input']}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                const barCount: number = parseInt(event.target.value ?? 0)
                if (barCount > bars.length) {
                  setBars((prevBars: BarData[]): BarData[] => [
                    ...prevBars,
                    ...new Array(barCount - bars.length)
                      .fill(null)
                      .map((): BarData => generateBar([0], 4, samples.length)),
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
            frequencies={[0, 1]}
            position={position}
            polyphony={samples.length}
            key={barIndex}
            generateBeat={(_: number[], polyphony?: number) =>
              generateBeat([0], polyphony)
            }
          />
        ),
      )}
    </div>
  )
}
