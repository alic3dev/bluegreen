export interface TrackInfo {
  numberOfGeneratedTracks: number
  registeredSteps: Record<string, () => void>
  registeredResets: Record<string, () => void>
}
