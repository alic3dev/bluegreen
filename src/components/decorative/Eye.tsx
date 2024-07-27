import type { ColorScheme } from '../../contexts/ColorSchemeContext'

import React from 'react'

import { ColorSchemeContext } from '../../contexts/ColorSchemeContext'

import styles from './Eye.module.scss'

const RESOLUTION: number = 2560
const HALF_RESOLUTION: number = RESOLUTION / 2
const PUPIL_RADIUS: number = RESOLUTION / 7

function drawEye(ctx: CanvasRenderingContext2D, colorScheme: ColorScheme) {
  ctx.lineWidth = 6
  ctx.strokeStyle = colorScheme.text
  ctx.fillStyle = colorScheme.crust

  ctx.beginPath()

  // Upper Eyelid
  ctx.moveTo(0, HALF_RESOLUTION)
  ctx.bezierCurveTo(
    HALF_RESOLUTION,
    RESOLUTION / 5,
    HALF_RESOLUTION,
    RESOLUTION / 5,
    RESOLUTION,
    HALF_RESOLUTION,
  )

  // Lower Eyelid
  ctx.moveTo(0, HALF_RESOLUTION)
  ctx.bezierCurveTo(
    HALF_RESOLUTION,
    RESOLUTION - RESOLUTION / 4.25,
    HALF_RESOLUTION,
    RESOLUTION - RESOLUTION / 4.25,
    RESOLUTION,
    HALF_RESOLUTION,
  )

  ctx.fill()
  ctx.stroke()
  ctx.beginPath()

  // Upper Eye
  ctx.moveTo(0, HALF_RESOLUTION)
  ctx.bezierCurveTo(
    HALF_RESOLUTION,
    RESOLUTION / 4,
    HALF_RESOLUTION,
    RESOLUTION / 4,
    RESOLUTION,
    HALF_RESOLUTION,
  )
  // Lower Eye
  ctx.moveTo(0, HALF_RESOLUTION)
  ctx.bezierCurveTo(
    HALF_RESOLUTION,
    RESOLUTION - RESOLUTION / 4,
    HALF_RESOLUTION,
    RESOLUTION - RESOLUTION / 4,
    RESOLUTION,
    HALF_RESOLUTION,
  )
  ctx.fillStyle = colorScheme.mantle
  ctx.fill()
  ctx.stroke()

  ctx.clip()

  // Eye ball
  ctx.beginPath()
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, RESOLUTION / 2.5, 0, 2 * Math.PI)
  ctx.lineWidth = 12
  ctx.stroke()
  ctx.fillStyle = colorScheme.mantle
  ctx.fill()
  ctx.lineWidth = 6

  // Iris
  ctx.beginPath()
  ctx.moveTo(HALF_RESOLUTION + RESOLUTION / 6, HALF_RESOLUTION)
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, RESOLUTION / 6, 0, 2 * Math.PI)
  ctx.fillStyle = colorScheme.green
  ctx.fill()
  ctx.stroke()
}

// const pulseValues: { opacity: number; direction: 'up' | 'down' } = {
//   opacity: 0.0,
//   direction: 'up',
// }

// function drawText(ctx: CanvasRenderingContext2D) {
//   if (pulseValues.direction === 'up') {
//     pulseValues.opacity += (Math.random() * 6) / 10000

//     if (pulseValues.opacity >= 0.125) pulseValues.direction = 'down'
//   } else {
//     pulseValues.opacity = Math.max(
//       pulseValues.opacity - (Math.random() * 6) / 10000,
//       0,
//     )

//     if (pulseValues.opacity <= 0.1) pulseValues.direction = 'up'
//   }

//   const opacityHex = Math.floor(pulseValues.opacity * 255).toString(16)

//   ctx.moveTo(HALF_RESOLUTION, HALF_RESOLUTION)
//   ctx.strokeStyle = `#006666${
//     opacityHex.length < 2 ? '0' + opacityHex : opacityHex
//   }`
//   ctx.fillStyle = ctx.strokeStyle
//   ctx.textAlign = 'center'
//   ctx.textBaseline = 'middle'

