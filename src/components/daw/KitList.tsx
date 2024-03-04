import React from 'react'
import { SampleKit } from 'zer0'

import styles from './KitList.module.scss'

export function KitList({ kits }: { kits: SampleKit[] }): JSX.Element {
  // FIXME: Need async support for load states

  const [, setRefreshIndex] = React.useState<Record<string, number>>({}) // May want to change this to a simple incrementor
  // FIXME: This needs to be reactive somehow; this is already reactive..? Ah nvm, only main BPM causes refresh but not internal

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
      {kits.map(
        (kit: SampleKit): JSX.Element => (
          <div
            key={kit.id}
            className={`${styles.kit} ${
              kit.isReadySync() ? '' : loadAndRefresh(kit)
            }`}
          >
            <h4 className={styles.name}>{kit.name}</h4>

            <div className={styles.controls}>
              <div className={styles['samples-header']}>
                <h4>Samples</h4>

                <button
                  onClick={(): void => {
                    kit.addSample(crypto.randomUUID(), '')

                    refreshKit(kit.id)
                  }}
                >
                  +
                </button>
              </div>

              {Object.keys(kit.samples).map(
                (sampleKey: string): JSX.Element => {
                  return (
                    <label key={sampleKey} className={styles.sample}>
                      <span>{sampleKey}</span>

                      <input
                        type="url"
                        defaultValue={kit.samples[sampleKey]
                          .getUrl()
                          ?.toString()}
                        onChange={getOnUrlChange(kit, sampleKey)}
                      />
                    </label>
                  )
                },
              )}
            </div>
          </div>
        ),
      )}
    </div>
  )
}
