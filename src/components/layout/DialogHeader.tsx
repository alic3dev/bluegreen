import styles from './DialogHeader.module.scss'

export function DialogHeader({
  children,
}: React.PropsWithChildren): JSX.Element {
  return <div className={styles['dialog-header']}>{children}</div>
}
