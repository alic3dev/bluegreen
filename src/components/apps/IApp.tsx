import React from 'react'

import { resolutions } from '../../utils/visual'

const VIDEO_RESOLUTION = resolutions['16:9']['1080p']

export function IApp(): React.ReactNode {
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

          data.data[newDataPosHor] = 255 - prevImageData.data[dataPos]
          data.data[newDataPosHor + 1] = 255 - prevImageData.data[dataPos + 1]
          data.data[newDataPosHor + 2] = 255 - prevImageData.data[dataPos + 2]
          data.data[newDataPosHor + 3] = 255

          const newDataPosVer: number =
            (Math.floor(x / 2) +
              (prevImageData.height - 1 - Math.floor(y / 2)) *
                prevImageData.width) *
            4

          data.data[newDataPosVer] = 255 - prevImageData.data[dataPos]
          data.data[newDataPosVer + 1] = 255 - prevImageData.data[dataPos + 1]
          data.data[newDataPosVer + 2] = 255 - prevImageData.data[dataPos + 2]
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

      // const tex = 'Sidney Mark Williams'

      // ctx.font =
      //   'bold 36px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont'
      // const w = ctx.measureText(tex).width

      // const pos = {
      //   x: ctx.canvas.width / 4 - w / 2,
      //   y: ctx.canvas.height / 4,
      // }

      // const gradient = ctx.createLinearGradient(
      //   pos.x,
      //   pos.y,
      //   pos.x + w / 2,
      //   pos.y + w / 2,
      // )
      // gradient.addColorStop(0, '#00FF0025')
      // gradient.addColorStop(0.5, '#FF000025')
      // gradient.addColorStop(1, '#0000FF25')
      // ctx.fillStyle = gradient
      // ctx.textBaseline = 'middle'
      // ctx.fillText(tex, pos.x, pos.y)

      // let gradient = ctx.createLinearGradient(333, 333, 100, 100)

      // gradient.addColorStop(0, '#00FF0025')
      // gradient.addColorStop(0.5, '#FF000025')
      // gradient.addColorStop(1, '#0000FF25')

      // ctx.strokeStyle = gradient
      // // ctx.strokeStyle = '#FFFFFF25'
      // // ctx.moveTo(500, 750)
      // // ctx.moveTo(750, 500)
      // // ctx.lineTo(100, 100)
      // // ctx.stroke()
      // ctx.moveTo(333, 333)
      // ctx.lineTo(100, 100)
      // ctx.stroke()

      // gradient = ctx.createLinearGradient(100, 333, 333, 100)

      // gradient.addColorStop(0, '#00FF0025')
      // gradient.addColorStop(0.5, '#FF000025')
      // gradient.addColorStop(1, '#0000FF25')

      // ctx.strokeStyle = gradient
      // ctx.moveTo(100, 333)
      // ctx.lineTo(333, 100)
      // ctx.stroke()

      // gradient = ctx.createLinearGradient(433, 333, 666, 100)

      // gradient.addColorStop(0, '#00FF0025')
      // gradient.addColorStop(0.5, '#FF000025')
      // gradient.addColorStop(1, '#0000FF25')

      // ctx.strokeStyle = gradient
      // ctx.moveTo(433, 333)
      // ctx.lineTo(666, 100)
      // ctx.stroke()

      // gradient = ctx.createLinearGradient(666, 333, 433, 100)

      // gradient.addColorStop(0, '#00FF0025')
      // gradient.addColorStop(0.5, '#FF000025')
      // gradient.addColorStop(1, '#0000FF25')

      // ctx.strokeStyle = gradient
      // ctx.moveTo(666, 333)
      // ctx.lineTo(433, 100)
      // ctx.stroke()

      let radgrad = ctx.createRadialGradient(
        ctx.canvas.width / 4,
        ctx.canvas.height / 4,
        0,
        ctx.canvas.width / 4,
        ctx.canvas.height / 4,
        50,
      )
      radgrad.addColorStop(0, '#FF000025')
      radgrad.addColorStop(0.5, '#00FF0025')
      radgrad.addColorStop(1, '#0000FF25')

      ctx.fillStyle = radgrad
      ctx.beginPath()
      ctx.arc(ctx.canvas.width / 4, ctx.canvas.height / 4, 50, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()

      radgrad = ctx.createRadialGradient(
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        0,
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        50,
      )
      radgrad.addColorStop(0.5, '#00FF0025')
      radgrad.addColorStop(0, '#FF000025')
      radgrad.addColorStop(1, '#0000FF25')

      ctx.fillStyle = radgrad
      ctx.beginPath()
      ctx.arc(
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        50,
        0,
        2 * Math.PI,
      )
      ctx.closePath()
      ctx.fill()

      radgrad = ctx.createRadialGradient(
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height / 4,
        0,
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height / 4,
        50,
      )
      radgrad.addColorStop(0, '#0000FF25')
      radgrad.addColorStop(0.5, '#00FF0025')
      radgrad.addColorStop(1, '#FF000025')

      ctx.fillStyle = radgrad
      ctx.beginPath()
      ctx.arc(
        ctx.canvas.width - ctx.canvas.width / 4,
        ctx.canvas.height / 4,
        50,
        0,
        2 * Math.PI,
      )
      ctx.closePath()
      ctx.fill()

      radgrad = ctx.createRadialGradient(
        ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        0,
        ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        50,
      )
      radgrad.addColorStop(0, '#0000FF25')
      radgrad.addColorStop(0.5, '#00FF0025')
      radgrad.addColorStop(1, '#FF000025')

      ctx.fillStyle = radgrad
      ctx.beginPath()
      ctx.arc(
        ctx.canvas.width / 4,
        ctx.canvas.height - ctx.canvas.height / 4,
        50,
        0,
        2 * Math.PI,
      )
      ctx.closePath()
      ctx.fill()

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
