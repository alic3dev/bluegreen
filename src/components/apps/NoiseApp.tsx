import type { ColorScheme } from '../../contexts/ColorSchemeContext'

import React from 'react'

import { Channel, Noise } from 'zer0'

import { ColorSchemeContext } from '../../contexts/ColorSchemeContext'

import styles from './NoiseApp.module.scss'

const VIDEO_RESOLUTION: { x: number; y: number } = {
  x: 2560,
  y: 1440,
}

interface AudioRef {
  context: AudioContext
  channel: Channel
  bf: BiquadFilterNode
  stereoPanner: StereoPannerNode
  gain: GainNode
  noise?: Noise
}

let defaultAudioRef: AudioRef

const getDefaultAudioRef = (): AudioRef => {
  if (defaultAudioRef) return defaultAudioRef

  const context: AudioContext = new AudioContext()

  const channel = new Channel({ audioContext: context })
  channel.gain.gain.value = 0.666

  const dc = context.createDynamicsCompressor()
  dc.connect(channel.gain)
  channel.gain.connect(dc)

  const bf = context.createBiquadFilter()
  bf.type = 'lowpass'
  bf.gain.value = 0.25
  bf.Q.value = 2
  bf.connect(channel.destination)

  const delay = context.createDelay()
  delay.delayTime.value = 1 / 19

  const delayGain = context.createGain()
  delayGain.gain.value = 2 / 3
  delayGain.connect(delay)
  delay.connect(delayGain)
  delay.connect(bf)

  const stereoPanner: StereoPannerNode = context.createStereoPanner()
  stereoPanner.connect(delay)

  const gain: GainNode = context.createGain()
  gain.gain.value = 2 / 3
  gain.connect(stereoPanner)
  gain.connect(channel.destination)
  gain.connect(gain)

  // const infGain: GainNode = context.createGain()
  // infGain.gain.value = 0.72
  // // infGain.connect(infGain)
  // infGain.connect(gain)

  // const samp = new Sample(context, '/kits/SwuM Drum Kit/Fx/drip.wav', infGain)
  // samp.onReady(() => {
  //   samp.play()
  // })

  return (defaultAudioRef = {
    context,
    channel,
    bf,
    stereoPanner,
    gain,
  })
}

export function NoiseApp() {
  const audioRef = React.useRef<AudioRef>(getDefaultAudioRef())
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const colorScheme = React.useContext<ColorScheme>(ColorSchemeContext)

  React.useEffect((): (() => void) => {
    const gain = audioRef.current.gain
    gain.gain.value = 1 / 6

    if (!audioRef.current.noise) {
      audioRef.current.noise = new Noise(audioRef.current.context, gain)
    }

    const pannerInterval: number = window.setInterval((): void => {
      audioRef.current.bf.Q.value =
        7.76 + 2.27 * Math.abs(Math.sin(performance.now() / 111))
      audioRef.current.bf.frequency.value =
        100 * Math.abs(Math.sin(performance.now() / 666))

      audioRef.current.stereoPanner.pan.value =
        (Math.sin(performance.now() / 333) * 2) / 3
    })

    const ctx: CanvasRenderingContext2D | null =
      canvasRef.current?.getContext('2d') ?? null
    let lastTime: number = 0
    let oddFrame: boolean = true

    let analyserVisualizationHandle: number
    const analyserVisualizationFrame = (time: number): void => {
      if (!ctx) return

      if (lastTime !== 0 && time - lastTime <= 0) {
        analyserVisualizationHandle = window.requestAnimationFrame(
          analyserVisualizationFrame,
        )

        return
      }

      oddFrame = !oddFrame
      lastTime = time

      ctx.fillStyle = colorScheme.base
      ctx.fillRect(0, 0, VIDEO_RESOLUTION.x, VIDEO_RESOLUTION.y)

      const analyserData: Uint8Array = audioRef.current.channel.pollAnalyser()

      ctx.moveTo(0, VIDEO_RESOLUTION.y / 2)
      ctx.beginPath()

      // const lastPoints: { x: number; y: number } = {
      //   x: 0,
      //   y: (analyserData[0] / 255) * VIDEO_RESOLUTION.y,
      // }

      let ySum: number = VIDEO_RESOLUTION.y / 2

      for (let i = 1; i < analyserData.length; i++) {
        const points: { x: number; y: number } = {
          x: (i / analyserData.length) * VIDEO_RESOLUTION.x,
          y: (analyserData[i] / 255) * VIDEO_RESOLUTION.y,
        }

        ctx.lineTo(points.x, points.y)

        ySum += points.y

        // ctx.quadraticCurveTo(
        //   (lastPoints.x + points.x) / 2,
        //   (lastPoints.y + points.y) / 2,
        //   points.x,
        //   points.y,
        // )

        // lastPoints.x = points.x
        // lastPoints.y = points.y
      }

      const yAvg: number = Math.round(ySum / analyserData.length)

      if (yAvg === 111 || yAvg === 333 || yAvg === 666 || yAvg === 999) {
        ctx.strokeStyle = colorScheme.red
      } else if (yAvg === 777) {
        ctx.strokeStyle = colorScheme.yellow
      } else if (oddFrame) {
        ctx.strokeStyle = colorScheme.green
      } else {
        ctx.strokeStyle = colorScheme.blue
      }

      ctx.stroke()

      analyserVisualizationHandle = window.requestAnimationFrame(
        analyserVisualizationFrame,
      )
    }
    analyserVisualizationHandle = window.requestAnimationFrame(
      analyserVisualizationFrame,
    )

    return (): void => {
      gain.gain.value = 0
      window.clearInterval(pannerInterval)
      window.cancelAnimationFrame(analyserVisualizationHandle)
    }
  }, [colorScheme])

  React.useEffect((): (() => void) => {
    const audioCtx: AudioContext = audioRef.current.context

    audioCtx.resume()

    return (): void => {
      audioCtx.suspend()
    }
  }, [])

  return (
    <div className={styles.app}>
      <canvas
        ref={canvasRef}
        className={styles.visual}
        width={VIDEO_RESOLUTION.x}
        height={VIDEO_RESOLUTION.y}
      >
        Noisity
      </canvas>
      <div className={styles.main}></div>
    </div>
  )
}
