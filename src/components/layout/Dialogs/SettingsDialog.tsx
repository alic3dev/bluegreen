import React from 'react'

import { Dialog, DialogFooter, DialogHeader } from '.'
import { Settings, SettingsContext } from '../../../contexts'

export function SettingsDialog({ close }: { close: () => void }): JSX.Element {
  const settings: Settings = React.useContext<Settings>(SettingsContext)
  const setSettings: React.Dispatch<React.SetStateAction<Settings>> =
    settings.setSettings

  return (
    <Dialog>
      <DialogHeader>Settings</DialogHeader>

      <div>
        <label>
          Auto-save
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={() => {
              setSettings((prevSettings) => ({
                ...prevSettings,
                autoSave: !prevSettings.autoSave,
              }))
            }}
          />
        </label>
      </div>

      <DialogFooter>
        <button onClick={close} autoFocus>
          Close
        </button>
      </DialogFooter>
    </Dialog>
  )
}
