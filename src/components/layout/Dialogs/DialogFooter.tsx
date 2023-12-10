import React from 'react'

import styles from './DialogFooter.module.scss'

export function DialogFooter({
  children,
}: React.PropsWithChildren): JSX.Element {
  return <div className={styles['dialog-footer']}>{children}</div>
}
