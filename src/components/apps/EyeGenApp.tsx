import { EyeGen } from '../modules'

import styles from './EyeGenApp.module.scss'

export function EyeGenApp(): React.ReactNode {
  return (
    <div className={styles.app}>
      <div className={styles.main}>
        <EyeGen />
      </div>
    </div>
  )
}
