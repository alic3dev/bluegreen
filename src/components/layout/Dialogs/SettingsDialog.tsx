import { DialogFooter, DialogHeader } from '.'
import { Dialog } from './Dialog'

export function SettingsDialog({ close }: { close: () => void }): JSX.Element {
  return (
    <Dialog>
      <DialogHeader>Settings</DialogHeader>

      <p>Content</p>

      <DialogFooter>
        <button onClick={close} autoFocus>
          Close
        </button>
      </DialogFooter>
    </Dialog>
  )
}
