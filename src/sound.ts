// High-fidelity, soothing Web Audio synthesis for tactile card gameplay

class SoundManager {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private lastHover = 0;
  private ambientNodes: AudioNode[] = [];
  private ambientGain: GainNode | null = null;
  private ambientTimer: number | null = null;
  private ambientOn = false;

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('survival_chain_sound') : null;
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        
        // Master compressor to ensure zero distortion and velvety smooth sound
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getDestination(): AudioNode | null {
    return this.compressor || (this.ctx ? this.ctx.destination : null);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('survival_chain_sound', String(this.enabled));
    }
    if (this.enabled) {
      this.playCardSound();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
    return this.enabled;
  }

  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. Realistic Paper Rustle & Card Slide (справжнє шуршання карти по столу)
  public playCardSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const duration = 0.12;

      // Realistic sliding paper friction (filtered white noise swish)
      const noiseBuffer = this.createNoiseBuffer(ctx, duration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.02);

      // Subtle warm felt/table landing thud
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      const thudFilter = ctx.createBiquadFilter();

      thudFilter.type = 'lowpass';
      thudFilter.frequency.setValueAtTime(220, now);

      thud.type = 'sine';
      thud.frequency.setValueAtTime(120, now + 0.02);
      thud.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      thudGain.gain.setValueAtTime(0.001, now);
      thudGain.gain.setValueAtTime(0.12, now + 0.02);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      thud.connect(thudFilter);
      thudFilter.connect(thudGain);
      thudGain.connect(dest);

