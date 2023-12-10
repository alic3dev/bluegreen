import React from 'react'

import { generateBeat, BarData, Position } from '../../utils/general'

import styles from './Bar.module.scss'

export type { BarData }

export function Bar({
  setBars,
  bar,
  barIndex,
  position,
  frequencies,
}: {
  setBars: React.Dispatch<React.SetStateAction<BarData[]>>
  bar: BarData
  barIndex: number
  position: Position
  frequencies: number[]
}): JSX.Element {
  return (
    <div className={styles.bar} key={barIndex}>
      <div className={styles.controls}>
        <div className={styles['title']}>BAR {barIndex + 1}</div>
        <label>
          Beats
          <input
            type="number"
            className={styles['number-input']}
            name={`${barIndex}-beats`}
            value={bar.notes.length}
            min={1}
            autoComplete="off"
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              const newBeats: number = event.target.valueAsNumber

              if (
                isNaN(newBeats) ||
                newBeats <= 0 ||
                newBeats === bar.notes.length
              )
                return

              if (newBeats > bar.notes.length) {
                setBars((prevBars: BarData[]): BarData[] => {
                  const newBars: BarData[] = prevBars.map(
                    (bar: BarData): BarData => ({
                      ...bar,
                      notes: bar.notes.map((beat: number[][]): number[][] => [
                        ...beat,
                      ]),
                    }),
                  )

                  for (let i: number = bar.notes.length; i < newBeats; i++) {
                    newBars[barIndex].notes.push(generateBeat(frequencies))
                  }

                  return newBars
                })
              } else {
                setBars((prevBars: BarData[]): BarData[] => {
                  const newBars: BarData[] = prevBars.map(
                    (bar: BarData): BarData => ({
                      ...bar,
                      notes: bar.notes.map((beat: number[][]): number[][] => [
                        ...beat,
                      ]),
                    }),
                  )

                  for (let i: number = newBeats; i < bar.notes.length; i++) {
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
            className={styles['number-input']}
            name={`${barIndex}-repeats`}
            value={bar.repeat}
            min={-1}
            autoComplete="off"
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              setBars((prevBars: BarData[]): BarData[] => {
                const newRepeat: number = event.target.valueAsNumber

                const newBars: BarData[] = prevBars.map(
                  (bar: BarData): BarData => ({
                    ...bar,
                    notes: bar.notes.map((beat: number[][]): number[][] => [
                      ...beat,
                    ]),
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
                      setBars((prevBars: BarData[]): BarData[] => {
                        const newBars: BarData[] = prevBars.map(
                          (bar: BarData): BarData => ({
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
                      setBars((prevBars: BarData[]): BarData[] => {
                        const newBars: BarData[] = prevBars.map(
                          (bar: BarData): BarData => ({
                            ...bar,
                            notes: bar.notes.map(
                              (beat: number[][]): number[][] => [...beat],
                            ),
                          }),
                        )

                        // FIXME: Should remove currently selected cell not last
                        newBars[barIndex].notes[beatIndex][polyphony] =
                          note.slice(0, note.length > 1 ? note.length - 1 : 1)

                        return newBars
                      })
                    }
                  }}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    setBars((prevBars: BarData[]): BarData[] => {
                      const newBars: BarData[] = prevBars.map(
                        (bar: BarData): BarData => ({
                          ...bar,
                          notes: bar.notes.map(
                            (beat: number[][]): number[][] => [...beat],
                          ),
                        }),
                      )

                      const newNote: number = event.target.valueAsNumber

                      newBars[barIndex].notes[beatIndex][polyphony] = [...note]
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
  )
}
