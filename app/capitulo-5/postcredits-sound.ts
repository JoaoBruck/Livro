import { sitePath } from "../site-path";
import { cuesBetween } from "./postcredits-sequence";

export class PostcreditsSound {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private sources = new Set<AudioBufferSourceNode>();
  private loading: Promise<void> | null = null;
  private closed = false;
  private volume = .55;
  muted = false;

  async unlock() {
    if (this.closed || typeof window.AudioContext !== "function") return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.context.destination);
    }
    // Called directly from a trusted gesture, before any fetch/await.
    const resume = this.context.resume();
    const context = this.context;
    if (!this.loading) this.loading = Promise.all(["vicente", "reporter", "tv-impact", "tv-on"].map(async sound => {
      const response = await fetch(sitePath(`/audio/postcredits/${sound}.wav`));
      if (!response.ok) throw new Error("postcredits audio");
      this.buffers.set(sound, await context.decodeAudioData(await response.arrayBuffer()));
    })).then(() => undefined).catch(error => { this.loading = null; throw error; });
    try { await Promise.all([resume, this.loading]); }
    catch { return false; }
    return !this.closed && context.state === "running";
  }

  advance(from: number, to: number) {
    if (this.closed || this.muted || this.context?.state !== "running" || !this.master) return;
    for (const cue of cuesBetween(from, to)) {
      const buffer = this.buffers.get(cue.sound);
      if (!buffer) continue;
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer; source.playbackRate.value = cue.rate; gain.gain.value = cue.gain;
      source.connect(gain); gain.connect(this.master);
      source.onended = () => { this.sources.delete(source); source.disconnect(); gain.disconnect(); };
      this.sources.add(source); source.start();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.context && this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, .02);
  }

  setMuted(muted: boolean) { this.muted = muted; this.setVolume(this.volume); if (muted) this.stop(); }

  stop() {
    for (const source of this.sources) { try { source.stop(); } catch { /* Already ended. */ } }
    this.sources.clear();
  }

  close() { this.closed = true; this.stop(); void this.context?.close(); }
}
