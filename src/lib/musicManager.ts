class MusicManager {
  private audio: HTMLAudioElement | null = null
  private enabled = false

  start() {
    if (!this.enabled || this.audio) return
    try {
      this.audio = new Audio('/sounds/musica-8bit.mp3')
      this.audio.loop = true
      this.audio.volume = 0.15
      this.audio.play().catch(() => {})
    } catch {}
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  setEnabled(v: boolean) { this.enabled = v; if (!v) this.stop() }
  isEnabled() { return this.enabled }
  dispose() { this.stop() }
}

export const musicManager = new MusicManager()
