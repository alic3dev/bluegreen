import type { Note, Octave, ScaleName } from 'zer0'

import React from 'react'

import { utils } from 'zer0'

import { Eye } from '../decorative'

import styles from './EyeGen.module.scss'

function createNoteTable(
  startingOctave: number = 0,
  endingOctave: number = 10,
  frequency: number = 440,
) {
  const noteTable: Octave[] = []

  for (let i = startingOctave; i <= endingOctave; i++) {
    noteTable.push({
      C: Math.pow(2, (-57 + i * 12) / 12) * frequency,
      'C#': Math.pow(2, (-56 + i * 12) / 12) * frequency,
      D: Math.pow(2, (-55 + i * 12) / 12) * frequency,
      'D#': Math.pow(2, (-54 + i * 12) / 12) * frequency,
      E: Math.pow(2, (-53 + i * 12) / 12) * frequency,
      F: Math.pow(2, (-52 + i * 12) / 12) * frequency,
      'F#': Math.pow(2, (-51 + i * 12) / 12) * frequency,
      G: Math.pow(2, (-50 + i * 12) / 12) * frequency,
      'G#': Math.pow(2, (-49 + i * 12) / 12) * frequency,
      A: Math.pow(2, (-48 + i * 12) / 12) * frequency,
      'A#': Math.pow(2, (-47 + i * 12) / 12) * frequency,
      B: Math.pow(2, (-46 + i * 12) / 12) * frequency,
    })
  }

  return noteTable
}

