import React from 'react'

export interface Project {
  id: string
  name: string

  bpm: number

  setProject: React.Dispatch<React.SetStateAction<Project>>
}

export const defaultProject: Project = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',

  bpm: 270,

  setProject() {},
}

export const ProjectContext = React.createContext<Project>(defaultProject)
