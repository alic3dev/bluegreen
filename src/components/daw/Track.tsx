import React from 'react'
import { Note, Octave, Synth, utils } from 'zer0'

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
  notes: number[][][]
  repeat: number
}

interface Position {
  bar: number
  beat: number
  repeated: number
}

const scale: Note[] = utils.getScaleInKey('major', 'F')
const frequencies: number[] = utils
  .createNoteTable(2, 4, utils.frequencyRoots.magic)
  .map((octave: Octave): number[] =>
    scale.map((note: Note): number => octave[note]),
  )
  .flat()
  .sort((a: number, b: number): number => a - b)

const generateBeat = (polyphony: number = 2): number[][] =>
  new Array<number>(polyphony)
    .fill(-1)
    .map((): number[] => [Math.floor(Math.random() * frequencies.length)])

// TODO: Don't generate random - Save states?
const generateBar = (beats: number = 4, polyphony: number = 2): Bar => ({
  notes: new Array<number[]>(beats)
    .fill([])
    .map((): number[][] => generateBeat(polyphony)),
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
}): JSX.Element {
  const [bars, setBars] = React.useState<Bar[]>(() =>
    new Array(4)
      .fill(null)
      .map((): Bar => generateBar(4, synths[index].getPolyphony())),
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

        <div className={styles['header-controls']}>
          <label>
            Synth
            <select name={`${options.id}-synth`} autoComplete="off">
              {synths.map(
                (synth: Synth, index: number): JSX.Element => (
                  <option key={`${synth.name}-${index}`} value={synth.name}>
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
                (channel: ChannelWithOptions, index: number): JSX.Element => (
                  <option key={`${channel.name}-${index}`} value={channel.name}>
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
              className={styles.bars}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                const barCount: number = parseInt(event.target.value ?? 0)

                if (barCount > bars.length) {
                  setBars((prevBars: Bar[]): Bar[] => [
                    ...prevBars,
                    ...new Array(barCount - bars.length)
                      .fill(null)
                      .map((): Bar => generateBar()),
                  ])
                } else if (barCount < bars.length) {
                  setBars((prevBars: Bar[]): Bar[] =>
                    prevBars.slice(0, barCount),
                  )
                }
              }}
            />
          </label>
        </div>
      </div>

      {bars.map(
        (bar: Bar, barIndex: number): JSX.Element => (
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
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    const newBeats: number = event.target.valueAsNumber

                    if (
                      isNaN(newBeats) ||
                      newBeats <= 0 ||
                      newBeats === bar.notes.length
                    )
                      return

                    if (newBeats > bar.notes.length) {
                      setBars((prevBars: Bar[]): Bar[] => {
                        const newBars: Bar[] = prevBars.map(
                          (bar: Bar): Bar => ({
                            ...bar,
                            notes: bar.notes.map(
                              (beat: number[][]): number[][] => [...beat],
                            ),
                          }),
                        )

                        for (
                          let i: number = bar.notes.length;
                          i < newBeats;
                          i++
                        ) {
                          newBars[barIndex].notes.push(generateBeat())
                        }

                        return newBars
                      })
                    } else {
                      setBars((prevBars: Bar[]): Bar[] => {
                        const newBars: Bar[] = prevBars.map(
                          (bar: Bar): Bar => ({
                            ...bar,
                            notes: bar.notes.map(
                              (beat: number[][]): number[][] => [...beat],
                            ),
                          }),
                        )

                        for (
                          let i: number = newBeats;
                          i < bar.notes.length;
                          i++
                        ) {
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
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    setBars((prevBars: Bar[]): Bar[] => {
                      const newRepeat: number = event.target.valueAsNumber

                      const newBars: Bar[] = prevBars.map(
                        (bar: Bar): Bar => ({
                          ...bar,
                          notes: bar.notes.map(
                            (beat: number[][]): number[][] => [...beat],
                          ),
                        }),
                      )

                      newBars[barIndex].repeat =
                        isNaN(newRepeat) || newRepeat < -1 ? -1 : newRepeat

                      return newBars
                    })
                  }}
                />
              </label>
            </div>
            {bar.notes.map(
              (beat: number[][], beatIndex: number): JSX.Element => (
                <div
                  key={`${barIndex}-${beatIndex}`}
                  className={`${styles.beat} ${
                    position.bar === barIndex && position.beat === beatIndex
                      ? styles.active
                      : ''
                  }`}
                >
                  {beat.map((note, polyphony) =>
                    note.map((subNote, subNoteIndex) => (
                      <input
                        type="number"
                        key={`${barIndex}-${beatIndex}-${polyphony}-${subNoteIndex}`}
                        name={`${barIndex}-${beatIndex}-${polyphony}-${subNoteIndex}`}
                        className={styles.note}
                        min={-1}
                        max={frequencies.length - 1}
                        value={subNote}
                        autoComplete="off"
                        onKeyDown={(
                          event: React.KeyboardEvent<HTMLInputElement>,
                        ): void => {
                          if (event.key === '/') {
                            setBars((prevBars: Bar[]): Bar[] => {
                              const newBars: Bar[] = prevBars.map(
                                (bar: Bar): Bar => ({
                                  ...bar,
                                  notes: bar.notes.map(
                                    (beat: number[][]): number[][] => [...beat],
                                  ),
                                }),
                              )

                              newBars[barIndex].notes[beatIndex][polyphony] = [
                                ...note,
                                note[note.length - 1],
                              ]

                              return newBars
                            })
                          } else if (event.key === '?') {
                            setBars((prevBars: Bar[]): Bar[] => {
                              const newBars: Bar[] = prevBars.map(
                                (bar: Bar): Bar => ({
                                  ...bar,
                                  notes: bar.notes.map(
                                    (beat: number[][]): number[][] => [...beat],
                                  ),
                                }),
                              )

                              // FIXME: Should remove currently selected cell not last
                              newBars[barIndex].notes[beatIndex][polyphony] =
                                note.slice(
                                  0,
                                  note.length > 1 ? note.length - 1 : 1,
                                )

                              return newBars
                            })
                          }
                        }}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ): void => {
                          setBars((prevBars: Bar[]): Bar[] => {
                            const newBars: Bar[] = prevBars.map(
                              (bar: Bar): Bar => ({
                                ...bar,
                                notes: bar.notes.map(
                                  (beat: number[][]): number[][] => [...beat],
                                ),
                              }),
                            )

                            const newNote: number = event.target.valueAsNumber

                            newBars[barIndex].notes[beatIndex][polyphony] = [
                              ...note,
                            ]
                            newBars[barIndex].notes[beatIndex][polyphony][
                              subNoteIndex
                            ] =
                              isNaN(newNote) || newNote < 0
                                ? -1
                                : newNote >= frequencies.length
                                ? frequencies.length - 1
                                : newNote

                            return newBars
                          })
                        }}
                      />
                    )),
                  )}
                </div>
              ),
            )}
          </div>
        ),
      )}
    </div>
  )
}
