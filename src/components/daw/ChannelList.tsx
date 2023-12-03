import React from 'react'
import { Channel } from 'zer0'
import { RxCaretDown } from 'react-icons/rx'

import styles from './ChannelList.module.scss'

export interface ChannelWithOptions {
  id: string
  name: string
  channel: Channel
}

const UPDATE_RATE: number = 10

export function ChannelList({
  channels,
  addChannel,
  removeChannel,
}: {
  channels: ChannelWithOptions[]
  addChannel: () => void
  removeChannel: (id: string) => void
}) {
  const channelDOMRefs = React.useRef<Record<string, HTMLDivElement>>({})
  const [openChannels, setOpenChannels] = React.useState<
    Record<string, boolean>
  >(() => ({
    [channels[0].id]: true,
  }))

  React.useEffect(() => {
    if (Object.values(openChannels).indexOf(true) === -1) return

    let animationFrameHandle: number
    let lastTime: number = 0

    const animationFrame = (time: DOMHighResTimeStamp): void => {
      if (time - lastTime < UPDATE_RATE) {
        animationFrameHandle = requestAnimationFrame(animationFrame)
        return
      }
      lastTime = time

      for (const channel of channels) {
        if (!openChannels[channel.id]) continue

        const channelDOM = channelDOMRefs.current[channel.id]

        if (!channelDOM) continue

        const channelGainDOM: HTMLDivElement =
          channelDOM.getElementsByClassName(
            styles['gain-display'],
          )[0] as HTMLDivElement

        if (!channelGainDOM) continue

        const buffer = channel.channel.pollAnalyser()

        const perc: number =
          buffer.reduce((a, b) => a + Math.abs(b - 128), 0) / buffer.length

        // FIXME: This needs to be smoothed or something

        channelGainDOM.style.width = `${perc}%`
        channelGainDOM.style.background = `linear-gradient(to right, #121212, rgb(${
          Math.max((perc - 50) / 50, 0) * 255
        }, ${(perc / 100) * 255}, ${0}))`
      }

      animationFrameHandle = requestAnimationFrame(animationFrame)
    }

    animationFrameHandle = requestAnimationFrame(animationFrame)

    return () => cancelAnimationFrame(animationFrameHandle)
  }, [channels, openChannels])

  return (
    <div className={styles['channel-list']}>
      <div className={styles['controls']}>
        <button onClick={addChannel}>New Channel</button>
      </div>

      {channels.map(
        (channel: ChannelWithOptions): JSX.Element => (
          <div
            key={channel.id}
            className={`${styles.channel} ${
              openChannels[channel.id] ? styles.open : ''
            }`}
            ref={(divRef: HTMLDivElement | null): void => {
              if (divRef) {
                channelDOMRefs.current[channel.id] = divRef
              }
            }}
          >
            <button
              className={styles['channel-header']}
              onClick={() => {
                setOpenChannels(
                  (
                    prevOpenChannels: typeof openChannels,
                  ): typeof openChannels => {
                    const newOpenChannels: typeof openChannels = {
                      ...prevOpenChannels,
                    }

                    if (newOpenChannels[channel.id])
                      newOpenChannels[channel.id] = !newOpenChannels[channel.id]
                    else newOpenChannels[channel.id] = true

                    return newOpenChannels
                  },
                )
              }}
            >
              <h4 className={styles['channel-title']}>{channel.name}</h4>
              <div className={styles['channel-caret']}>
                <RxCaretDown />
              </div>
            </button>

            <div className={styles['channel-content']}>
              <label>
                GAIN
                <input
                  type="range"
                  min={0}
                  max={1000}
                  defaultValue={channel.channel.gain.gain.value * 1000}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    channel.channel.gain.gain.value =
                      event.target.valueAsNumber / 1000
                  }}
                />
              </label>

              <div className={styles['gain-display-wrapper']}>
                <div className={styles['gain-display']} />
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  )
}