//   ctx.font =
//     "320px 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', Osaka, 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif"
//   ctx.fillText('音楽', HALF_RESOLUTION, HALF_RESOLUTION)
//   ctx.strokeText('音楽', HALF_RESOLUTION, HALF_RESOLUTION)
// }

interface DrawOptions {
  fade: number
}

function drawAudioData(
  options: DrawOptions,
  ctx: CanvasRenderingContext2D,
  audioData: Uint8Array,
  full: boolean = false,
  colorScheme: ColorScheme,
) {
  if (!full) {
    // Pupil Clip
    ctx.beginPath()
    ctx.moveTo(HALF_RESOLUTION + PUPIL_RADIUS, HALF_RESOLUTION)
    ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, PUPIL_RADIUS, 0, 2 * Math.PI)
    ctx.fillStyle = colorScheme.base
    ctx.fill()

    ctx.save()
    ctx.clip()

    ctx.strokeStyle = colorScheme.text
  } else {
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const fade = Math.min(255, Math.max(0, options.fade)).toString(16)

    if (fade.length === 0) {
      ctx.fillStyle = `${colorScheme.base}00`
    } else if (fade.length === 1) {
      ctx.fillStyle = `${colorScheme.base}0${fade}`
    } else {
      ctx.fillStyle = `${colorScheme.base}${fade}`
    }

    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = colorScheme.text
  }

  ctx.beginPath()

  for (let i = 0; i < audioData.length; i++) {
    const v = audioData[i] / 128.0
    const y = v * (full ? HALF_RESOLUTION : PUPIL_RADIUS)

    const mappedX =
      (i / (audioData.length - 1)) * (full ? HALF_RESOLUTION : PUPIL_RADIUS) * 2

    ctx[i === 0 ? 'moveTo' : 'lineTo'](
      (full ? 0 : HALF_RESOLUTION - PUPIL_RADIUS) + mappedX,
      y + (full ? 0 : HALF_RESOLUTION - PUPIL_RADIUS),
    )
  }

  ctx.stroke()

  if (!full) {
    ctx.restore()
  }
}

export function Eye({
  drawOptions,
  audioDataRef,
  full,
}: {
  drawOptions: React.MutableRefObject<DrawOptions>
  audioDataRef: React.MutableRefObject<Uint8Array | undefined>
  full?: boolean
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)

  const colorScheme = React.useContext<ColorScheme>(ColorSchemeContext)

  React.useEffect((): void | (() => void) => {
    if (!canvasRef.current) return

    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d')
    }

    const ctx: CanvasRenderingContext2D | null = ctxRef.current

    if (!ctx) return

    ctx.reset()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!full) {
      drawEye(ctx, colorScheme)
    } else {
      ctx.lineWidth = 6
      ctx.strokeStyle = colorScheme.base
      ctx.fillStyle = colorScheme.base
    }

    if (audioDataRef.current) {
      drawAudioData(
        drawOptions.current,
        ctx,
        audioDataRef.current,
        full,
        colorScheme,
      )
    }

    let animationFrameHandle: number

    const drawAnimation = (): void => {
      if (audioDataRef.current) {
        drawAudioData(
          drawOptions.current,
          ctx,
          audioDataRef.current,
          full,
          colorScheme,
        )
      }

      animationFrameHandle = window.requestAnimationFrame(drawAnimation)
    }

    drawAnimation()

    return (): void => {
      window.cancelAnimationFrame(animationFrameHandle)
    }
  }, [audioDataRef, full, colorScheme, drawOptions])

  return (
    <canvas
      ref={canvasRef}
      width={RESOLUTION}
      height={RESOLUTION}
      className={`${styles.eye} ${full ? styles.full : ''}`}
    ></canvas>
  )
}
