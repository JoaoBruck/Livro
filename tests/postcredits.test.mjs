import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { InterviewClock, INTERVIEW, BEAT_STARTS, END_MS, BROADCAST_MS, IMPACT_MS, SOUND_CUES, cuesBetween, getInterviewMoment, nextInterviewPosition } from "../app/capitulo-5/postcredits-sequence.ts";

const beatIndex = id => INTERVIEW.findIndex(beat => beat.id === id);
const startOf = id => BEAT_STARTS[beatIndex(id)];
const voiceOf = id => SOUND_CUES.filter(cue => cue.at >= startOf(id)
  && cue.at < startOf(id) + INTERVIEW[beatIndex(id)].duration);

test("a paused or hidden interview keeps its place, even after a long absence", () => {
  const clock = new InterviewClock();
  clock.tick(100); clock.tick(8100);
  assert.equal(clock.elapsed, 8000);
  clock.pause();
  clock.tick(100000); clock.tick(100120);
  assert.equal(clock.elapsed, 8120);
  assert.equal(getInterviewMoment(clock.elapsed).beatIndex, 0);
});

test("replay and manually advancing never inherit a previous playback timestamp", () => {
  const clock = new InterviewClock();
  clock.tick(0); clock.tick(20000);
  clock.seek(0); clock.tick(25000);
  assert.equal(clock.elapsed, 0);
  clock.seek(nextInterviewPosition(clock.elapsed)); clock.tick(27000);
  assert.equal(clock.elapsed, BROADCAST_MS);
  assert.equal(getInterviewMoment(clock.elapsed).beatIndex, 0);
  assert.equal(nextInterviewPosition(startOf("hesitation")), startOf("leroy-name"));
  assert.equal(nextInterviewPosition(startOf("apology")), startOf("like-a-son"));
  clock.tick(1000000);
  assert.equal(clock.elapsed, END_MS);
  assert.equal(getInterviewMoment(clock.elapsed).phase, "ended");
});

test("every spoken line has enough time to read, and ends before the next line", () => {
  INTERVIEW.forEach((beat, index) => {
    assert.equal(getInterviewMoment(BEAT_STARTS[index]).beatIndex, index);
    assert.equal(getInterviewMoment(BEAT_STARTS[index] + beat.duration - 1).beatIndex, index);
    if (beat.speaker) {
      const words = beat.text.split(/\s+/u).length;
      assert.ok(beat.duration >= words / 3.2 * 1000, `${index}: reading time`);
      assert.ok(words <= 24, `${beat.id}: keep mobile captions short`);
      const voice = SOUND_CUES.filter(cue => cue.at >= BEAT_STARTS[index] && cue.at < BEAT_STARTS[index] + beat.duration);
      assert.ok(voice.length > 0);
      assert.ok(voice.at(-1).at + 100 < BEAT_STARTS[index] + beat.duration);
    }
  });
});

test("muted animation and voiced animation use the same mouth timing; reduced motion holds each pose", () => {
  const cue = voiceOf("kaio-account").find(cue => cue.at >= startOf("kaio-account") + 2000);
  assert.equal(getInterviewMoment(cue.at + 10).frame, 1);
  assert.equal(getInterviewMoment(cue.at + 10, true).frame, 2);
  assert.equal(getInterviewMoment(startOf("covering-face") + 1700).frame, 5);
  assert.equal(getInterviewMoment(startOf("covering-face") + 1700, true).frame, 4);
  assert.equal(getInterviewMoment(startOf("silence") + 1200).frame, 6);
  for (let elapsed = 0; elapsed <= END_MS; elapsed += 75) {
    assert.ok(getInterviewMoment(elapsed).frame >= 0 && getInterviewMoment(elapsed).frame <= 8);
  }
});

test("impact occurs exactly at contact, and no audio catches up after a seek or background stall", () => {
  assert.equal(cuesBetween(IMPACT_MS - 10, IMPACT_MS + 10)[0]?.sound, "tv-impact");
  assert.deepEqual(cuesBetween(0, BROADCAST_MS), []);
  assert.deepEqual(cuesBetween(30000, 0), []);
  for (const beat of INTERVIEW.filter(beat => !beat.speaker)) {
    assert.equal(voiceOf(beat.id).length, 0, beat.id);
  }
});

test("covered-face apologies keep their gesture, and reporter questions never animate Vicente's mouth", () => {
  for (const cue of voiceOf("apology")) assert.equal(getInterviewMoment(cue.at + 10).frame, 5);
  for (const beat of INTERVIEW.filter(beat => beat.speaker === "Entrevistador")) {
    for (const cue of voiceOf(beat.id)) {
      assert.equal(cue.sound, "reporter");
      assert.ok(![1, 7].includes(getInterviewMoment(cue.at + 10).frame), beat.id);
    }
  }
  for (const cue of voiceOf("like-a-son")) assert.equal(getInterviewMoment(cue.at + 10).frame, 7);
});

