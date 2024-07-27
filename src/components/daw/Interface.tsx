import type { SynthPresetValues, SampleKitPresetValues } from 'zer0'

import type { TrackInfo } from './SharedTypes'
import type { TrackOptions } from './Track'

import type {
  BaseProject,
  Project,
  ProjectKitTrack,
  ProjectSynthTrack,
  ProjectTrack,
} from '../../utils/project'

import React from 'react'
import { IoGrid } from 'react-icons/io5'
import { MdPiano } from 'react-icons/md'
import { PiArrowLeftBold, PiDotsThreeVertical } from 'react-icons/pi'
import { TbEaseInOutControlPoints } from 'react-icons/tb'

import { Channel, SampleKit, Synth } from 'zer0'

import { ChannelList } from './ChannelList'
import { Header } from './Header'
import { KitList } from './KitList'
import { ProjectSettings } from './ProjectSettings'
import { SynthList } from './SynthList'
import { Track } from './Track'

import {
  DialogContainer,
  ConfirmDialog,
  SettingsDialog,
  OpenDialog,
} from '../layout/Dialogs'
import { Tabbed } from '../layout/Tabbed'

import {
  LOCAL_STORAGE_KEY_PROJECT_CHANNELS_PREFIX,
  LOCAL_STORAGE_KEY_SELECTED_PROJECT,
} from '../../utils/constants'

import styles from './Interface.module.scss'

interface AudioRef {
  context: AudioContext
}

