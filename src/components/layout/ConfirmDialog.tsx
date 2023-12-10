import { Dialog } from './Dialog'
import { DialogHeader } from './DialogHeader'

import styles from './ConfirmDialog.module.scss'
import { DialogFooter } from './DialogFooter'

export function ConfirmDialog({
  title,
  children,
  onCancel,
  onConfirm,
}: React.PropsWithChildren<{
  title?: string
  onCancel?: () => void
  onConfirm?: () => void
}>): JSX.Element {
  return (
    <Dialog>
      {(title === undefined || title.length) && (
        <DialogHeader>{title ?? 'Confirmation'}</DialogHeader>
      )}

      {children}

      {(onCancel || onConfirm) && (
        <DialogFooter>
          <div className={styles['dialog-controls']}>
            {onCancel && <button onClick={onCancel}>Cancel</button>}
            {onConfirm && <button onClick={onConfirm}>Confirm</button>}
          </div>
        </DialogFooter>
      )}
    </Dialog>
  )
}
