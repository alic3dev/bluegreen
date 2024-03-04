import React from 'react'

import { resolutions } from '../../utils/visual'

const VIDEO_RESOLUTION = resolutions['16:9']['1080p']

export function SApp(): JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect((): (() => void) | void => {
    if (!canvasRef.current) return

    const ctx: CanvasRenderingContext2D | null = canvasRef.current.getContext(
      '2d',
      {
        willReadFrequently: true,
      },
    )

    if (!ctx) return

    let prevImageData: ImageData = new ImageData(8, 8)

    let animationFrameHandle: number
    const animationFrame = (time: DOMHighResTimeStamp): void => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const data: ImageData = new ImageData(
        prevImageData.width,
        prevImageData.height,
      )

      for (let x: number = 0; x < prevImageData.width; x++) {
        for (let y: number = 0; y < prevImageData.height; y++) {
          const dataPos: number = (x + y * prevImageData.width) * 4

          const newDataPos: number =
            (Math.floor(x / 2) + Math.floor(y / 2) * prevImageData.width) * 4

          data.data[newDataPos] = prevImageData.data[dataPos]
          data.data[newDataPos + 1] = prevImageData.data[dataPos + 1]
          data.data[newDataPos + 2] = prevImageData.data[dataPos + 2]
          data.data[newDataPos + 3] = 255

          const newDataPosHor: number =
            (prevImageData.width -
              1 -
              Math.floor(x / 2) +
              Math.floor(y / 2) * prevImageData.width) *
            4

          data.data[newDataPosHor] = prevImageData.data[dataPos]
          data.data[newDataPosHor + 1] = prevImageData.data[dataPos + 1]
          data.data[newDataPosHor + 2] = prevImageData.data[dataPos + 2]
          data.data[newDataPosHor + 3] = 255

          const newDataPosVer: number =
            (Math.floor(x / 2) +
              (prevImageData.height - 1 - Math.floor(y / 2)) *
                prevImageData.width) *
            4

          data.data[newDataPosVer] = prevImageData.data[dataPos]
          data.data[newDataPosVer + 1] = prevImageData.data[dataPos + 1]
          data.data[newDataPosVer + 2] = prevImageData.data[dataPos + 2]
          data.data[newDataPosVer + 3] = 255

          const newDataPosHorVer: number =
            (prevImageData.width -
              1 -
              Math.floor(x / 2) +
              (prevImageData.height - 1 - Math.floor(y / 2)) *
                prevImageData.width) *
            4

          data.data[newDataPosHorVer] = prevImageData.data[dataPos]
          data.data[newDataPosHorVer + 1] = prevImageData.data[dataPos + 1]
          data.data[newDataPosHorVer + 2] = prevImageData.data[dataPos + 2]
          data.data[newDataPosHorVer + 3] = 255
        }
      }

      ctx.putImageData(data, 0, 0)

      ctx.fillStyle = `#${Math.floor(
        ((Math.sin(time / 150) + 2) / 2) * 10 + 16,
      ).toString(16)}0000AA`
      // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.lineWidth = 6
      ctx.strokeStyle = '#FFFFFF25'
      ctx.moveTo(500, 750)
      ctx.moveTo(750, 500)
      ctx.lineTo(100, 100)
      ctx.stroke()

      prevImageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      )

      animationFrameHandle = window.requestAnimationFrame(animationFrame)
    }
    animationFrameHandle = window.requestAnimationFrame(animationFrame)

    return (): void => {
      window.cancelAnimationFrame(animationFrameHandle)
    }
  }, [])

  return (
    <main>
      <canvas
        ref={canvasRef}
        width={VIDEO_RESOLUTION.x}
        height={VIDEO_RESOLUTION.y}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      >
        ENABLE CANVAS
      </canvas>
    </main>
  )
}
