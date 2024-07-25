import React from 'react'

import { CiFloppyDisk, CiFolderOn, CiPlay1, CiStop1 } from 'react-icons/ci'

import styles from './GenerativeControls.module.scss'

export function GenerativeControls({
  playing,
  setPlaying,
  canvasRef,
}: {
  playing: boolean
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>
  canvasRef: React.RefObject<HTMLCanvasElement>
}): React.ReactNode {
  const inputFileRef = React.useRef<HTMLInputElement>(null)

  const togglePlaying = React.useCallback((): void => {
    setPlaying((isPlaying: boolean): boolean => !isPlaying)
  }, [setPlaying])

  const save = React.useCallback((): void => {
    if (!canvasRef.current) return

    window.location.href = canvasRef.current
      .toDataURL('png', 100)
      .replace('image/png', 'image/octet-stream')
  }, [canvasRef])

  const open = React.useCallback((): void => {
    if (!canvasRef.current || !inputFileRef.current) return

    inputFileRef.current.click()
  }, [canvasRef])

  const onFile = React.useCallback(
    (event: InputEvent): void => {
      if (!canvasRef.current) return

      const ctx: CanvasRenderingContext2D | null =
        canvasRef.current.getContext('2d')

      if (!ctx) return

      const file: File = (event.target as HTMLInputElement).files![0]

      const url = URL.createObjectURL(file)
      const img = new Image()

      img.onload = function _tempImgOnload(): void {
        URL.revokeObjectURL(this.src)
        canvasRef.current.getContext('2d').drawImage(this, 0, 0)
      }

      img.src = url
    },
    [canvasRef],
  )

  return (
    <div className={styles['generative-controls']}>
      <button onClick={togglePlaying}>
        {playing ? <CiStop1 /> : <CiPlay1 />}
      </button>

      <button onClick={save}>
        <CiFloppyDisk />
      </button>

      <input
        ref={inputFileRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFile}
      />

      <button onClick={open}>
        <CiFolderOn />
      </button>
    </div>
  )
}
