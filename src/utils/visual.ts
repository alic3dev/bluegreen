export interface Coordinates2D {
  x: number
  y: number
}

export type Resolution2D = Coordinates2D
export type Size2D = Coordinates2D

export type DisplayRatio = '16:9' | '4:3'
export type DisplayStandard = '360p' | '480p' | '720p' | '1080p' | '1440p'

const displayRatios: DisplayRatio[] = ['16:9', '4:3']
const displayStandards: DisplayStandard[] = [
  '360p',
  '480p',
  '720p',
  '1080p',
  '1440p',
]

export function generateResolution(
  displayRatio: DisplayRatio,
  displayStandard: DisplayStandard,
): Resolution2D {
  const parsedDisplayStandard: number = parseInt(
    displayStandard.slice(0, displayStandard.length - 1),
  )

  if (
    Number.isNaN(parsedDisplayStandard) ||
    !Number.isInteger(parsedDisplayStandard)
  ) {
    throw new Error(`Unknown display standard: ${displayStandard}`)
  }

  const [
    parsedDisplayRatioWidth,
    parsedDisplayRatioHeight,
    shouldBeUndefined,
  ]: number[] = displayRatio.split(':').map((c: string): number => parseInt(c))

  if (
    Number.isNaN(parsedDisplayRatioHeight + parsedDisplayRatioWidth) ||
    !Number.isInteger(parsedDisplayRatioWidth) ||
    !Number.isInteger(parsedDisplayRatioHeight) ||
    parsedDisplayRatioWidth < 0 ||
    parsedDisplayRatioHeight < 0 ||
    typeof shouldBeUndefined !== 'undefined'
  ) {
    throw new Error(`Invalid display ratio: ${displayRatio}`)
  }

  return {
    x: Math.ceil(
      parsedDisplayStandard /
        (parsedDisplayRatioHeight / parsedDisplayRatioWidth),
    ),
    y: parsedDisplayStandard,
  }
}

function generateResolutionLookup(): Record<
  DisplayRatio,
  Record<DisplayStandard, Resolution2D>
> {
  const res: Partial<
    Record<DisplayRatio, Partial<Record<DisplayStandard, Resolution2D>>>
  > = {}

  for (const displayRatio of displayRatios) {
    res[displayRatio] = {}

    for (const displayStandard of displayStandards) {
      res[displayRatio]![displayStandard] = generateResolution(
        displayRatio,
        displayStandard,
      )
    }
  }

  return res as Record<DisplayRatio, Record<DisplayStandard, Resolution2D>>
}

export const resolutions: Record<
  DisplayRatio,
  Record<DisplayStandard, Resolution2D>
> = generateResolutionLookup()
