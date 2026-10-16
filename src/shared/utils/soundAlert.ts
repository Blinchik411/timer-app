/**
 * Воспроизводит мягкий двухтональный звуковой сигнал об окончании таймера
 * с использованием Web Audio API (работает оффлайн, не требует внешних mp3-файлов).
 */
export const playTimerCompletionSound = (): void => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    // Гармоничный двухтональный сигнал (D5 587.33 Гц -> A5 880 Гц)
    playTone(587.33, 0, 0.22)
    playTone(880, 0.26, 0.38)
  } catch (e) {
    console.warn('Не удалось воспроизвести звук завершения таймера:', e)
  }
}
