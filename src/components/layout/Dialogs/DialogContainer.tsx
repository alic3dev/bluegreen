import React from 'react'

import styles from './DialogContainer.module.scss'

export function DialogContainer({
  dialogs,
  setDialogs,
}: {
  dialogs: JSX.Element[]
  setDialogs: React.Dispatch<React.SetStateAction<JSX.Element[]>>
}): JSX.Element {
  const closeDialogs = React.useCallback(() => setDialogs([]), [setDialogs])

  React.useEffect(() => {
    const escKeydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()

        closeDialogs()
      }
    }

    window.addEventListener('keydown', escKeydownListener)

    return () => window.removeEventListener('keydown', escKeydownListener)
  }, [closeDialogs])

  return (
    <div
      className={`${styles['dialog-container']} ${
        dialogs.length ? styles.active : ''
      }`}
      onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target !== event.currentTarget) return

        // TODO: Should we only remove the topmost dialog (pop?) or keep as is?

        closeDialogs()
      }}
    >
      {dialogs}
    </div>
  )
}
