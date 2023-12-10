import { Dialog } from './Dialog'
import { DialogHeader } from './DialogHeader'

import styles from './ConfirmDialog.module.scss'
import { DialogFooter } from './DialogFooter'

export function ConfirmDialog({
  title,
  children,
  onCancel,
  onConfirm,
  cancelText,
  confirmText,
  dangerous,
}: React.PropsWithChildren<{
  title?: string
  onCancel?: () => void
  onConfirm?: () => void
  cancelText?: string
  confirmText?: string
  dangerous?: boolean
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
            {onCancel && (
              <button
                className={`${styles['dialog-control']} ${styles['cancel']}`}
                onClick={onCancel}
              >
                {cancelText ?? 'Cancel'}
              </button>
            )}
            {onConfirm && (
              <button
                className={`${styles['dialog-control']} ${styles['confirm']} ${
                  dangerous ? styles['danger'] : ''
                }`}
                onClick={onConfirm}
                autoFocus
              >
                {confirmText ?? 'Confirm'}
              </button>
            )}
          </div>
        </DialogFooter>
      )}
    </Dialog>
  )
}
