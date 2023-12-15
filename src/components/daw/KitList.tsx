import React from 'react'
import { SampleKit } from 'zer0'

import styles from './KitList.module.scss'

export function KitList({ kits }: { kits: SampleKit[] }): JSX.Element {
  // FIXME: Need async support for load states

  const [, setRefreshIndex] = React.useState<Record<string, number>>({}) // May want to change this to a simple incrementor
  // FIXME: This needs to be reactive somehow; this is already reactive..? Ah nvm, only main BPM causes refresh but not internal

  const refreshKit = React.useCallback((name: string, index: number): void => {
    const refreshKey: string = `${name}-${index}`

    setRefreshIndex(
      (prevRefreshIndex: Record<string, number>): Record<string, number> => ({
        ...prevRefreshIndex,
        [refreshKey]: (prevRefreshIndex[refreshKey] ?? 0) + 1,
      }),
    )
  }, [])

  const urlChangeTimeoutLookupRef = React.useRef<Record<string, number>>({})
  const getOnUrlChange =
    (kit: SampleKit, sampleKey: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const timeoutLookupKey: string = kit.id + sampleKey

      if (urlChangeTimeoutLookupRef.current[timeoutLookupKey]) {
        clearTimeout(urlChangeTimeoutLookupRef.current[timeoutLookupKey])
        delete urlChangeTimeoutLookupRef.current[timeoutLookupKey]
      }

      urlChangeTimeoutLookupRef.current[timeoutLookupKey] = setTimeout(() => {
        kit.samples[sampleKey].setUrl(event.target.value)
      }, 250)
    }

  return (
    <div className={styles['kit-list']}>
      {kits.map(
        (kit: SampleKit, index: number): JSX.Element => (
          <div key={kit.id} className={styles.kit}>
            <h4 className={styles.name}>{kit.name}</h4>

            <div className={styles.controls}>
              <div className={styles['samples-header']}>
                <h4>Samples</h4>

                <button
                  onClick={(): void => {
                    kit.addSample(crypto.randomUUID(), '')

                    refreshKit(kit.name, index)
                  }}
                >
                  +
                </button>
              </div>

              {Object.keys(kit.samples).map((sampleKey) => {
                return (
                  <label key={sampleKey} className={styles.sample}>
                    <span>{sampleKey}</span>

                    <input
                      type="url"
                      defaultValue={kit.samples[sampleKey].getUrl()?.toString()}
                      onChange={getOnUrlChange(kit, sampleKey)}
                    />
                  </label>
                )
              })}
            </div>

            {/* <div className={styles.controls}>
              <label>
                Hold
                <input
                  type="number"
                  name="hold"
                  min={0}
                  step={0.01}
                  value={kit.getHold()}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    kit.setHold(event.target.valueAsNumber)

                    refreshKit(kit.name, index)
                  }}
                />
              </label>

              <label>
                Portamento
                <input
                  type="number"
                  name="portamento"
                  min={0}
                  step={0.1}
                  value={kit.getPortamento()}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    kit.setPortamento(event.target.valueAsNumber)

                    refreshKit(kit.name, index)
                  }}
                />
              </label>

              <label>
                BPM Sync{' '}
                <input
                  type="checkbox"
                  name="bpm-sync"
                  checked={kit.getBPMSync()}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    kit.setBPMSync(event.target.value === 'on')

                    // FIXME: Somethings wrong here

                    refreshKit(kit.name, index)
                  }}
                />
              </label>
              <label>
                BPM{' '}
                <input
                  type="number"
                  name="bpm"
                  value={kit.getBPM()}
                  min={1}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    kit.setBPM(event.target.valueAsNumber)

                    refreshKit(kit.name, index)
                  }}
                />
              </label>

              <label>
                Curve
                <input
                  type="text"
                  name="curve"
                  value={JSON.stringify(kit.getGainCurve())}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    kit.setGainCurve(JSON.parse(event.target.value))

                    refreshKit(kit.name, index)
                  }}
                />
              </label>

              <div className={styles.oscillators}>
                <div className={styles['oscillator-header']}>
                  <h4>Oscillators</h4>

                  <button
                    onClick={(): void => {
                      kit.addOscillator('sine')

                      refreshKit(kit.name, index)
                    }}
                  >
                    +
                  </button>
                </div>

                {kit.oscillators.map(
                  (
                    oscillator: Oscillator,
                    oscillatorIndex: number,
                  ): JSX.Element => (
                    <div className={styles.oscillator} key={oscillatorIndex}>
                      <div className={styles['oscillator-header']}>
                        <h5 className={styles.name}>
                          Oscillator {oscillatorIndex + 1}
                        </h5>

                        <button
                          onClick={(): void => {
                            kit.removeOscillator(oscillator)

                            refreshKit(kit.name, index)
                          }}
                        >
                          -
                        </button>
                      </div>

                      <label>
                        Type{' '}
                        <select
                          value={oscillator.type}
                          name="oscillator-type"
                          onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>,
                          ): void => {
                            kit.modifyOscillator(oscillator, {
                              type: event.target.value as OscillatorType,
                            })

                            refreshKit(kit.name, index)
                          }}
                        >
                          <option value="sine">Sine</option>
                          <option value="triangle">Triangle</option>
                          <option value="square">Square</option>
                          <option value="sawtooth">Sawtooth</option>
                        </select>
                      </label>

                      <label>
                        Volume
                        <input
                          type="range"
                          value={oscillator.gain.gain.value * 1000}
                          name="volume"
                          min={0}
                          max={1000}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ): void => {
                            const volume: number = isNaN(
                              event.target.valueAsNumber,
                            )
                              ? 0
                              : event.target.valueAsNumber / 1000

                            kit.modifyOscillator(oscillator, {
                              volume,
                            })

                            refreshKit(kit.name, index)
                          }}
                        />
                      </label>

                      <label>
                        Offset
                        <input
                          type="number"
                          name="offset"
                          value={oscillator.frequency.value}
                          min={-22050}
                          max={22050}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ): void => {
                            oscillator.frequency.value =
                              event.target.valueAsNumber

                            refreshKit(kit.name, index)
                          }}
                        />
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div> */}
          </div>
        ),
      )}
    </div>
  )
}
