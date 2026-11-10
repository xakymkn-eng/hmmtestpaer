/**
 * Procedural Web Audio API sound generator for Sky Vanguard
 * Zero external audio assets needed, 100% synthesized in real time.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private currentMusicMode: 'none' | 'lobby' | 'combat' = 'none';
  private activeMusicNodes: { stop: () => void }[] = [];
  private musicLoopTimer: number | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('sky_vanguard_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // localStorage may fail in restricted sandboxes
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('sky_vanguard_muted', String(this.isMuted));
    } catch {}

    if (this.musicGain && this.ctx) {
      const t = this.ctx.currentTime;
      if (this.isMuted) {
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.1);
      } else {
        const targetVol = this.currentMusicMode === 'combat' ? 0.48 : 0.42;
        this.musicGain.gain.setValueAtTime(0.0001, t);
        this.musicGain.gain.linearRampToValueAtTime(targetVol, t + 0.3);
      }
    }

    return this.isMuted;
  }

  /**
   * Overhauled Punchy Sci-Fi Laser Fire (Crisp transient pop + deep sub punch + ion sizzle)
   * Completely replaces the repetitive retro "tit tit tit" beep!
   */
  public playLaser(variant: 'light' | 'plasma' | 'laser' = 'light') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitchVar = 1 + (Math.random() * 0.12 - 0.06); // ±6% natural micro-variance

    if (variant === 'light') {
      // PHOENIX & STANDARD BLASTER: Punchy dual-pulse photon cannon
      // Layer 1: Crisp high-tech transient pop
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1450 * pitchVar, t);
      clickOsc.frequency.exponentialRampToValueAtTime(320 * pitchVar, t + 0.035);
      clickGain.gain.setValueAtTime(0.14, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.035);

      // Layer 2: Deep punchy kinetic body
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      const bodyFilter = this.ctx.createBiquadFilter();
      bodyOsc.type = 'sawtooth';
      bodyOsc.frequency.setValueAtTime(320 * pitchVar, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(85 * pitchVar, t + 0.08);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(1800, t);
      bodyFilter.frequency.exponentialRampToValueAtTime(400, t + 0.08);

      bodyGain.gain.setValueAtTime(0.12, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);
      bodyOsc.start(t);
      bodyOsc.stop(t + 0.08);

      // Layer 3: Subtle high-frequency laser trail shimmer
      const hissOsc = this.ctx.createOscillator();
      const hissGain = this.ctx.createGain();
      hissOsc.type = 'sine';
      hissOsc.frequency.setValueAtTime(840 * pitchVar, t);
      hissOsc.frequency.exponentialRampToValueAtTime(240 * pitchVar, t + 0.07);
      hissGain.gain.setValueAtTime(0.08, t);
      hissGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      hissOsc.connect(hissGain);
      hissGain.connect(this.ctx.destination);
      hissOsc.start(t);
      hissOsc.stop(t + 0.07);
    } else if (variant === 'plasma') {
      // TITAN & HEAVY CANNON: Concussive heavy ion pulse with sub bass thump
      // Sub boom
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(240 * pitchVar, t);
      subOsc.frequency.exponentialRampToValueAtTime(45 * pitchVar, t + 0.12);
      subGain.gain.setValueAtTime(0.2, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(t);
      subOsc.stop(t + 0.12);

      // Plasma rip
      const ripOsc = this.ctx.createOscillator();
      const ripGain = this.ctx.createGain();
      const ripFilter = this.ctx.createBiquadFilter();
      ripOsc.type = 'sawtooth';
      ripOsc.frequency.setValueAtTime(650 * pitchVar, t);
      ripOsc.frequency.exponentialRampToValueAtTime(110 * pitchVar, t + 0.1);
      ripFilter.type = 'bandpass';
      ripFilter.frequency.setValueAtTime(800, t);
      ripFilter.Q.value = 2.5;
      ripGain.gain.setValueAtTime(0.14, t);
      ripGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      ripOsc.connect(ripFilter);
      ripFilter.connect(ripGain);
      ripGain.connect(this.ctx.destination);
      ripOsc.start(t);
      ripOsc.stop(t + 0.1);
    } else {
      // PIERCING BEAM: Sleek relativistic tachyon beam with harmonic whistle
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1600 * pitchVar, t);
      osc1.frequency.exponentialRampToValueAtTime(480 * pitchVar, t + 0.08);
      osc2.frequency.setValueAtTime(800 * pitchVar, t);
      osc2.frequency.exponentialRampToValueAtTime(240 * pitchVar, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.08);
      osc2.stop(t + 0.08);
    }
  }

  /**
   * LX-88 Vampire Lord [HUYỀN THOẠI]: Eerie Gothic shrieking blood-surge laser
   * High-pitch demonic bat shriek + sinister low blood resonance + fluttering tremolo
   */
  public playVampireLaser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitchVar = 1 + (Math.random() * 0.1 - 0.05);

    // Layer 1: Piercing demonic bat shriek / vampire hiss
    const shriekOsc = this.ctx.createOscillator();
    const shriekGain = this.ctx.createGain();
    const shriekFilter = this.ctx.createBiquadFilter();

    shriekOsc.type = 'sawtooth';
    shriekOsc.frequency.setValueAtTime(2600 * pitchVar, t);
    shriekOsc.frequency.exponentialRampToValueAtTime(750 * pitchVar, t + 0.09);

    shriekFilter.type = 'bandpass';
    shriekFilter.frequency.setValueAtTime(2200, t);
    shriekFilter.frequency.exponentialRampToValueAtTime(600, t + 0.09);
    shriekFilter.Q.value = 4.2;

    shriekGain.gain.setValueAtTime(0.16, t);
    shriekGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    shriekOsc.connect(shriekFilter);
    shriekFilter.connect(shriekGain);
    shriekGain.connect(this.ctx.destination);
    shriekOsc.start(t);
    shriekOsc.stop(t + 0.09);

    // Layer 2: Deep blood surge rumble
    const bloodOsc = this.ctx.createOscillator();
    const bloodGain = this.ctx.createGain();
    bloodOsc.type = 'sine';
    bloodOsc.frequency.setValueAtTime(140 * pitchVar, t);
    bloodOsc.frequency.exponentialRampToValueAtTime(45 * pitchVar, t + 0.11);
    bloodGain.gain.setValueAtTime(0.18, t);
    bloodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

    bloodOsc.connect(bloodGain);
    bloodGain.connect(this.ctx.destination);
    bloodOsc.start(t);
    bloodOsc.stop(t + 0.11);

    // Layer 3: Rapid bat-wing flutter modulation
    const flutterOsc = this.ctx.createOscillator();
    const flutterGain = this.ctx.createGain();
    flutterOsc.type = 'triangle';
    flutterOsc.frequency.setValueAtTime(38, t); // 38Hz flutter rate
    flutterGain.gain.setValueAtTime(0.08, t);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    flutterOsc.connect(flutterGain);
    flutterGain.connect(this.ctx.destination);
    flutterOsc.start(t);
    flutterOsc.stop(t + 0.08);
  }

  /**
   * LX-88 Royal Sovereign Gold [HUYỀN THOẠI]: Crystalline Imperial Laser
   * Resonant royal crystal chime + pure harmonic overtones + holy golden shimmer
   */
  public playRoyalLaser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitchVar = 1 + (Math.random() * 0.08 - 0.04);

    // Layer 1: Sparkling crystal diamond harmonic bells (High harmonic chords)
    [1760, 2640, 3520].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitchVar, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7 * pitchVar, t + 0.07);

      const amp = (0.09 / (idx + 1));
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    });

    // Layer 2: Regal Imperial brass body
    const royalOsc = this.ctx.createOscillator();
    const royalGain = this.ctx.createGain();
    const royalFilter = this.ctx.createBiquadFilter();

    royalOsc.type = 'triangle';
    royalOsc.frequency.setValueAtTime(440 * pitchVar, t);
    royalOsc.frequency.exponentialRampToValueAtTime(180 * pitchVar, t + 0.09);

    royalFilter.type = 'lowpass';
    royalFilter.frequency.setValueAtTime(1400, t);
    royalGain.gain.setValueAtTime(0.14, t);
    royalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    royalOsc.connect(royalFilter);
    royalFilter.connect(royalGain);
    royalGain.connect(this.ctx.destination);
    royalOsc.start(t);
    royalOsc.stop(t + 0.09);
  }

  /**
   * Missile launch whoosh
   */
  public playMissileLaunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.18);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Procedural synthesized explosion using filtered white noise + bass boom
   */
  public playExplosion(type: 'small' | 'medium' | 'boss' = 'small') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = type === 'boss' ? 0.9 : type === 'medium' ? 0.45 : 0.22;

    // White noise buffer
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'boss' ? 300 : 700, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + duration);

    const noiseGain = this.ctx.createGain();
    const vol = type === 'boss' ? 0.35 : type === 'medium' ? 0.2 : 0.12;
    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);

    // Bass punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = type === 'boss' ? 140 : 180;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + duration * 0.8);

    oscGain.gain.setValueAtTime(vol * 1.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration * 0.8);
  }

  /**
   * Impact hit sound
   */
  public playHit(isShield: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isShield) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Gift box pickup chime with celebratory heroic harmonics
   */
  public playGiftBoxPickup(type: 'laser' | 'lightning') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = type === 'laser'
      ? [523.25, 783.99, 1046.5, 1567.98] // C5 -> G5 -> C6 -> G6 (radiant laser fanfare)
      : [440, 659.25, 880, 1318.51]; // A4 -> E5 -> A5 -> E6 (electric storm chime)

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === 'lightning' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    });
  }

  /**
   * High-voltage crackling chain lightning sound
   */
  public playLightning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const pitch = 1200 + (Math.random() * 400 - 200);
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.1);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * RTS-88 Kamen Rider Ark-One [HUYỀN THOẠI]:
   * Sinister digitized malice lightning blast (Metallic Ark Driver pop + deep malice sub boom + distorted electronic malice buzz + red-black evil thunder crackle)
   */
  public playArkOneLightning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const pitchVar = 1 + (Math.random() * 0.08 - 0.04);

    // Layer 1: Metal mechanical Ark-Driver lock snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(2400 * pitchVar, t);
    snapOsc.frequency.exponentialRampToValueAtTime(320 * pitchVar, t + 0.03);
    snapGain.gain.setValueAtTime(0.18, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.03);

    // Layer 2: Menacing Malice Sub-Bass Boom (Singularity malice pulse)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75 * pitchVar, t);
    subOsc.frequency.exponentialRampToValueAtTime(28 * pitchVar, t + 0.16);
    subGain.gain.setValueAtTime(0.24, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.16);

    // Layer 3: Distorted digitized electronic malice buzz (Ark-One Conclusion Malice sound)
    const buzzOsc = this.ctx.createOscillator();
    const buzzFilter = this.ctx.createBiquadFilter();
    const buzzGain = this.ctx.createGain();

    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.setValueAtTime(680 * pitchVar, t);
    buzzOsc.frequency.exponentialRampToValueAtTime(140 * pitchVar, t + 0.14);

    buzzFilter.type = 'bandpass';
    buzzFilter.frequency.setValueAtTime(1200, t);
    buzzFilter.frequency.exponentialRampToValueAtTime(350, t + 0.14);
    buzzFilter.Q.value = 5.0; // Sharp digitized electronic resonance

    buzzGain.gain.setValueAtTime(0.16, t);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    buzzOsc.connect(buzzFilter);
    buzzFilter.connect(buzzGain);
    buzzGain.connect(this.ctx.destination);
    buzzOsc.start(t);
    buzzOsc.stop(t + 0.14);

    // Layer 4: Jagged malicious red-black electric thunder crackle
    const thunderOsc = this.ctx.createOscillator();
    const thunderGain = this.ctx.createGain();
    thunderOsc.type = 'square';
    thunderOsc.frequency.setValueAtTime(360 * pitchVar, t);
    thunderOsc.frequency.linearRampToValueAtTime(90 * pitchVar, t + 0.12);
    thunderGain.gain.setValueAtTime(0.12, t);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    thunderOsc.connect(thunderGain);
    thunderGain.connect(this.ctx.destination);
    thunderOsc.start(t);
    thunderOsc.stop(t + 0.12);
  }

  /**
   * Hyper laser beam continuous/pulsed hum
   */
  public playHyperLaser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.08);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Power-up pickup chime
   */
  public playPowerup(type: 'weapon' | 'shield' | 'bomb' | 'coin' = 'weapon') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const notes = type === 'coin' 
      ? [987.77, 1318.51] // B5 -> E6
      : type === 'weapon'
      ? [523.25, 659.25, 783.99, 1046.50] // C5 -> E5 -> G5 -> C6
      : type === 'bomb'
      ? [440, 554.37, 659.25] // A4 -> C#5 -> E5
      : [400, 600, 800];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.12);
    });
  }

  /**
   * EMP Super Bomb screen-wipe roar
   */
  public playBomb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Heavy low sweep
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.8);

    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.8);

    // 2. High sparkle chime as bullets disintegrate
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1200, t + 0.05);
    chime.frequency.exponentialRampToValueAtTime(2400, t + 0.35);

    chimeGain.gain.setValueAtTime(0.15, t + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);
    chime.start(t + 0.05);
    chime.stop(t + 0.4);
  }

  /**
   * Boss incoming alarm (two-tone red alert klaxon)
   */
  public playBossAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const startTime = t + i * 0.32;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 587.33 : 440, startTime);
      osc.frequency.setValueAtTime(i % 2 === 0 ? 440 : 587.33, startTime + 0.15);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    }
  }

  /**
   * Victory theme fanfare
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { f: 523.25, time: 0 },
      { f: 659.25, time: 0.12 },
      { f: 783.99, time: 0.24 },
      { f: 1046.5, time: 0.38 },
      { f: 1318.51, time: 0.55 },
    ];

    chords.forEach(({ f, time }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + time);

      gain.gain.setValueAtTime(0.15, t + time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + time + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + time);
      osc.stop(t + time + 0.5);
    });
  }

  /**
   * Defeat sting
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.23]; // Descending melancholy
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.2;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Fighter-specific weapon shots
   */
  public playFighterShot(variant: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const pitchVar = 1 + (Math.random() * 0.14 - 0.07);

    switch (variant) {
      case 'aurora': // Cryo ice crystal shard
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(320 * pitchVar, t + 0.08);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        break;

      case 'vortex': // Graviton quantum disc
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(140 * pitchVar, t + 0.11);
        gain.gain.setValueAtTime(0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        break;

      case 'mirage': // Twin criss-cross phase laser
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980 * pitchVar, t);
        osc.frequency.linearRampToValueAtTime(420 * pitchVar, t + 0.07);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        break;

      case 'solaris': // Solar fusion fireball
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(70 * pitchVar, t + 0.16);
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        break;

      case 'chrono': // Tachyon relativistic beam
        osc.type = 'square';
        osc.frequency.setValueAtTime(1600 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(500 * pitchVar, t + 0.06);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        break;

      case 'apocalypse': // Heavy antimatter shell
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(55 * pitchVar, t + 0.18);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        break;

      case 'valkyrie': // Radiant holy spear chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(700 * pitchVar, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        break;

      case 'nebula_sovereign': // Deep space pulsar resonance
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(80 * pitchVar, t + 0.15);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        break;

      case 'thunderbolt': // Electric arc spark
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(300 * pitchVar, t + 0.05);
        gain.gain.setValueAtTime(0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        break;

      case 'plasma_reaper': // High-frequency buzzsaw hum
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520 * pitchVar, t);
        osc.frequency.linearRampToValueAtTime(380 * pitchVar, t + 0.09);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        break;

      case 'tempest': // Sinusoidal sonic oscillation
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(160 * pitchVar, t + 0.12);
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        break;

      case 'viper': // Toxic acidic spit
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(220 * pitchVar, t + 0.08);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        break;

      case 'falcon': // Gatling minigun mechanical thud
        osc.type = 'square';
        osc.frequency.setValueAtTime(320 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(90 * pitchVar, t + 0.04);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        break;

      case 'astraea': {
        // SX-77 ASTRAEA: Sparkling celestial starburst arpeggio + punchy core
        const starFreqs = [1567.98, 1975.53, 2349.32];
        starFreqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const sOsc = this.ctx.createOscillator();
          const sGain = this.ctx.createGain();
          sOsc.type = 'triangle';
          const st = t + idx * 0.015;
          sOsc.frequency.setValueAtTime(freq * pitchVar, st);
          sOsc.frequency.exponentialRampToValueAtTime(freq * 0.6 * pitchVar, st + 0.06);
          sGain.gain.setValueAtTime(0.08, st);
          sGain.gain.exponentialRampToValueAtTime(0.001, st + 0.06);
          sOsc.connect(sGain);
          sGain.connect(this.ctx.destination);
          sOsc.start(st);
          sOsc.stop(st + 0.06);
        });
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(540 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(90 * pitchVar, t + 0.07);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        break;
      }

      case 'bastion': // Heavy concussive shock pulse
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(60 * pitchVar, t + 0.14);
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        break;

      case 'stellar_sentinel': // Orbital satellite helix pulse (harmonic crystal chime + pulse)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(920 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(440 * pitchVar, t + 0.08);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        break;

      case 'void_rift': // Dimensional rift blade tear (pitch drop vacuum rip)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(780 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(110 * pitchVar, t + 0.1);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        break;

      case 'sol_inferno': // Solar napalm core launch (thermal combustion roar)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(80 * pitchVar, t + 0.13);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
        break;

      case 'chrono_echo': // Chrono resonator acoustic ping (high-tech double pulse)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(550 * pitchVar, t + 0.06);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        break;

      case 'graviton_lance': // Supersonic graviton railgun crack (heavy magnetic punch)
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(120 * pitchVar, t + 0.07);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        break;

      case 'bio_spore': // Organic parasitic spore pod launch
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(640 * pitchVar, t);
        osc.frequency.exponentialRampToValueAtTime(180 * pitchVar, t + 0.09);
        gain.gain.setValueAtTime(0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        break;

      default:
        this.playLaser('light');
        return;
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Starlight Nova Skill Activation Sound (SX-77 Astraea Starfire)
   * Celestial star arpeggio (C6, E6, G6, B6, D7) cascading into cosmic harmonic explosion
   */
  public playStarNovaSkill() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const starNotes = [1046.5, 1318.51, 1567.98, 1975.53, 2349.32]; // C6, E6, G6, B6, D7
    starNotes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, noteTime + 0.22);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });

    // Deep cosmic resonance boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, t + 0.15);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.7);
    subGain.gain.setValueAtTime(0.25, t + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t + 0.15);
    subOsc.stop(t + 0.75);
  }

  /**
   * Sound when dodging an enemy bullet or attack
   */
  public playDodge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.16);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Sound when armor (giáp) breaks
   */
  public playShieldBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Hero fighter active skill activation sound
   */
  public playSkillActivation(fighterId: string) {
    if (fighterId === 'astraea') {
      this.playStarNovaSkill();
      return;
    }
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass impact boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    subGain.gain.setValueAtTime(0.25, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.45);

    // High sci-fi riser chime
    const riserOsc = this.ctx.createOscillator();
    const riserGain = this.ctx.createGain();
    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(280, t);
    riserOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.35);
    riserGain.gain.setValueAtTime(0.12, t);
    riserGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    riserOsc.connect(riserGain);
    riserGain.connect(this.ctx.destination);
    riserOsc.start(t);
    riserOsc.stop(t + 0.4);
  }

  /**
   * Gacha warp portal sound
   */
  public playGachaWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(300, t + 1.1);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  /**
   * Gacha Card Reveal Fanfare based on Tier
   */
  public playGachaReveal(tier: 'B' | 'A' | 'S') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (tier === 'S') {
      // Golden Legendary Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = t + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.16, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.6);
      });
    } else if (tier === 'A') {
      // Purple Epic Chord
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = t + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.14, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } else {
      // Blue Rare Chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  /**
   * Mission completed & gems claimed chime
   */
  public playClaimReward() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Hyperspace Warp Jump sound effect (frequency sweep + thundering sub-bass)
   */
  public playWarpJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Sub-bass rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, t);
    subOsc.frequency.exponentialRampToValueAtTime(140, t + 0.4);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 1.2);
    subGain.gain.setValueAtTime(0.25, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 1.2);

    // Rising hyperspace laser sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(180, t);
    sweepOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.6);
    sweepOsc.frequency.exponentialRampToValueAtTime(320, t + 1.1);
    sweepGain.gain.setValueAtTime(0.12, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.ctx.destination);
    sweepOsc.start(t);
    sweepOsc.stop(t + 1.1);
  }

  /**
   * Celebratory sound when gems/pass/VIP recharge is successful
   */
  public playTopUpSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }

  /**
   * Snappy arcade UI button click sound
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Rewarding chime when claiming mailbox or quest rewards
   */
  public playReward() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 880, 1046.5, 1318.51]; // E5, A5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  /**
   * Sound effect played when reaching a combo milestone (every 50 hits)
   * High-energy ascending arpeggio with shimmering resonance
   */
  public playComboMilestone(milestone: number = 50) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = milestone >= 100
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      const noteStart = t + idx * 0.055;
      osc.frequency.setValueAtTime(freq, noteStart);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, noteStart + 0.16);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.26);
    });
  }

  /**
   * Procedural Cosmic Ambience & Music System
   */
  private ensureMusicGain(): GainNode | null {
    this.initContext();
    if (!this.ctx) return null;

    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.42, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }
    return this.musicGain;
  }

  /**
   * Stop any running cosmic music & ambient soundscapes smoothly
   */
  public stopMusic() {
    if (this.musicLoopTimer !== null) {
      clearInterval(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }

    if (this.activeMusicNodes.length > 0) {
      for (const node of this.activeMusicNodes) {
        try {
          node.stop();
        } catch {}
      }
      this.activeMusicNodes = [];
    }

    this.currentMusicMode = 'none';
  }

  /**
   * Sảnh Chính: Âm thanh vũ trụ huyền bí ngoài sảnh (Lobby Cosmic Ambient Pad & Celestial Wind)
   * Tạo không gian vô tận với tiếng đàn synth êm dịu, gió vũ trụ huyền ảo và những nốt sao băng lấp lánh
   */
  public playLobbyMusic() {
    if (this.currentMusicMode === 'lobby') return;
    this.stopMusic();

    const masterGain = this.ensureMusicGain();
    if (!this.ctx || !masterGain) return;

    this.currentMusicMode = 'lobby';
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Smoothly fade in lobby volume (boosted to 0.42 for rich, immersive cosmic ambience)
    masterGain.gain.setValueAtTime(masterGain.gain.value, t);
    masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0001 : 0.42, t + 0.8);

    // 1. Deep Celestial Drone & Warm Chord Pad (D2, A2, F3, C4 - D minor 9th)
    const padNotes = [73.42, 110.0, 174.61, 261.63, 329.63]; // D2, A2, F3, C4, E4
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.001, t);
    padGain.gain.linearRampToValueAtTime(0.14, t + 2.0);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(280, t);

    // Filter LFO to create breathing cosmic wave modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.07, t); // Very slow cycle ~14 seconds
    lfoGain.gain.setValueAtTime(160, t);
    lfo.connect(padFilter.frequency);
    lfo.start(t);
    this.activeMusicNodes.push({ stop: () => { try { lfo.stop(); } catch {} } });

    padNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      const detune = (idx - 2) * 5; // Subtle spatial detune
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime(detune, t);
      osc.connect(padFilter);
      osc.start(t);
      this.activeMusicNodes.push({ stop: () => { try { osc.stop(); } catch {} } });
    });

    padFilter.connect(padGain);
    padGain.connect(masterGain);

    // 2. Ethereal Cosmic Interstellar Wind (Bandpass filtered white noise)
    const noiseLength = 4 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(360, t);
    windFilter.Q.value = 1.8;

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, t);
    windGain.gain.linearRampToValueAtTime(0.05, t + 3.0);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    windSource.start(t);
    this.activeMusicNodes.push({ stop: () => { try { windSource.stop(); } catch {} } });

    // 3. Periodic delicate starlight chimes (sparkling notes)
    const chimeScale = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    let chimeIdx = 0;

    const triggerStarlightChime = () => {
      if (this.currentMusicMode !== 'lobby' || !this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noteCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < noteCount; i++) {
        const noteFreq = chimeScale[(chimeIdx + i * 2) % chimeScale.length];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        const noteStart = now + i * 0.22;
        osc.frequency.setValueAtTime(noteFreq, noteStart);
        osc.frequency.exponentialRampToValueAtTime(noteFreq * 1.02, noteStart + 0.6);

        g.gain.setValueAtTime(0.0001, noteStart);
        g.gain.linearRampToValueAtTime(0.06, noteStart + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.9);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(noteStart);
        osc.stop(noteStart + 0.95);
      }
      chimeIdx = (chimeIdx + 1) % chimeScale.length;
    };

    // Trigger starlight chime every 3.5 seconds
    this.musicLoopTimer = window.setInterval(triggerStarlightChime, 3500);
  }

  /**
   * Trong Trận: Âm thanh không chiến vũ trụ huyền bí kịch tính (Mystical Space Combat Groove)
   * Nhịp đập bass synth 16-step mạnh mẽ, hợp âm ngân hà huyền ảo, hiệu ứng đẩy kịch tính cao trào
   */
  public playCombatMusic() {
    if (this.currentMusicMode === 'combat') return;
    this.stopMusic();

    const masterGain = this.ensureMusicGain();
    if (!this.ctx || !masterGain) return;

    this.currentMusicMode = 'combat';
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Smoothly fade in combat volume (boosted to 0.48 for powerful driving beats)
    masterGain.gain.setValueAtTime(masterGain.gain.value, t);
    masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0001 : 0.48, t + 0.6);

    // 1. Mysterious Atmospheric Space Combat Drone & Synth Pad
    const droneNotes = [73.42, 110.0, 146.83, 220.0]; // D2, A2, D3, A3
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(520, t);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, t);
    droneGain.gain.linearRampToValueAtTime(0.16, t + 1.5);

    droneNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime((idx - 1.5) * 4, t);
      osc.connect(droneFilter);
      osc.start(t);
      this.activeMusicNodes.push({ stop: () => { try { osc.stop(); } catch {} } });
    });

    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);

    // 2. Procedural Sequencer: 16-step Driving Cosmic Synth Bass & Percussion at 124 BPM
    // 124 BPM -> 1 beat = 0.4838s, 16th note = 0.1209s
    const stepDuration = 60 / (124 * 4); // ~0.121s
    const bassRiff = [
      73.42, 73.42, 110.0, 73.42,   // D2, D2, A2, D2
      87.31, 87.31, 130.81, 87.31,  // F2, F2, C3, F2
      98.0, 98.0, 146.83, 98.0,     // G2, G2, D3, G2
      110.0, 98.0, 87.31, 73.42     // A2, G2, F2, D2
    ];

    let currentStep = 0;

    const playSequenceStep = () => {
      if (this.currentMusicMode !== 'combat' || !this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const stepInMeasure = currentStep % 16;
      const bassFreq = bassRiff[stepInMeasure];

      // A. Punchy Synth Bass Pluck
      const bassOsc = this.ctx.createOscillator();
      const bassPluckGain = this.ctx.createGain();
      const bassPluckFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassPluckFilter.type = 'lowpass';
      bassPluckFilter.frequency.setValueAtTime(750, now);
      bassPluckFilter.frequency.exponentialRampToValueAtTime(140, now + stepDuration * 0.9);

      const isAccented = stepInMeasure === 0 || stepInMeasure === 4 || stepInMeasure === 8 || stepInMeasure === 12;
      const pluckVol = isAccented ? 0.16 : 0.11;

      bassPluckGain.gain.setValueAtTime(pluckVol, now);
      bassPluckGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.95);

      bassOsc.connect(bassPluckFilter);
      bassPluckFilter.connect(bassPluckGain);
      bassPluckGain.connect(masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + stepDuration);

      // B. Sub-bass Cosmic Pulse Kick on Quarter notes (0, 4, 8, 12)
      if (isAccented) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(115, now);
        kickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

        kickGain.gain.setValueAtTime(0.22, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.16);
      }

      // C. High Cosmic Pulsar Hi-Hat tick on Off-beats (2, 6, 10, 14)
      if (stepInMeasure % 4 === 2) {
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'triangle';
        tickOsc.frequency.setValueAtTime(3000, now);
        tickOsc.frequency.exponentialRampToValueAtTime(1500, now + 0.03);

        tickGain.gain.setValueAtTime(0.07, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        tickOsc.connect(tickGain);
        tickGain.connect(masterGain);
        tickOsc.start(now);
        tickOsc.stop(now + 0.035);
      }

      currentStep++;
    };

    // Schedule 16th steps tightly
    this.musicLoopTimer = window.setInterval(playSequenceStep, Math.round(stepDuration * 1000));
  }
}

export const sound = new SoundEngine();
