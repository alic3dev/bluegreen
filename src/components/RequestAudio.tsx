import React from 'react'

import { canCreateAudioContext } from '../utils/canCreateAudioContext'

import styles from './RequestAudio.module.scss'

export function RequestAudio({
  setCanCreateAudioContext,
}: {
  setCanCreateAudioContext: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {
  const [tries, setTries] = React.useState<number>(0)

  return (
    <div className={styles.request}>
      <p>We couldn't create an audio context automatically.</p>
      <p>Click the button below to grant audio permission.</p>

      <button
        onClick={(): void => {
          const _canCreateAudioContext: boolean = canCreateAudioContext()

          if (!_canCreateAudioContext) {
            setTries((prevTries: number): number => prevTries + 1)
          }

          setCanCreateAudioContext(_canCreateAudioContext)
        }}
      >
        Allow audio{tries > 0 && ' (Try again)'}
      </button>

      {tries > 0 && (
        <>
          <p>Hmm.. We failed to request audio permission.</p>
          <p>Check your browser settings and try again.</p>
        </>
      )}
    </div>
  )
}
