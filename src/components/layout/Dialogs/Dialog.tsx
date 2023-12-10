import React from 'react'

import styles from './Dialog.module.scss'

export function Dialog({ children }: React.PropsWithChildren): JSX.Element {
  return <div className={styles.dialog}>{children}</div>
}
