import React from 'react'

import { resolutions } from '../../utils/visual'
import { GenerativeControls } from '../controls/GenerativeControls'

const VIDEO_RESOLUTION = resolutions['16:9']['1080p']

export function CApp(): JSX.Element {
  const [frameCount, setFrameCount] = React.useState<number>(0)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const prevImageDataRef = React.useRef<{ data: ImageData }>({
    data: new ImageData(8, 8),
  })

  const [playing, setPlaying] = React.useState<boolean>(false)

  React.useEffect((): (() => void) | void => {
    if (!playing || !canvasRef.current) return

    const ctx: CanvasRenderingContext2D | null = canvasRef.current.getContext(
      '2d',
      {
        willReadFrequently: true,
      },
    )

    if (!ctx) return

    let animationFrameHandle: number
    const animationFrame = (): void => {
      prevImageDataRef.current.data = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      )
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const data: ImageData = new ImageData(
        prevImageDataRef.current.data.width,
        prevImageDataRef.current.data.height,
      )

      for (let x: number = 0; x < prevImageDataRef.current.data.width; x++) {
        for (let y: number = 0; y < prevImageDataRef.current.data.height; y++) {
          const dataPos: number =
            (x + y * prevImageDataRef.current.data.width) * 4

          const newDataPos: number =
            (Math.floor(x / 2) +
              Math.floor(y / 2) * prevImageDataRef.current.data.width) *
            4

          data.data[newDataPos] = prevImageDataRef.current.data.data[dataPos]
          data.data[newDataPos + 1] =
            prevImageDataRef.current.data.data[dataPos + 1]
          data.data[newDataPos + 2] =
            prevImageDataRef.current.data.data[dataPos + 2]
          data.data[newDataPos + 3] = 255

          const newDataPosHor: number =
            (prevImageDataRef.current.data.width -
              1 -
              Math.floor(x / 2) +
              Math.floor(y / 2) * prevImageDataRef.current.data.width) *
            4

          data.data[newDataPosHor] = prevImageDataRef.current.data.data[dataPos]
          data.data[newDataPosHor + 1] =
            prevImageDataRef.current.data.data[dataPos + 1]
          data.data[newDataPosHor + 2] =
            prevImageDataRef.current.data.data[dataPos + 2]
          data.data[newDataPosHor + 3] = 255

          const newDataPosVer: number =
            (Math.floor(x / 2) +
              (prevImageDataRef.current.data.height - 1 - Math.floor(y / 2)) *
                prevImageDataRef.current.data.width) *
            4

          data.data[newDataPosVer] = prevImageDataRef.current.data.data[dataPos]
          data.data[newDataPosVer + 1] =
            prevImageDataRef.current.data.data[dataPos + 1]
          data.data[newDataPosVer + 2] =
            prevImageDataRef.current.data.data[dataPos + 2]
          data.data[newDataPosVer + 3] = 255

          const newDataPosHorVer: number =
            (prevImageDataRef.current.data.width -
              1 -
              Math.floor(x / 2) +
              (prevImageDataRef.current.data.height - 1 - Math.floor(y / 2)) *
                prevImageDataRef.current.data.width) *
            4

          data.data[newDataPosHorVer] =
            prevImageDataRef.current.data.data[dataPos]
          data.data[newDataPosHorVer + 1] =
            prevImageDataRef.current.data.data[dataPos + 1]
          data.data[newDataPosHorVer + 2] =
            prevImageDataRef.current.data.data[dataPos + 2]
          data.data[newDataPosHorVer + 3] = 255
        }
      }

      ctx.putImageData(data, 0, 0)

      ctx.lineWidth = 6

      // ctx.beginPath()
      // ctx.strokeStyle = '#FFFF0025'
      // ctx.moveTo(500, 750)
      // ctx.moveTo(750, 500)
      // ctx.lineTo(100, 100)
      // ctx.stroke()
      // ctx.closePath()

      // ctx.beginPath()
      // ctx.strokeStyle = '#00FFFF25'
      // ctx.moveTo(1000, 50)
      // ctx.moveTo(50, 750)
      // ctx.lineTo(500, 700)
      // ctx.stroke()
      // ctx.closePath()

      // ctx.beginPath()
      // ctx.strokeStyle = '#FF00FF25'
      // ctx.moveTo(50, 200)
      // ctx.moveTo(250, 1000)
      // ctx.lineTo(600, 300)
      // ctx.stroke()
      // ctx.closePath()

      prevImageDataRef.current.data = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      )

      animationFrameHandle = window.requestAnimationFrame(animationFrame)
      setFrameCount((prevFrameCount: number): number => prevFrameCount + 1)
    }
    animationFrameHandle = window.requestAnimationFrame(animationFrame)

    return (): void => {
      window.cancelAnimationFrame(animationFrameHandle)
    }
  }, [playing])

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

      <GenerativeControls
        playing={playing}
        setPlaying={setPlaying}
        canvasRef={canvasRef}
      />

      <div
        style={{ position: 'absolute', bottom: 0, left: 0, background: '#000' }}
      >
        Frame: {frameCount}
      </div>
    </main>
  )
}