interface ChannelPreset {
  id: string
  name: string
  gain: number
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

const getLocalStorageChannelsKey = (id: string): string =>
  `${LOCAL_STORAGE_KEY_PROJECT_CHANNELS_PREFIX}${id}`

export function Interface({ project }: { project: Project }): JSX.Element {
  const {
    setProject,
  }: { setProject: React.Dispatch<React.SetStateAction<BaseProject>> } = project

  const [dialogs, setDialogs] = React.useState<JSX.Element[]>([])

  const [tabbedOpen, setTabbedOpen] = React.useState<boolean>(true)
  const toggleTabbedOpen = (): void => {
    setTabbedOpen((prevValue: boolean): boolean => !prevValue)
  }

  const audioRef = React.useRef<AudioRef>(getDefaultAudioRef())

  const [channels, setChannels] = React.useState<Channel[]>((): Channel[] => {
    const res: Channel[] = [
      new Channel({
        name: 'Main',
        audioContext: audioRef.current.context,
      }),
    ]

    if (window.localStorage) {
      const localStorageKey: string = getLocalStorageChannelsKey(project.id)

      try {
        const storedChannelsJSON: string | null =
          window.localStorage.getItem(localStorageKey)

        if (storedChannelsJSON) {
          const storedChannels: ChannelPreset[] = JSON.parse(storedChannelsJSON)

          if (!Array.isArray(storedChannels)) {
            throw new Error('Invalid channel storage type')
          }

          for (const channel of storedChannels) {
            if (
              typeof channel.id !== 'string' ||
              typeof channel.name !== 'string' ||
              typeof channel.gain !== 'number'
            ) {
              throw new Error('Invalid channel storage data')
            }

            res.push(
              new Channel({
                name: channel.name,
                id: channel.id,
                audioContext: audioRef.current.context,
                output: res[0].destination,
              }),
            )
          }
        }
      } catch {
        window.localStorage.removeItem(localStorageKey)
      }
    }

    return res
  })

  const generatedChannelsRef = React.useRef<number>(channels.length)

  const generateChannel = React.useCallback(
    (name?: string): Channel =>
      new Channel({
        name: name ?? `Channel ${generatedChannelsRef.current++}`,
        audioContext: audioRef.current.context,
        output: channels[0].destination,
      }),
    [channels],
  )

  const [synths, setSynths] = React.useState<Synth[]>((): Synth[] => {
    const savedSynths: SynthPresetValues[] = []

    for (const track of project.tracks) {
      if (Object.prototype.hasOwnProperty.call(track, 'synthId')) {
        const synthStorageKey: string = `${Synth.localStorageKeyPrefix}${
          (track as ProjectSynthTrack).synthId
        }`

        const synthStorageString: string | null =
          window.localStorage.getItem(synthStorageKey)

        if (!synthStorageString) continue

        try {
          savedSynths.push(JSON.parse(synthStorageString))
        } catch {
          window.localStorage.removeItem(synthStorageKey)
        }
      }
    }

    // FIXME: Synths don't save their position/order
    const res: Synth[] = savedSynths.map(
      (savedSynthPreset: SynthPresetValues): Synth => {
        let synthChannel: Channel | undefined

        if (savedSynthPreset.channelId) {
          synthChannel = channels.find(
            (channel: Channel): boolean =>
              channel.id === savedSynthPreset.channelId,
          )
        }

        return new Synth({
          audioContext: audioRef.current.context,
          name: savedSynthPreset.name,
          channel: synthChannel ?? channels[0],
          savedPreset: savedSynthPreset,
        })
      },
    )

    return res
  })

  const [kits, setKits] = React.useState<SampleKit[]>((): SampleKit[] => {
    const savedKits: SampleKitPresetValues[] = []

    for (const track of project.tracks) {
      if (Object.prototype.hasOwnProperty.call(track, 'kitId')) {
        const kitStorageKey: string = `${SampleKit.localStorageKeyPrefix}${
          (track as ProjectKitTrack).kitId
        }`

        const kitStorageString: string | null =
          window.localStorage.getItem(kitStorageKey)

        if (!kitStorageString) continue

        try {
          savedKits.push(JSON.parse(kitStorageString))
        } catch {
          window.localStorage.removeItem(kitStorageKey)
        }
      }
    }

    // FIXME: Kits don't save their position/order
    const res: SampleKit[] = savedKits.map(
      (savedSampleKitPreset: SampleKitPresetValues): SampleKit => {
        let sampleKitChannel: Channel | undefined

        if (savedSampleKitPreset.channelId) {
          sampleKitChannel = channels.find(
            (channel: Channel): boolean =>
              channel.id === savedSampleKitPreset.channelId,
          )
        }

        return new SampleKit({
          audioContext: audioRef.current.context,
          channel: sampleKitChannel ?? channels[0],
          savedPreset: savedSampleKitPreset,
        })
      },
    )

    return res
  })

  const trackInfoRef = React.useRef<TrackInfo>({
    numberOfGeneratedTracks: 1,
    registeredSteps: {},
    registeredResets: {},
  })

  const generateNewTrack = React.useCallback(
    ({
      id = crypto.randomUUID(),
      title = `Track ${++trackInfoRef.current.numberOfGeneratedTracks}`,
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
          setTracks((prevTracks: TrackOptions[]): TrackOptions[] =>
            prevTracks.filter((track) => track.id !== id),
          )

          setProject((prevProject: BaseProject): BaseProject => {
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
      const res: TrackOptions[] = project.tracks.map(
        (track: ProjectTrack): TrackOptions => {
          if (Object.hasOwnProperty.call(track, 'synthId')) {
            return generateNewTrack({
              id: track.id,
              title: track.name,
              defaultSynthId: (track as ProjectSynthTrack).synthId,
            })
          } else if (Object.hasOwnProperty.call(track, 'kitId')) {
            return generateNewTrack({
              id: track.id,
              title: track.name,
              defaultKitId: (track as ProjectKitTrack).kitId,
            })
          }

          throw new Error('Unknown track type in project')
        },
      )

      trackInfoRef.current.numberOfGeneratedTracks = res.length

      return res
    },
  )

  const [playing, _setPlaying] = React.useState<boolean>(false)
  const setPlaying = (action: React.SetStateAction<boolean>): void => {
    if (audioRef.current.context) {
      audioRef.current.context.resume()
    }

    return _setPlaying(action)
  }

  React.useEffect((): void => {
    for (const synth of synths) {
      if (synth.getBPMSync()) {
        synth.setBPM(project.bpm)
      }
    }
  }, [synths, project.bpm])

  /*
  React.useEffect(() => {
    // FIXME: Figure out why these don't work, may need to set metadata first?
    //        Probably not worthwhile to pursue.
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
    const newSynth: Synth = new Synth({
      audioContext: audioRef.current.context,
      name: accumulatedName,
      channel: channels[0],
    })

    setSynths((prevSynths: Synth[]): Synth[] => [...prevSynths, newSynth])
    setTracks((prevTracks: TrackOptions[]): TrackOptions[] => [
      ...prevTracks,
      newTrack,
    ])
  }

  const addKitTrack = (): void => {
    const originalName: string = 'Kit #'
    let accumulatedName: string = `${originalName}1`
    let accumulator: number = 1

    while (
      kits.find((kit: SampleKit): boolean => kit.name === accumulatedName)
    ) {
      accumulatedName = `${originalName}${accumulator++}`
    }

    const newKit: SampleKit = new SampleKit({
      audioContext: audioRef.current.context,
      name: accumulatedName,
      samples: defaultSamples,
      channel: channels[0],
    })

    setKits((prevKits: SampleKit[]): SampleKit[] => [...prevKits, newKit])

    setTimeout((): void => {
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
    const newChannel: Channel = generateChannel()

    setChannels((prevChannels: Channel[]): Channel[] => [
      ...prevChannels,
      newChannel,
    ])
  }, [generateChannel])

  const removeChannel = React.useCallback((id: string): void => {
    setChannels((prevChannels: Channel[]): Channel[] => {
      const channelIndex: number = prevChannels.findIndex(
        (channel: Channel): boolean => channel.id === id,
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
            onCancel={(): void => {
              setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] =>
                prevDialogs.filter((dialog) => dialog !== newConfirmDialog),
              )
            }}
            onConfirm={(): void => {
              setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] =>
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
            project={project}
            key={crypto.randomUUID()}
            close={(
              closeBase: boolean = true,
              ...dialogs: JSX.Element[]
            ): void => {
              setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] =>
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
              setDialogs((prevDialogs: JSX.Element[]): JSX.Element[] =>
                prevDialogs.filter(
                  (dialog: JSX.Element): boolean =>
                    dialog !== newSettingsDialog,
                ),
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
    [project],
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

    return (): void => {
      window.removeEventListener('keydown', keyboardShortcutListener)
    }
  }, [actions])

  type TabsIdLookup = Record<
    'project' | 'kits' | 'synths' | 'channels',
    `${string}-${string}-${string}-${string}-${string}`
  >
  const tabsIdLookup = React.useMemo<TabsIdLookup>(
    (): TabsIdLookup => ({
      project: crypto.randomUUID(),
      kits: crypto.randomUUID(),
      synths: crypto.randomUUID(),
      channels: crypto.randomUUID(),
    }),
    [],
  )

  React.useEffect((): void => {
    // FIXME: This should be a preset on channel itself rather than being done here
    window.localStorage.setItem(
      getLocalStorageChannelsKey(project.id),
      JSON.stringify(
        channels.slice(1).map(
          (channel: Channel): ChannelPreset => ({
            name: channel.name,
            id: channel.id,
            gain: channel.gain.gain.value,
          }),
        ),
      ),
    )
  }, [channels, project.id])

  return (
    <div className={styles.interface}>
      <Header
        project={project}
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
            {!tracks.length && (
              <div className={styles['track-intro']}>
                <PiArrowLeftBold />
                &nbsp;&nbsp;Add a track to get started!
              </div>
            )}

            <div className={styles['track-container']}>
              {tracks.map(
                (trackOptions: TrackOptions): JSX.Element =>
                  Object.hasOwnProperty.call(trackOptions, 'defaultKitId') ? (
                    <Track
                      project={project}
                      options={trackOptions}
                      key={trackOptions.id}
                      kits={kits}
                    />
                  ) : (
                    <Track
                      project={project}
                      options={trackOptions}
                      key={trackOptions.id}
                      synths={synths}
                    />
                  ),
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles['tabbed-wrapper']} ${
            tabbedOpen ? '' : styles.closed
          }`}
        >
          <button
            className={styles['tabbed-toggle']}
            onClick={toggleTabbedOpen}
          >
            <PiDotsThreeVertical />
          </button>

          <Tabbed
            tabs={[
              {
                id: tabsIdLookup.project,
                name: 'Project',
                element: <ProjectSettings project={project} />,
              },
              {
                id: tabsIdLookup.synths,
                name: 'Synths',
                element: <SynthList synths={synths} channels={channels} />,
              },
              {
                id: tabsIdLookup.kits,
                name: 'Kits',
                element: <KitList kits={kits} channels={channels} />,
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
      </div>

      <DialogContainer dialogs={dialogs} setDialogs={setDialogs} />
    </div>
  )
}
