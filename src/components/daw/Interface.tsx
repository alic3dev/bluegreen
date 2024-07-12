import React from 'react'
import { MdPiano } from 'react-icons/md'
import { IoGrid } from 'react-icons/io5'
import { TbEaseInOutControlPoints } from 'react-icons/tb'

import {
  Channel,
  Effect,
  effects,
  SampleKit,
  Synth,
  SynthPresetValues,
} from 'zer0'
import { SampleKitPresetValues } from 'zer0/src/SampleKitPreset'

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
import { LOCAL_STORAGE_KEY_SELECTED_PROJECT } from '../../utils/constants'

import { KitList } from './KitList'
import { Header } from './Header'
import { TrackInfo } from './SharedTypes'

import styles from './Interface.module.scss'

interface AudioRef {
  context: AudioContext
}

let defaultAudioRef: AudioRef

const getDefaultAudioRef = (): AudioRef => {
  if (defaultAudioRef) return defaultAudioRef

  const context: AudioContext = new AudioContext()

  return (defaultAudioRef = {
    context,
  })
}

const defaultSamples: Record<string, string> = {
  kick: '/kits/SwuM Drum Kit/Kicks/Vinyl Kick 3.wav',
  snare: '/kits/SwuM Drum Kit/Snare/Vinyl snare 5.wav',
  hat: '/kits/SwuM Drum Kit/HiHats/Vinyl Hihat 9.wav',
  clap: '/kits/SwuM Drum Kit/Claps/Clap 1.wav',
}

export function Interface(): JSX.Element {
  const project: Project = React.useContext(ProjectContext)
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<Project>> } = project

  const [dialogs, setDialogs] = React.useState<JSX.Element[]>([])

  const audioRef = React.useRef<AudioRef>(getDefaultAudioRef())
  const generatedChannelsRef = React.useRef<number>(1)

  const [channels, setChannels] = React.useState<ChannelWithOptions[]>(
    (): ChannelWithOptions[] => [
      {
        id: crypto.randomUUID(),
        name: `Main`,
        channel: new Channel(
          audioRef.current.context,
          audioRef.current.context.destination,
        ),
      },
    ],
  )

  const generateChannel = React.useCallback(
    (name?: string): ChannelWithOptions => ({
      id: crypto.randomUUID(),
      name: name ?? `Channel ${generatedChannelsRef.current++}`,

      channel: new Channel(
        audioRef.current.context,
        channels[0].channel.destination,
      ),
    }),
    [channels],
  )

  const delayReverb = React.useRef<Effect>(
    new effects.reverb.DelayReverb(
      audioRef.current.context,
      channels[0].channel.destination, // FIXME: Routing is getting confusing, refactor how these connect/link
    ),
  )

  const defaultSynthRef = React.useRef<{ val?: Synth }>({})
  const generateDefaultSynth = (): Synth => {
    if (!defaultSynthRef.current.val) {
      defaultSynthRef.current.val = new Synth(
        audioRef.current.context,
        'Basic',
        delayReverb.current.input,
      )
    }

    return defaultSynthRef.current.val
  }

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

    // FIXME: Synths don't save their position/order
    return savedSynths.length
      ? savedSynths.map(
          (savedSynthPreset: SynthPresetValues, index: number) => {
            return new Synth(
              audioRef.current.context,
              savedSynthPreset.name,
              index
                ? channels[0].channel.destination
                : delayReverb.current.input,
              savedSynthPreset,
            )
          },
        )
      : [generateDefaultSynth()]
  })

  const defaultKitRef = React.useRef<{ val?: SampleKit }>({})
  const generateDefaultKit = (): SampleKit => {
    if (!defaultKitRef.current.val) {
      defaultKitRef.current.val = new SampleKit(
        audioRef.current.context,
        defaultSamples,
        channels[0].channel.destination,
      )
    }

    return defaultKitRef.current.val
  }

  const [kits, setKits] = React.useState<SampleKit[]>((): SampleKit[] => {
    // FIXME: This is loading all kit presets, be more effiecient about it (Only project Synths)
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

    // FIXME: Kits don't save their position/order
    return savedKits.length
      ? savedKits.map(
          (savedSampleKitPreset: SampleKitPresetValues): SampleKit =>
            new SampleKit(
              audioRef.current.context,
              {},
              channels[0].channel.destination,
              savedSampleKitPreset,
            ),
        )
      : [generateDefaultKit()]
  })

  const trackInfoRef = React.useRef<TrackInfo>({
    numberOfGeneratedTracks: 1,
    registeredSteps: {},
    registeredResets: {},
  })

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

  React.useEffect(
    (): void =>
      synths
        .filter((synth: Synth): boolean => synth.getBPMSync())
        .forEach((synth: Synth): void => synth.setBPM(project.bpm)),
    [synths, project.bpm],
  )

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

    const newKit: SampleKit = new SampleKit(
      audioRef.current.context,
      defaultSamples,
      channels[0].channel.destination,
    )

    newKit.name = accumulatedName
    newKit.savePreset()

    setKits((prevKits: SampleKit[]): SampleKit[] => [...prevKits, newKit])

    setTimeout(() => {
      const newTrack: TrackOptions = generateNewTrack({
        defaultKitId: newKit.id,
        defaultChannelId: channels[0].id,
      })

      setTracks((prevTracks: TrackOptions[]): TrackOptions[] => [
        ...prevTracks,
        newTrack,
      ])
    }, 0)
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

  const actions = React.useMemo<{
    new: () => void
    open: () => void
    save: () => void
    settings: () => void
  }>(
    () => ({
      new: (): void => {
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

              window.localStorage.removeItem(LOCAL_STORAGE_KEY_SELECTED_PROJECT)
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
      },
      open: (): void => {
        // TODO: Modularize this
        const openDialog: JSX.Element = (
          <OpenDialog
            key={crypto.randomUUID()}
            close={(
              closeBase: boolean = true,
              ...dialogs: JSX.Element[]
            ): void => {
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
      },
      save: (): void => {
        alert(`
        // TODO: Implement me
      `)
      },
      settings: (): void => {
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
      },
    }),
    [],
  )

  React.useEffect((): (() => void) => {
    const keyboardShortcutListener = (event: KeyboardEvent): void => {
      if (event.metaKey) {
        if (event.key === 'o') {
          event.preventDefault()
          event.stopPropagation()

          actions.open()
        } else if (event.key === 's') {
          event.preventDefault()
          event.stopPropagation()

          actions.save()
        } else if (event.key === 'p') {
          event.preventDefault()
          event.stopPropagation()

          actions.new()
        } else if (event.key === ',') {
          event.preventDefault()
          event.stopPropagation()

          actions.settings()
        }
      }
    }

    window.addEventListener('keydown', keyboardShortcutListener)

    return () => {
      window.removeEventListener('keydown', keyboardShortcutListener)
    }
  }, [actions])

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

  return (
    <div className={styles.interface}>
      <Header
        trackInfo={trackInfoRef.current}
        playing={playing}
        setPlaying={setPlaying}
        actions={actions}
      />

      <div className={styles.content}>
        <div className={styles['track-section']}>
          <div className={styles['track-section-controls']}>
            <button title="New Synth Track" onClick={addSynthTrack}>
              <MdPiano />
            </button>
            <button title="New Kit Track" onClick={addKitTrack}>
              <IoGrid />
            </button>
            <button title="New Automation Track" onClick={addAutomationTrack}>
              <TbEaseInOutControlPoints />
            </button>
          </div>

          <div className={styles['track-container-wrapper']}>
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
