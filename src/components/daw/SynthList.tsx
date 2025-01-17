import type { Channel, Oscillator, Synth } from 'zer0'

import React from 'react'

import { EffectChainList } from './EffectChainList'

import styles from './SynthList.module.scss'

export function SynthList({
  synths,
  channels,
}: {
  synths: Synth[]
  channels: Channel[]
}): JSX.Element {
  const [, setRefreshIndex] = React.useState<Record<string, number>>({}) // May want to change this to a simple incrementor

  const [selectedSynthID, setSelectedSynthID] = React.useState<string>(
    synths.length ? synths[0].id : '',
  )
  const selectedSynth = React.useMemo<Synth | null>(
    (): Synth | null =>
      selectedSynthID
        ? synths.find(
            (synth: Synth): boolean => synth.id === selectedSynthID,
          ) ?? null
        : null,
    [selectedSynthID, synths],
  )

  const refreshSynth = React.useCallback((id: string): void => {
    setRefreshIndex(
      (prevRefreshIndex: Record<string, number>): Record<string, number> => ({
        ...prevRefreshIndex,
        [id]: (prevRefreshIndex[id] ?? 0) + 1,
      }),
    )
  }, [])

  React.useEffect((): void => {
    if (synths.length === 1) {
      setSelectedSynthID(synths[0].id)
    }
  }, [synths])

  return (
    <div className={styles['synth-list']}>
      <select
        className={styles['tabbed-selector']}
        value={selectedSynthID}
        onChange={(event) => setSelectedSynthID(event.currentTarget.value)}
      >
        <option value=""></option>
        {synths.map(
          (synth: Synth): React.ReactNode => (
            <option value={synth.id} key={synth.id}>
              {synth.name}
            </option>
          ),
        )}
      </select>

      <select
        className={styles['tabbed-selector']}
        value={selectedSynth ? selectedSynth.getChannel()?.id : ''}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
          if (!selectedSynth) return

          const selectedChannel: Channel | undefined = channels.find(
            (channel: Channel): boolean =>
              channel.id === event.currentTarget.value,
          )

          if (selectedChannel) {
            selectedSynth.setChannel(selectedChannel)

            refreshSynth(selectedSynth.id)
          }
        }}
      >
        <option value=""></option>
        {selectedSynth &&
          channels.map(
            (channel: Channel): React.ReactNode => (
              <option value={channel.id} key={channel.id}>
                {channel.name}
              </option>
            ),
          )}
      </select>

      {selectedSynth && (
        <div key={`${selectedSynth.id}`} className={styles['tabbed-content']}>
          <div className={styles['tabbed-controls']}>
            <label>
              Hold
              <input
                type="number"
                name="hold"
                min={0}
                step={0.01}
                defaultValue={selectedSynth.getHold()}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ): void => {
                  const newHold: number = event.target.valueAsNumber

                  if (!Number.isNaN(newHold) && newHold >= 0) {
                    selectedSynth.setHold(event.target.valueAsNumber)
                  }

                  refreshSynth(selectedSynth.id)
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
                defaultValue={selectedSynth.getPortamento()}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ): void => {
                  const newPortamento: number = event.target.valueAsNumber

                  if (!Number.isNaN(newPortamento) && newPortamento >= 0) {
                    selectedSynth.setPortamento(event.target.valueAsNumber)
                  }

                  refreshSynth(selectedSynth.id)
                }}
              />
            </label>

            <label>
              BPM Sync{' '}
              <input
                type="checkbox"
                name="bpm-sync"
                defaultChecked={selectedSynth.BPMSync.getSync()}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ): void => {
                  selectedSynth.BPMSync.setSync(event.currentTarget.checked)

                  refreshSynth(selectedSynth.id)
                }}
              />
            </label>

            <label>
              Curve
              <input
                type="text"
                name="curve"
                defaultValue={JSON.stringify(selectedSynth.getGainCurve())}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ): void => {
                  let newGainCurve: unknown[] | undefined

                  try {
                    newGainCurve = JSON.parse(event.target.value)
                  } catch {
                    /* Empty */
                  }

                  if (
                    Array.isArray(newGainCurve) &&
                    !newGainCurve.find(
                      (value: unknown): boolean =>
                        typeof value !== 'number' || Number.isNaN(value),
                    )
                  ) {
                    selectedSynth.setGainCurve(newGainCurve as number[])
                  }

                  refreshSynth(selectedSynth.id)
                }}
              />
            </label>

            <br />

            <div className={styles.oscillators}>
              <div className={styles['tabbed-button-header']}>
                <h4 className={styles['tabbed-name']}>Oscillators</h4>

                <button
                  onClick={(): void => {
                    selectedSynth.addOscillator('sine')

                    refreshSynth(selectedSynth.id)
                  }}
                >
                  +
                </button>
              </div>

              {selectedSynth.oscillators.map(
                (
                  oscillator: Oscillator,
                  oscillatorIndex: number,
                ): JSX.Element => (
                  <div className={styles.oscillator} key={oscillatorIndex}>
                    <div className={styles['tabbed-button-header']}>
                      <h5 className={styles['tabbed-name']}>
                        Oscillator {oscillatorIndex + 1}
                      </h5>

                      <button
                        onClick={(): void => {
                          selectedSynth.removeOscillator(oscillator)

                          refreshSynth(selectedSynth.id)
                        }}
                      >
                        -
                      </button>
                    </div>

                    <label>
                      Type{' '}
                      <select
                        defaultValue={oscillator.type}
                        name="oscillator-type"
                        onChange={(
                          event: React.ChangeEvent<HTMLSelectElement>,
                        ): void => {
                          selectedSynth.modifyOscillator(oscillator, {
                            type: event.target.value as OscillatorType,
                          })

                          refreshSynth(selectedSynth.id)
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
                        defaultValue={oscillator.gain.gain.value * 1000}
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

                          selectedSynth.modifyOscillator(oscillator, {
                            volume,
                          })

                          refreshSynth(selectedSynth.id)
                        }}
                      />
                    </label>

                    <label>
                      Offset
                      <input
                        type="number"
                        name="offset"
                        defaultValue={oscillator.frequency.value}
                        min={-22050}
                        max={22050}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ): void => {
                          const newOffset: number = event.target.valueAsNumber

                          if (!Number.isNaN(newOffset)) {
                            oscillator.frequency.value = newOffset
                          }

                          refreshSynth(selectedSynth.id)
                        }}
                      />
                    </label>
                  </div>
                ),
              )}
            </div>

            <EffectChainList effectChain={selectedSynth.effectChain} />
          </div>
        </div>
      )}
    </div>
  )
}
