import React from 'react'
import {
  CiFloppyDisk,
  CiFolderOn,
  CiPlay1,
  CiSettings,
  CiSquarePlus,
  CiStop1,
  CiUndo,
} from 'react-icons/ci'

import { Channel, Effect, effects, Synth } from 'zer0'

import {
  ChannelList,
  ChannelWithOptions,
  Track,
  TrackOptions,
  SynthList,
} from '../daw'

import {
  DialogContainer,
  ConfirmDialog,
  SettingsDialog,
} from '../layout/Dialogs'
import { Tabbed } from '../layout/Tabbed'

import styles from './Zer0App.module.scss'

interface AudioRef {
  context: AudioContext
  gain: GainNode
}

let defaultAudioRef: AudioRef

const getDefaultAudioRef = (): AudioRef => {
  if (defaultAudioRef) return defaultAudioRef

  const context: AudioContext = new AudioContext()

  const gain: GainNode = context.createGain()
  gain.gain.value = 0.75
  gain.connect(context.destination)

  return (defaultAudioRef = {
    context,
    gain,
  })
}

export function Zer0App(): JSX.Element {
  const [dialogs, setDialogs] = React.useState<JSX.Element[]>([])

  const audioRef = React.useRef<AudioRef>(getDefaultAudioRef())
  const generatedChannelsRef = React.useRef<number>(1)

  const generateChannel = React.useCallback(
    (name?: string): ChannelWithOptions => ({
      id: crypto.randomUUID(),
      name: name ?? `Channel ${generatedChannelsRef.current++}`,

      channel: new Channel(audioRef.current.context, audioRef.current.gain),
    }),
    [],
  )

  const [channels, setChannels] = React.useState<ChannelWithOptions[]>(
    (): ChannelWithOptions[] => [generateChannel('Main')],
  )

  const delayReverb = React.useRef<Effect>(
    new effects.reverb.DelayReverb(
      audioRef.current.context,
      channels[0].channel.destination, // FIXME: Routing is getting confusing, refactor how these connect/link
    ),
  )

  // TODO: Make a `SynthWithOptions` interface
  const [synths, setSynths] = React.useState<Synth[]>((): Synth[] => [
    new Synth(
      audioRef.current.context,
      'Basic',
      delayReverb.current.input /*channels[0].channel.destination*/,
    ),
  ])

  const trackInfoRef = React.useRef<{
    numberOfGeneratedTracks: number
    registeredSteps: Record<string, () => void>
    registeredResets: Record<string, () => void>
  }>({
    numberOfGeneratedTracks: 1,
    registeredSteps: {},
    registeredResets: {},
  })

  const step = React.useCallback(
    (): void =>
      Object.values(trackInfoRef.current.registeredSteps).forEach(
        (subStep: () => void): void => subStep(),
      ),
    [],
  )

  const reset = React.useCallback(
    (): void =>
      Object.values(trackInfoRef.current.registeredResets).forEach(
        (subReset: () => void): void => subReset(),
      ),
    [],
  )

  const generateNewTrack = React.useCallback((): TrackOptions => {
    const id: string = crypto.randomUUID()

    return {
      id,
      title: `Track ${trackInfoRef.current.numberOfGeneratedTracks++}`,
      registerStep(subStep: () => void): void {
        trackInfoRef.current.registeredSteps[id] = subStep
      },
      registerReset(subReset: () => void): void {
        trackInfoRef.current.registeredResets[id] = subReset
      },
      unregisterStep(): void {
        delete trackInfoRef.current.registeredSteps[id]
      },
      unregisterReset(): void {
        delete trackInfoRef.current.registeredResets[id]
      },
      remove(): void {
        setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id))
      },
    }
  }, [])

  const [tracks, setTracks] = React.useState<TrackOptions[]>(
    (): TrackOptions[] => [generateNewTrack()],
  )

  const [bpm, setBPM] = React.useState<number>(270)
  const [playing, setPlaying] = React.useState<boolean>(false)

  synths
    .filter((synth: Synth): boolean => synth.getBPMSync())
    .forEach((synth: Synth): void => synth.setBPM(bpm))

  /*
  // FIXME: Figure out why these don't work, may need to set metadata first?
  //        Probably not worthwhile to pursue.

  React.useEffect(() => {
    if (playing) navigator.mediaSession.playbackState = 'playing'
    else navigator.mediaSession.playbackState = 'paused'
  
    navigator.mediaSession.setActionHandler('play', () => {
      console.log('play')
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('pause')
    })
    navigator.mediaSession.setActionHandler('stop', () => {
      console.log('stop')
    })
  }, [playing])
  */

  const addSynthTrack = React.useCallback((): void => {
    const originalName: string = 'Basic'
    let accumulatedName: string = `${originalName}`
    let accumulator: number = 2

    while (
      synths.find((synth: Synth): boolean => synth.name === accumulatedName)
    ) {
      accumulatedName = `${originalName} ${accumulator++}`
    }

    const newTrack: TrackOptions = generateNewTrack()
    const newSynth: Synth = new Synth(
      audioRef.current.context,
      accumulatedName,
      channels[0].channel.destination,
    )

    setSynths((prevSynths: Synth[]): Synth[] => [...prevSynths, newSynth])
    setTracks((prevTracks: TrackOptions[]): TrackOptions[] => [
      ...prevTracks,
      newTrack,
    ])
  }, [generateNewTrack, channels, synths])

  // FIXME: Implement this and feed into Tracks
  // const removeTrack = React.useCallback(() => {}, [])

  const addChannel = React.useCallback((): void => {
    const newChannel: ChannelWithOptions = generateChannel()

    setChannels((prevChannels: ChannelWithOptions[]): ChannelWithOptions[] => [
      ...prevChannels,
      newChannel,
    ])
  }, [generateChannel])

  const removeChannel = React.useCallback((id: string): void => {
    setChannels((prevChannels: ChannelWithOptions[]): ChannelWithOptions[] => {
      const channelIndex: number = prevChannels.findIndex(
        (channel: ChannelWithOptions): boolean => channel.id === id,
      )

      if (channelIndex === -1) return prevChannels

      return [
        ...prevChannels.slice(0, channelIndex),
        ...prevChannels.slice(channelIndex + 1),
      ]

      // FIXME: Will need to update anything dependant on this channel; switch them to the Main channel?
    })
  }, [])

  React.useEffect((): undefined | (() => void) => {
    if (playing) {
      let playFunctionTimeout: number

      const playFunction = (): void => {
        step()

        playFunctionTimeout = setTimeout(playFunction, (60 / bpm) * 1000)
      }

      playFunction()

      return (): void => clearTimeout(playFunctionTimeout)
    }
  }, [step, playing, bpm])

  const onSaveClick = () => {
    alert('save')
  }
  const onOpenClick = () => {
    alert('open')
  }
  const onNewClick = () => {
    const newConfirmDialog = (
      <ConfirmDialog
        key={crypto.randomUUID()}
        title="Create a new project"
        onCancel={() => {
          setDialogs((prevDialogs) =>
            prevDialogs.filter((dialog) => dialog !== newConfirmDialog),
          )
        }}
        onConfirm={() => {
          setDialogs((prevDialogs) =>
            prevDialogs.filter((dialog) => dialog !== newConfirmDialog),
          )

          // TODO: Implement this
          alert('implement me!!@!')
        }}
        // dangerous
      >
        <p>Are you sure you want to make a new project?</p>
        <p className={styles.small}>(All unsaved changes will be lost.)</p>
      </ConfirmDialog>
    )

    setDialogs((prevDialogs) => [...prevDialogs, newConfirmDialog])
  }
  const onSettingsClick = () => {
    const newSettingsDialog = (
      <SettingsDialog
        key={crypto.randomUUID()}
        close={(): void => {
          setDialogs((prevDialogs) =>
            prevDialogs.filter((dialog) => dialog !== newSettingsDialog),
          )
        }}
      />
    )

    setDialogs((prevDialogs) => [...prevDialogs, newSettingsDialog])
  }

  React.useEffect((): (() => void) => {
    const keyboardShortcutListener = (event: KeyboardEvent): void => {
      if (event.metaKey) {
        if (event.key === 'o') {
          event.preventDefault()
          event.stopPropagation()

          onOpenClick()
        } else if (event.key === 's') {
          event.preventDefault()
          event.stopPropagation()

          onSaveClick()
        } else if (event.key === 'p') {
          event.preventDefault()
          event.stopPropagation()

          onNewClick()
        } else if (event.key === ',') {
          event.preventDefault()
          event.stopPropagation()

          onSettingsClick()
        }
      }
    }

    window.addEventListener('keydown', keyboardShortcutListener)

    return () => {
      window.removeEventListener('keydown', keyboardShortcutListener)
    }
  }, [])

  const rightSideBarTabsIdLookup = React.useMemo(
    () => ({
      synths: crypto.randomUUID(),
      channels: crypto.randomUUID(),
    }),
    [],
  )

  return (
    <div className={styles.zer0app}>
      <div className={styles.controls}>
        <h1 className={styles.title}>ZER0</h1>

        <div className={styles['project-controls']}>
          <button
            className={styles['project-control-save']}
            title="Save"
            onClick={onSaveClick}
          >
            <CiFloppyDisk />
          </button>

          <button
            className={styles['project-control-open']}
            title="Open"
            onClick={onOpenClick}
          >
            <CiFolderOn />
          </button>

          <button
            className={styles['project-control-new']}
            title="New"
            onClick={onNewClick}
          >
            <CiSquarePlus />
          </button>
        </div>

        <div className={styles.spacer} />

        <button
          onClick={(): void =>
            setPlaying((prevPlaying: boolean): boolean => !prevPlaying)
          }
          className={playing ? styles.stop : styles.play}
        >
          {playing ? <CiStop1 /> : <CiPlay1 />}
        </button>
        <button onClick={reset} className={styles.reset}>
          <CiUndo />
        </button>
        <label className={styles['bpm-wrapper']}>
          <span className={styles['bpm-text']}>BPM</span>
          <input
            type="number"
            min={1}
            name="BPM"
            className={styles.bpm}
            autoComplete="off"
            value={bpm}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              const newBPM: number = event.target.valueAsNumber

              if (!isNaN(newBPM) && newBPM > 0) {
                setBPM(newBPM)
              }
            }}
          />
        </label>

        <div className={styles.spacer} />

        <input
          type="range"
          min={0}
          max={1000}
          title="Gain"
          autoComplete="off"
          defaultValue={audioRef.current.gain.gain.value * 1000}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
            audioRef.current.gain.gain.value = event.target.valueAsNumber / 1000
          }}
          style={{ visibility: 'hidden' }}
        />

        <div className={styles['project-controls']}>
          <button
            className={styles['project-control-settings']}
            title="Settings"
            onClick={onSettingsClick}
          >
            <CiSettings />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles['track-section']}>
          <div className={styles['track-section-controls']}>
            <button onClick={addSynthTrack}>New Synth Track</button>
          </div>

          <div className={styles['track-container']}>
            {tracks.map(
              (trackOptions: TrackOptions, index: number): JSX.Element => (
                <Track
                  options={trackOptions}
                  key={trackOptions.id}
                  index={index}
                  channels={channels}
                  synths={synths}
                />
              ),
            )}
          </div>
        </div>

        <Tabbed
          tabs={[
            {
              id: rightSideBarTabsIdLookup.synths,
              name: 'Synths',
              element: <SynthList synths={synths} />,
            },
            {
              id: rightSideBarTabsIdLookup.channels,
              name: 'Channels',
              element: (
                <ChannelList
                  channels={channels}
                  addChannel={addChannel}
                  removeChannel={removeChannel}
                />
              ),
            },
          ]}
        />
      </div>

      <DialogContainer dialogs={dialogs} setDialogs={setDialogs} />
    </div>
  )
}
