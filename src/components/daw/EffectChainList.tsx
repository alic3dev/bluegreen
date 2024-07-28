import type { Effect, EffectChain } from 'zer0'

import React from 'react'

import { EffectParameters } from './EffectParameters'

export function EffectChainList({
  effectChain,
}: {
  effectChain: EffectChain
}): React.ReactNode {
  return effectChain.effects.map(
    (effect: Effect): React.ReactNode => (
      <div key={effect.id}>
        <h5>{effect.name}</h5>

        <EffectParameters parameters={effect.parameters} />
      </div>
    ),
  )
}
