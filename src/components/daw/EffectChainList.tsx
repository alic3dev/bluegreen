import type {
  Effect,
  EffectChain,
  EffectListItem,
  EffectListItemEffect,
} from 'zer0'

import React from 'react'
import { effectsList } from 'zer0'

import { EffectParameters } from './EffectParameters'

import styles from './EffectChainList.module.scss'

export function EffectChainList({
  effectChain,
}: {
  effectChain: EffectChain
}): React.ReactNode {
  const [refreshIndex, setRefreshIndex] = React.useState<number>(0)
  const [selectedEffectToAdd, setSelectedEffectToAdd] =
    React.useState<EffectListItemEffect>(effectsList[0].effects[0])

  const addSelectedEffect = React.useCallback((): void => {
    effectChain.addEffect(selectedEffectToAdd.effect)

    setRefreshIndex((prevRefreshIndex: number): number => prevRefreshIndex + 1)
  }, [effectChain, selectedEffectToAdd])

  return (
    <div className={styles.content} key={refreshIndex}>
      <h5>Effects</h5>

      <div className={styles['select-with-button']}>
        <select
          value={selectedEffectToAdd.id}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
            let newlySelectedEffect: EffectListItemEffect | undefined

            for (const effectCategory of effectsList) {
              for (const effect of effectCategory.effects) {
                if (effect.id === event.currentTarget.value) {
                  newlySelectedEffect = effect
                }
              }

              if (newlySelectedEffect) {
                setSelectedEffectToAdd(newlySelectedEffect)
                break
              }
            }
          }}
        >
          {effectsList.map(
            (effectCategory: EffectListItem): React.ReactNode => (
              <optgroup key={effectCategory.name} label={effectCategory.name}>
                {effectCategory.effects.map(
                  (
                    effectListItemEffect: EffectListItemEffect,
                  ): React.ReactNode => (
                    <option
                      key={effectListItemEffect.id}
                      value={effectListItemEffect.id}
                    >
                      {effectListItemEffect.name}
                    </option>
                  ),
                )}
              </optgroup>
            ),
          )}
        </select>

        <button onClick={addSelectedEffect}>+</button>
      </div>

      {effectChain.effects.map(
        (effect: Effect): React.ReactNode => (
          <div key={effect.id}>
            <h5>{effect.name}</h5>

            <EffectParameters parameters={effect.parameters} />
          </div>
        ),
      )}
    </div>
  )
}
