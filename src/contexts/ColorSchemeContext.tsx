import type { Colors, ColorName } from '@catppuccin/palette'

import React from 'react'

import * as palette from '@catppuccin/palette'

export type ColorScheme = Colors<string>

interface IntermediaryColorSchemeExtraction {
  label: ColorName
  hex: string
}

const defaultColorScheme: ColorScheme = Object.keys(
  palette.flavors.latte.colors,
)
  .map((label: string): IntermediaryColorSchemeExtraction => {
    return {
      label: label as ColorName,
      hex: palette.flavors.latte.colors[label as ColorName].hex,
    }
  })
  .reduce<Partial<ColorScheme>>(
    (
      prev: Partial<ColorScheme>,
      cur: IntermediaryColorSchemeExtraction,
    ): Partial<ColorScheme> => {
      prev[cur.label] = cur.hex

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

  for (const label in palette.flavors.latte.colors) {
    colorScheme[label as ColorName] = styles.getPropertyValue(
      `--color-${label}`,
    )
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
