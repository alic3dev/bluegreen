import React from 'react'

import { resolutions } from '../../utils/visual'

const VIDEO_RESOLUTION = resolutions['16:9']['720p']

export function AApp(): JSX.Element {
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

    let iter: number = Date.now().valueOf()
    let skewFactor: number = 0

    let animationFrameHandle: number
    let previousTime = 0

    let count: number = 1
    const finalData: number[] = new Array(
      ctx.canvas.width * ctx.canvas.height * 4,
    ).fill(0)

    // const d = (0xa71c3).toString(2)
    // const d = (0xa11a4).toString(2)
    const d = `Molly lost her sight when she was fourteen
Blinded by disease, she was afraid of the dark
She was tortured through the years with nonstop bullying
She just kept getting stronger with each hateful remark

'Cause she can see
The light shine in the night
And she can see
The beauty that's inside
If you would ask her right this moment if she'd ever change a thing
She would smile and just say, "There's a reason for everything."

Open (open) up your eyes
Open (open) up your eyes

Ellen lost her son at only 17
The drugs just couldn't numb him from the pain anymore
It's the saddest sight his family had ever seen
Their hearts fell to their stomachs when they found him on the floor

He couldn't see
The light shine in the night
He couldn't see
It'd all turn out alright

If he had stepped back for a moment and seen how much he was loved
He would never lay his finger on the trigger of that gun

Open (open) up your eyes
Open (open) up your eyes

Taylor lost her mom when she was twenty-four
They didn't catch the cancer 'til too little too late
She had never felt an emptiness like this before
She didn't think she'd ever be relieved of the weight

But now she sees
What family really means
And she still sees
Her mother in her dreams

If you could ask her in a moment what the lesson she learned was
She'd say, "Never waste a moment with the people that you love."

Open (open) up your eyes
Open (open) up your eyes

Contemplated death more times than you would think
I'm thankful every day I was afraid of the knife
I was left alone with me, it pushed me to the brink
Until somebody showed me just how special is a life

I couldn't see
What really mattered then
And now I see
The value of a friend

If you'd have asked me in those moments if I could escape that hell
I would never have imagined I'd be doin' quite this well

Open (open) up your eyes
Open (open) up your eyes

Open (open) up your eyes
Open (open) up your eyes

Open (open) up your eyes
Open (open) up your eyes

Open (open) up your eyes
Open (open) up your eyes`
      .split('')
      .map((v) => v.charCodeAt(0).toString(2))
      .join('')

    let invert: boolean = false

    const animationFrame = (time: DOMHighResTimeStamp): void => {
      if (previousTime === 0) {
        previousTime = time
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      if (count < Infinity) {
        invert = !invert

        const data: ImageData = new ImageData(
          prevImageData.width,
          prevImageData.height,
        )

        for (let x: number = 0; x < prevImageData.width; x++) {
          for (let y: number = 0; y < prevImageData.height; y++) {
            const dataPos: number = (x + y * prevImageData.width) * 4

            const val =
              d[
                Math.floor((count + x + y * prevImageData.width) % d.length)
              ] === '1'
                ? invert
                  ? 0
                  : 255
                : invert
                ? 255
                : 0

            data.data[dataPos] =
              Math.abs(
                Math.sin(
                  (((x + count) % prevImageData.width) /
                    (prevImageData.width - 1)) *
                    Math.PI *
                    iter,
                ),
              ) * val
            data.data[dataPos + 1] =
              Math.abs(
                Math.sin(
                  (((y + count) % prevImageData.height) /
                    (prevImageData.height - 1)) *
                    Math.PI *
                    iter,
                ),
              ) * val
            data.data[dataPos + 2] =
              Math.abs(
                Math.sin(
                  ((((x + count) % prevImageData.width) /
                    (prevImageData.width - 1) +
                    ((y + count) % prevImageData.height) /
                      (prevImageData.height - 1)) /
                    2) *
                    Math.PI *
                    iter,
                ),
              ) * val
            data.data[dataPos + 3] = 255

            continue

            const skewedX = (x + skewFactor) % (prevImageData.width / 1)
            const skewedY = (y + skewFactor) % (prevImageData.height / 1)

            data.data[dataPos] =
              Math.abs(
                Math.sin(
                  (skewedX / (prevImageData.width - 1)) * Math.PI * iter,
                ),
              ) * 255
            data.data[dataPos + 1] =
              Math.abs(
                Math.sin(
                  (skewedY / (prevImageData.height - 1)) * Math.PI * iter,
                ),
              ) * 255
            data.data[dataPos + 2] =
              Math.abs(
                Math.sin(
                  ((skewedX / (prevImageData.width - 1) +
                    skewedY / (prevImageData.height - 1)) /
                    2) *
                    Math.PI *
                    iter,
                ),
              ) * 255
            data.data[dataPos + 3] = 255

            finalData[dataPos] += data.data[dataPos]
            finalData[dataPos + 1] += data.data[dataPos + 1]
            finalData[dataPos + 2] += data.data[dataPos + 2]
            finalData[dataPos + 3] += data.data[dataPos + 3]
          }
        }

        count++
        // iter = Date.now().valueOf()
        skewFactor = 0

        iter += 0
        // skewFactor += delta

        ctx.putImageData(data, 0, 0)
      } else {
        const finalImage = new ImageData(ctx.canvas.width, ctx.canvas.height)

        for (let i = 0; i < finalData.length; i++) {
          finalImage.data[i] = finalData[i] / count
        }

        ctx.putImageData(finalImage, 0, 0)
      }

      ctx.lineWidth = 6

      prevImageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      )

      previousTime = time

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
