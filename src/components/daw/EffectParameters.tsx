import type { AutomatableParameter } from 'zer0'

import React from 'react'

function EffectParameterInput({
  parameter,
}: {
  parameter: AutomatableParameter
}): React.ReactNode {
  switch (parameter.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          name="bpm-sync"
          defaultChecked={parameter.getValue()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
            parameter.setValue(event.currentTarget.checked)
          }}
        />
      )

    case 'number':
      if (parameter.control === 'slider') {
        return (
          <input
            type="range"
            defaultValue={parameter.getValue() * 1000}
            min={0}
            max={1000}
            step={1}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              const newValue: number = event.currentTarget.valueAsNumber

              if (!Number.isNaN(newValue)) {
                parameter.setValue(newValue / 1000)
              }
            }}
          />
        )
      }

      return (
        <input
          type="number"
          defaultValue={parameter.getValue()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
            const newValue: number = event.currentTarget.valueAsNumber

            if (!Number.isNaN(newValue)) {
              parameter.setValue(newValue)
            }
          }}
        />
      )
    default:
      return <></>
  }
}

function EffectParameter({
  parameter,
}: {
  parameter: AutomatableParameter
}): React.ReactNode {
  return (
    <div>
      <label>
        {parameter.name}

        <EffectParameterInput parameter={parameter} />
      </label>
    </div>
  )
}

export function EffectParameters({
  parameters,
}: {
  parameters: AutomatableParameter[]
}): React.ReactNode {
  return parameters.map(
    (parameter: AutomatableParameter): React.ReactNode => (
      <EffectParameter key={parameter.id} parameter={parameter} />
    ),
  )
}
