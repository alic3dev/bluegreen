import React from 'react'

import { Beat } from './Beat'
import { generateBeat, BarData, Position } from '../../utils/general'

import styles from './Bar.module.scss'

export type { BarData }

export function Bar({
  setBars,
  bar,
  barIndex,
  position,
  frequencies,
  polyphony,
}: {
  setBars: React.Dispatch<React.SetStateAction<BarData[]>>
  bar: BarData
  barIndex: number
  position: Position
  frequencies: number[]
  polyphony: number
}): JSX.Element {
  const onBeatsInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const newBeats: number = event.target.valueAsNumber

    if (isNaN(newBeats) || newBeats <= 0 || newBeats === bar.notes.length)
      return

    if (newBeats > bar.notes.length) {
      setBars((prevBars: BarData[]): BarData[] => {
        const newBars: BarData[] = prevBars.map(
          (bar: BarData): BarData => ({
            ...bar,
            notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
          }),
        )

        for (let i: number = bar.notes.length; i < newBeats; i++) {
          newBars[barIndex].notes.push(generateBeat(frequencies, polyphony))
        }

        return newBars
      })
    } else {
      setBars((prevBars: BarData[]): BarData[] => {
        const newBars: BarData[] = prevBars.map(
          (bar: BarData): BarData => ({
            ...bar,
            notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
          }),
        )

        for (let i: number = newBeats; i < bar.notes.length; i++) {
          newBars[barIndex].notes.pop()
        }

        return newBars
      })
    }
  }

  const onRepeatsInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setBars((prevBars: BarData[]): BarData[] => {
      const newRepeat: number = event.target.valueAsNumber

      const newBars: BarData[] = prevBars.map(
        (bar: BarData): BarData => ({
          ...bar,
          notes: bar.notes.map((beat: number[][]): number[][] => [...beat]),
        }),
      )

      newBars[barIndex].repeat =
        isNaN(newRepeat) || newRepeat < -1 ? -1 : newRepeat

      return newBars
    })
  }

  return (
    <div className={styles.bar}>
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
            onChange={onBeatsInputChange}
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
            onChange={onRepeatsInputChange}
          />
        </label>
      </div>

      {bar.notes.map(
        (beat: number[][], beatIndex: number): JSX.Element => (
          <Beat
            setBars={setBars}
            barIndex={barIndex}
            beat={beat}
            beatIndex={beatIndex}
            position={position}
            frequencies={frequencies}
            key={`${barIndex}-${beatIndex}`}
          />
        ),
      )}
    </div>
  )
}