export function EyeGen({ tones }: { tones?: boolean }) {
  const noteTable = React.useMemo(
    () => createNoteTable(0, 10, utils.frequencyRoots.magic),
    [],
  )
  const [scale, setScale] = React.useState<ScaleName>('minor')
  const [scaleKey, setScaleKey] = React.useState<Note>('C')
  const [bpm, setBPM] = React.useState<number>(133)
  const audioContext = React.useRef<AudioContext>()
  const analyser = React.useRef<AnalyserNode>()
  const gainNode = React.useRef<GainNode>()
  const oscillators = React.useRef<OscillatorNode[]>([])
  const oscillatorGains = React.useRef<GainNode[]>([])
  const audioDataRef = React.useRef<Uint8Array>(new Uint8Array(1024).fill(128))

  const contentRef = React.useRef<HTMLDivElement>(null)

  const scaleInKey = React.useMemo<Note[]>(
    (): Note[] => utils.getScaleInKey(scale, scaleKey),
    [scale, scaleKey],
  )

  const drawOptions = React.useRef({
    fade: 255,
  })

  const getRandomNoteInScale = React.useCallback(() => {
    return noteTable[Math.floor(Math.random() * 2 + 2)][
      scaleInKey[Math.floor(Math.random() * scaleInKey.length)]
    ]
  }, [noteTable, scaleInKey])

  const start = React.useCallback(() => {
    if (!audioContext.current) audioContext.current = new AudioContext()

    if (!analyser.current) {
      analyser.current = audioContext.current.createAnalyser()
      analyser.current.fftSize = 2048
      analyser.current.connect(audioContext.current.destination)

      const bufferLength = analyser.current.frequencyBinCount
      audioDataRef.current = new Uint8Array(bufferLength)

      setInterval(() => {
        if (!analyser.current || !audioDataRef.current) return

        analyser.current.getByteTimeDomainData(audioDataRef.current)
      }, 10)
    }

    if (!gainNode.current) {
      gainNode.current = audioContext.current.createGain()

      if (tones) {
        gainNode.current.connect(analyser.current)
      } else {
        const delay = audioContext.current.createDelay()
        delay.delayTime.value = 60 / 90 / 16

        const delayTwo = audioContext.current.createDelay()
        delayTwo.delayTime.value = 60 / 90 / 32

        const delayGain = audioContext.current.createGain()
        delayGain.gain.value = 0.3

        delay.connect(delayTwo)
        delayTwo.connect(delayGain)
        delayGain.connect(delay)

        gainNode.current.connect(delay)
        delay.connect(analyser.current)
      }
    }

    gainNode.current.gain.value = 0
    gainNode.current.gain.linearRampToValueAtTime(
      0.33,
      audioContext.current.currentTime + 2,
    )

    if (!oscillators.current.length) {
      for (let i = 0; i < (tones ? 12 : 3); i++) {
        const newOscillator: OscillatorNode =
          audioContext.current.createOscillator()

        if (tones) {
          newOscillator.type = 'sine'
          newOscillator.frequency.value = 0 //440

          const oscGain = audioContext.current.createGain()
          oscGain.gain.value = 0

          oscillatorGains.current.push(oscGain)

          newOscillator.connect(oscGain)
          oscGain.connect(gainNode.current)
        } else {
          newOscillator.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine'

          newOscillator.detune.value = Math.random() * 4.4

          newOscillator.frequency.value =
            noteTable[Math.floor(Math.random() * 2 + 2)][
              scaleInKey[Math.floor(Math.random() * scaleInKey.length)]
            ]

          newOscillator.connect(gainNode.current)
        }

        newOscillator.start()

        oscillators.current.push(newOscillator)
      }
    } else {
      if (tones) {
        for (const osc of oscillators.current) {
          osc.frequency.cancelScheduledValues(audioContext.current.currentTime)
          osc.frequency.setValueAtTime(0, audioContext.current.currentTime)
        }
      } else {
        oscillators.current[
          Math.floor(Math.random() * oscillators.current.length)
        ].frequency.linearRampToValueAtTime(
          noteTable[Math.floor(Math.random() * 2 + 2)][
            scaleInKey[Math.floor(Math.random() * scaleInKey.length)]
          ],
          audioContext.current.currentTime + 2,
        )
      }
    }
  }, [tones, noteTable, scaleInKey])

  const mute = React.useCallback((): void => {
    if (!gainNode.current || !audioContext.current) return

    gainNode.current.gain.linearRampToValueAtTime(
      0,
      audioContext.current.currentTime + 2,
    )
  }, [])

  React.useEffect((): (() => void) | void => {
    if (tones) return

    const intervalHandler = window.setInterval(() => {
      if (!oscillators.current.length) return

      if (Math.random() * 4 > 1) return

      if (Math.random() * 10 > 2) {
        if (Math.random() * 4 > 1) {
          oscillators.current[
            Math.floor(Math.random() * oscillators.current.length)
          ].frequency.value = getRandomNoteInScale()
        } else {
          oscillators.current[
            Math.floor(Math.random() * oscillators.current.length)
          ].frequency.linearRampToValueAtTime(
            getRandomNoteInScale(),
            (audioContext.current?.currentTime ?? 0) + 2,
          )
        }
      } else {
        const freq = getRandomNoteInScale()

        for (const oscillator of oscillators.current) {
          oscillator.frequency.value = freq
        }
      }
    }, 60000 / bpm)

    return (): void => clearInterval(intervalHandler)
  }, [tones, scale, bpm, noteTable, getRandomNoteInScale])

  React.useEffect((): (() => void) => {
    audioContext.current?.resume()

    for (const oscillator of oscillators.current) {
      oscillator.start()
    }

    return (): void => {
      audioContext.current?.suspend()

      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const oscillator of oscillators.current) {
        oscillator.stop()
      }
    }
  }, [])

  return (
    <div
      ref={contentRef}
      className={`${styles.content} ${tones ? styles.full : ''}`}
    >
      <h1 className={styles.title}>音楽を見ます</h1>

      <div className={styles.eye}>
        <Eye
          drawOptions={drawOptions}
          audioDataRef={audioDataRef}
          full={tones}
        />
      </div>

      <div className={styles.controls}>
        {tones ? (
          <div className={styles.dual}>
            <label>
              調
              <br />
              <form
                onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                  event.preventDefault()
                  event.stopPropagation()

                  if (!oscillators.current.length) {
                    start()
                  }

                  const values: number[] = []
                  const gainValues: number[] = []
                  const types: OscillatorType[] = []

                  const inputs =
                    event.currentTarget.querySelectorAll('input.freq')
                  for (const input of inputs) {
                    values.push(parseFloat((input as HTMLInputElement).value))
                  }

                  const fade = event.currentTarget.querySelector('input.fade')
                  if (fade) {
                    drawOptions.current.fade = parseInt(
                      (fade as HTMLInputElement).value,
                    )
                  }

                  const gains =
                    event.currentTarget.querySelectorAll('input.gain')
                  for (const gainInput of gains) {
                    gainValues.push(
                      parseInt((gainInput as HTMLInputElement).value),
                    )
                  }
                  console.log(gainValues)

                  const selects = event.currentTarget.querySelectorAll('select')
                  for (const select of selects) {
                    types.push(select.value as OscillatorType)
                  }

                  for (let i = 0; i < oscillators.current.length; i++) {
                    oscillators.current[i].frequency.value = values[i] || 0
                    oscillators.current[i].type = types[i] || 'sine'

                    oscillatorGains.current[i].gain.setValueAtTime(
                      values[i] ? (gainValues[i] ?? 300) / 1000 : 0,
                      0,
                    )
                  }
                }}
              >
                {new Array(12).fill(null).map(
                  (_: null, index: number): React.ReactNode => (
                    <div key={index} className={styles['tone-control']}>
                      <input
                        defaultValue={0}
                        className="freq"
                        type="number"
                        step="any"
                      />
                      <select defaultValue="sine">
                        <option value="sine">Sine</option>
                        <option value="triangle">Triangle</option>
                        <option value="square">Square</option>
                        <option value="sawtooth">Sawtooth</option>
                      </select>
                      <input
                        className="gain"
                        type="range"
                        min={0}
                        max={1000}
                        defaultValue={300}
                        step={1}
                      />
                    </div>
                  ),
                )}

                <div className={styles['tone-control']}>
                  <input
                    type="number"
                    className="fade"
                    min={0}
                    max={255}
                    defaultValue={drawOptions.current.fade}
                  />

                  <button type="submit">音楽</button>

                  <button type="reset">0 0 0</button>
                </div>
              </form>
            </label>
          </div>
        ) : (
          <div className={styles.dual}>
            <label>
              調
              <br />
              <select
                value="C"
                onChange={(e) => setScaleKey(e.target.value as Note)}
              >
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
              </select>
            </label>

            <label>
              音階
              <br />
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value as ScaleName)}
              >
                {Object.keys(utils.scales).map((scaleName, index) => (
                  <option key={scaleName + index} value={scaleName}>
                    {scaleName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              テンポ
              <br />
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBPM(parseInt(e.target.value) || 60)}
              />
            </label>
          </div>
        )}

        <label className={styles.label}>
          音量
          <input
            value={gainNode.current?.gain.value}
            type="range"
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => {
              gainNode.current?.gain.setValueAtTime(
                e.currentTarget.valueAsNumber,
                0,
              )
            }}
          />
        </label>

        {!tones && (
          <>
            <div className={styles.dual}>
              <button onClick={start}>音楽</button>
              <button onClick={mute}>ミュート</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
