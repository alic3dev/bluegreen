import React from 'react'

import { Synth } from 'zer0'

import styles from './SynthList.module.scss'

export function SynthList({ synths }: { synths: Synth[] }) {
  const [, setRefreshIndex] = React.useState<Record<string, number>>({}) // May want to change this to a simple incrementor
  // FIXME: This needs to be reactive somehow; this is already reactive..? Ah nvm, only main BPM causes refresh but not internal

  const refreshSynth = React.useCallback(
    (name: string, index: number): void => {
      const refreshKey: string = `${name}-${index}`

      setRefreshIndex((prevRefreshIndex) => ({
        ...prevRefreshIndex,
        [refreshKey]: (prevRefreshIndex[refreshKey] ?? 0) + 1,
      }))
    },
    [],
  )

  return (
    <div className={styles['synth-list']}>
      {synths.map((synth, index) => (
        <div key={`${synth.name}-${index}`} className={styles.synth}>
          <h4 className={styles.name}>{synth.name}</h4>

          <div className={styles.controls}>
            <label>
              Hold
              <input
                type="number"
                name="hold"
                min={0}
                step={0.01}
                value={synth.getHold()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  synth.setHold(event.target.valueAsNumber)

                  refreshSynth(synth.name, index)
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
                value={synth.getPortamento()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  synth.setPortamento(event.target.valueAsNumber)

                  refreshSynth(synth.name, index)
                }}
              />
            </label>

            <label>
              BPM Sync{' '}
              <input
                type="checkbox"
                name="bpm-sync"
                checked={synth.getBPMSync()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  synth.setBPMSync(event.target.value === 'on')

                  // FIXME: Somethings wrong here

                  refreshSynth(synth.name, index)
                }}
              />
            </label>
            <label>
              BPM{' '}
              <input
                type="number"
                name="bpm"
                value={synth.getBPM()}
                min={1}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  synth.setBPM(event.target.valueAsNumber)

                  refreshSynth(synth.name, index)
                }}
              />
            </label>

            <div className={styles.oscillators}>
              <div className={styles['oscillator-header']}>
                <h4>Oscillators</h4>

                <button
                  onClick={() => {
                    synth.addOscillator('sine')

                    refreshSynth(synth.name, index)
                  }}
                >
                  +
                </button>
              </div>

              {synth.oscillators.map((oscillator, oscillatorIndex) => (
                <div className={styles.oscillator} key={oscillatorIndex}>
                  <div className={styles['oscillator-header']}>
                    <h5 className={styles.name}>
                      Oscillator {oscillatorIndex + 1}
                    </h5>

                    <button
                      onClick={() => {
                        synth.removeOscillator(oscillator)

                        refreshSynth(synth.name, index)
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
                      ) => {
                        synth.modifyOscillator(oscillator, {
                          type: event.target.value as OscillatorType,
                        })

                        refreshSynth(synth.name, index)
                      }}
                    >
                      <option value="sine">Sine</option>
                      <option value="triangle">Triangle</option>
                      <option value="square">Square</option>
                      <option value="sawtooth">Sawtooth</option>
                    </select>
                  </label>

                  <label>
                    Curve
                    <input
                      type="text"
                      name="curve"
                      value={JSON.stringify(synth.getGainCurve())}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        synth.setGainCurve(JSON.parse(event.target.value))

                        refreshSynth(synth.name, index)
                      }}
                    />
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
                      ) => {
                        const volume = isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber / 1000

                        synth.modifyOscillator(oscillator, {
                          volume,
                        })

                        refreshSynth(synth.name, index)
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
                      ) => {
                        oscillator.frequency.value = event.target.valueAsNumber

                        refreshSynth(synth.name, index)
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
