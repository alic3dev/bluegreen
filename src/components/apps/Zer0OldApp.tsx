import React from 'react'

import { SampleKit, Synth, utils, Octave, Note } from 'zer0'

import styles from './Zer0App.module.scss'

const noteTable: Octave[] = utils.createNoteTable(1, 3, 432)
const cMinorScale = utils.getScaleInKey('minor', 'C')

const frequencies = noteTable
  .map((notes) =>
    Object.keys(notes)
      .filter((note) => cMinorScale.includes(note as Note))
      .map((note) => notes[note as Note]),
  )
  .flat()

export function Zer0App(): React.ReactNode {
  const hasStartedRef = React.useRef<boolean>(false)
  const synthRef = React.useRef<Synth>()
  const sampleKitRef = React.useRef<SampleKit>()
  const noteTimeouts = React.useRef<number[]>([])

  const domFrequenciesRef = React.useRef<HTMLDivElement>(null)
  const domKickRef = React.useRef<HTMLDivElement>(null)
  const domSnareRef = React.useRef<HTMLDivElement>(null)
  const domHatRef = React.useRef<HTMLDivElement>(null)

  const onStartClicked = React.useCallback(() => {
    if (!hasStartedRef.current) {
      const audioContext: AudioContext = new AudioContext()

      const synthGain: GainNode = new GainNode(audioContext, { gain: 0.2 })
      const sampleKitGain: GainNode = new GainNode(audioContext, { gain: 0.6 })

      synthGain.connect(audioContext.destination)
      sampleKitGain.connect(audioContext.destination)

      synthRef.current = new Synth({ audioContext, output: synthGain })
      sampleKitRef.current = new SampleKit({
        audioContext,
        samples: {
          kick: '/kits/SwuM Drum Kit/Kicks/kick 1.wav',
          snare: {
            input: '/kits/SwuM Drum Kit/Snare/Snare 6.wav',
            gain: 0.66,
          },
          hat: {
            input: '/kits/SwuM Drum Kit/HiHats/Hihat 2.wav',
            gain: 0.75,
          },
          hatTwo: {
            input: '/kits/SwuM Drum Kit/HiHats/Hihat 8.wav',
            gain: 0.9,
          },
          clicks: {
            input: '/kits/SwuM Drum Kit/Fx/clicks.wav',
            gain: 0.727288,
          },
        },
        output: sampleKitGain,
      })

      hasStartedRef.current = true
    }
  }, [])

  React.useEffect(() => {
    document.title = 'ZER0'

    const onKeydown = (event: KeyboardEvent) => {
      if (!synthRef.current) return

      if (event.key.length === 1) {
        const charCode = event.key.charCodeAt(0)

        const codes: number[] = [97, 115, 100, 102, 103, 104, 106, 107, 108]
        const charCodeIndex: number = codes.indexOf(charCode)

        if (charCodeIndex === -1) return

        // synthRef.current.playNote(
        //   frequencies[charCodeIndex % frequencies.length],
        // )

        // return

        noteTimeouts.current
          .splice(0)
          .forEach((noteTimeout) => clearTimeout(noteTimeout))

        let i: number = 0
        let x: number = 0
        let y: boolean = true
        let offset: number = 2

        const recursivePlayNote = () => {
          if (!synthRef.current || !sampleKitRef.current) {
            return
          }

          const frequencyToPlay =
            frequencies[
              (charCodeIndex +
                i +
                offset +
                (y ? 0 : i % 3 ? Math.floor(Math.random() * 5) : 5)) %
                frequencies.length
            ]

          synthRef.current.playNote(frequencyToPlay)

          if (domFrequenciesRef.current) {
            domFrequenciesRef.current.innerHTML = `${
              frequencyToPlay < 100 ? '&nbsp;' : ''
            }${frequencyToPlay.toPrecision(frequencyToPlay < 100 ? 4 : 5)} Hz`
          }

          if (i % 4 === 0) {
            i += 3
          } else {
            i += 2
          }

          const samplesToPlay = []

          if (x % 16 === 0 || x % 32 === 30 || x % 64 === 63) {
            samplesToPlay.push('kick')
            domKickRef.current?.classList.add(styles.active)
            domSnareRef.current?.classList.remove(styles.active)
          } else if (x % 16 === 8 || x % 32 === 29) {
            samplesToPlay.push('snare')
            domSnareRef.current?.classList.add(styles.active)
            domKickRef.current?.classList.remove(styles.active)
          } else {
            domKickRef.current?.classList.remove(styles.active)
            domSnareRef.current?.classList.remove(styles.active)
          }

          if (x > 0 && (x % 14 === 0 || x % 30 === 0)) {
            samplesToPlay.push({
              name: 'hatTwo',
              gain: Math.random() * 0.5 + 0.3,
            })
          }

          if (x % 16 === 0) {
            samplesToPlay.push({
              name: 'clicks',
              gain: x % 32 === 0 ? 0.33 : 0.6969,
            })
          }

          if (x % 2 === 0 || i % 32 < 4 || i % 64 > 58) {
            samplesToPlay.push({ name: 'hat', gain: 0.3 + (i % 3 ? 0 : 0.6) })
            domHatRef.current?.classList.add(styles.active)
          } else {
            domHatRef.current?.classList.remove(styles.active)
          }

          x++

          if (x % 64 === 0) {
            y = !y
          }

          if (samplesToPlay.length)
            sampleKitRef.current.play(0, ...samplesToPlay)

          if (i % 33 === 0) {
            i = 0

            if (offset === 2) {
              offset = 3
            } else {
              offset = 2
            }
          }

          noteTimeouts.current.push(setTimeout(recursivePlayNote, 133.666))
        }

        recursivePlayNote()
      }
    }

    window.addEventListener('keydown', onKeydown)

    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  return (
    <div className={styles.zer0app}>
      <h1>ゼロ</h1>

      <div ref={domFrequenciesRef} className={styles.frequencies}>
        &nbsp;
      </div>

      <div className={styles.drums}>
        <div ref={domKickRef} className={styles.drum}>
          🦵
        </div>
        <div ref={domSnareRef} className={styles.drum}>
          🥁
        </div>
        <div ref={domHatRef} className={styles.drum}>
          🥢
        </div>
      </div>

      <button onClick={onStartClicked}>音楽</button>
    </div>
  )
}
