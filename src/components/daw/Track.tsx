import React from 'react'
import { Note, Octave, Synth, utils } from 'zer0'

import { ChannelWithOptions } from './ChannelList'
import { Bar, BarData } from './Bar'

import { generateBar, Position } from '../../utils/general'

import styles from './Track.module.scss'

export interface TrackOptions {
  title: string
  id: string
  registerStep: (stepFunc: () => void) => void
  registerReset: (resetFunc: () => void) => void

  unregisterStep: () => void
  unregisterReset: () => void
}

// FIXME: Make this a context or sumfin
const scale: Note[] = utils.getScaleInKey('major', 'F')
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
  index, // FIXME: This is a hacky solution, refactor this
}: {
  options: TrackOptions
  channels: ChannelWithOptions[]
  synths: Synth[]
  index: number
}): JSX.Element {
  const polyphony: number = synths[index].getPolyphony()

  const [bars, setBars] = React.useState<BarData[]>(() =>
    new Array(4)
      .fill(null)
      .map((): BarData => generateBar(frequencies, 4, polyphony)),
  )

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
        synths[index].playNote(
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
  }, [bars, position, synths, index])

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
        <h3 className={styles.title}>{options.title}</h3>

        <div className={styles['controls']}>
          <label>
            Synth
            <select name={`${options.id}-synth`} autoComplete="off">
              {synths.map(
                (synth: Synth): JSX.Element => (
                  <option key={synth.id} value={synth.name}>
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
