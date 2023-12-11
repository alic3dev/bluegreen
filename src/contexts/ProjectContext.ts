import React from 'react'

import { BarData } from '../utils/general'

export interface ProjectTrack {
  id: string
  name: string
  channelId: string
  synthId: string
  bars: BarData[]
}

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

export const ProjectContext = React.createContext<Project>(defaultProject)
