import React from 'react'
import { SampleKit } from 'zer0'

import { ChannelWithOptions } from './ChannelList'
import { TrackOptions } from './Track'

import {
  ProjectKitTrack,
  ProjectTrack,
  Project,
  ProjectContext,
} from '../../contexts'

import trackStyles from './Track.module.scss'

export function KitTrack({
  options,
  channels,
  kits,
}: {
  options: TrackOptions
  channels: ChannelWithOptions[]
  kits: SampleKit[]
}): JSX.Element {
  const project = React.useContext(ProjectContext)
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<Project>> } = project

  const [kit, setKit] = React.useState<SampleKit>(() => kits[0]) // FIXME: Ya know wut

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
                    bars: [], // FIXME: <- EMPTY <-
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
              defaultValue={4}
              min={1}
              name={`${options.id}-bars`}
              autoComplete="off"
              className={trackStyles['number-input']}
              onChange={
                (/*event: React.ChangeEvent<HTMLInputElement>*/): void => {
                  // const barCount: number = parseInt(event.target.value ?? 0)
                  // if (barCount > bars.length) {
                  //   setBars((prevBars: BarData[]): BarData[] => [
                  //     ...prevBars,
                  //     ...new Array(barCount - bars.length)
                  //       .fill(null)
                  //       .map(
                  //         (): BarData => generateBar(frequencies, 4, polyphony),
                  //       ),
                  //   ])
                  // } else if (barCount < bars.length) {
                  //   setBars((prevBars: BarData[]): BarData[] =>
                  //     prevBars.slice(0, barCount),
                  //   )
                  // }
                }
              }
            />
          </label>
        </div>
      </div>

      {/* {bars.map(
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
      )} */}
    </div>
  )
}
