import type { Note, ScaleName, FrequencyRootName } from 'zer0'

import type { BarData } from '../utils/general'

export interface BaseProjectTrack {
  id: string
  name: string
  bars: BarData[]
}

export interface ProjectKitTrack extends BaseProjectTrack {
  kitId: string
}

export interface ProjectSynthTrack extends BaseProjectTrack {
  synthId: string
}

export type ProjectTrack = ProjectSynthTrack | ProjectKitTrack

export interface BaseProject {
  id: string
  name: string

  bpm: number

  frequencyRoot: FrequencyRootName
  scale: ScaleName
  scaleKey: Note

  tracks: ProjectTrack[]
}

export interface Project extends BaseProject {
  setProject: React.Dispatch<React.SetStateAction<BaseProject>>
  scaleNotes: Note[]
  frequencies: number[]
  frequencyRootValue: number
}

export const defaultProject: BaseProject = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',

  bpm: 270,

  frequencyRoot: 'standard',
  scale: 'minor',
  scaleKey: 'C',

  tracks: [],
}
