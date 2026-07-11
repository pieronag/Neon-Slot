class SoundManager {
  private ctx: AudioContext | null = null
  enabled = true
  private vol = 0.3

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private playAudio(path: string, vol = 1) {
    if (!this.enabled) return
    try {
      const audio = new Audio(path)
      audio.volume = this.vol * vol
      audio.play().catch(() => {})
    } catch {}
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 1) {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = type; o.frequency.value = freq
      g.gain.value = this.vol * vol; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur)
    } catch {}
  }

  play(type: 'spin' | 'win' | 'bigwin' | 'bonus' | 'click' | 'collect') {
    switch (type) {
      case 'spin':
        this.playAudio('/sounds/girar-slot.mp3', 0.5)
        break
      case 'win':
      case 'bigwin':
      case 'bonus':
      case 'collect':
        this.playAudio('/sounds/cobrar.mp3', 0.6)
        break
      case 'click':
        this.tone(800, 0.04, 'square', 0.15)
    }
  }
}

export const soundManager = new SoundManager()
