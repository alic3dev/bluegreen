import React from 'react'

import styles from './Eye.module.scss'

const RESOLUTION: number = 2560
const HALF_RESOLUTION: number = RESOLUTION / 2
const PUPIL_RADIUS: number = RESOLUTION / 7

function drawEye(ctx: CanvasRenderingContext2D) {
  ctx.lineWidth = 6
  ctx.strokeStyle = '#000'

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

  ctx.fillStyle = '#202020'
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
  ctx.fillStyle = '#242424'
  ctx.fill()
  ctx.stroke()

  ctx.clip()

  // Eye ball
  ctx.beginPath()
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, RESOLUTION / 2.5, 0, 2 * Math.PI)
  ctx.lineWidth = 12
  ctx.stroke()
  ctx.fillStyle = '#262626'
  ctx.fill()
  ctx.lineWidth = 6

  // Iris
  ctx.beginPath()
  ctx.moveTo(HALF_RESOLUTION + RESOLUTION / 6, HALF_RESOLUTION)
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, RESOLUTION / 6, 0, 2 * Math.PI)
  ctx.fillStyle = '#282828'
  ctx.fill()
  ctx.stroke()

  // Pupil
  ctx.beginPath()
  ctx.moveTo(HALF_RESOLUTION + PUPIL_RADIUS, HALF_RESOLUTION)
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, PUPIL_RADIUS, 0, 2 * Math.PI)
  ctx.fillStyle = '#000000'
  ctx.fill()
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

function drawAudioData(ctx: CanvasRenderingContext2D, audioData: Uint8Array) {
  // Pupil Clip
  ctx.beginPath()
  ctx.moveTo(HALF_RESOLUTION + PUPIL_RADIUS, HALF_RESOLUTION)
  ctx.arc(HALF_RESOLUTION, HALF_RESOLUTION, PUPIL_RADIUS, 0, 2 * Math.PI)
  ctx.fillStyle = '#000000'
  ctx.fill()

  ctx.save()
  ctx.clip()

  ctx.strokeStyle = '#484848'

  ctx.beginPath()

  for (let i = 0; i < audioData.length; i++) {
    const v = audioData[i] / 128.0
    const y = v * PUPIL_RADIUS

    const mappedX = (i / (audioData.length - 1)) * PUPIL_RADIUS * 2

    ctx[i === 0 ? 'moveTo' : 'lineTo'](
      HALF_RESOLUTION - PUPIL_RADIUS + mappedX,
      y + HALF_RESOLUTION - PUPIL_RADIUS,
    )
  }
  ctx.stroke()

  ctx.restore()
}

export function Eye({
  audioDataRef,
}: {
  audioDataRef: React.MutableRefObject<Uint8Array | undefined>
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const ctx: CanvasRenderingContext2D | null =
      canvasRef.current.getContext('2d')

    if (!ctx) return

    drawEye(ctx)
    if (audioDataRef.current) drawAudioData(ctx, audioDataRef.current)

    // let startTime: number
    let animationFrameHandler: number

    const prevAudioData: Uint8Array | undefined = audioDataRef.current

    const drawAnimation = () => {
      if (prevAudioData !== audioDataRef.current && audioDataRef.current) {
        // drawEye(ctx)

        drawAudioData(ctx, audioDataRef.current)
      }

      animationFrameHandler = requestAnimationFrame(drawAnimation)
    }

    animationFrameHandler = requestAnimationFrame(drawAnimation)

    return () => cancelAnimationFrame(animationFrameHandler)
  }, [audioDataRef])

  return (
    <canvas
      ref={canvasRef}
      width={RESOLUTION}
      height={RESOLUTION}
      className={styles.eye}
    ></canvas>
  )
}
