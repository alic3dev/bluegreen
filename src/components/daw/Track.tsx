import React from 'react'
import { Note, Synth, utils } from 'zer0'

import { ChannelWithOptions } from './ChannelList'

import styles from './Track.module.scss'

export interface TrackOptions {
  title: string
  id: string
  registerStep: (stepFunc: () => void) => void
  registerReset: (resetFunc: () => void) => void

  unregisterStep: () => void
  unregisterReset: () => void
}

interface Bar {
  notes: number[][]
  repeat: number
}

interface Position {
  bar: number
  beat: number
  repeated: number
}

const frequencyRoots: Record<string, number> = {
  standard: 440,
  magic: 432,
  scientific: 430.54,
}

const scale: Note[] = utils.getScaleInKey('minor', 'E')
const frequencies: number[] = utils
  .createNoteTable(2, 4, frequencyRoots.scientific)
  .map((octave) => scale.map((note) => octave[note]))
  .flat()
  .sort((a, b) => a - b)

const generateBeat = (polyphony = 2): number[] =>
  new Array<number>(polyphony)
    .fill(-1)
    .map(() => Math.floor(Math.random() * frequencies.length))

// TODO: Don't generate random - Save states?
const generateBar = (beats = 4, polyphony = 2): Bar => ({
  notes: new Array<number[]>(beats).fill([]).map(() => generateBeat(polyphony)),
  repeat: 0,
})

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
}) {
  const [polyphony] = React.useState<number>(2)

  const [bars, setBars] = React.useState<Bar[]>(() =>
    new Array(4).fill(null).map(() => generateBar(4, polyphony)),
  )

  const [position, setPosition] = React.useState<Position>({
    bar: 0,
    beat: 0,
    repeated: 0,
  })

  const step = React.useCallback(() => {
    const notes: number[] = bars[position.bar].notes[position.beat]

    // FIXME: Add polyphony

    if (notes[0] > -1 && notes[0] < frequencies.length) {
      synths[index].playNote(frequencies[notes[0]])
    }

    setPosition((prevPosition) => {
      const newPosition = { ...prevPosition }

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

  const reset = React.useCallback(() => {
    setPosition({
      bar: 0,
      beat: 0,
      repeated: 0,
    })
  }, [])

  React.useEffect(() => {
    options.registerStep(step)

    return () => options.unregisterStep()
  }, [options, step])

  React.useEffect(() => {
    options.registerReset(reset)

    return () => options.unregisterReset()
  }, [options, reset])

  return (
    <div className={styles.track}>
      <div className={styles.info}>
        <h3 className={styles.title}>{options.title}</h3>

        <div className={styles['header-controls']}>
          <label>
            Synth
            <select name={`${options.id}-synth`} autoComplete="off">
              {synths.map((synth, index) => (
                <option key={`${synth.name}-${index}`} value={synth.name}>
                  {synth.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Channel
            <select name={`${options.id}-channel`} autoComplete="off">
              {channels.map((channel, index) => (
                <option key={`${channel.name}-${index}`} value={channel.name}>
                  {channel.name}
                </option>
              ))}
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
              className={styles.bars}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const barCount: number = parseInt(event.target.value ?? 0)

                if (barCount > bars.length) {
                  setBars((prevBars) => [
                    ...prevBars,
                    ...new Array(barCount - bars.length)
                      .fill(null)
                      .map(() => generateBar()),
                  ])
                } else if (barCount < bars.length) {
                  setBars((prevBars) => prevBars.slice(0, barCount))
                }
              }}
            />
          </label>
        </div>
      </div>

      {bars.map((bar, barIndex) => (
        <div className={styles.bar} key={barIndex}>
          <div className={styles.controls}>
            <div className={styles['bar-title']}>BAR {barIndex + 1}</div>
            <label>
              Beats
              <input
                type="number"
                className={styles.beats}
                name={`${barIndex}-beats`}
                value={bar.notes.length}
                min={1}
                autoComplete="off"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const newBeats: number = event.target.valueAsNumber

                  if (
                    isNaN(newBeats) ||
                    newBeats <= 0 ||
                    newBeats === bar.notes.length
                  )
                    return

                  if (newBeats > bar.notes.length) {
                    setBars((prevBars) => {
                      const newBars: Bar[] = prevBars.map((bar) => ({
                        ...bar,
                        notes: bar.notes.map((beat) => [...beat]),
                      }))

                      for (let i = bar.notes.length; i < newBeats; i++) {
                        newBars[barIndex].notes.push(generateBeat())
                      }

                      return newBars
                    })
                  } else {
                    setBars((prevBars) => {
                      const newBars: Bar[] = prevBars.map((bar) => ({
                        ...bar,
                        notes: bar.notes.map((beat) => [...beat]),
                      }))

                      for (let i = newBeats; i < bar.notes.length; i++) {
                        newBars[barIndex].notes.pop()
                      }

                      return newBars
                    })
                  }
                }}
              />
            </label>
            <label>
              Repeats
              <input
                type="number"
                className={styles.repeats}
                name={`${barIndex}-repeats`}
                value={bar.repeat}
                min={-1}
                autoComplete="off"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setBars((prevBars) => {
                    const newRepeat: number = event.target.valueAsNumber

                    const newBars: Bar[] = prevBars.map((bar) => ({
                      ...bar,
                      notes: bar.notes.map((beat) => [...beat]),
                    }))

                    newBars[barIndex].repeat =
                      isNaN(newRepeat) || newRepeat < -1 ? -1 : newRepeat

                    return newBars
                  })
                }}
              />
            </label>
          </div>
          {bar.notes.map((beat, beatIndex) => (
            <div
              key={`${barIndex}-${beatIndex}`}
              className={`${styles.beat} ${
                position.bar === barIndex && position.beat === beatIndex
                  ? styles.active
                  : ''
              }`}
            >
              {beat.map((note, polyphony) => (
                <input
                  type="number"
                  key={`${barIndex}-${beatIndex}-${polyphony}`}
                  name={`${barIndex}-${beatIndex}-${polyphony}`}
                  className={styles.note}
                  min={-1}
                  max={frequencies.length - 1}
                  value={note}
                  autoComplete="off"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setBars((prevBars) => {
                      const newBars: Bar[] = prevBars.map((bar) => ({
                        ...bar,
                        notes: bar.notes.map((beat) => [...beat]),
                      }))

                      const newNote = event.target.valueAsNumber

                      newBars[barIndex].notes[beatIndex][polyphony] =
                        isNaN(newNote) || newNote < 0
                          ? -1
                          : newNote >= frequencies.length
                          ? frequencies.length - 1
                          : newNote

                      return newBars
                    })
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
