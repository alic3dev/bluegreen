import { BarData } from '../utils/general'

export interface BaseProjectTrack {
  id: string
  name: string
  bars: BarData[]
}

export interface ProjectKitTrack extends BaseProjectTrack {
  channelId: string
  kitId: string
}

export interface ProjectSynthTrack extends BaseProjectTrack {
  channelId: string
  synthId: string
}

export type ProjectTrack = ProjectSynthTrack | ProjectKitTrack

export interface Project {
  id: string
  name: string

  bpm: number

  tracks: ProjectTrack[]

  setProject: React.Dispatch<React.SetStateAction<Project>>
}

export const defaultProject: Project = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',

  bpm: 270,

  tracks: [],

  setProject() {},
}
