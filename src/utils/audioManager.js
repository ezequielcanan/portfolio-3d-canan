// src/utils/audioManager.js
let audioContext = null;
const buffers = new Map();
let unlocked = false;
let masterGainNode = null;
let isMuted = false;
let volumeBeforeMute = 1.0; // Guardar volumen antes de mutear

function getAudioContext() {
  if (audioContext) return audioContext;
  const AC = window.AudioContext || window.webkitAudioContext;
  audioContext = new AC();

  // Crear nodo de ganancia maestro
  masterGainNode = audioContext.createGain();
  masterGainNode.connect(audioContext.destination);
  masterGainNode.gain.value = 1.0;

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
    return null;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // gain node para control de volumen individual
  const gain = ctx.createGain();
  gain.gain.value = options.volume ?? 1;

  // Conectar: source → gain → masterGain → destination
  source.connect(gain);
  gain.connect(masterGainNode);

  // scheduling: start immediately relative to audioContext time
  const when = ctx.currentTime + (options.delay || 0);
  source.start(when);

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

// Función para alternar mute
export function toggleMute() {
  if (!masterGainNode) return;

  if (isMuted) {
    // Desmutear: restaurar volumen anterior
    masterGainNode.gain.value = volumeBeforeMute;
    isMuted = false;
  } else {
    // Mutear: guardar volumen actual y poner en 0
    volumeBeforeMute = masterGainNode.gain.value;
    masterGainNode.gain.value = 0;
    isMuted = true;
  }

  return isMuted;
}

// Función para obtener estado del mute
export function getMuteState() {
  return isMuted;
}

// Función para establecer volumen maestro
export function setMasterVolume(volume) {
  if (!masterGainNode) return;
  masterGainNode.gain.value = Math.max(0, Math.min(1, volume));

  // Si estamos muteados y cambiamos el volumen, actualizar volumeBeforeMute
  if (isMuted) {
    volumeBeforeMute = masterGainNode.gain.value;
  }
}

// Función para obtener volumen maestro
export function getMasterVolume() {
  if (!masterGainNode) return 1;
  return masterGainNode.gain.value;
}