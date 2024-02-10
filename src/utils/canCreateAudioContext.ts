export function canCreateAudioContext(): boolean {
  try {
    const audioContext: AudioContext = new AudioContext()

    if (audioContext) return true
  } catch {
    /* empty */
  }

  return false
}
