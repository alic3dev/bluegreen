import type { Channel } from 'zer0'

import React from 'react'
import { RxCaretDown } from 'react-icons/rx'

import { EffectChainList } from './EffectChainList'

import styles from './ChannelList.module.scss'

const UPDATE_RATE: number = 10

export function ChannelList({
  channels,
  addChannel,
  removeChannel,
}: {
  channels: Channel[]
  addChannel: () => void
  removeChannel: (id: string) => void
}): JSX.Element {
  const channelDOMRefs = React.useRef<Record<string, HTMLDivElement>>({})
  const [openChannels, setOpenChannels] = React.useState<
    Record<string, boolean>
  >(
    (): Record<string, boolean> => ({
      [channels[0].id]: true,
    }),
  )

  removeChannel.name // FIXME: Remove this - Add remove channel button

  React.useEffect((): undefined | (() => void) => {
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

        const channelDOM: HTMLDivElement = channelDOMRefs.current[channel.id]

        if (!channelDOM) continue

        const channelGainDOM: HTMLDivElement =
          channelDOM.getElementsByClassName(
            styles['gain-display'],
          )[0] as HTMLDivElement

        if (!channelGainDOM) continue

        const buffer: Uint8Array | undefined = channel.pollAnalyser()

        const perc: number = buffer
          ? buffer.reduce(
              (a: number, b: number): number => a + Math.abs(b - 128),
              0,
            ) / buffer.length
          : 0

        channelGainDOM.style.width = `${perc}%`
        channelGainDOM.style.background = `linear-gradient(to right, #121212, rgb(${
          Math.max((perc - 50) / 50, 0) * 255
        }, ${(perc / 100) * 255}, ${0}))`
      }

      animationFrameHandle = requestAnimationFrame(animationFrame)
    }

    animationFrameHandle = requestAnimationFrame(animationFrame)

    return (): void => cancelAnimationFrame(animationFrameHandle)
  }, [channels, openChannels])

  return (
    <div className={styles['channel-list']}>
      <div className={styles['controls']}>
        <button onClick={addChannel}>New Channel</button>
      </div>

      {channels.map(
        (channel: Channel): JSX.Element => (
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
              onClick={(): void => {
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
                  defaultValue={channel.gain.gain.value * 1000}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    channel.gain.gain.value = event.target.valueAsNumber / 1000
                  }}
                />
              </label>

              <div className={styles['gain-display-wrapper']}>
                <div className={styles['gain-display']} />
              </div>

              <EffectChainList effectChain={channel.effectChain} />
            </div>
          </div>
        ),
      )}
    </div>
  )
}
