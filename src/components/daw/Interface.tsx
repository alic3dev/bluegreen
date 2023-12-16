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

import {
  Channel,
  Effect,
  effects,
  SampleKit,
  Synth,
  SynthPresetValues,
} from 'zer0'

import {
  ChannelList,
  ChannelWithOptions,
  Track,
  TrackOptions,
  SynthList,
} from '.'

import {
  DialogContainer,
  ConfirmDialog,
  SettingsDialog,
  OpenDialog,
} from '../layout/Dialogs'
import { Tabbed } from '../layout/Tabbed'

import {
  Project,
  ProjectContext,
  ProjectKitTrack,
  ProjectSynthTrack,
  ProjectTrack,
} from '../../contexts'

import styles from './Interface.module.scss'
import { KitList } from './KitList'
import { TapBpm } from './TapBpm'
import {
  SampleKitPresetValues,
  SampleKitPresetValuesParsed,
} from 'zer0/src/SampleKitPreset'

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

export function Interface(): JSX.Element {
  // const settings: Settings = React.useContext(SettingsContext)
  const project: Project = React.useContext(ProjectContext)
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<Project>> } = project

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

  // TODO: Make a `SynthWithOptions` interface - Possibly unneeded, will determine in the future
  const [synths, setSynths] = React.useState<Synth[]>((): Synth[] => {
    // FIXME: This is loading all synth presets, be more effiecient about it (Only project Synths)
    const savedSynths: SynthPresetValues[] = []
    for (let i: number = 0; i < window.localStorage.length; i++) {
      const synthStorageKey = window.localStorage.key(i)

      if (!synthStorageKey || !synthStorageKey.startsWith('ゼロ：Synth：')) {
        continue
      }

      const synthStorageString = window.localStorage.getItem(synthStorageKey)

      if (!synthStorageString) continue

      try {
        savedSynths.push(JSON.parse(synthStorageString))
      } catch {
        window.localStorage.removeItem(synthStorageKey)
      }
    }

    // FIXME: Install hook causes two synths to always be generated...

    // FIXME: Synths don't save their position/order
    return savedSynths.length
      ? savedSynths.map((savedSynthPreset, index) => {
          const newSynth = new Synth(
            audioRef.current.context,
            savedSynthPreset.name,
            index ? channels[0].channel.destination : delayReverb.current.input,
            savedSynthPreset,
          )

          newSynth.id = savedSynthPreset.id

          return newSynth
        })
      : [
          new Synth(
            audioRef.current.context,
            'Basic',
            delayReverb.current.input /*channels[0].channel.destination*/,
          ),
        ]
  })

  const [kits /*, setKits*/] = React.useState<SampleKit[]>((): SampleKit[] => {
    // FIXME: This is loading all synth presets, be more effiecient about it (Only project Synths)
    const savedKits: SampleKitPresetValues[] = []
    for (let i: number = 0; i < window.localStorage.length; i++) {
      const synthStorageKey = window.localStorage.key(i)

      if (
        !synthStorageKey ||
        !synthStorageKey.startsWith('ゼロ：Sample＿Kit：')
      ) {
        continue
      }

      const synthStorageString = window.localStorage.getItem(synthStorageKey)

      if (!synthStorageString) continue

      try {
        savedKits.push(JSON.parse(synthStorageString))
      } catch {
        window.localStorage.removeItem(synthStorageKey)
      }
    }

    // FIXME: Install hook causes two synths to always be generated...

    // FIXME: Synths don't save their position/order
    return savedKits.length
      ? savedKits.map(
          (savedSampleKitPreset: SampleKitPresetValuesParsed): SampleKit => {
            const newSampleKit: SampleKit = new SampleKit(
              audioRef.current.context,
              {},
              audioRef.current.gain,
              {
                ...savedSampleKitPreset,
                samples: Object.keys(savedSampleKitPreset.samples).reduce(
                  (p, c) => ({ ...p, [c]: [savedSampleKitPreset.samples[c]] }),
                  {},
                ),
              },
            )

            return newSampleKit
          },
        )
      : [
          new SampleKit(
            audioRef.current.context,
            {
              kick: '/kits/SwuM Drum Kit/Kicks/Vinyl Kick 3.wav',
              snare: '/kits/SwuM Drum Kit/Snare/Vinyl snare 5.wav',
              hat: '/kits/SwuM Drum Kit/HiHats/Vinyl Hihat 9.wav',
              clap: '/kits/SwuM Drum Kit/Claps/Clap 1.wav',
            },
            audioRef.current.gain,
          ),
        ]
  })

  const trackInfoRef = React.useRef<{
    numberOfGeneratedTracks: number
    registeredSteps: Record<string, () => void>
    registeredResets: Record<string, () => void>
  }>({
    numberOfGeneratedTracks: 1,
    registeredSteps: {},
    registeredResets: {},
  })

  const reset = React.useCallback(
    (): void =>
      Object.values(trackInfoRef.current.registeredResets).forEach(
        (subReset: () => void): void => subReset(),
      ),
    [],
  )

  const generateNewTrack = React.useCallback(
    ({
      id = crypto.randomUUID(),
      title = `Track ${trackInfoRef.current.numberOfGeneratedTracks++}`,
      defaultChannelId,
      defaultSynthId,
      defaultKitId,
    }: {
      id?: string
      title?: string
      defaultChannelId?: string
      defaultSynthId?: string
      defaultKitId?: string
    }): TrackOptions => {
      const res = {
        id,
        title,
        defaultChannelId,
        defaultSynthId,
        defaultKitId,
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
          setTracks((prevTracks) =>
            prevTracks.filter((track) => track.id !== id),
          )

          setProject((prevProject) => {
            return {
              ...prevProject,
              tracks: prevProject.tracks.filter((track) => track.id !== id),
            }
          })
        },
      }

      if (!res.defaultSynthId) delete res.defaultSynthId
      if (!res.defaultKitId) delete res.defaultKitId

      return res
    },
    [setProject],
  )

  const [tracks, setTracks] = React.useState<TrackOptions[]>(
    (): TrackOptions[] => {
      if (project.tracks.length) {
        return project.tracks.map((track: ProjectTrack): TrackOptions => {
          if (Object.hasOwnProperty.call(track, 'synthId')) {
            return generateNewTrack({
              id: track.id,
              title: track.name,
              defaultChannelId: track.channelId,
              defaultSynthId: (track as ProjectSynthTrack).synthId,
            })
          } else if (Object.hasOwnProperty.call(track, 'kitId')) {
            return generateNewTrack({
              id: track.id,
              title: track.name,
              defaultChannelId: track.channelId,
              defaultKitId: (track as ProjectKitTrack).kitId,
            })
          }

          throw new Error('Unknown track type in project')
        })
      }

      return [generateNewTrack({})]
    },
  )

  const [playing, setPlaying] = React.useState<boolean>(false)

  // TODO: Determine if it's more performant to use the effect or not, assuming it is not.
  // React.useEffect(
  //   () =>
  synths
    .filter((synth: Synth): boolean => synth.getBPMSync())
    .forEach((synth: Synth): void => synth.setBPM(project.bpm))
  //   [synths, bpm],
  // )

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

  const addSynthTrack = (): void => {
    const originalName: string = 'Basic'
    let accumulatedName: string = `${originalName}`
    let accumulator: number = 2

    while (
      synths.find((synth: Synth): boolean => synth.name === accumulatedName)
    ) {
      accumulatedName = `${originalName} ${accumulator++}`
    }

    const newTrack: TrackOptions = generateNewTrack({})
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
  }

  const addKitTrack = (): void => {
    const originalName: string = 'Kit #'
    let accumulatedName: string = `${originalName} 1`
    let accumulator: number = 1

    while (
      kits.find((kit: SampleKit): boolean => kit.name === accumulatedName)
    ) {
      accumulatedName = `${originalName} ${accumulator++}`
    }

    // const newKit: SampleKit = new SampleKit(
    //   audioRef.current.context,
    //   {},
    //   channels[0].channel.destination,
    // )

    // newKit.name = accumulatedName

    const newTrack: TrackOptions = generateNewTrack({
      defaultKitId: kits[0].id,
      // defaultKitId: newKit.id,
    })

    // setKits((prevKits: SampleKit[]): SampleKit[] => [...prevKits, newKit])
    setTracks((prevTracks: TrackOptions[]): TrackOptions[] => [
      ...prevTracks,
      newTrack,
    ])
  }
  const addAutomationTrack = (): void => alert('// TODO: Implement me :)')

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
      let stepTimeout: number

      const step = (): void => {
        Object.values(trackInfoRef.current.registeredSteps).forEach(
          (subStep: () => void): void => subStep(),
        )

        stepTimeout = setTimeout(step, (60 / project.bpm) * 1000)
      }

      step()

      return (): void => clearTimeout(stepTimeout)
    }
  }, [playing, project.bpm]) // FIXME: BPM updates causes immediate fires

  const onSaveClick = (): void => {
    alert(`
      // TODO: Implement me
    `)
  }

  const onOpenClick = React.useCallback((): void => {
    // TODO: Modularize this
    const openDialog: JSX.Element = (
      <OpenDialog
        key={crypto.randomUUID()}
        close={(closeBase: boolean = true, ...dialogs: JSX.Element[]): void => {
          setDialogs((prevDialogs) =>
            prevDialogs.filter(
              (dialog: JSX.Element): boolean =>
                ![...(closeBase ? [openDialog] : []), ...dialogs].includes(
                  dialog,
                ),
            ),
          )
        }}
        addDialog={(dialog: JSX.Element) =>
          setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] => [
            ...prevDialogs,
            dialog,
          ])
        }
      />
    )

    setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] => [
      ...prevDialogs,
      openDialog,
    ])
  }, [])

  const onNewClick = (): void => {
    const newConfirmDialog: JSX.Element = (
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

          window.localStorage.removeItem(`ゼローProject`)
          window.location.reload()

          // TODO: ('implement me!!@!') in a better way
        }}
        // dangerous
      >
        <p>Are you sure you want to make a new project?</p>
        <p className="small">(All unsaved changes will be lost.)</p>
      </ConfirmDialog>
    )

    setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] => [
      ...prevDialogs,
      newConfirmDialog,
    ])
  }
  const onSettingsClick = (): void => {
    const newSettingsDialog: JSX.Element = (
      <SettingsDialog
        key={crypto.randomUUID()}
        close={(): void => {
          setDialogs((prevDialogs) =>
            prevDialogs.filter((dialog) => dialog !== newSettingsDialog),
          )
        }}
      />
    )

    setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] => [
      ...prevDialogs,
      newSettingsDialog,
    ])
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
  }, [onOpenClick])

  type TabsIdLookup = Record<
    'kits' | 'synths' | 'channels',
    `${string}-${string}-${string}-${string}-${string}`
  >
  const tabsIdLookup = React.useMemo<TabsIdLookup>(
    (): TabsIdLookup => ({
      kits: crypto.randomUUID(),
      synths: crypto.randomUUID(),
      channels: crypto.randomUUID(),
    }),
    [],
  )

  const onProjectNameChangeTimeout = React.useRef<number | null>(null)
  const onProjectNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (onProjectNameChangeTimeout.current) {
      clearTimeout(onProjectNameChangeTimeout.current)
      onProjectNameChangeTimeout.current = null
    }

    onProjectNameChangeTimeout.current = setTimeout(
      (): void =>
        setProject(
          (prevProject: Project): Project => ({
            ...prevProject,
            name: event.target.value,
          }),
        ),
      250,
    )
  }

  const registerTapBpmStep = React.useCallback((step: () => void): void => {
    trackInfoRef.current.registeredSteps.TAP_BPM_STEP = step
  }, [])
  const unregisterTapBpmStep = React.useCallback((): void => {
    delete trackInfoRef.current.registeredSteps.TAP_BPM_STEP
  }, [])

  return (
    <div className={styles.interface}>
      <div className={styles.controls}>
        <h1 className={styles.title}>ZER0</h1>

        <input
          className={styles['project-title']}
          type="text"
          defaultValue={project.name}
          onChange={onProjectNameChange}
          placeholder="Set a project title"
          name="Project Title"
        />

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
            value={project.bpm}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              const newBPM: number = event.target.valueAsNumber

              if (!isNaN(newBPM) && newBPM > 0) {
                setProject((prevProject) => ({
                  ...prevProject,
                  bpm: newBPM,
                }))
              }
            }}
          />
        </label>

        <TapBpm
          registerStep={registerTapBpmStep}
          unregisterStep={unregisterTapBpmStep}
          onTapped={(bpm: number): void => {
            setProject((prevProject) => ({
              ...prevProject,
              bpm: Math.round(bpm),
            }))
          }}
        />

        <div className={styles.spacer} />
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
            <button onClick={addKitTrack}>New Kit Track</button>
            <button onClick={addAutomationTrack}>New Automation</button>
          </div>

          <div className={styles['track-container']}>
            {tracks.map(
              (trackOptions: TrackOptions): JSX.Element =>
                Object.hasOwnProperty.call(trackOptions, 'defaultKitId') ? (
                  <Track
                    options={trackOptions}
                    key={trackOptions.id}
                    channels={channels}
                    kits={kits}
                  />
                ) : (
                  <Track
                    options={trackOptions}
                    key={trackOptions.id}
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
              id: tabsIdLookup.synths,
              name: 'Synths',
              element: <SynthList synths={synths} />,
            },
            {
              id: tabsIdLookup.kits,
              name: 'Kits',
              element: <KitList kits={kits} />,
            },
            {
              id: tabsIdLookup.channels,
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
