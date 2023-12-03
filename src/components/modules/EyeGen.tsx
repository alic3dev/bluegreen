import React from 'react'

import { Eye } from '../decorative'

import styles from './EyeGen.module.scss'

type Note =
  | 'A'
  | 'A#'
  | 'B'
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'

type Octave = {
  [note in Note]: number
}

const scales: { [scale: string]: Note[] } = {
  all: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  minor: ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'],
}

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

export function EyeGen() {
  const noteTable = React.useMemo(createNoteTable, [])
  const [scale, setScale] = React.useState('minor')
  // const [scaleKey, setScaleKey] = React.useState('C')
  const [bpm, setBPM] = React.useState<number>(133)
  const audioContext = React.useRef<AudioContext>()
  const analyser = React.useRef<AnalyserNode>()
  const gainNode = React.useRef<GainNode>()
  const oscillators = React.useRef<OscillatorNode[]>([])
  const audioDataRef = React.useRef<Uint8Array>(new Uint8Array(1024).fill(128))

  const getRandomNoteInScale = React.useCallback(() => {
    return noteTable[Math.floor(Math.random() * 2 + 2)][
      scales[scale][Math.floor(Math.random() * scales[scale].length)]
    ]
  }, [noteTable, scale])

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

      gainNode.current.connect(analyser.current)
    }

    gainNode.current.gain.value = 0
    gainNode.current.gain.linearRampToValueAtTime(
      0.33,
      audioContext.current.currentTime + 2,
    )

    if (!oscillators.current.length) {
      for (let i = 0; i < 3; i++) {
        const newOscillator: OscillatorNode =
          audioContext.current.createOscillator()

        newOscillator.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine'
        newOscillator.detune.value = Math.random() * 4.4
        newOscillator.frequency.value =
          noteTable[Math.floor(Math.random() * 2 + 2)][
            scales[scale][Math.floor(Math.random() * scales[scale].length)]
          ]
        newOscillator.connect(gainNode.current)
        newOscillator.start()

        oscillators.current.push(newOscillator)
      }
    } else {
      oscillators.current[
        Math.floor(Math.random() * oscillators.current.length)
      ].frequency.linearRampToValueAtTime(
        noteTable[Math.floor(Math.random() * 2 + 2)][
          scales[scale][Math.floor(Math.random() * scales[scale].length)]
        ],
        audioContext.current.currentTime + 2,
      )
    }
  }, [noteTable, scale])

  const mute = React.useCallback(() => {
    if (!gainNode.current || !audioContext.current) return

    gainNode.current.gain.linearRampToValueAtTime(
      0,
      audioContext.current.currentTime + 2,
    )
  }, [])

  React.useEffect(() => {
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

    return () => clearInterval(intervalHandler)
  }, [scale, bpm, noteTable, getRandomNoteInScale])

  return (
    <div className={styles.content}>
      <h1 className={styles.title}>音楽を見ます</h1>

      <div className={styles.eye}>
        <Eye audioDataRef={audioDataRef} />
      </div>

      <div className={styles.controls}>
        <div className={styles.dual}>
          <label>
            調
            <br />
            <select value="C" /*onChange={(e) => setScale(e.target.value)}*/>
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
            <select value={scale} onChange={(e) => setScale(e.target.value)}>
              {Object.keys(scales).map((scaleName, index) => (
                <option key={scaleName + index} value={scaleName}>
                  {scaleName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <br />

        <label>
          テンポ
          <br />
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBPM(parseInt(e.target.value) || 60)}
          />
        </label>

        <br />

        <div className={styles.dual}>
          <button onClick={start}>音楽</button>
          <button onClick={mute}>ミュート</button>
        </div>
      </div>
    </div>
  )
}
