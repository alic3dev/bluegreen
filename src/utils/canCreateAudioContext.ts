export function canCreateAudioContext(): boolean {
  try {
    const audioContext: AudioContext = new AudioContext()

    const buffer: AudioBufferSourceNode = new AudioBufferSourceNode(
      audioContext,
    )
    buffer.start(0, 0, 1)

    if (audioContext && audioContext.state === 'running') return true
  } catch {
    /* empty */
  }

  return false
}
