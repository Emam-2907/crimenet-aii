// Audio Utility for CRIMENET AI
// Audio is muted by default to provide a professional, silent investigation environment.

class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Disabled by default for professional law enforcement workstation standards
  }

  init() {
    if (this.isMuted) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playBeep() {
    // Silent by default
  }

  playRadarPing() {
    // Silent
  }

  playThreatAlert() {
    // Silent
  }

  playTacticalClick() {
    // Silent
  }

  playScanSweep() {
    // Silent
  }

  playSuccessChime() {
    // Silent
  }
}

export const soundFx = new TacticalAudioEngine();

