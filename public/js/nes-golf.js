/**
 * GOFLBALL (1984) — Authentic NES Golf (1984) Engine
 *
 * True-to-era dual presentation:
 * 1. Overhead Hole Map (fairway, hazards, rough, animated wind arrow, golfer locator).
 * 2. Behind-The-Golfer 3D Perspective:
 *    - Parallax sky with dithered clouds and distant tree line.
 *    - Perspective fairway with yardage flags.
 *    - Classic pixel golfer sprite with 4-stage swing animation.
 *    - Authentic 3-Click NES Swing Bar (Click 1: Start, Click 2: Power, Click 3: Sweet-Spot Accuracy).
 *    - Parabolic ball trajectory with shrinking scale, ground shadow, grass divots, sand puffs, and water splashes.
 *    - Dedicated Putting Green Mode with grid elevation contours and fluttering flagstick!
 * 3. Multi-Channel WebAudio 2A03 Chipset Synthesizer (Pulse 1, Pulse 2, Triangle Bass, Noise Swish).
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NesGolfEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. 9-HOLE CHAMPIONSHIP COURSE SPECIFICATION
  // ---------------------------------------------------------------------------
  const HOLES = [
    { number: 1, par: 4, yards: 372, windBase: 3, bend: 0.0, water: [{ x: 0.18, y: 0.52, w: 0.20, h: 0.24 }], bunkers: [{ x: 0.65, y: 0.28, r: 0.08 }] },
    { number: 2, par: 4, yards: 410, windBase: 5, bend: 0.10, water: [], bunkers: [{ x: 0.36, y: 0.48, r: 0.09 }, { x: 0.62, y: 0.22, r: 0.07 }] },
    { number: 3, par: 3, yards: 185, windBase: 6, bend: 0.0, water: [{ x: 0.24, y: 0.32, w: 0.52, h: 0.22 }], bunkers: [{ x: 0.32, y: 0.18, r: 0.06 }, { x: 0.68, y: 0.18, r: 0.06 }] },
    { number: 4, par: 5, yards: 525, windBase: 7, bend: -0.12, water: [{ x: 0.64, y: 0.36, w: 0.24, h: 0.30 }], bunkers: [{ x: 0.42, y: 0.30, r: 0.08 }] },
    { number: 5, par: 4, yards: 390, windBase: 4, bend: 0.06, water: [{ x: 0.16, y: 0.26, w: 0.20, h: 0.34 }], bunkers: [{ x: 0.58, y: 0.22, r: 0.08 }] },
    { number: 6, par: 3, yards: 205, windBase: 8, bend: 0.0, water: [{ x: 0.22, y: 0.26, w: 0.56, h: 0.26 }], bunkers: [{ x: 0.50, y: 0.14, r: 0.07 }] },
    { number: 7, par: 5, yards: 540, windBase: 6, bend: 0.14, water: [], bunkers: [{ x: 0.38, y: 0.55, r: 0.09 }, { x: 0.60, y: 0.32, r: 0.08 }] },
    { number: 8, par: 4, yards: 365, windBase: 5, bend: -0.08, water: [{ x: 0.58, y: 0.20, w: 0.26, h: 0.44 }], bunkers: [{ x: 0.36, y: 0.22, r: 0.08 }] },
    { number: 9, par: 4, yards: 445, windBase: 9, bend: 0.0, water: [{ x: 0.18, y: 0.40, w: 0.24, h: 0.22 }, { x: 0.60, y: 0.40, w: 0.24, h: 0.22 }], bunkers: [{ x: 0.40, y: 0.15, r: 0.07 }, { x: 0.60, y: 0.15, r: 0.07 }] }
  ];

  // ---------------------------------------------------------------------------
  // 2. WEBAUDIO 2A03 8-BIT CHIPSET SYNTHESIZER
  // ---------------------------------------------------------------------------
  class NesSoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    _ensureCtx() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    // Pulse Channel (Square wave with custom envelope)
    playPulse(freq, durationMs, gainVal = 0.1, slideTo = null, dutyType = "square") {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = dutyType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + durationMs / 1000);
      }
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    }

    // Noise Channel (Authentic 8-bit white noise buffer)
    playNoise(durationMs, gainVal = 0.12, lowPassFreq = 1200) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const bufferSize = Math.floor(ctx.sampleRate * (durationMs / 1000));
      if (bufferSize <= 0) return;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(lowPassFreq, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }

    // Sound Effects
    playMeterTick() {
      this.playPulse(880, 25, 0.05);
    }

    playSwingStrike(isSweetSpot = true) {
      // Noise whoosh + metallic pulse thwack
      this.playNoise(160, 0.18, 2400);
      if (isSweetSpot) {
        this.playPulse(440, 90, 0.14, 180);
        setTimeout(() => this.playPulse(880, 110, 0.12, 440), 30);
      } else {
        // Dull clunk for hook/slice
        this.playPulse(180, 130, 0.16, 70);
      }
    }

    playPuttTap() {
      this.playPulse(330, 60, 0.08, 110);
      this.playNoise(60, 0.06, 800);
    }

    playBounce() {
      this.playPulse(240, 45, 0.07, 120);
      this.playNoise(40, 0.08, 600);
    }

    playWaterSplash() {
      this.playNoise(420, 0.22, 900);
      this.playPulse(140, 300, 0.12, 60);
    }

    playCupDrop() {
      // Hollow cup rattle followed by victory arpeggio
      this.playPulse(320, 40, 0.10, 160);
      setTimeout(() => this.playPulse(280, 50, 0.10, 140), 60);
      setTimeout(() => this.playPulse(360, 50, 0.10, 180), 120);
      const fanfare = [523.25, 659.25, 783.99, 1046.50];
      fanfare.forEach((n, idx) => {
        setTimeout(() => this.playPulse(n, 140, 0.09), 220 + idx * 80);
      });
    }

    playChatTypewriter(pitchOffset = 0) {
      this.playPulse(620 + pitchOffset * 40, 20, 0.04);
    }

    playChatBlip(step = 0) {
      const base = 520;
      this.playPulse(base + step * 80, 45, 0.06);
    }

    playRubberStamp() {
      this.playNoise(180, 0.28, 400);
      this.playPulse(85, 200, 0.22, 40);
    }

    playOffendedBuzzer() {
      this.playPulse(110, 320, 0.16, 65, "sawtooth");
    }

    playCashDing() {
      this.playPulse(987.77, 80, 0.08);
      setTimeout(() => this.playPulse(1318.51, 180, 0.10), 75);
    }

    playCartEnginePuff() {
      this.playNoise(35, 0.03, 350);
      this.playPulse(65, 45, 0.04, 45, "triangle");
    }
  }

  // ---------------------------------------------------------------------------
  // 3. RETRO NES GOLF CANVAS (DUAL-VIEW & PERSPECTIVE SIMULATION)
  // ---------------------------------------------------------------------------
  class NesGolfCanvas {
    constructor(canvas, sound, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.sound = sound || new NesSoundEngine();
      this.callbacks = callbacks || {};

      this.holeData = HOLES[0];
      this.windMultiplier = 1.0;
      this.upgrades = { gimmeBoost: 0, windResist: 0, unlockAutoSwing: false };
      this.partnerShirt = "#f83800";
      this.partnerHat = "#fcfcfc";
      this.partnerName = "PARTNER";

      this.particles = [];
      this.resetHole(1);

      this.canvas.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.triggerAction();
      });

      this._loop = this._loop.bind(this);
      requestAnimationFrame(this._loop);
    }

    setUpgrades(fx, windMultiplier = 1.0) {
      this.upgrades = Object.assign({ gimmeBoost: 0, windResist: 0, unlockAutoSwing: false }, fx || {});
      this.windMultiplier = windMultiplier || 1.0;
    }

    setPartnerVisuals(partner) {
      if (!partner) return;
      this.partnerShirt = partner.shirtColor || "#f83800";
      this.partnerHat = partner.hatColor || "#fcfcfc";
      this.partnerName = partner.shortName || "PARTNER";
    }

    resetHole(holeNumber) {
      const idx = ((holeNumber - 1) % HOLES.length + HOLES.length) % HOLES.length;
      this.holeData = HOLES[idx];
      this.strokes = 0;
      this.holeComplete = false;
      this.mode = "FAIRWAY"; // "FAIRWAY" or "GREEN"
      this.lie = "TEE";
      this.greenSlope = {
        x: (((holeNumber * 7) % 3) - 1) * 0.006,
        y: (holeNumber % 2 === 0 ? 0.004 : -0.004)
      };

      // Course normalized coords: Tee (0.5, 0.88), Green (0.5 + bend, 0.14)
      this.teePos = { x: 0.5, y: 0.88 };
      this.pinPos = { x: 0.5 + this.holeData.bend * 0.6, y: 0.14 };
      this.ball = { x: this.teePos.x, y: this.teePos.y, z: 0, scale: 1, vx: 0, vy: 0, moving: false };

      // Wind vector
      const angle = ((holeNumber * 83) % 360) * (Math.PI / 180);
      this.wind = {
        mph: Math.max(1, Math.round(this.holeData.windBase * this.windMultiplier)),
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        label: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(((angle * 180) / Math.PI + 360) % 360 / 45)]
      };

      // 3-Click Swing System State:
      // "IDLE" -> "POWER_UP" -> "ACCURACY_DOWN" -> "STRIKE" -> "FLIGHT" -> "REST"
      this.meterState = "IDLE";
      this.meterPower = 0.0;
      this.meterAccuracy = 0.0; // 0.0 is perfect sweet spot, -1.0 hook, +1.0 slice
      this.swingAnimFrame = 0; // 0: address, 1: backswing, 2: downswing strike, 3: follow-through
      this.swingAnimTimer = 0;
      this.bannerText = null;
      this.bannerTimer = 0;

      this.particles = [];
      this._selectBestClub();
    }

    _selectBestClub() {
      const dist = this.getRemainingYards();
      if (this.mode === "GREEN" || dist <= 22) {
        this.club = { name: "PT", maxDist: 35, type: "PUTTER" };
      } else if (this.lie === "BUNKER") {
        this.club = { name: "SW", maxDist: 85, type: "WEDGE" };
      } else if (dist > 220) {
        this.club = { name: "1W", maxDist: 275, type: "WOOD" };
      } else if (dist > 160) {
        this.club = { name: "3W", maxDist: 220, type: "WOOD" };
      } else if (dist > 110) {
        this.club = { name: "5I", maxDist: 165, type: "IRON" };
      } else if (dist > 65) {
        this.club = { name: "9I", maxDist: 115, type: "IRON" };
      } else {
        this.club = { name: "SW", maxDist: 85, type: "WEDGE" };
      }
      this.aimAngle = Math.atan2(this.pinPos.y - this.ball.y, this.pinPos.x - this.ball.x);
      if (this.callbacks && this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({ mode: this.mode, lie: this.lie || "TEE", club: this.club, aimAngle: this.aimAngle });
      }
    }

    cycleClub(delta) {
      if (this.ball.moving || this.meterState !== "IDLE" || this.holeComplete) return;
      const clubs = [
        { name: "1W", maxDist: 275, type: "WOOD" },
        { name: "3W", maxDist: 220, type: "WOOD" },
        { name: "5I", maxDist: 165, type: "IRON" },
        { name: "9I", maxDist: 115, type: "IRON" },
        { name: "SW", maxDist: 85, type: "WEDGE" },
        { name: "PT", maxDist: 35, type: "PUTTER" }
      ];
      const idx = Math.max(0, clubs.findIndex((c) => c.name === (this.club && this.club.name)));
      const next = (idx + delta + clubs.length) % clubs.length;
      this.club = clubs[next];
      if (this.callbacks && this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({ mode: this.mode, lie: this.lie || "TEE", club: this.club, aimAngle: this.aimAngle });
      }
    }

    adjustAim(deltaDeg) {
      if (this.ball.moving || this.meterState !== "IDLE" || this.holeComplete) return;
      const rad = (deltaDeg * Math.PI) / 180;
      const baseAngle = Math.atan2(this.pinPos.y - this.ball.y, this.pinPos.x - this.ball.x);
      const minA = baseAngle - Math.PI / 3;
      const maxA = baseAngle + Math.PI / 3;
      this.aimAngle = Math.max(minA, Math.min(maxA, (this.aimAngle || baseAngle) + rad));
      if (this.callbacks && this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange({ mode: this.mode, lie: this.lie || "TEE", club: this.club, aimAngle: this.aimAngle });
      }
    }

    getRemainingYards() {
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const distNorm = Math.sqrt(dx * dx + dy * dy);
      return Math.max(1, Math.round((distNorm / 0.74) * this.holeData.yards));
    }

    // -------------------------------------------------------------------------
    // 3-CLICK NES SWING CONTROLLER
    // -------------------------------------------------------------------------
    triggerAction() {
      if (this.holeComplete || this.ball.moving) return;

      // Click 1: Start Backswing Meter
      if (this.meterState === "IDLE") {
        this.meterState = "POWER_UP";
        this.meterPower = 0.1;
        this.swingAnimFrame = 1; // Backswing
        this.sound.playMeterTick();
        return;
      }

      // Click 2: Lock Power & Sweep Back Left->Right Toward Sweet Spot
      if (this.meterState === "POWER_UP") {
        this.meterState = "ACCURACY_DOWN";
        this.meterAccuracy = -1.0;
        this.sound.playMeterTick();
        return;
      }

      // Click 3: Lock Accuracy at Sweet Spot & Strike!
      if (this.meterState === "ACCURACY_DOWN") {
        this.executeShot(this.meterPower, this.meterAccuracy);
      }
    }

    autoSwingShot() {
      if (this.holeComplete || this.ball.moving) return;
      this.meterState = "POWER_UP";
      this.meterPower = 0.95;
      this.swingAnimFrame = 1;
      this.sound.playMeterTick();
      setTimeout(() => {
        if (!this.holeComplete) {
          this.executeShot(0.96, 0.0); // Perfect sweet-spot strike
        }
      }, 180);
    }

    executeShot(powerRatio, accuracyVal) {
      this.meterState = "STRIKE";
      this.swingAnimFrame = 2; // Impact strike
      this.strokes++;

      // Accuracy: If close to 0, dead straight!
      // Upgrade expands sweet spot:
      const sweetTolerance = 0.16 + (this.upgrades.gimmeBoost ? 0.35 : 0);
      let sliceOffset = 0;
      let isSweetSpot = true;

      if (Math.abs(accuracyVal) > sweetTolerance) {
        sliceOffset = accuracyVal > 0 ? (accuracyVal - sweetTolerance) : (accuracyVal + sweetTolerance);
        isSweetSpot = false;
      }

      if (this.club.name === "PT") {
        this.sound.playPuttTap();
      } else {
        this.sound.playSwingStrike(isSweetSpot);
      }

      // Grass divots fly
      for (let i = 0; i < 7; i++) {
        this.particles.push({
          x: 94 + (Math.random() - 0.5) * 8,
          y: 196 + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 4 - 2,
          color: "#88d800",
          life: 20
        });
      }

      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const targetNormDist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const holeYards = (this.holeData && this.holeData.yards) || 350;
      const teeToPinNorm = 0.76; // tee (0.5, 0.90) to pin (0.5, 0.14)
      const clubMaxYards = (this.club && this.club.maxDist) || 235;
      const lieNow = this.lie || this.mode || "FAIRWAY";
      const lieFactor = lieNow === "BUNKER"
        ? (this.club.name === "SW" || this.club.name === "PW" ? 0.85 : 0.55)
        : (lieNow === "ROUGH" ? 0.78 : 1.0);
      const effectivePower = this.mode === "GREEN"
        ? Math.min(1.18, Math.max(0.18, powerRatio * 1.15))
        : Math.min(1.12, Math.max(0.25, powerRatio * 1.05)) * lieFactor;
      const travelDist = this.mode === "GREEN"
        ? Math.min(targetNormDist * 1.35, (clubMaxYards / holeYards) * teeToPinNorm * effectivePower)
        : Math.min(targetNormDist * 1.12, (clubMaxYards / holeYards) * teeToPinNorm * effectivePower);

      // Wind & putting green slope drift (scaled so short tap-ins don't get yanked off line)
      const windDrift = (1 - Math.min(1, this.upgrades.windResist || 0)) * (this.wind.mph * 0.0018) * (this.club.name === "PT" ? 0.1 : 1.0);
      const slopeScale = (this.mode === "GREEN") ? Math.min(1.2, travelDist * 14) : 0;
      const slopeX = (this.greenSlope ? this.greenSlope.x : 0) * slopeScale;
      const slopeY = (this.greenSlope ? this.greenSlope.y : 0) * slopeScale;

      const shotAngle = this.aimAngle + sliceOffset * 0.22;
      const destX = this.ball.x + Math.cos(shotAngle) * travelDist + this.wind.dx * windDrift + slopeX;
      const destY = this.ball.y + Math.sin(shotAngle) * travelDist + this.wind.dy * windDrift + slopeY;

      this.flightFrames = this.club.name === "PT" ? 22 : 36;
      this.flightTick = 0;
      this.startBall = { x: this.ball.x, y: this.ball.y };
      this.targetBall = {
        x: Math.max(0.12, Math.min(0.88, destX)),
        y: Math.max(0.08, Math.min(0.92, destY))
      };
      this.ball.moving = true;

      setTimeout(() => {
        this.swingAnimFrame = 3; // Follow-through
      }, 120);
    }

    _updatePhysics() {
      // 1. Advance Swing Meter needle
      if (this.meterState === "POWER_UP") {
        this.meterPower += 0.036;
        if (this.meterPower >= 1.0) {
          this.meterPower = 1.0;
          this.meterState = "ACCURACY_DOWN";
          this.meterAccuracy = -1.0;
        }
      } else if (this.meterState === "ACCURACY_DOWN") {
        this.meterAccuracy += 0.044;
        if (this.meterAccuracy >= 1.0) {
          // Missed return snap -> push/slice
          this.executeShot(this.meterPower, 0.9);
        }
      }

      if (this.bannerTimer > 0) this.bannerTimer--;

      // Update particle effects
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.life--;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      if (!this.ball.moving) return;

      this.flightTick++;
      const t = this.flightTick / this.flightFrames;

      if (t >= 1) {
        this.ball.x = this.targetBall.x;
        this.ball.y = this.targetBall.y;
        this.ball.z = 0;
        this.ball.scale = 1;
        this.ball.moving = false;
        this._checkLanding();
      } else {
        // Parabolic flight arc
        this.ball.x = this.startBall.x + (this.targetBall.x - this.startBall.x) * t;
        this.ball.y = this.startBall.y + (this.targetBall.y - this.startBall.y) * t;
        if (this.club.name === "PT") {
          this.ball.z = 0;
          this.ball.scale = 1.0;
        } else {
          this.ball.z = Math.sin(t * Math.PI) * 28;
          this.ball.scale = 1.0 + Math.sin(t * Math.PI) * 0.8;
        }
      }
    }

    _checkLanding() {
      // Check water hazards first
      let hitWater = null;
      for (const w of this.holeData.water) {
        if (
          this.ball.x >= w.x &&
          this.ball.x <= w.x + w.w &&
          this.ball.y >= w.y &&
          this.ball.y <= w.y + w.h
        ) {
          hitWater = w;
          break;
        }
      }

      let inBunker = false;
      if (hitWater) {
        this.sound.playWaterSplash();
        for (let i = 0; i < 14; i++) {
          this.particles.push({
            x: 120 + (Math.random() - 0.5) * 16,
            y: 130 + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 5 - 2,
            color: "#00e8d8",
            life: 25
          });
        }
        // Penalty stroke + drop safely short of hazard
        this.strokes++;
        this.ball.x = Math.min(0.84, Math.max(0.16, 0.5));
        this.ball.y = Math.min(0.88, hitWater.y + hitWater.h + 0.04);
        this.lie = "ROUGH";
        this.mode = "FAIRWAY";
        this.bannerText = "WATER +1!";
        this.bannerTimer = 45;
      } else {
        // Check sand bunkers
        for (const b of (this.holeData.bunkers || [])) {
          const bdx = this.ball.x - b.x;
          const bdy = this.ball.y - b.y;
          if (bdx * bdx + bdy * bdy <= b.r * b.r * 1.25) {
            inBunker = true;
            break;
          }
        }
        if (inBunker) {
          this.sound.playBounce();
          this.lie = "BUNKER";
          this.mode = "FAIRWAY";
          this.bannerText = "SAND TRAP!";
          this.bannerTimer = 40;
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: 118 + (Math.random() - 0.5) * 14,
              y: 132 + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 3,
              vy: -Math.random() * 4 - 1,
              color: "#f8d878",
              life: 22
            });
          }
        } else {
          this.sound.playBounce();
        }
      }

      // Check distance to pin
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const distNorm = Math.sqrt(dx * dx + dy * dy);
      const gimmeNorm = (this.mode === "GREEN" ? 0.022 : 0.011) + ((this.upgrades.gimmeBoost || 0) * 0.025);

      // Green or fairway/rough classification (only if dry & outside bunker)
      if (!hitWater && !inBunker) {
        if (distNorm <= 0.085 || this.mode === "GREEN") {
          if (this.mode !== "GREEN" && distNorm > gimmeNorm) {
            this.bannerText = "ON GREEN!";
            this.bannerTimer = 35;
          }
          this.mode = "GREEN";
          this.lie = "GREEN";
        } else {
          const fairwayCenter = 0.5 + (this.holeData.bend || 0) * (1 - this.ball.y) * 0.5;
          if (Math.abs(this.ball.x - fairwayCenter) <= 0.16) {
            this.lie = "FAIRWAY";
          } else {
            this.lie = "ROUGH";
            if (!this.bannerText) {
              this.bannerText = "HEAVY ROUGH";
              this.bannerTimer = 30;
            }
          }
        }
      }

      // Cup drop, putting capture, or mercy max-stroke pickup (double-par + 2)?
      const holePar = (this.holeData && this.holeData.par) || 4;
      const maxMercyStrokes = Math.max(6, holePar * 2 + 2);
      if (distNorm <= gimmeNorm || this.strokes >= maxMercyStrokes) {
        this.ball.x = this.pinPos.x;
        this.ball.y = this.pinPos.y;
        this.holeComplete = true;
        this.meterState = "REST";
        this.sound.playCupDrop();

        const diff = this.strokes - this.holeData.par;
        if (this.strokes === 1) this.bannerText = "HOLE IN ONE!";
        else if (diff <= -2) this.bannerText = "EAGLE!";
        else if (diff === -1) this.bannerText = "BIRDIE!";
        else if (diff === 0) this.bannerText = "PAR";
        else this.bannerText = "BOGEY";
        this.bannerTimer = 75;

        setTimeout(() => {
          if (this.callbacks.onHoleComplete) {
            this.callbacks.onHoleComplete({
              hole: this.holeData.number,
              par: this.holeData.par,
              strokes: this.strokes,
              banner: this.bannerText
            });
          }
        }, 950);
      } else {
        this.meterState = "IDLE";
        this.swingAnimFrame = 0;
        this._selectBestClub();
      }
    }

    // -------------------------------------------------------------------------
    // 4. RETRO DUAL-VIEW 1984 NES GOLF RENDERER
    // -------------------------------------------------------------------------
    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width;  // 256
      const H = this.canvas.height; // 220
      ctx.imageSmoothingEnabled = false;

      // Pure NES Black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // --- SECTION A: OVERHEAD MINIMAP (Left Side: x: 4..74, y: 4..164) ---
      this._drawOverheadMinimap(ctx, 4, 4, 70, 160);

      // --- SECTION B: GREEN VIEW vs BEHIND-THE-GOLFER 3D PERSPECTIVE ---
      if (this.mode === "GREEN" && !this.ball.moving) {
        this._drawPuttingGreenView(ctx, 78, 4, 174, 160);
      } else {
        this._drawPerspectiveView(ctx, 78, 4, 174, 160);
      }

      // --- SECTION C: PARTICLES (Divots, Splash, Dust) ---
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
      }

      // --- SECTION D: BOTTOM 3-CLICK NES POWER & ACCURACY METER ---
      this._drawBottomSwingMeter(ctx, 6, 172, 244, 44);

      // --- SECTION E: HOLE CLEAR BANNER ---
      if (this.bannerTimer > 0 && this.bannerText) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(86, 68, 156, 32);
        ctx.strokeStyle = "#f8b800";
        ctx.lineWidth = 2;
        ctx.strokeRect(86, 68, 156, 32);
        ctx.fillStyle = "#f8b800";
        ctx.font = "bold 13px 'Courier New', monospace";
        ctx.fillText(this.bannerText, 104, 89);
      }
    }

    _drawOverheadMinimap(ctx, x, y, w, h) {
      // Border & Rough
      ctx.fillStyle = "#005000";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#00a800";
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

      // Fairway
      ctx.fillStyle = "#88d800";
      const bend = Math.round(this.holeData.bend * (w * 0.4));
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.90);
      ctx.lineTo(x + w * 0.75, y + h * 0.90);
      ctx.lineTo(x + w * 0.70 + bend, y + h * 0.45);
      ctx.lineTo(x + w * 0.65 + bend, y + h * 0.14);
      ctx.lineTo(x + w * 0.35 + bend, y + h * 0.14);
      ctx.lineTo(x + w * 0.30 + bend, y + h * 0.45);
      ctx.closePath();
      ctx.fill();

      // Water Hazards
      for (const wt of this.holeData.water) {
        ctx.fillStyle = "#0058f8";
        ctx.fillRect(
          Math.floor(x + wt.x * w),
          Math.floor(y + wt.y * h),
          Math.floor(wt.w * w),
          Math.floor(wt.h * h)
        );
      }

      // Sand Bunkers
      for (const b of this.holeData.bunkers) {
        ctx.fillStyle = "#f8d878";
        const bx = Math.floor(x + b.x * w);
        const by = Math.floor(y + b.y * h);
        const br = Math.floor(b.r * w);
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }

      // Putting Green & Cup
      const gx = Math.floor(x + this.pinPos.x * w);
      const gy = Math.floor(y + this.pinPos.y * h);
      ctx.fillStyle = "#58f898";
      ctx.fillRect(gx - 7, gy - 5, 14, 10);

      // Flagstick
      ctx.fillStyle = "#f83800";
      ctx.fillRect(gx, gy - 6, 4, 3);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(gx - 1, gy - 6, 1, 6);

      // Golfer, Aim Vector & Ball Marker on Minimap
      const bx = Math.floor(x + this.ball.x * w);
      const by = Math.floor(y + this.ball.y * h);
      if (!this.holeComplete && !this.ball.moving) {
        const len = Math.min(22, Math.max(6, Math.round(((this.club && this.club.maxDist) || 150) / 10)));
        const ax = Math.floor(bx + Math.cos(this.aimAngle) * len);
        const ay = Math.floor(by + Math.sin(this.aimAngle) * len);
        ctx.strokeStyle = "#f8b800";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(bx - 1, by - 1, 3, 3);

      // Wind Indicator at top of map
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 2, y + 2, w - 4, 16);
      ctx.fillStyle = "#58f898";
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillText(`${this.wind.mph}${this.wind.label}`, x + 6, y + 13);
    }

    _drawPuttingGreenView(ctx, x, y, w, h) {
      // Crisp 1984 NES Close-Up Putting Green Viewport
      ctx.fillStyle = "#005000";
      ctx.fillRect(x, y, w, h);

      // Checkerboard mowed putting turf stripes
      const tile = 14;
      for (let gx = x + 6; gx < x + w - 6; gx += tile) {
        for (let gy = y + 20; gy < y + h - 6; gy += tile) {
          const even = (((gx - x) / tile) + ((gy - y) / tile)) % 2 === 0;
          ctx.fillStyle = even ? "#00a800" : "#18b818";
          ctx.fillRect(gx, gy, Math.min(tile, x + w - 6 - gx), Math.min(tile, y + h - 6 - gy));
        }
      }

      // Putting header & break indicator
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, w, 18);
      ctx.fillStyle = "#58f898";
      ctx.font = "bold 9px 'Courier New', monospace";
      const remFt = Math.max(1, Math.round(this.getRemainingYards() * 3));
      const breakDir = (this.greenSlope && this.greenSlope.x > 0.001) ? "BRK R>" : (this.greenSlope && this.greenSlope.x < -0.001) ? "<BRK L" : "FLAT";
      ctx.fillText(`GREEN: ${remFt}FT  ${breakDir}`, x + 6, y + 12);

      // Cup at top-center of putting box, ball relative below
      const cupX = x + Math.floor(w / 2);
      const cupY = y + 46;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cupX, cupY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Relative ball placement (clamped inside putting pad)
      const relDx = (this.ball.x - this.pinPos.x) * 620;
      const relDy = (this.ball.y - this.pinPos.y) * 620;
      const bpx = Math.max(x + 14, Math.min(x + w - 14, Math.round(cupX + relDx)));
      const bpy = Math.max(y + 26, Math.min(y + h - 14, Math.round(cupY + relDy)));

      // Dotted Putter Aim Line
      ctx.strokeStyle = "#f8b800";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(bpx, bpy);
      ctx.lineTo(bpx + Math.cos(this.aimAngle) * 38, bpy + Math.sin(this.aimAngle) * 38);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shadow & Ball
      ctx.fillStyle = "#004010";
      ctx.fillRect(bpx - 2, bpy + 2, 5, 2);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(bpx - 2, bpy - 2, 5, 5);

      // Subtle putter silhouette
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bpx - 10, bpy - 12);
      ctx.lineTo(bpx - 3, bpy);
      ctx.stroke();
    }

    _drawPerspectiveView(ctx, x, y, w, h) {
      // 1. Sky & Dithered Clouds
      ctx.fillStyle = "#0078f8"; // NES Sky Blue
      ctx.fillRect(x, y, w, Math.floor(h * 0.44));

      // White pixel clouds drifting
      ctx.fillStyle = "#fcfcfc";
      const cloudShift = Math.floor((Date.now() / 400) % w);
      ctx.fillRect(x + ((18 + cloudShift) % w), y + 8, 22, 5);
      ctx.fillRect(x + ((22 + cloudShift) % w), y + 6, 14, 3);
      ctx.fillRect(x + ((90 + cloudShift) % w), y + 14, 30, 6);
      ctx.fillRect(x + ((96 + cloudShift) % w), y + 11, 18, 4);

      // 2. Distant Horizon Mountain & Tree Line
      const horizY = y + Math.floor(h * 0.44);
      ctx.fillStyle = "#004010"; // Dark green pines
      for (let px = x; px < x + w; px += 6) {
        const treeH = 6 + (px % 5) * 2;
        ctx.fillRect(px, horizY - treeH, 5, treeH);
      }

      // 3. Perspective Fairway / Rough
      ctx.fillStyle = "#00a800"; // Deep Rough
      ctx.fillRect(x, horizY, w, h - Math.floor(h * 0.44));

      // Perspective Trapeze Fairway
      ctx.fillStyle = "#88d800";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.38, horizY);
      ctx.lineTo(x + w * 0.62, horizY);
      ctx.lineTo(x + w * 0.90, y + h);
      ctx.lineTo(x + w * 0.10, y + h);
      ctx.closePath();
      ctx.fill();

      // Yardage signs & Pin in the distance
      const pinDistX = x + w * (0.5 + this.holeData.bend * 0.2);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(pinDistX, horizY - 14, 1, 14);
      ctx.fillStyle = "#f83800";
      const flagFlutter = (Date.now() >> 8) & 1;
      ctx.fillRect(pinDistX + 1, horizY - 14 + flagFlutter, 6 + flagFlutter, 4);

      // 4. Golfer Sprite & Goflball (Address / Swing)
      const gx = x + 40;
      const gy = y + h - 48;

      this._drawPixelGolfer(ctx, gx, gy);

      // Goflball on tee / turf with shadow
      const bx = gx + 26;
      const by = gy + 28 - this.ball.z;
      const bScale = this.ball.scale || 1.0;
      const bSize = Math.max(3, Math.round(4 * bScale));

      // Ball shadow on turf
      ctx.fillStyle = "#005000";
      ctx.fillRect(bx - 1, gy + 29, Math.round(5 * (2 - bScale * 0.5)), 2);

      // Ball
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(bx - Math.floor(bSize / 2), Math.floor(by - bSize / 2), bSize, bSize);

      // Partner Goflball Cart idling on the side
      this._drawSideCart(ctx, x + w - 46, gy + 8);
    }

    _drawPixelGolfer(ctx, x, y) {
      // Visor / Cap
      ctx.fillStyle = "#f83800";
      ctx.fillRect(x + 5, y, 10, 4);
      ctx.fillRect(x + 13, y + 2, 5, 2);

      // Face
      ctx.fillStyle = "#f8b880";
      ctx.fillRect(x + 5, y + 4, 8, 8);
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 10, y + 6, 2, 2); // eye

      // Blue Shirt / Torso
      ctx.fillStyle = "#0058f8";
      ctx.fillRect(x + 3, y + 12, 12, 14);

      // White Slacks
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(x + 4, y + 26, 4, 12);
      ctx.fillRect(x + 10, y + 26, 4, 12);

      // Red Golf Shoes
      ctx.fillStyle = "#f83800";
      ctx.fillRect(x + 3, y + 38, 5, 3);
      ctx.fillRect(x + 10, y + 38, 5, 3);

      // Club & Arms Animation
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (this.swingAnimFrame === 0) {
        // Address: club resting behind ball
        ctx.moveTo(x + 10, y + 16);
        ctx.lineTo(x + 25, y + 37);
      } else if (this.swingAnimFrame === 1) {
        // Backswing: club cocked over shoulder
        ctx.moveTo(x + 8, y + 14);
        ctx.lineTo(x - 8, y - 2);
      } else if (this.swingAnimFrame === 2) {
        // Impact Strike: club striking ball
        ctx.moveTo(x + 12, y + 18);
        ctx.lineTo(x + 26, y + 36);
      } else {
        // Follow-through: club wrapped around
        ctx.moveTo(x + 12, y + 14);
        ctx.lineTo(x + 28, y + 2);
      }
      ctx.stroke();
    }

    _drawSideCart(ctx, x, y) {
      // White roof
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(x + 4, y, 26, 3);
      ctx.fillRect(x + 6, y + 3, 2, 8);
      ctx.fillRect(x + 26, y + 3, 2, 8);

      // Cart body
      ctx.fillStyle = "#a8a8a8";
      ctx.fillRect(x + 4, y + 11, 28, 8);

      // Tires
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 6, y + 19, 6, 6);
      ctx.fillRect(x + 22, y + 19, 6, 6);

      // Partner headshot inside cart
      ctx.fillStyle = this.partnerHat;
      ctx.fillRect(x + 12, y + 4, 6, 3);
      ctx.fillStyle = "#f8b880";
      ctx.fillRect(x + 13, y + 7, 5, 4);
      ctx.fillStyle = this.partnerShirt;
      ctx.fillRect(x + 11, y + 11, 8, 4);
    }

    _drawBottomSwingMeter(ctx, x, y, w, h) {
      // Background frame
      ctx.fillStyle = "#101018";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Club & HUD Info on left
      ctx.fillStyle = "#f8b800";
      ctx.font = "bold 11px 'Courier New', monospace";
      const unitLabel = this.mode === "GREEN" ? `${Math.max(1, Math.round(this.getRemainingYards() * 3))}FT` : `${this.getRemainingYards()}Y`;
      ctx.fillText(`${this.club.name} ${unitLabel}`, x + 6, y + 14);

      ctx.fillStyle = "#58f898";
      const lieShort = { TEE: "TEE", FAIRWAY: "FWY", ROUGH: "RGH", BUNKER: "SND", GREEN: "GRN" }[this.lie || this.mode] || "FWY";
      ctx.fillText(`P${this.holeData.par} S${this.strokes} ${lieShort}`, x + 6, y + 28);

      // 3-Click Horizontal Gauge Bar (Right side: bx: x+84, by: y+8, bw: w-92, bh: 14)
      const bx = x + 84;
      const by = y + 8;
      const bw = w - 92;
      const bh = 14;

      ctx.fillStyle = "#000000";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);

      // Sweet-spot zone indicator in green
      const sweetWidth = Math.round(bw * (0.16 + (this.upgrades.gimmeBoost ? 0.35 : 0)));
      const sweetX = bx + Math.round((bw - sweetWidth) / 2);
      ctx.fillStyle = "#00a800";
      ctx.fillRect(sweetX, by + 1, sweetWidth, bh - 2);

      // Active Needle: sweeps leftward on POWER_UP, then sweeps smoothly rightward back through sweet spot on ACCURACY_DOWN!
      let needleX = sweetX + Math.round(sweetWidth / 2);
      if (this.meterState === "POWER_UP") {
        needleX = bx + Math.round(bw * (1 - this.meterPower));
      } else if (this.meterState === "ACCURACY_DOWN") {
        needleX = bx + Math.round(((this.meterAccuracy + 1) / 2) * bw);
      }

      ctx.fillStyle = this.meterState === "ACCURACY_DOWN" ? "#f878f8" : "#fcfcfc";
      ctx.fillRect(needleX - 2, by - 2, 4, bh + 4);

      // Instructions below bar
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = "#00e8d8";
      let prompt = "[SWING] TAP 1: START METER";
      if (this.meterState === "POWER_UP") prompt = "[SWING] TAP 2: SET POWER";
      else if (this.meterState === "ACCURACY_DOWN") prompt = "[SWING] TAP 3: HIT SWEET SPOT!";
      else if (this.ball.moving) prompt = "GOFLBALL IN FLIGHT...";
      else if (this.holeComplete) prompt = "HOLE COMPLETE! MOVING TO CART...";
      ctx.fillText(prompt, bx + 2, by + bh + 13);
    }

    _loop() {
      this._updatePhysics();
      this._draw();
      requestAnimationFrame(this._loop);
    }
  }

  return {
    HOLES,
    NesSoundEngine,
    NesGolfCanvas
  };
});
