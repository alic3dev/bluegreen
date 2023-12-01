// import React from 'react'
import { CiSettings } from 'react-icons/ci'

import { Synth } from 'zer0'

import styles from './SynthList.module.scss'

export function SynthList({ synths }: { synths: Synth[] }) {
  // TODO: Add controls for synths

  return (
    <div className={styles['synth-list']}>
      {synths.map((synth) => (
        <div key={synth.name} className={styles.synth}>
          <div className={styles.name}>{synth.name}</div>

          <div className={styles.controls}>
            <CiSettings />
          </div>
        </div>
      ))}
    </div>
  )
}
