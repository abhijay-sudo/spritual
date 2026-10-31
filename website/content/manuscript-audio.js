// =========================================================================
// SPRITUAL — PROCEDURAL WEB AUDIO API SOUND ENGINE (ZERO MP3/EXTERNAL FILES)
// Procedural acoustic physics: Vellum rustle, 432Hz temple chime, bow shockwave
// =========================================================================

let audioCtx = null;
let masterGain = null;
let soundscapeEnabled = false;

// Read user preference
try {
  soundscapeEnabled = localStorage.getItem('spritual_soundscape_v1') === 'on';
} catch {}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.75, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Procedural Vellum Page-Turn Rustle (140ms bandpass-swept noise)
export function playPageRustle() {
  if (!soundscapeEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.14); // 140ms buffer
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  // Generate white noise with soft organic grain
  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.65));
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  // Sweeping Bandpass Filter (900Hz -> 2400Hz -> 600Hz)
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.Q.setValueAtTime(3.5, now);
  bandpass.frequency.setValueAtTime(900, now);
  bandpass.frequency.exponentialRampToValueAtTime(2400, now + 0.065);
  bandpass.frequency.exponentialRampToValueAtTime(600, now + 0.14);

  // Soft Exponential Gain Envelope
  const rustleGain = ctx.createGain();
  rustleGain.gain.setValueAtTime(0.001, now);
  rustleGain.gain.linearRampToValueAtTime(0.24, now + 0.025);
  rustleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  whiteNoise.connect(bandpass);
  bandpass.connect(rustleGain);
  rustleGain.connect(masterGain);

  whiteNoise.start(now);
  whiteNoise.stop(now + 0.14);
}

// 2. Warm Chola-Bronze Bell / Tanpura Overtone Chord (432Hz Fundamental, 3.8s decay)
export function playTempleChime(freq = 432) {
  if (!soundscapeEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chimeGain = ctx.createGain();
  chimeGain.gain.setValueAtTime(0.001, now);
  chimeGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
  chimeGain.connect(masterGain);

  // Fundamental + Consonant Fifth (1.5x) + Shimmer Octave (2.02x)
  const partials = [
    { freq: freq, type: 'sine', gain: 0.5 },
    { freq: freq * 1.5, type: 'triangle', gain: 0.3 },
    { freq: freq * 2.02, type: 'sine', gain: 0.2 }
  ];

  partials.forEach(p => {
    const osc = ctx.createOscillator();
    const pGain = ctx.createGain();
    osc.type = p.type;
    osc.frequency.setValueAtTime(p.freq, now);
    pGain.gain.setValueAtTime(p.gain, now);

    osc.connect(pGain);
    pGain.connect(chimeGain);

    osc.start(now);
    osc.stop(now + 3.8);
  });
}

// 3. Deep Bow-String Shockwave Thrum (Scenes 10 & 11: Shiva's celestial bow breaks)
export function playBowShockwave() {
  if (!soundscapeEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sub-Bass 65Hz Punch Ramping Down
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(68, now);
  subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.65);

  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.linearRampToValueAtTime(0.55, now + 0.03);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

  subOsc.connect(subGain);
  subGain.connect(masterGain);
  subOsc.start(now);
  subOsc.stop(now + 0.85);

  // Metallic Bronze Snap
  const snapBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
  const snapData = snapBuffer.getChannelData(0);
  for (let i = 0; i < snapData.length; i++) {
    snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapData.length * 0.2));
  }

  const snapSource = ctx.createBufferSource();
  snapSource.buffer = snapBuffer;

  const snapFilter = ctx.createBiquadFilter();
  snapFilter.type = 'highpass';
  snapFilter.frequency.setValueAtTime(1400, now);

  const snapGain = ctx.createGain();
  snapGain.gain.setValueAtTime(0.4, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  snapSource.connect(snapFilter);
  snapFilter.connect(snapGain);
  snapGain.connect(masterGain);

  snapSource.start(now);
  snapSource.stop(now + 0.08);
}

// Soundscape UI Toggle Controller
export function initSoundscapeUI() {
  const toggle = document.querySelector('[data-soundscape-toggle]');
  if (!toggle) return;

  function updateButton() {
    toggle.setAttribute('aria-pressed', String(soundscapeEnabled));
    const label = toggle.querySelector('span');
    if (label) {
      label.textContent = soundscapeEnabled ? '🔊 Sound: On' : '🔈 Sound: Off';
    }
  }

  toggle.addEventListener('click', () => {
    soundscapeEnabled = !soundscapeEnabled;
    try {
      localStorage.setItem('spritual_soundscape_v1', soundscapeEnabled ? 'on' : 'off');
    } catch {}
    if (soundscapeEnabled) {
      getAudioContext();
      playPageRustle();
    }
    updateButton();
  });

  updateButton();
}

// Auto-initialize toggle button on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundscapeUI);
  } else {
    initSoundscapeUI();
  }
}
