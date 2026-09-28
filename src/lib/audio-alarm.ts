'use client';

class OrderAlarmManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    // Play an alternating high-attention chime every 1.2 seconds
    this.playToneSequence();
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playToneSequence();
      }
    }, 1400);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private playToneSequence() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Tone 1: 880Hz (A5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: 1174Hz (D6)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174, now + 0.28);

      gain2.gain.setValueAtTime(0.45, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.28);
      osc2.stop(now + 0.65);

      // Tone 3: 1396Hz (F6) urgent buzzer
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1396, now + 0.70);

      gain3.gain.setValueAtTime(0.5, now + 0.70);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);

      osc3.start(now + 0.70);
      osc3.stop(now + 1.1);
    } catch {
      // AudioContext could be blocked by browser user gesture restrictions
    }
  }
}

export const orderAlarm = typeof window !== 'undefined' ? new OrderAlarmManager() : (null as any);
