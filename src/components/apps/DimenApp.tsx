import React from 'react'

import {
  DisplayRatio,
  DisplayStandard,
  Resolution2D,
  resolutions,
} from '../../utils/visual'

import styles from './DimenApp.module.scss'

const VIDEO_ASPECT_RATIO: DisplayRatio = '4:3'
const VIDEO_STANDARD: DisplayStandard = '720p'
const VIDEO_RESOLUTION: Resolution2D =
  resolutions[VIDEO_ASPECT_RATIO][VIDEO_STANDARD]

type ColorChannel = number
type RedChannel = ColorChannel
type GreenChannel = ColorChannel
type BlueChannel = ColorChannel
type AlphaChannel = ColorChannel
type Pixel = [RedChannel, GreenChannel, BlueChannel, AlphaChannel]

const RED_CHANNEL: number = 0
const GREEN_CHANNEL: number = 1
const BLUE_CHANNEL: number = 2
const ALPHA_CHANNEL: number = 3

export function DimenApp(): JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const frameRef = React.useRef<HTMLSpanElement>(null)
  const fpsRef = React.useRef<HTMLSpanElement>(null)

  const [overlayHidden, setOverlayHidden] = React.useState<number>(
    (): number => {
      try {
        return parseInt(
          JSON.parse(
            window.localStorage.getItem('bluegreen:dimen:overlayHidden') ?? '2',
          ),
        )
      } catch {}

      return 2
    },
  )

  React.useEffect((): void => {
    window.localStorage.setItem(
      'bluegreen:dimen:overlayHidden',
      JSON.stringify(overlayHidden),
    )
  }, [overlayHidden])

  const [showHelp, setShowHelp] = React.useState<boolean>(false)

  React.useEffect((): (() => void) => {
    function keyDownListener(event: KeyboardEvent) {
      switch (event.code) {
        case 'KeyI':
          setOverlayHidden((prevOverlayHidden: number): number =>
            prevOverlayHidden + 1 > 2 ? 0 : prevOverlayHidden + 1,
          )
          break
        case 'KeyH':
          setShowHelp((prevShowHelp: boolean): boolean => !prevShowHelp)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', keyDownListener)

    return (): void => {
      window.removeEventListener('keydown', keyDownListener)
    }
  }, [])

  React.useEffect((): (() => void) | void => {
    let animationFrameHandle: number

    if (!canvasRef.current) return

    const ctx: CanvasRenderingContext2D | null = canvasRef.current.getContext(
      '2d',
      {
        alpha: true,
        colorSpace: 'srgb',
        desynchronized: false,
        willReadFrequently: true,
      },
    )
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    let frameCount: number = 0

    const imageData: ImageData = new ImageData(
      canvasRef.current.width,
      canvasRef.current.height,
      {
        colorSpace: 'srgb',
      },
    )

    for (let i: number = 0; i < imageData.data.length; i += 4) {
      const normalizedIterator: number = Math.floor(i / 4)

      const y: number = Math.floor(normalizedIterator / imageData.width)
      const x: number = normalizedIterator % (y * imageData.width)

      if (x === Math.floor(ctx.canvas.width / 4) - 1 && y === 1) {
        imageData.data[i + RED_CHANNEL] = 255
        imageData.data[i + GREEN_CHANNEL] = 0
        imageData.data[i + BLUE_CHANNEL] = 0
        imageData.data[i + ALPHA_CHANNEL] = 255
        continue
      } else if (
        x === Math.floor(ctx.canvas.width / 2) - 1 &&
        y === Math.floor(ctx.canvas.height / 2) - 1
      ) {
        imageData.data[i + RED_CHANNEL] = 0
        imageData.data[i + GREEN_CHANNEL] = 0
        imageData.data[i + BLUE_CHANNEL] = 255
        imageData.data[i + ALPHA_CHANNEL] = 255
        continue
      } else if (x === 1 && y === Math.floor(ctx.canvas.height / 2) - 1) {
        imageData.data[i + RED_CHANNEL] = 0
        imageData.data[i + GREEN_CHANNEL] = 255
        imageData.data[i + BLUE_CHANNEL] = 0
        imageData.data[i + ALPHA_CHANNEL] = 255
        continue
      } else {
        imageData.data[i + RED_CHANNEL] = 0
        imageData.data[i + GREEN_CHANNEL] = 0
        imageData.data[i + BLUE_CHANNEL] = 0
        imageData.data[i + ALPHA_CHANNEL] = 255
      }

      // imageData.data[i] =
      //   Math.random() *
      //   255 *
      //   Math.abs(Math.sin(1 + ((i + frameCount * 10) % imageData.width)))
      // imageData.data[i + 1] =
      //   Math.random() *
      //   255 *
      //   Math.abs(Math.sin(1 + ((i + 1 + frameCount * 10) % imageData.width)))
      // imageData.data[i + 2] = Math.floor(
      //   (Math.random() *
      //     255 *
      //     Math.abs(
      //       Math.sin(1 + ((i + 2 + frameCount * 10) % imageData.width)),
      //     )) /
      //     1,
      // )
      // imageData.data[i + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)

    const getPixel = (
      x: number,
      y: number,
      _imageData: ImageData = imageData,
    ): Pixel => {
      const loc: number = y * _imageData.width * 4 + x * 4

      const redChannel: RedChannel = _imageData.data[loc + RED_CHANNEL]
      const greenChannel: GreenChannel = _imageData.data[loc + GREEN_CHANNEL]
      const blueChannel: BlueChannel = _imageData.data[loc + BLUE_CHANNEL]
      const alphaChannel: AlphaChannel = _imageData.data[loc + ALPHA_CHANNEL]

      return [redChannel, greenChannel, blueChannel, alphaChannel]
    }

    let prevTime: number = 0

    let prevFpsTime: number = 0

    const FPS_FRAME_AVG_COUNT: number = 10

    const animationFrame = (time: DOMHighResTimeStamp): void => {
      if (frameCount === 0) {
        prevFpsTime = time
      } else if ((frameCount + 1) % FPS_FRAME_AVG_COUNT === 0) {
        if (fpsRef.current) {
          fpsRef.current.innerText = `${Math.floor(
            FPS_FRAME_AVG_COUNT / ((time - prevFpsTime) / 1000),
          )}`
        }

        prevFpsTime = time
      }

      if (time - prevTime < 0) {
        animationFrameHandle = window.requestAnimationFrame(animationFrame)
        return
      }

      const prevImageData: ImageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
        {
          colorSpace: 'srgb',
        },
      )

      for (let i: number = 0; i < imageData.data.length; i += 4) {
        const normalizedIterator: number = Math.floor(i / 4)

        const y: number = Math.floor(normalizedIterator / imageData.width)
        const x: number = normalizedIterator % (y * imageData.width)

        if (x % 2 === 0 || y % 2 === 0) {
          imageData.data[i + RED_CHANNEL] = 0
          imageData.data[i + GREEN_CHANNEL] = 0
          imageData.data[i + BLUE_CHANNEL] = 0
          imageData.data[i + ALPHA_CHANNEL] = 255
          continue
        }

        // if (x === 65 || y === 11) {
        //   imageData.data[i + RED_CHANNEL] = 0
        //   imageData.data[i + GREEN_CHANNEL] = 255
        //   imageData.data[i + BLUE_CHANNEL] = 0
        //   imageData.data[i + ALPHA_CHANNEL] = 255
        //   continue
        // }
        // continue

        const PIXEL_OFFSET: number = 1

        const topPixel: Pixel = getPixel(
          x,
          y - PIXEL_OFFSET - 1 < 0
            ? ctx.canvas.height - 1
            : y - PIXEL_OFFSET - 1,
          prevImageData,
        )
        const bottomPixel: Pixel = getPixel(
          x,
          y + PIXEL_OFFSET + 1 > ctx.canvas.height - 1
            ? PIXEL_OFFSET
            : y + PIXEL_OFFSET + 1,
          prevImageData,
        )
        const leftPixel: Pixel = getPixel(
          x - PIXEL_OFFSET - 1 < 0
            ? ctx.canvas.width - 1
            : x - PIXEL_OFFSET - 1,

          y,
          prevImageData,
        )
        const rightPixel: Pixel = getPixel(
          x + PIXEL_OFFSET + 1 > ctx.canvas.width - 1
            ? PIXEL_OFFSET
            : x + PIXEL_OFFSET + 1,
          y,
          prevImageData,
        )

        // if (Math.random() > 0.01) {
        imageData.data[i + RED_CHANNEL] = Math.floor(
          // Math.min(
          (topPixel[RED_CHANNEL] +
            bottomPixel[RED_CHANNEL] +
            leftPixel[RED_CHANNEL] +
            rightPixel[RED_CHANNEL] +
            imageData.data[i + RED_CHANNEL]) %
            256,
          // /
          // 4,
          // 255,
        )
        imageData.data[i + GREEN_CHANNEL] = Math.floor(
          // Math.min(
          (topPixel[GREEN_CHANNEL] +
            bottomPixel[GREEN_CHANNEL] +
            leftPixel[GREEN_CHANNEL] +
            rightPixel[GREEN_CHANNEL] +
            imageData.data[i + GREEN_CHANNEL]) %
            256,
          // 255,
        )
        imageData.data[i + BLUE_CHANNEL] = Math.floor(
          // Math.min(
          (topPixel[BLUE_CHANNEL] +
            bottomPixel[BLUE_CHANNEL] +
            leftPixel[BLUE_CHANNEL] +
            rightPixel[BLUE_CHANNEL] +
            imageData.data[i + BLUE_CHANNEL]) %
            256,
          // 255,
        )

        imageData.data[i + ALPHA_CHANNEL] = 255
        // } else {
        //   imageData.data[i] =
        //     Math.random() *
        //     255 *
        //     Math.abs(Math.sin(time + ((i + frameCount * 10) % imageData.width)))
        //   imageData.data[i + 1] =
        //     Math.random() *
        //     255 *
        //     Math.abs(
        //       Math.sin(time + ((i + 1 + frameCount * 10) % imageData.width)),
        //     )
        //   imageData.data[i + 2] = Math.floor(
        //     Math.random() *
        //       255 *
        //       Math.abs(
        //         Math.sin(time + ((i + 2 + frameCount * 10) % imageData.width)),
        //       ),
        //   )
        //   imageData.data[i + 3] = 255
        // }
      }

      ctx.putImageData(imageData, 0, 0)

      if (frameRef.current) frameRef.current.innerText = `${frameCount}`

      frameCount++
      prevTime = time

      animationFrameHandle = window.requestAnimationFrame(animationFrame)
    }
    animationFrameHandle = window.requestAnimationFrame(animationFrame)

    return (): void => window.cancelAnimationFrame(animationFrameHandle)
  }, [])

  return (
    <main className={styles.main}>
      <canvas
        ref={canvasRef}
        width={VIDEO_RESOLUTION.x}
        height={VIDEO_RESOLUTION.y}
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'contain',
        }}
      >
        Enable plz
      </canvas>

      <div
        className={`${styles.overlay} ${
          overlayHidden === 2
            ? styles.hidden
            : overlayHidden === 1
            ? styles['half-hidden']
            : ''
        }`}
      >
        <div>
          Frame: <span ref={frameRef}></span>
        </div>
        <div>
          FPS: <span ref={fpsRef}>[CALCULATING]</span>
        </div>
        <div>Aspect Ratio: {VIDEO_ASPECT_RATIO}</div>
        <div>Video Standard: {VIDEO_STANDARD}</div>
        <div>
          Resolution: {VIDEO_RESOLUTION.x}x{VIDEO_RESOLUTION.y}
        </div>
      </div>

      <div className={`${styles.help} ${showHelp ? '' : styles.hidden}`}>
        <div className={styles.content}>
          <h2>Help</h2>

          <ul>
            <li>
              I: Toggle video information (States: Hidden, Visible,
              Half-Visible)
            </li>
            <li>H: Show help display</li>
          </ul>
        </div>
      </div>

      <div className={styles.hints}>
        Press <span className={styles['key-hint']}>H</span> to display help.
      </div>
    </main>
  )
}
