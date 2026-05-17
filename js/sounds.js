let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

// ── Sound effects ─────────────────────────────────────────────────────────────

function playShoot() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

function playDamage() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25);
  } catch(e) {}
}

function playRescue() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.38);
    });
  } catch(e) {}
}

function playLevelComplete() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 659, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.13;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t); osc.stop(t + 0.5);
    });
  } catch(e) {}
}

// ── Background music ──────────────────────────────────────────────────────────
// Original upbeat looping chiptune — bouncy and fun, Parry Gripp energy.
// 140 BPM, C major, 4-bar loop with melody, bass, kick, snare, hi-hat.

const _BPM  = 140;
const _B    = 60 / _BPM;        // 1 beat
const _E    = _B / 2;           // eighth note
const _Q    = _B;               // quarter note
const _LOOP = _E * 32;          // 4 bars

// Note frequencies
const _C3=131,_F3=175,_G3=196,_A3=220;
const _C5=523,_D5=587,_E5=659,_F5=698,_G5=784,_A5=880,_B5=988,_C6=1047,_D6=1175;

// Melody: [offset, freq, duration]
const _MELODY = [
  // bar 1 — "bum bum bum-bum bum bum…"
  [_E* 0, _E5, _E], [_E* 1, _G5, _E], [_E* 2, _A5, _E], [_E* 3, _G5, _E],
  [_E* 4, _E5, _Q], [_E* 6, _C5, _E], [_E* 7, _D5, _E],
  // bar 2
  [_E* 8, _E5, _E], [_E* 9, _E5, _E], [_E*10, _G5, _E], [_E*11, _A5, _E],
  [_E*12, _G5, _Q], [_E*14, _F5, _E], [_E*15, _E5, _E],
  // bar 3 — goes higher
  [_E*16, _G5, _E], [_E*17, _A5, _E], [_E*18, _B5, _E], [_E*19, _C6, _E],
  [_E*20, _B5, _Q], [_E*22, _A5, _E], [_E*23, _G5, _E],
  // bar 4 — resolve down
  [_E*24, _E5, _E], [_E*25, _D5, _E], [_E*26, _C5, _E], [_E*27, _D5, _E],
  [_E*28, _E5, _Q], [_E*30, _G5, _E], [_E*31, _E5, _E],
];

// Bass: [offset, freq, duration]
const _BASS = [
  [_E* 0, _C3, _Q*0.8], [_E* 4, _C3, _Q*0.8],
  [_E* 8, _G3, _Q*0.8], [_E*12, _G3, _Q*0.8],
  [_E*16, _A3, _Q*0.8], [_E*20, _A3, _Q*0.8],
  [_E*24, _F3, _Q*0.8], [_E*28, _F3, _Q*0.8],
];

// Kick offsets (beats 1 & 3 of every bar)
const _KICK = [0,1,2,3].flatMap(b => [_E*(b*8), _E*(b*8+4)]);
// Snare offsets (beats 2 & 4 of every bar)
const _SNARE = [0,1,2,3].flatMap(b => [_E*(b*8+2), _E*(b*8+6)]);
// Hi-hat on every eighth note
const _HIHAT = Array.from({length:32}, (_,i) => _E*i);

const _music = { playing: false, until: 0, timer: null };

function _schedNote(ctx, t, freq, dur, vol, type) {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t); osc.stop(t + dur + 0.01);
}

function _schedNoise(ctx, t, dur, vol, hpFreq) {
  const size   = Math.ceil(ctx.sampleRate * dur);
  const buf    = ctx.createBuffer(1, size, ctx.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src    = ctx.createBufferSource();
  src.buffer   = buf;
  const filter = ctx.createBiquadFilter();
  filter.type  = 'highpass'; filter.frequency.value = hpFreq;
  const gain   = ctx.createGain();
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.start(t); src.stop(t + dur + 0.01);
}

function _schedLoop(start) {
  const ctx = getAudioCtx();
  _MELODY.forEach(([off, freq, dur]) =>
    _schedNote(ctx, start+off, freq, dur*0.82, 0.10, 'square'));
  _BASS.forEach(([off, freq, dur]) =>
    _schedNote(ctx, start+off, freq, dur,      0.14, 'sawtooth'));
  _KICK.forEach(off => {
    const t = start + off;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.start(t); o.stop(t + 0.2);
  });
  _SNARE.forEach(off => _schedNoise(ctx, start+off, 0.14, 0.18, 1500));
  _HIHAT.forEach(off => _schedNoise(ctx, start+off, 0.04, 0.06, 8000));
  _music.until = start + _LOOP;
}

function _musicTick() {
  if (!_music.playing) return;
  try {
    const ctx = getAudioCtx();
    while (_music.until < ctx.currentTime + 0.6) _schedLoop(_music.until);
  } catch(e) {}
}

function startBgMusic() {
  if (_music.playing) return;
  _music.playing = true;
  if (!_music.timer) _music.timer = setInterval(_musicTick, 200);
  try {
    const ctx = getAudioCtx();
    _music.until = ctx.currentTime;
    // Only schedule immediately if the context is already running.
    // If suspended (mobile before first touch), resumeAudio() will kick
    // off _musicTick once the context is unlocked by a user gesture.
    if (ctx.state === 'running') _musicTick();
  } catch(e) {}
}

let _audioUnlocked = false;

function resumeAudio() {
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Silent 1-sample buffer — required by older iOS Safari to unlock the audio pipeline.
    // Must be played inside a user-gesture handler to take effect.
    if (!_audioUnlocked) {
      _audioUnlocked = true;
      const buf = _audioCtx.createBuffer(1, 1, 22050);
      const src = _audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(_audioCtx.destination);
      src.start(0);
    }
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume().then(() => {
        if (_music.playing) {
          _music.until = _audioCtx.currentTime;
          _musicTick();
        }
      });
    }
  } catch(e) {}
}

// Auto-resume when the tab comes back to foreground (e.g. after iOS lock screen)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && _audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
});
