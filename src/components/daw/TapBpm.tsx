import type { Project } from '../../utils/project'

import React from 'react'

import styles from './TapBpm.module.scss'

export function TapBpm({
  project,
  onTapped,
  registerStep,
  unregisterStep,
}: {
  project: Project
  onTapped(bpm: number): void
  registerStep(step: () => void): void
  unregisterStep(): void
}): JSX.Element {
  const pulseTimeout = React.useRef<{ value?: number }>({})
  const [pulse, setPulse] = React.useState<boolean>(false)

  React.useEffect((): (() => void) => {
    registerStep((): void => {
      setPulse(true)

      clearTimeout(pulseTimeout.current.value)
      pulseTimeout.current.value = setTimeout(() => {
        setPulse(false)
      }, (60 / project.bpm) * 500)
    })

    return (): void => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(pulseTimeout.current.value)
      unregisterStep()
    }
  }, [registerStep, unregisterStep, project.bpm])

  const tappedBpmRef = React.useRef<{
    taps: number[]
    clearTimeout?: number
  }>({
    taps: [],
  })

  const onTapClick = (): void => {
    clearTimeout(tappedBpmRef.current.clearTimeout)

    tappedBpmRef.current.clearTimeout = setTimeout(() => {
      tappedBpmRef.current.taps.splice(0)
      delete tappedBpmRef.current.clearTimeout
    }, 2500)

    const currentTime: number = performance.now()

    tappedBpmRef.current.taps = tappedBpmRef.current.taps.filter(
      (tap: number): boolean => currentTime - tap < 2500,
    )

    tappedBpmRef.current.taps.push(currentTime)

    tappedBpmRef.current.taps.splice(0, tappedBpmRef.current.taps.length - 10)

    if (tappedBpmRef.current.taps.length > 2) {
      const differences: number[] = []

      for (let i: number = 0; i < tappedBpmRef.current.taps.length - 2; i++) {
        differences.push(
          tappedBpmRef.current.taps[i + 1] - tappedBpmRef.current.taps[i],
        )
      }

      const average: number =
        differences.reduce((a, b) => a + b, 0) / differences.length

      const bpm: number = 60 / (average / 1000)

      onTapped(bpm)
    }
  }

  return (
    <button
      className={`${styles.tap} ${
        !tappedBpmRef.current.taps.length && pulse ? styles.pulse : ''
      }`}
      style={{
        transitionDuration: `${(60 / project.bpm) * 500}ms`,
      }}
      onClick={onTapClick}
    >
      TAP
    </button>
  )
}
