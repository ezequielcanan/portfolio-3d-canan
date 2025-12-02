// src/utils/audioManager.js
let audioContext = null;
const buffers = new Map();
let unlocked = false;

function getAudioContext() {
  if (audioContext) return audioContext;
  const AC = window.AudioContext || window.webkitAudioContext;
  audioContext = new AC();
  return audioContext;
}

export async function loadAudio(name, url) {
  if (buffers.has(name)) return buffers.get(name);
  const ctx = getAudioContext();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();

  // decodeAudioData compat: some browsers return Promise, others need callback
  const decoded = await new Promise((resolve, reject) => {
    const maybePromise = ctx.decodeAudioData(
      arrayBuffer,
      (buf) => resolve(buf),
      (err) => reject(err)
    );
    // if returns a promise, resolve it too
    if (maybePromise && maybePromise.then) {
      maybePromise.then(resolve).catch(reject);
    }
  });

  buffers.set(name, decoded);
  return decoded;
}

export function play(name, options = {}) {
  const ctx = getAudioContext();
  const buffer = buffers.get(name);
  if (!buffer) {
    console.warn(`[audioManager] buffer not loaded: ${name}`);
    return;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // gain node for volume control
  const gain = ctx.createGain();
  gain.gain.value = options.volume ?? 1;

  source.connect(gain).connect(ctx.destination);

  // scheduling: start immediately relative to audioContext time
  source.start(0);
  return source; // can stop if needed
}

export function resumeIfNeeded() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (typeof ctx.state !== "undefined" && ctx.state === "suspended") {
    ctx.resume().then(() => {
      unlocked = true;
    }).catch(() => { });
  } else {
    unlocked = true;
  }
}

export function isUnlocked() {
  return unlocked;
}
