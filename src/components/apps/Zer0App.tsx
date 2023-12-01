import React from 'react'
import { CiPlay1, CiStop1, CiUndo } from 'react-icons/ci'

import { /*SampleKit,*/ Channel, Synth /*utils, Octave, Note*/ } from 'zer0'

import { ChannelList, Track, TrackOptions, SynthList } from '../daw'

import styles from './Zer0App.module.scss'
import { Tabbed } from '../layout/Tabbed'

interface AudioRef {
  context: AudioContext
  gain: GainNode
}

let defaultAudioRef: AudioRef

const getDefaultAudioRef = (): AudioRef => {
  if (defaultAudioRef) return defaultAudioRef

  const context = new AudioContext()
  const gain = context.createGain()
  gain.gain.value = 0.75
  gain.connect(context.destination)

  return (defaultAudioRef = {
    context,
    gain,
  })
}

export function Zer0App() {
  const audioRef = React.useRef<AudioRef>(getDefaultAudioRef())

  const [synths] = React.useState<Synth[]>(() => [
    new Synth(audioRef.current.context, audioRef.current.gain),
  ])

  const [channels] = React.useState<Channel[]>(() => [
    new Channel(audioRef.current.context, audioRef.current.gain),
  ])

  const trackInfoRef = React.useRef<{
    numberOfGeneratedTracks: number
    registeredSteps: Record<string, () => void>
    registeredResets: Record<string, () => void>
  }>({
    numberOfGeneratedTracks: 0,
    registeredSteps: {},
    registeredResets: {},
  })

  const generateNewTrack = React.useCallback((): TrackOptions => {
    const id: string = Math.random().toString()

    return {
      id,
      title: `Track ${trackInfoRef.current.numberOfGeneratedTracks++}`,
      registerStep: (subStep: () => void): void => {
        trackInfoRef.current.registeredSteps[id] = subStep
      },
      registerReset: (subReset: () => void): void => {
        trackInfoRef.current.registeredResets[id] = subReset
      },
      unregisterStep: (): void => {
        delete trackInfoRef.current.registeredSteps[id]
      },
      unregisterReset: (): void => {
        delete trackInfoRef.current.registeredResets[id]
      },
    }
  }, [])

  const step = React.useCallback(() => {
    Object.values(trackInfoRef.current.registeredSteps).forEach((subStep) =>
      subStep(),
    )
  }, [])

  const reset = React.useCallback(() => {
    Object.values(trackInfoRef.current.registeredResets).forEach((subReset) =>
      subReset(),
    )
  }, [])

  const [tracks, setTracks] = React.useState<TrackOptions[]>(() => [
    generateNewTrack(),
  ])

  const [bpm, setBPM] = React.useState<number>(90)
  const [playing, setPlaying] = React.useState<boolean>(false)

  // React.useEffect(() => {
  //   if (playing) navigator.mediaSession.playbackState = 'playing'
  //   else navigator.mediaSession.playbackState = 'paused'

  //   // FIXME: Figure out why these don't work, may need to set metadata first?
  //   navigator.mediaSession.setActionHandler('play', () => {
  //     console.log('play')
  //   })
  //   navigator.mediaSession.setActionHandler('pause', () => {
  //     console.log('pause')
  //   })
  //   navigator.mediaSession.setActionHandler('stop', () => {
  //     console.log('stop')
  //   })
  // }, [playing])

  const addTrack = React.useCallback(() => {
    const newTrack: TrackOptions = generateNewTrack()

    setTracks((prevTracks: TrackOptions[]) => [...prevTracks, newTrack])
  }, [generateNewTrack])

  React.useEffect(() => {
    if (playing) {
      let playFunctionTimeout: number

      const playFunction = () => {
        step()

        playFunctionTimeout = setTimeout(playFunction, (60 / bpm) * 1000)
      }

      playFunction()

      return () => clearTimeout(playFunctionTimeout)
    }
  }, [step, playing, bpm])

  return (
    <div className={styles.zer0app}>
      {/* <h1 className={styles.title}>ZER0</h1> */}

      <div className={styles.controls}>
        <h1 className={styles.title}>ZER0</h1>

        <div className={styles.spacer} />

        <button
          onClick={() => setPlaying((prevPlaying) => !prevPlaying)}
          className={playing ? styles.stop : styles.play}
        >
          {playing ? <CiStop1 /> : <CiPlay1 />}
        </button>
        <button onClick={reset} className={styles.reset}>
          <CiUndo />
        </button>
        <input
          type="number"
          min={1}
          max={999}
          name="BPM"
          className={styles.bpm}
          placeholder="BPM"
          autoComplete="off"
          value={bpm}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const newBPM = event.target.valueAsNumber

            if (!isNaN(newBPM) && newBPM > 0) {
              setBPM(newBPM)
            }
          }}
        />

        <div className={styles.spacer} />

        <input
          type="range"
          min={0}
          max={1000}
          title="Gain"
          autoComplete="off"
          defaultValue={audioRef.current.gain.gain.value * 1000}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            (audioRef.current.gain.gain.value =
              event.target.valueAsNumber / 1000)
          }
        />
      </div>

      <div className={styles.content}>
        <div className={styles['track-section']}>
          <div className={styles['track-section-title']}>Tracks</div>
          <div className={styles['track-section-controls']}>
            <button onClick={addTrack}>Add</button>
          </div>

          <div className={styles['track-container']}>
            {tracks.map((trackOptions) => (
              <Track
                options={trackOptions}
                key={trackOptions.id}
                synths={synths}
              />
            ))}
          </div>
        </div>

        <Tabbed
          tabs={[
            {
              name: 'Synths',
              element: <SynthList synths={synths} />,
            },
            {
              name: 'Channels',
              element: <ChannelList channels={channels} />,
            },
          ]}
        />
      </div>
    </div>
  )
}
