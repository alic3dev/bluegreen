import React from 'react'
import { Note, Synth, utils } from 'zer0'

const frequencyRoots: Record<string, number> = {
  standard: 440,
  magic: 432,
  scientific: 430.54,
}

const scale: Note[] = utils.getScaleInKey('minor', 'E')
const frequencies: number[] = utils
  .createNoteTable(1, 2, frequencyRoots.scientific)
  .map((octave) => scale.map((note) => octave[note]))
  .flat()
  .sort((a, b) => a - b)

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

const generateBeat = (polyphony = 2): number[] =>
  new Array<number>(polyphony)
    .fill(-1)
    .map(() => Math.floor(Math.random() * frequencies.length))

// TODO: Don't generate random - Save states?
const generateBar = (beats = 4, polyphony = 2): Bar => ({
  notes: new Array<number[]>(beats).fill([]).map(() => generateBeat(polyphony)),
  repeat: 1,
})

export function Track({
  options,
  synths,
}: {
  options: TrackOptions
  synths: Synth[]
}) {
  const [polyphony] = React.useState<number>(2)

  const [bars, setBars] = React.useState<Bar[]>(() =>
    new Array(4).fill(null).map(() => generateBar(4, polyphony)),
  )

  const position = React.useRef<Position>({
    bar: 0,
    beat: 0,
    repeated: 0,
  })

  const step = React.useCallback(() => {
    const notes: number[] =
      bars[position.current.bar].notes[position.current.beat]

    // FIXME: Add polyphony

    if (notes[0] > -1 && notes[0] < frequencies.length) {
      synths[0].playNote(frequencies[notes[0]])
    }

    position.current.beat++

    if (position.current.beat >= bars[position.current.bar].notes.length) {
      position.current.beat = 0
      position.current.repeated++
    }

    if (position.current.repeated >= bars[position.current.bar].repeat) {
      position.current.repeated = 0
      position.current.bar++
    }

    if (position.current.bar >= bars.length) {
      position.current.bar = 0
    }
  }, [bars, synths])

  const reset = React.useCallback(() => {
    position.current.bar = 0
    position.current.beat = 0
    position.current.repeated = 0
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

        <div className={styles.controls}>
          <label>
            Synth
            <select name={`${options.id}-synth`} autoComplete="off">
              {synths.map((synth) => (
                <option key={synth.name} value={synth.name}>
                  {synth.name}
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
            Bar {barIndex + 1}
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
                defaultValue={1}
                min={-1}
                autoComplete="off"
              />
            </label>
          </div>
          {bar.notes.map((beat, beatIndex) => (
            <div key={`${barIndex}-${beatIndex}`} className={styles.beat}>
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
