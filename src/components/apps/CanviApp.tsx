import React from 'react'

import styles from './CanviApp.module.scss'

import { Coordinates2D, Resolution2D } from '../../utils/visual'

const VIDEO_RESOLUTION: Resolution2D = {
  x: 2560,
  y: 1440,
}

const MAX_ITERATIONS: number = 333

export function CanviApp(): JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawInfoRef = React.useRef<{
    iteration: number
    looped: number
    lastPos: Coordinates2D
    lastInvPos: Coordinates2D
  }>({
    iteration: 0,
    looped: 0,
    lastPos: { x: 0, y: VIDEO_RESOLUTION.y / 2 },
    lastInvPos: { x: 0, y: VIDEO_RESOLUTION.y / 2 },
  })

  React.useEffect((): (() => void) => {
    let animationFrameHandle: number
    const lastTime: number = 0
    const lineWidth: number = 6

    const requestFrame = (): void => {
      animationFrameHandle = window.requestAnimationFrame(animationFrame)
    }

    const animationFrame = (time: number): void => {
      const ctx: CanvasRenderingContext2D | null =
        canvasRef.current?.getContext('2d') ?? null

      if (!ctx || (lastTime !== 0 && time - lastTime <= 0)) {
        requestFrame()
        return
      }

      ctx.fillStyle = '#00000003'
      ctx.fillRect(0, 0, VIDEO_RESOLUTION.x, VIDEO_RESOLUTION.y)

      const perc: number = drawInfoRef.current.iteration / MAX_ITERATIONS

      const x: number = VIDEO_RESOLUTION.x * perc

      const sinVal: number = Math.sin(
        perc * (drawInfoRef.current.looped + 1) * 2 * Math.PI,
      )
      const y: number =
        VIDEO_RESOLUTION.y / 2 +
        ((VIDEO_RESOLUTION.y - lineWidth) / 2) *
          sinVal *
          (drawInfoRef.current.looped % 2 === 0 ? -1 : 1)
      const invY: number =
        VIDEO_RESOLUTION.y / 2 +
        ((VIDEO_RESOLUTION.y - lineWidth) / 2) *
          sinVal *
          (drawInfoRef.current.looped % 2 === 0 ? 1 : -1)

      // if (drawInfoRef.current.iteration % 2 === 0) {
      //   ctx.beginPath()
      //   ctx.moveTo(drawInfoRef.current.lastPos.x, drawInfoRef.current.lastPos.y)
      // }

      ctx.lineTo(x, y)
      ctx.moveTo(
        drawInfoRef.current.lastInvPos.x,
        drawInfoRef.current.lastInvPos.y,
      )
      ctx.lineTo(x, invY)
      ctx.moveTo(drawInfoRef.current.lastPos.x, drawInfoRef.current.lastPos.y)

      const r = Math.floor(Math.random() * 255)
      const g = Math.floor(Math.random() * 255)
      const b = Math.floor(Math.random() * 255)

      ctx.strokeStyle = `#${r < 16 ? `0${r.toString(16)}` : r.toString(16)}${
        g < 16 ? `0${g.toString(16)}` : g.toString(16)
      }${b < 16 ? `0${b.toString(16)}` : b.toString(16)}`
      // ctx.fillStyle = `#${r < 16 ? `0${r.toString(16)}` : r.toString(16)}${
      //   g < 16 ? `0${g.toString(16)}` : g.toString(16)
      // }${b < 16 ? `0${b.toString(16)}` : b.toString(16)}10`

      // ctx.fill()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = lineWidth
      ctx.stroke()

      if (drawInfoRef.current.iteration >= MAX_ITERATIONS) {
        drawInfoRef.current.iteration = 0
        drawInfoRef.current.lastPos = { x: 0, y: VIDEO_RESOLUTION.y / 2 }
        drawInfoRef.current.lastInvPos = { ...drawInfoRef.current.lastPos }
        drawInfoRef.current.looped++

        ctx.moveTo(drawInfoRef.current.lastPos.x, drawInfoRef.current.lastPos.y)

        if (drawInfoRef.current.looped % 6 === 0) {
          ctx.beginPath()
        }
      } else {
        drawInfoRef.current.iteration++
        drawInfoRef.current.lastPos.x = x
        drawInfoRef.current.lastPos.y = y
        drawInfoRef.current.lastInvPos.x = x
        drawInfoRef.current.lastInvPos.y = invY
      }

      requestFrame()
    }
    requestFrame()

    return (): void => {
      cancelAnimationFrame(animationFrameHandle)
    }
  }, [])

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={VIDEO_RESOLUTION.x}
        height={VIDEO_RESOLUTION.y}
      >
        :)
      </canvas>
    </div>
  )
}
