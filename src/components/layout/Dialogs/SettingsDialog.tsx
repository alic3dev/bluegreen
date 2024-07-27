import type { ProvidedSettings, Settings } from '../../../contexts'

import React from 'react'

import { Dialog, DialogFooter, DialogHeader } from '.'
import { SettingsContext } from '../../../contexts'

export function SettingsDialog({ close }: { close: () => void }): JSX.Element {
  const settings: ProvidedSettings =
    React.useContext<ProvidedSettings>(SettingsContext)

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
              settings.setSettings(
                (prevSettings: Settings): Settings => ({
                  ...prevSettings,
                  autoSave: !prevSettings.autoSave,
                }),
              )
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
