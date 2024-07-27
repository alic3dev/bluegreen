import type { Channel, SampleKit } from 'zer0'

import React from 'react'

import styles from './KitList.module.scss'

export function KitList({
  kits,
  channels,
}: {
  kits: SampleKit[]
  channels: Channel[]
}): JSX.Element {
  // FIXME: Need async support for load states

  const [, setRefreshIndex] = React.useState<Record<string, number>>({}) // May want to change this to a simple incrementor
  // FIXME: This needs to be reactive somehow; this is already reactive..? Ah nvm, only main BPM causes refresh but not internal

  const [selectedKitID, setSelectedKitID] = React.useState<string>(
    kits.length ? kits[0].id : '',
  )
  const selectedKit = React.useMemo<SampleKit | null>(
    (): SampleKit | null =>
      selectedKitID
        ? kits.find((kit: SampleKit): boolean => kit.id === selectedKitID) ??
          null
        : null,
    [selectedKitID, kits],
  )

  const refreshKit = React.useCallback((id: string): void => {
    const refreshKey: string = `${id}`

    setRefreshIndex(
      (prevRefreshIndex: Record<string, number>): Record<string, number> => ({
        ...prevRefreshIndex,
        [refreshKey]: (prevRefreshIndex[refreshKey] ?? 0) + 1,
      }),
    )
  }, [])

  // const [loadingKits, setLoadingKits] = React.useState<Record<string, boolean>>(
  //   (): Record<string, boolean> => {
  //     const res: Record<string, boolean> = {};

  //       for (const kit of kits) {
  //         res[kit.id] = !kit.isReadySync;
  //       }

  //       return res;
  //   },
  // )

  // React.useEffect(() => {
  //   setLoadingKits(
  //     (prevLoadingKits: Record<string, boolean>): Record<string, boolean> => {
  //       const res: Record<string, boolean> = {};

  //       for (const kit of kits) {
  //         res[kit.id] = prevLoadingKits[kit.id] ?? true;
  //       }

  //       return res;
  //     },
  //   )
  // }, [kits])

  const urlChangeTimeoutLookupRef = React.useRef<Record<string, number>>({})
  const getOnUrlChange =
    (kit: SampleKit, sampleKey: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const timeoutLookupKey: string = kit.id + sampleKey

      if (urlChangeTimeoutLookupRef.current[timeoutLookupKey]) {
        clearTimeout(urlChangeTimeoutLookupRef.current[timeoutLookupKey])
        delete urlChangeTimeoutLookupRef.current[timeoutLookupKey]
      }

      urlChangeTimeoutLookupRef.current[timeoutLookupKey] = setTimeout(
        (): void => {
          kit.samples[sampleKey].setUrl(event.target.value)

          kit.savePreset()
        },
        250,
      )
    }

  const loadAndRefresh = (kit: SampleKit): string => {
    kit.onReady((): void => {
      window.setTimeout((): void => refreshKit(kit.id), 0)
    })

    return styles.loading
  }

  return (
    <div className={styles['kit-list']}>
      <select
        className={styles['tabbed-selector']}
        value={selectedKitID}
        onChange={(event) => setSelectedKitID(event.currentTarget.value)}
      >
        <option value=""></option>
        {kits.map(
          (synth: SampleKit): React.ReactNode => (
            <option value={synth.id} key={synth.id}>
              {synth.name}
            </option>
          ),
        )}
      </select>

      <select
        className={styles['tabbed-selector']}
        value={selectedKit ? selectedKit.channel?.id : ''}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
          if (!selectedKit) return

          const selectedChannel: Channel | undefined = channels.find(
            (channel: Channel): boolean =>
              channel.id === event.currentTarget.value,
          )

          if (selectedChannel) {
            selectedKit.setChannel(selectedChannel)

            refreshKit(selectedKit.id)
          }
        }}
      >
        <option value=""></option>
        {selectedKit &&
          channels.map(
            (channel: Channel): React.ReactNode => (
              <option value={channel.id} key={channel.id}>
                {channel.name}
              </option>
            ),
          )}
      </select>

      {selectedKit && (
        <div
          key={selectedKit.id}
          className={`${styles['tabbed-content']} ${
            selectedKit.isReadySync() ? '' : loadAndRefresh(selectedKit)
          }`}
        >
          <div className={styles['tabbed-controls']}>
            <div className={styles['tabbed-button-header']}>
              <h4 className={styles['tabbed-name']}>Samples</h4>

              <button
                onClick={(): void => {
                  selectedKit.addSample(crypto.randomUUID(), '')

                  refreshKit(selectedKit.id)
                }}
              >
                +
              </button>
            </div>

            {Object.keys(selectedKit.samples).map(
              (sampleKey: string): JSX.Element => {
                return (
                  <label key={sampleKey} className={styles.sample}>
                    <span>{sampleKey}</span>

                    <input
                      type="url"
                      defaultValue={selectedKit.samples[sampleKey]
                        .getUrl()
                        ?.toString()}
                      onChange={getOnUrlChange(selectedKit, sampleKey)}
                    />
                  </label>
                )
              },
            )}
          </div>
        </div>
      )}
    </div>
  )
}