test("the broken voice softens around Leroy and regains firmness for the denial", () => {
  const broken = voiceOf("leroy-name");
  const firm = voiceOf("denial");
  assert.ok(broken.every(cue => cue.gain < firm[0].gain));
  assert.ok(Math.max(...broken.map(cue => cue.rate)) < Math.min(...firm.map(cue => cue.rate)));
  assert.equal(getInterviewMoment(startOf("denial"), true).frame, 0);
  assert.equal(new Set(INTERVIEW.map(beat => beat.id)).size, INTERVIEW.length);
});

test("sobbing moves through a held pose and freezes with the interview clock", () => {
  const clock = new InterviewClock();
  clock.seek(startOf("apology") + 300);
  clock.tick(1000);
  const first = getInterviewMoment(clock.elapsed);
  clock.tick(1340);
  const second = getInterviewMoment(clock.elapsed);
  assert.equal(first.frame, 5);
  assert.equal(second.frame, 5);
  assert.notDeepEqual(first.motion, second.motion, "covered hands must not mean a frozen character");
  assert.equal(second.motion.leftOpacity, 0, "tears remain behind the hands");
  clock.pause();
  clock.tick(100000);
  assert.deepEqual(getInterviewMoment(clock.elapsed).motion, second.motion);
  for (const id of ["like-a-son", "alana-question"]) {
    const moment = getInterviewMoment(startOf(id) + 1000);
    assert.ok(moment.motion.leftOpacity > 0);
    assert.ok(moment.motion.rightOpacity > 0);
  }
});

test("crying stays within the emotional passage and reduced motion holds it completely still", () => {
  for (let elapsed = 0; elapsed <= END_MS; elapsed += 75) {
    const moment = getInterviewMoment(elapsed);
    assert.ok(Math.abs(moment.motion.x) <= .8);
    assert.ok(Math.abs(moment.motion.y) <= 3.05);
    const still = getInterviewMoment(elapsed, true).motion;
    assert.equal(Math.abs(still.x) + Math.abs(still.y) + Math.abs(still.tilt), 0);
    assert.equal(still.breath, 1);
    assert.equal(still.leftOpacity + still.rightOpacity, 0);
  }
  for (const id of ["opening", "kaio-account", "denial", "last-line"]) {
    const { motion } = getInterviewMoment(startOf(id) + 1000);
    assert.equal(Math.abs(motion.x) + Math.abs(motion.y), 0, id);
    assert.equal(motion.leftOpacity + motion.rightOpacity, 0, id);
  }
});

test("the scene works in the older mobile browsers supported by the reader", () => {
  const methods = ["findLast", "findLastIndex", "at"];
  const originals = methods.map(name => Array.prototype[name]);
  try {
    methods.forEach(name => { Array.prototype[name] = undefined; });
    assert.equal(getInterviewMoment(BROADCAST_MS).beatIndex, 0);
    assert.equal(getInterviewMoment(END_MS).phase, "ended");
    assert.equal(nextInterviewPosition(0), BROADCAST_MS);
    assert.equal(cuesBetween(IMPACT_MS - 1, IMPACT_MS + 1)[0].sound, "tv-impact");
  } finally {
    methods.forEach((name, index) => { Array.prototype[name] = originals[index]; });
  }
});

test("authored effects are small mono PCM assets with headroom and no clipped samples", () => {
  for (const [name, min, max] of [["vicente", .04, .09], ["reporter", .04, .09], ["tv-impact", 1, 2], ["tv-on", .5, 1.5]]) {
    const wav = readFileSync(new URL(`../public/audio/postcredits/${name}.wav`, import.meta.url));
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.readUInt16LE(22), 1);
    assert.equal(wav.readUInt16LE(34), 16);
    const duration = (wav.length - 44) / (wav.readUInt32LE(24) * 2);
    assert.ok(duration >= min && duration <= max, `${name}: duration ${duration}`);
    let peak = 0, squares = 0;
    for (let i = 44; i < wav.length; i += 2) {
      const sample = wav.readInt16LE(i) / 32768;
      peak = Math.max(peak, Math.abs(sample)); squares += sample * sample;
    }
    assert.ok(peak > .2 && peak < .9, `${name}: peak ${peak}`);
    assert.ok(Math.sqrt(squares / ((wav.length - 44) / 2)) > .003, `${name}: audible signal`);
  }
});
