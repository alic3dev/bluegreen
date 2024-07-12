import type { AlphaColor, Color, Labels, Variants } from '@catppuccin/palette'

import React from 'react'

import palette from '@catppuccin/palette'

export type ColorScheme = Labels<string, string>

interface IntermediaryColorSchemeExtraction {
  label: string
  hex: string
}

const defaultColorScheme: ColorScheme = Object.keys(palette.variants.latte)
  .map((label: string): IntermediaryColorSchemeExtraction => {
    return {
      label,
      hex: palette.variants.latte[label as keyof Labels<Color, AlphaColor>].hex,
    }
  })
  .reduce<Partial<ColorScheme>>(
    (
      prev: Partial<ColorScheme>,
      cur: IntermediaryColorSchemeExtraction,
    ): Partial<ColorScheme> => {
      prev[cur.label as keyof Labels<Color, AlphaColor>] = cur.hex

      return prev
    },
    {},
  ) as ColorScheme

export const ColorSchemeContext =
  React.createContext<ColorScheme>(defaultColorScheme)

function generateColorScheme(): ColorScheme {
  const styles: CSSStyleDeclaration = window.getComputedStyle(
    document.documentElement,
  )

  const colorScheme: ColorScheme = { ...defaultColorScheme }

  for (const label in palette.labels) {
    colorScheme[label as keyof Labels<Variants<Color>, Variants<Color>>] =
      styles.getPropertyValue(`--color-${label}`)
  }

  return colorScheme
}

export function ColorSchemeProvider({
  children,
}: React.PropsWithChildren): React.ReactNode {
  const [colorScheme, setColorScheme] =
    React.useState<ColorScheme>(generateColorScheme)

  React.useEffect((): void | (() => void) => {
    if (!window.matchMedia) return

    const onColorSchemeChange = (): void => {
      setColorScheme(generateColorScheme())
    }

    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', onColorSchemeChange)

    return (): void => {
      window
        .matchMedia('(prefers-color-scheme: light)')
        .removeEventListener('change', onColorSchemeChange)
    }
  }, [])

  return (
    <ColorSchemeContext.Provider value={colorScheme}>
      {children}
    </ColorSchemeContext.Provider>
  )
}
