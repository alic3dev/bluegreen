import { KitTrack, KitTrackOptions, KitTrackProps } from './KitTrack'
import { SynthTrack, SynthTrackOptions, SynthTrackProps } from './SynthTrack'

export type TrackOptions = KitTrackOptions | SynthTrackOptions

type TrackProps =
  | (KitTrackProps & { synths?: undefined })
  | (SynthTrackProps & { kits?: undefined })

export function Track({
  options,
  channels,
  kits,
  synths,
}: TrackProps): JSX.Element {
  if (kits) {
    return <KitTrack options={options} channels={channels} kits={kits} />
  } else if (synths) {
    return <SynthTrack options={options} channels={channels} synths={synths} />
  }

  throw new Error('Unknown track passed to Track')
}
