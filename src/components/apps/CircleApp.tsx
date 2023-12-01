import React from 'react'

import styles from './CircleApp.module.scss'

const RESOLUTION: number = 2560

export function CircleApp() {
  const [begin, setBegin] = React.useState<boolean>(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    let circleAnimationFrameHandler: number
    let lastTime: number = 0

    function circleAnimationFrame(time: number) {
      if (!ctx) return

      const elapsedTime: number = time - lastTime

      if (elapsedTime < 100)
        return (circleAnimationFrameHandler =
          requestAnimationFrame(circleAnimationFrame))

      lastTime = time

      ctx.fillStyle = '#000000AA'
      ctx.fillRect(0, 0, RESOLUTION, RESOLUTION)

      ctx.lineCap = 'round'

      ctx.moveTo(
        RESOLUTION / 2 + (1 + 0) * Math.cos(0) * 25,
        RESOLUTION / 2 + (1 + 0) * Math.sin(0) * 25,
      )
      // ctx.bezierCurveTo(
      //   RESOLUTION / 2,
      //   0,
      //   RESOLUTION,
      //   RESOLUTION / 2,
      //   RESOLUTION / 2,
      //   RESOLUTION,
      // )
      ctx.beginPath()
      for (let i = 0; i < 720; i++) {
        const angle = 0.1 * i

        ctx.lineTo(
          RESOLUTION / 2 + (1 + angle) * Math.cos(angle) * 25,
          RESOLUTION / 2 + (1 + angle) * Math.sin(angle) * 10,
        )

        // if (i % 20 === 0) {
        if (Math.random() * 10 > 7) {
          ctx.lineWidth = Math.floor(Math.random() * 100 + 1)

          if (Math.random() * 10 > 8) {
            if (Math.random() * 4 > 3) {
              if (Math.random() * 2 > 0.1) {
                ctx.strokeStyle = '#006600'
              } else {
                ctx.strokeStyle = '#666600'
              }
            } else {
              ctx.strokeStyle = '#006666'
            }
          } else {
            ctx.strokeStyle = '#060606'
          }
          ctx.stroke()
          ctx.beginPath()
        }
      }

      circleAnimationFrameHandler = requestAnimationFrame(circleAnimationFrame)
    }

    circleAnimationFrameHandler = requestAnimationFrame(circleAnimationFrame)

    return () => cancelAnimationFrame(circleAnimationFrameHandler)
  }, [])

  return (
    <div className={styles.app}>
      <canvas
        ref={canvasRef}
        height={RESOLUTION}
        width={RESOLUTION}
        className={styles.canvas}
      ></canvas>
      <div className={styles.picturefour} />
      <div className={styles.picture} />
      <div className={styles.picturetwo} />
      <div className={styles.picturethree} />

      <div
        className={styles.intro + ' ' + (begin ? styles.close : '')}
        onClick={() => setBegin(true)}
      >
        ビギン
      </div>
    </div>
  )
}
