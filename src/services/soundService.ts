const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const SoundService = {
  playEat: () => {
    playTone(600, "sine", 0.1);
    setTimeout(() => playTone(900, "sine", 0.1), 50);
  },
  
  playShield: () => {
    playTone(400, "square", 0.1, 0.05);
    setTimeout(() => playTone(600, "square", 0.1, 0.05), 100);
    setTimeout(() => playTone(800, "square", 0.3, 0.05), 200);
  },

  playShieldBreak: () => {
    playTone(200, "sawtooth", 0.1, 0.05);
    setTimeout(() => playTone(150, "sawtooth", 0.2, 0.05), 50);
  },

  playCollectStar: () => {
    playTone(800, "sine", 0.05, 0.05);
    setTimeout(() => playTone(1000, "sine", 0.05, 0.05), 50);
  },

  playLevelComplete: () => {
    const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    tones.forEach((freq, i) => {
      setTimeout(() => playTone(freq, "triangle", 0.4, 0.1), i * 150);
    });
  },

  playGameOver: () => {
    playTone(300, "sawtooth", 0.5, 0.05);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  },

  resumeContext: () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
};