      thud.start(now + 0.02);
      thud.stop(now + 0.1);
    } catch {}
  }

  // 2. Card Draw (soft silky paper slide swoosh)
  public playDrawSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const duration = 0.15;

      const noiseBuffer = this.createNoiseBuffer(ctx, duration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.linearRampToValueAtTime(2600, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(2.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.02);
    } catch {}
  }

  // 3. Defense Success / Beating (ідентичний до приємного звуку ходу картою)
  public playClashSound() {
    this.playCardSound();
  }

  // 4. "БИТО!" Discard Sweep (м'яке, приємне шуршання скидання карт у відбій)
  public playBitoSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const duration = 0.22;

      // Soft layered paper sweep swoosh
      const noiseBuffer = this.createNoiseBuffer(ctx, duration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.02);
    } catch {}
  }

  // 5. Axe / Joker Play (crystal bell sparkle)
  public playAxeSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const harmonics = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

      harmonics.forEach((freq, idx) => {
        if (!ctx || !dest) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.09, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.3);
      });
    } catch {}
  }

  // 6. Saw / Special Play (warm acoustic harmonic)
  public playSawSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.linearRampToValueAtTime(392.00, now + 0.06);
      osc.frequency.linearRampToValueAtTime(261.63, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // 7. Take Cards (soft cascading felt taps)
  public playTakeSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      [0, 0.04, 0.08, 0.12].forEach((delay, idx) => {
        if (!ctx || !dest) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220 - idx * 25, now + delay);
        osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.07);

        gain.gain.setValueAtTime(0.1, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.07);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    } catch {}
  }

  // 8. Victory Celebration (radiant warm major celesta chords)
  public playWinSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      // Radiant C major pentatonic chord progression: C5, E5, G5, A5, C6
      const chord = [523.25, 659.25, 783.99, 880.00, 1046.50];

      chord.forEach((freq, idx) => {
        if (!ctx || !dest) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.14, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.48);
      });
    } catch {}
  }

  // 9. Soft Defeat (gentle soothing marimba resolution)
  public playDefeatSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;
      const notes = [349.23, 329.63, 293.66, 261.63]; // F4 -> E4 -> D4 -> C4

      notes.forEach((freq, idx) => {
        if (!ctx || !dest) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.11, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.32);
      });
    } catch {}
  }

  // 10. Dual Soft Wooden Axe Chop / Strike (Точне відтворення аудіо зразка: вжух + м'який сухий чоп/стукіт)
  public playAxeClashSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;

      const now = ctx.currentTime;

      // Функція створення одного удару сокири зі зразка: плавний розтин повітря (вжух) + чіткий м'який дерев'яний чоп
      const playAxeChopWithWhoosh = (time: number, baseFreq: number, panX: number, whooshIntensity: number) => {
        if (!ctx || !dest) return;

        let hitDest: AudioNode = dest;
        if (ctx.createStereoPanner) {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(panX, time);
          panner.connect(dest);
          hitDest = panner;
        }

        // 1. Аеродинамічний свист/вжух помаху сокири перед ударом (як у новому аудіо)
        const whooshDur = 0.09;
        const whooshNoise = this.createNoiseBuffer(ctx, whooshDur);
        const whooshSrc = ctx.createBufferSource();
        whooshSrc.buffer = whooshNoise;

        const whooshFilter = ctx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.Q.setValueAtTime(1.8, time - whooshDur);
        whooshFilter.frequency.setValueAtTime(650, time - whooshDur);
        whooshFilter.frequency.linearRampToValueAtTime(1900, time - 0.02);
        whooshFilter.frequency.exponentialRampToValueAtTime(950, time);

        const whooshGain = ctx.createGain();
        whooshGain.gain.setValueAtTime(0.001, time - whooshDur);
        whooshGain.gain.linearRampToValueAtTime(0.28 * whooshIntensity, time - 0.02);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);

        whooshSrc.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(hitDest);

        try {
          whooshSrc.start(Math.max(0, time - whooshDur));
          whooshSrc.stop(time + 0.02);
        } catch {}

        // 2. М'який сухий дерев'яний транзієнт (момент контакту)
        const snapNoise = this.createNoiseBuffer(ctx, 0.035);
        const snapSrc = ctx.createBufferSource();
        snapSrc.buffer = snapNoise;

        const snapFilter = ctx.createBiquadFilter();
        snapFilter.type = 'lowpass';
        snapFilter.frequency.setValueAtTime(1250, time);
        snapFilter.frequency.exponentialRampToValueAtTime(320, time + 0.03);

        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.001, time);
        snapGain.gain.linearRampToValueAtTime(0.32, time + 0.003); // м'яка округла атака
        snapGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

        snapSrc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(hitDest);

        try {
          snapSrc.start(time);
          snapSrc.stop(time + 0.04);
        } catch {}

        // 3. Низькочастотне тіло удару (пружний щільний «ТУК»)
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(baseFreq * 1.05, time);
        bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.42, time + 0.08);

        bodyGain.gain.setValueAtTime(0.001, time);
        bodyGain.gain.linearRampToValueAtTime(0.48, time + 0.004);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.095);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(hitDest);
        bodyOsc.start(time);
        bodyOsc.stop(time + 0.10);

        // 4. Дерев'яний обертон (щільність дубового топорища та колоди)
        const woodOsc = ctx.createOscillator();
        const woodGain = ctx.createGain();
        woodOsc.type = 'triangle';
        woodOsc.frequency.setValueAtTime(baseFreq * 1.9, time);
        woodOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, time + 0.06);

        woodGain.gain.setValueAtTime(0.001, time);
        woodGain.gain.linearRampToValueAtTime(0.22, time + 0.003);
        woodGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.065);

        woodOsc.connect(woodGain);
        woodGain.connect(hitDest);
        woodOsc.start(time);
        woodOsc.stop(time + 0.07);

        // 5. Короткий акустичний хвіст кімнати (природне оксамитове затухання без бруду)
        const roomOsc = ctx.createOscillator();
        const roomGain = ctx.createGain();
        roomOsc.type = 'sine';
        roomOsc.frequency.setValueAtTime(baseFreq * 0.7, time + 0.015);

        roomGain.gain.setValueAtTime(0.001, time + 0.015);
        roomGain.gain.linearRampToValueAtTime(0.15, time + 0.025);
        roomGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

        roomOsc.connect(roomGain);
        roomGain.connect(hitDest);
        roomOsc.start(time + 0.015);
        roomOsc.stop(time + 0.17);
      };

      // УДАР 1: виліт та удар першої сокири (вжух + м'який соковитий чоп)
      playAxeChopWithWhoosh(now + 0.10, 150, -0.2, 1.0);

      // УДАР 2: схрещення другої сокири (легкий вжух + перехресний м'який чоп)
      playAxeChopWithWhoosh(now + 0.42, 185, 0.2, 0.8);
    } catch {}
  }

  // ───────────────────────── Магічні UI-звуки ─────────────────────────

  private tone(freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'sine', dest?: AudioNode) {
    const ctx = this.ctx;
    const out = dest || this.getDestination();
    if (!ctx || !out) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }

  // Скляний «тік» при наведенні
  public playHoverSound() {
    if (!this.enabled) return;
    const t = performance.now();
    if (t - this.lastHover < 70) return;
    this.lastHover = t;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.tone(1760, now, 0.09, 0.035, 'sine');
      this.tone(2637, now + 0.02, 0.1, 0.02, 'triangle');
    } catch {}
  }

  // М'який магічний клік по кнопках
  public playClickSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.tone(520, now, 0.12, 0.09, 'triangle');
      this.tone(784, now + 0.03, 0.22, 0.07, 'sine');
      this.tone(1568, now + 0.05, 0.3, 0.035, 'sine');
    } catch {}
  }

  // Каскад іскорок (перемога, трофей, джокер)
  public playSparkleSound(count = 7) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const scale = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760, 2093, 2349.32];
      for (let i = 0; i < count; i++) {
        const f = scale[Math.floor(Math.random() * scale.length)];
        this.tone(f, now + i * 0.06 + Math.random() * 0.03, 0.35, 0.05, 'sine');
      }
    } catch {}
  }

  // Роздача карт: свист + дзвіночок
  public playDealSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
      const now = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(ctx, 0.22);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.4;
      f.frequency.setValueAtTime(500, now);
      f.frequency.exponentialRampToValueAtTime(4200, now + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.2, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      src.connect(f);
      f.connect(g);
      g.connect(dest);
      src.start(now);
      src.stop(now + 0.24);
      this.tone(1318.51, now + 0.12, 0.35, 0.05, 'sine');
    } catch {}
  }

  // Твій хід: теплий дзвіночок
  public playTurnSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.tone(659.25, now, 0.5, 0.06, 'sine');
      this.tone(987.77, now + 0.12, 0.6, 0.05, 'sine');
    } catch {}
  }

  // ───────────────────────── Фонова музика лісу ─────────────────────────
  // Генерується в реальному часі: тепла пад-гармонія, вітер та мерехтливі «світлячкові» ноти.

  public startAmbient() {
    if (!this.enabled || this.ambientOn) return;
    try {
      const ctx = this.initCtx();
      const dest = this.getDestination();
      if (!ctx || !dest) return;
      this.ambientOn = true;
      const now = ctx.currentTime;

      const bus = ctx.createGain();
      bus.gain.setValueAtTime(0.0001, now);
      bus.gain.linearRampToValueAtTime(0.5, now + 4);
      bus.connect(dest);
      this.ambientGain = bus;
      this.ambientNodes.push(bus);

      // Пад: Am9 — A2, E3, A3, C4, E4, B4
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      lp.Q.value = 0.6;
      lp.connect(bus);
      this.ambientNodes.push(lp);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07;
      lfoGain.gain.value = 380;
      lfo.connect(lfoGain);
      lfoGain.connect(lp.frequency);
      lfo.start();
      this.ambientNodes.push(lfo, lfoGain);

      const pad = [110, 164.81, 220, 261.63, 329.63, 493.88];
      pad.forEach((f, i) => {
        [-6, 6].forEach((det) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i < 2 ? 'sawtooth' : 'triangle';
          o.frequency.value = f;
          o.detune.value = det;
          g.gain.value = i < 2 ? 0.018 : 0.012;
          o.connect(g);
          g.connect(lp);
          o.start();
          this.ambientNodes.push(o, g);
        });
      });

      // Вітер у кронах
      const wind = ctx.createBufferSource();
      wind.buffer = this.createNoiseBuffer(ctx, 4);
      wind.loop = true;
      const wf = ctx.createBiquadFilter();
      wf.type = 'bandpass';
      wf.frequency.value = 600;
      wf.Q.value = 0.8;
      const wg = ctx.createGain();
      wg.gain.value = 0.035;
      const wl = ctx.createOscillator();
      const wlg = ctx.createGain();
      wl.frequency.value = 0.11;
      wlg.gain.value = 0.025;
      wl.connect(wlg);
      wlg.connect(wg.gain);
      wl.start();
      wind.connect(wf);
      wf.connect(wg);
      wg.connect(bus);
      wind.start();
      this.ambientNodes.push(wind, wf, wg, wl, wlg);

      // Світлячкові ноти (пентатоніка A мінор)
      const notes = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
      const schedule = () => {
        if (!this.ambientOn || !this.ctx) return;
        const t = this.ctx.currentTime;
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const f = notes[Math.floor(Math.random() * notes.length)];
          this.tone(f, t + i * 0.28, 2.4, 0.03, 'sine', bus);
          this.tone(f * 2, t + i * 0.28, 1.2, 0.008, 'sine', bus);
        }
        this.ambientTimer = window.setTimeout(schedule, 2500 + Math.random() * 4500);
      };
      this.ambientTimer = window.setTimeout(schedule, 1800);
    } catch {}
  }

  public stopAmbient() {
    this.ambientOn = false;
    if (this.ambientTimer !== null) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    const ctx = this.ctx;
    const bus = this.ambientGain;
    const nodes = this.ambientNodes;
    this.ambientNodes = [];
    this.ambientGain = null;
    if (ctx && bus) {
      try {
        const now = ctx.currentTime;
        bus.gain.cancelScheduledValues(now);
        bus.gain.setValueAtTime(bus.gain.value, now);
        bus.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      } catch {}
      window.setTimeout(() => {
        nodes.forEach((n) => {
          try {
            (n as OscillatorNode).stop?.();
          } catch {}
          try {
            n.disconnect();
          } catch {}
        });
      }, 1000);
    }
  }
}

export const soundManager = new SoundManager();
