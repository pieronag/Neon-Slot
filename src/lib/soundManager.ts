class SoundManager {
  private ctx: AudioContext | null = null
  enabled = true
  private vol = 0.3

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
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

  private noise(dur: number, vol = 1) {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
      const s = ctx.createBufferSource(); s.buffer = buf
      const g = ctx.createGain(); g.gain.value = this.vol * vol * 0.5; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000
      s.connect(f); f.connect(g); g.connect(ctx.destination); s.start()
    } catch {}
  }

  play(type: 'spin' | 'win' | 'bigwin' | 'bonus' | 'click') {
    switch (type) {
      case 'spin':
        this.noise(0.3, 0.4); this.tone(400, 0.12, 'sawtooth', 0.3)
        setTimeout(() => this.tone(300, 0.12), 60); setTimeout(() => this.tone(200, 0.12), 120)
        break
      case 'win':
        this.tone(523, 0.12, 'square', 0.4); setTimeout(() => this.tone(659, 0.12, 'square', 0.4), 80)
        setTimeout(() => this.tone(784, 0.18, 'square', 0.4), 160)
        break
      case 'bigwin':
        this.tone(523, 0.1, 'square', 0.5); setTimeout(() => this.tone(659, 0.1, 'square', 0.5), 70)
        setTimeout(() => this.tone(784, 0.1, 'square', 0.5), 140)
        setTimeout(() => this.tone(1047, 0.3, 'square', 0.5), 210)
        break
      case 'bonus':
        this.tone(440, 0.12, 'sine', 0.4); setTimeout(() => this.tone(554, 0.12, 'sine', 0.4), 100)
        setTimeout(() => this.tone(659, 0.12, 'sine', 0.4), 200)
        setTimeout(() => this.tone(880, 0.25, 'sine', 0.5), 300)
        break
      case 'click':
        this.tone(800, 0.04, 'square', 0.15)
    }
  }
}

export const soundManager = new SoundManager()
