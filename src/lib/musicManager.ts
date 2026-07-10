class MusicManager {
  private ctx: AudioContext | null = null
  private enabled = false
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = []
  private interval: ReturnType<typeof setInterval> | null = null

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  start() {
    if (!this.enabled || this.oscillators.length > 0) return
    try {
      const ctx = this.getCtx()
      const bg = ctx.createGain(); bg.gain.value = 0.04; bg.connect(ctx.destination)

      const bOsc = ctx.createOscillator(); bOsc.type = 'sine'; bOsc.frequency.value = 55
      bOsc.connect(bg); bOsc.start()
      this.oscillators.push({ osc: bOsc, gain: bg })

      const bg2 = ctx.createGain(); bg2.gain.value = 0.025
      const pOsc = ctx.createOscillator(); pOsc.type = 'triangle'; pOsc.frequency.value = 110
      pOsc.connect(bg2); bg2.connect(ctx.destination); pOsc.start()
      this.oscillators.push({ osc: pOsc, gain: bg2 })

      this.interval = setInterval(() => {
        bOsc.frequency.setValueAtTime(55, ctx.currentTime)
        bOsc.frequency.linearRampToValueAtTime(58, ctx.currentTime + 0.5)
        bOsc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 1)
      }, 1000)
    } catch {}
  }

  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null }
    this.oscillators.forEach(({ osc, gain }) => { try { osc.stop(); gain.disconnect() } catch {} })
    this.oscillators = []
  }

  setEnabled(v: boolean) { this.enabled = v; if (!v) this.stop() }
  isEnabled() { return this.enabled }
  dispose() { this.stop(); this.ctx?.close(); this.ctx = null }
}

export const musicManager = new MusicManager()
