import React from 'react'

import { BarData, Position } from '../../utils/general'

import styles from './Beat.module.scss'

export function Beat({
  setBars,
  barIndex,
  beat,
  beatIndex,
  position,
  frequencies,
}: {
  setBars: React.Dispatch<React.SetStateAction<BarData[]>>
  barIndex: number
  beat: number[][]
  beatIndex: number
  position: Position
  frequencies: number[]
}): JSX.Element {
  const getOnSubNoteKeyDown =
    ({
      note,
      polyphony,
    }: {
      note: number[]
      polyphony: number
    }): React.KeyboardEventHandler<HTMLInputElement> =>
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === '/') {
        setBars((prevBars: BarData[]): BarData[] => {
          const newBars: BarData[] = prevBars.map(
            (bar: BarData): BarData => ({
              ...bar,
              notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
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
              notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
            }),
          )

          // FIXME: Should remove currently selected cell not last
          newBars[barIndex].notes[beatIndex][polyphony] = note.slice(
            0,
            note.length > 1 ? note.length - 1 : 1,
          )

          return newBars
        })
      }
    }

  const getOnSubNoteChange =
    ({
      note,
      polyphony,
      subNoteIndex,
    }: {
      note: number[]
      polyphony: number
      subNoteIndex: number
    }): React.ChangeEventHandler<HTMLInputElement> =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setBars((prevBars: BarData[]): BarData[] => {
        const newBars: BarData[] = prevBars.map(
          (bar: BarData): BarData => ({
            ...bar,
            notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
          }),
        )

        const newNote: number = event.target.valueAsNumber

        newBars[barIndex].notes[beatIndex][polyphony] = [...note]
        newBars[barIndex].notes[beatIndex][polyphony][subNoteIndex] =
          isNaN(newNote) || newNote < 0
            ? -1
            : newNote >= frequencies.length
            ? frequencies.length - 1
            : newNote

        return newBars
      })
    }

  return (
    <div
      className={`${styles.beat} ${
        position.bar === barIndex && position.beat === beatIndex
          ? styles.active
          : ''
      }`}
    >
      {beat.map((note: number[], polyphony: number) =>
        note.map(
          (subNote: number, subNoteIndex: number): JSX.Element => (
            <input
              type="number"
              key={`${barIndex}-${beatIndex}-${polyphony}-${subNoteIndex}`}
              name={`${barIndex}-${beatIndex}-${polyphony}-${subNoteIndex}`}
              className={styles.note}
              min={-1}
              max={frequencies.length - 1}
              value={subNote}
              autoComplete="off"
              onKeyDown={getOnSubNoteKeyDown({ note, polyphony })}
              onChange={getOnSubNoteChange({ note, polyphony, subNoteIndex })}
            />
          ),
        ),
      )}
    </div>
  )
}
