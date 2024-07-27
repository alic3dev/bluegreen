import { KitTrack, KitTrackOptions, KitTrackProps } from './KitTrack'
import { SynthTrack, SynthTrackOptions, SynthTrackProps } from './SynthTrack'

export type TrackOptions = KitTrackOptions | SynthTrackOptions

type TrackProps =
  | (KitTrackProps & { synths?: undefined })
  | (SynthTrackProps & { kits?: undefined })

export function Track({
  project,
  options,
  kits,
  synths,
}: TrackProps): JSX.Element {
  if (kits) {
    return <KitTrack project={project} options={options} kits={kits} />
  } else if (synths) {
    return <SynthTrack project={project} options={options} synths={synths} />
  }

  throw new Error('Unknown track passed to Track')
}
