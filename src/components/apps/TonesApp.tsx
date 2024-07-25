import { EyeGen } from '../modules'

import styles from './Tones.module.scss'

export function TonesApp() {
  return (
    <div className={styles.app}>
      <div className={styles.main}>
        <EyeGen tones />
      </div>
    </div>
  )
}
