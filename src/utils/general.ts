export interface Position {
  bar: number
  beat: number
  repeated: number
}

export interface BarData {
  notes: number[][][]
  repeat: number
}

export const generateBeat = (
  frequencies: number[],
  polyphony: number = 2,
): number[][] =>
  new Array<number>(polyphony)
    .fill(-1)
    .map((): number[] => [
      frequencies.length ? Math.floor(Math.random() * frequencies.length) : -1,
    ])

// TODO: Don't generate random - Save states?
export const generateBar = (
  frequencies: number[],
  beats: number = 4,
  polyphony?: number,
): BarData => ({
  notes: new Array<number[]>(beats)
    .fill([])
    .map((): number[][] => generateBeat(frequencies, polyphony)),
  repeat: 0,
})
