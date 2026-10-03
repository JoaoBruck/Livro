// Offline authoring with jsfxr (https://github.com/chr15m/jsfxr, Unlicense).
// Usage: node scripts/create-postcredits-audio.mjs /path/to/jsfxr/sfxr.js
// The generator is never downloaded or executed by the reader's browser.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const { sfxr, Params } = require(resolve(process.argv[2]));
const rate = 44100;
let seed = 512017;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const output = new URL("../public/audio/postcredits/", import.meta.url);
mkdirSync(output, { recursive: true });
const hz = frequency => Math.sqrt(frequency * 100 / (8 * rate) - .001);
const time = seconds => Math.sqrt(seconds * rate / 100000);
function synth(settings) {
  return sfxr.toBuffer(Object.assign(new Params(), {
    sample_size: 16, sample_rate: rate, sound_vol: .35,
    p_env_attack: time(.002), p_env_sustain: time(.016), p_env_decay: time(.015),
    p_lpf_freq: .5, p_hpf_freq: .02,
  }, settings));
}
function mix(seconds, layers) {
  const samples = new Float32Array(Math.round(seconds * rate));
  for (const [wave, gain, offset = 0] of layers) {
    const start = Math.round(offset * rate);
    for (let i = 0; i < wave.length && i + start < samples.length; i++) samples[i + start] += wave[i] * gain;
  }
  return samples;
}
function save(name, samples, peak) {
  const max = samples.reduce((value, sample) => Math.max(value, Math.abs(sample)), .00001);
  const data = Buffer.alloc(44 + samples.length * 2);
  data.write("RIFF"); data.writeUInt32LE(data.length - 8, 4); data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write("data", 36); data.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const edge = Math.min(1, i / 110, (samples.length - 1 - i) / 220);
    data.writeInt16LE(Math.round(samples[i] / max * peak * Math.max(0, edge) * 32767), 44 + i * 2);
  }
  writeFileSync(new URL(name, output), data);
  console.log(`${name}: ${(samples.length / rate).toFixed(3)}s, ${data.length} bytes`);
}
save("vicente.wav", synth({ wave_type: 0, p_base_freq: hz(133), p_duty: .34, p_freq_ramp: -.025, p_lpf_freq: .27, p_vib_strength: .018, p_vib_speed: .18 }), .5);
save("reporter.wav", synth({ wave_type: 0, p_base_freq: hz(219), p_duty: .2, p_freq_ramp: .015, p_lpf_freq: .34, p_env_decay: time(.012) }), .42);
const low = synth({ wave_type: 2, p_base_freq: hz(126), p_freq_ramp: -.28, p_env_sustain: time(.05), p_env_decay: time(.65), p_lpf_freq: .7, p_hpf_freq: 0 });
const crack = synth({ wave_type: 3, p_base_freq: hz(700), p_env_punch: .4, p_env_sustain: time(.028), p_env_decay: time(.28), p_lpf_freq: .24, p_hpf_freq: .07 });
const shell = synth({ wave_type: 1, p_base_freq: hz(318), p_freq_ramp: -.04, p_pha_offset: .13, p_pha_ramp: -.04, p_env_sustain: time(.03), p_env_decay: time(.47), p_lpf_freq: .19 });
save("tv-impact.wav", mix(1.5, [[low, 1], [crack, .63], [shell, .18, .018], [crack, .18, .19], [shell, .09, .28]]), .78);
const staticNoise = synth({ wave_type: 3, p_base_freq: hz(1900), p_env_attack: time(.06), p_env_sustain: time(.18), p_env_decay: time(.5), p_lpf_freq: .31, p_hpf_freq: .12 });
const relay = synth({ wave_type: 3, p_base_freq: hz(420), p_env_attack: 0, p_env_sustain: time(.008), p_env_decay: time(.045), p_lpf_freq: .45 });
save("tv-on.wav", mix(.95, [[relay, .6], [staticNoise, .2, .1]]), .35);
