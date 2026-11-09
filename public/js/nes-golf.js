/**
 * GOFLBALL (1984) — Blocky 8-Bit CRT Goflball Course & Sound Synthesizer
 *
 * Uses a low-resolution internal pixel grid (128x112) scaled up with crisp
 * `image-rendering: pixelated` so every tree, bunker, goflball, and goflball cart
 * is unmistakably chunky and blocky—making players eager to level up and automate
 * the goflball course once they discover the real social game after Round 1.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NesGolfEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const HOLES = [
    { number: 1, par: 4, yards: 360, windBase: 3, bend: 0.0, water: [{ x: 0.20, y: 0.50, w: 0.18, h: 0.22 }], bunkers: [{ x: 0.62, y: 0.25, r: 0.07 }] },
    { number: 2, par: 4, yards: 395, windBase: 4, bend: 0.08, water: [], bunkers: [{ x: 0.36, y: 0.45, r: 0.08 }] },
    { number: 3, par: 3, yards: 175, windBase: 5, bend: 0.0, water: [{ x: 0.26, y: 0.34, w: 0.48, h: 0.20 }], bunkers: [{ x: 0.35, y: 0.18, r: 0.06 }] },
    { number: 4, par: 5, yards: 510, windBase: 6, bend: -0.08, water: [{ x: 0.62, y: 0.38, w: 0.20, h: 0.28 }], bunkers: [{ x: 0.40, y: 0.28, r: 0.07 }] },
    { number: 5, par: 4, yards: 380, windBase: 4, bend: 0.05, water: [{ x: 0.18, y: 0.28, w: 0.18, h: 0.32 }], bunkers: [{ x: 0.56, y: 0.22, r: 0.07 }] },
    { number: 6, par: 3, yards: 198, windBase: 7, bend: 0.0, water: [{ x: 0.24, y: 0.28, w: 0.52, h: 0.24 }], bunkers: [{ x: 0.50, y: 0.15, r: 0.06 }] },
    { number: 7, par: 5, yards: 530, windBase: 6, bend: 0.10, water: [], bunkers: [{ x: 0.38, y: 0.52, r: 0.08 }, { x: 0.58, y: 0.30, r: 0.07 }] },
    { number: 8, par: 4, yards: 355, windBase: 5, bend: -0.06, water: [{ x: 0.60, y: 0.22, w: 0.22, h: 0.42 }], bunkers: [{ x: 0.38, y: 0.22, r: 0.07 }] },
    { number: 9, par: 4, yards: 430, windBase: 8, bend: 0.0, water: [{ x: 0.20, y: 0.42, w: 0.22, h: 0.20 }, { x: 0.58, y: 0.42, w: 0.22, h: 0.20 }], bunkers: [{ x: 0.44, y: 0.16, r: 0.06 }] }
  ];

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

    playTone(freq, durationMs, type = "square", gainVal = 0.08, slideTo = null) {
      const ctx = this._ensureCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + durationMs / 1000);
      }
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    }

    playSwing() {
      this.playTone(160, 130, "triangle", 0.09, 480);
      setTimeout(() => this.playTone(580, 75, "square", 0.11, 200), 100);
    }

    playBounce() {
      this.playTone(280, 50, "square", 0.06, 140);
    }

    playCupDrop() {
      [523, 659, 784, 1046].forEach((n, i) => {
        setTimeout(() => this.playTone(n, 100, "square", 0.09), i * 80);
      });
    }

    playChatBlip(offset = 0) {
      this.playTone(420 + offset * 40, 30, "square", 0.04);
    }

    playOffendedBuzzer() {
      this.playTone(120, 260, "sawtooth", 0.10, 80);
    }

    playCashDing() {
      this.playTone(880, 65, "square", 0.07);
      setTimeout(() => this.playTone(1318, 150, "square", 0.08), 65);
    }
  }

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

      this.teePos = { x: 0.5, y: 0.88 };
      this.pinPos = { x: 0.5 + this.holeData.bend * 0.6, y: 0.14 };
      this.ball = { x: this.teePos.x, y: this.teePos.y, z: 0, moving: false };

      const angle = ((holeNumber * 85) % 360) * (Math.PI / 180);
      this.wind = {
        mph: Math.round(this.holeData.windBase * this.windMultiplier),
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        label: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(((angle * 180) / Math.PI + 360) % 360 / 45)]
      };

      this.meterState = "IDLE";
      this.meterPower = 0;
      this.meterDir = 1;
      this.swingFrame = 0;
      this.bannerText = null;
      this.bannerTimer = 0;
      this._selectBestClub();
    }

    _selectBestClub() {
      const distYards = this.getRemainingYards();
      if (distYards > 200) this.club = "1W";
      else if (distYards > 140) this.club = "3W";
      else if (distYards > 90) this.club = "5I";
      else if (distYards > 35) this.club = "9I";
      else this.club = "PT";
      this.aimAngle = Math.atan2(this.pinPos.y - this.ball.y, this.pinPos.x - this.ball.x);
    }

    getRemainingYards() {
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const normDist = Math.sqrt(dx * dx + dy * dy);
      return Math.max(1, Math.round((normDist / 0.74) * this.holeData.yards));
    }

    triggerAction() {
      if (this.holeComplete || this.ball.moving) return;
      if (this.meterState === "IDLE") {
        this.meterState = "POWER";
        this.meterPower = 0.15;
        this.meterDir = 1;
        this.swingFrame = 1;
        this.sound.playChatBlip(2);
      } else if (this.meterState === "POWER") {
        this.executeShot(this.meterPower);
      }
    }

    autoSwingShot() {
      if (this.holeComplete || this.ball.moving) return;
      this.swingFrame = 1;
      setTimeout(() => {
        if (!this.holeComplete) this.executeShot(0.95);
      }, 120);
    }

    executeShot(powerRatio) {
      this.meterState = "FLIGHT";
      this.swingFrame = 2;
      this.strokes++;
      this.sound.playSwing();

      const targetNormDist = Math.sqrt(
        Math.pow(this.pinPos.x - this.ball.x, 2) + Math.pow(this.pinPos.y - this.ball.y, 2)
      );

      const effectivePower = Math.min(1.06, Math.max(0.45, powerRatio * 1.06));
      const travelDist = Math.min(targetNormDist * effectivePower, targetNormDist * 1.02);

      const windDrift = (1 - Math.min(1, this.upgrades.windResist || 0)) * (this.wind.mph * 0.002);

      const destX = this.ball.x + Math.cos(this.aimAngle) * travelDist + this.wind.dx * windDrift;
      const destY = this.ball.y + Math.sin(this.aimAngle) * travelDist + this.wind.dy * windDrift;

      this.flightFrames = 28;
      this.flightTick = 0;
      this.startBall = { x: this.ball.x, y: this.ball.y };
      this.targetBall = {
        x: Math.max(0.14, Math.min(0.86, destX)),
        y: Math.max(0.08, Math.min(0.92, destY))
      };
      this.ball.moving = true;
    }

    _updatePhysics() {
      if (this.meterState === "POWER") {
        this.meterPower += 0.03 * this.meterDir;
        if (this.meterPower >= 1.0) {
          this.meterPower = 1.0;
          this.meterDir = -1;
        } else if (this.meterPower <= 0.1) {
          this.meterPower = 0.1;
          this.meterDir = 1;
        }
      }

      if (this.bannerTimer > 0) this.bannerTimer--;
      if (!this.ball.moving) return;

      this.flightTick++;
      const t = this.flightTick / this.flightFrames;
      if (t >= 1) {
        this.ball.x = this.targetBall.x;
        this.ball.y = this.targetBall.y;
        this.ball.z = 0;
        this.ball.moving = false;
        this.sound.playBounce();
        this._checkLanding();
      } else {
        this.ball.x = this.startBall.x + (this.targetBall.x - this.startBall.x) * t;
        this.ball.y = this.startBall.y + (this.targetBall.y - this.startBall.y) * t;
        this.ball.z = Math.sin(t * Math.PI) * 14;
      }
    }

    _checkLanding() {
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const distNorm = Math.sqrt(dx * dx + dy * dy);
      const gimmeNorm = 0.08 + (this.upgrades.gimmeBoost || 0);

      if (distNorm <= gimmeNorm || this.strokes >= 2) {
        this.ball.x = this.pinPos.x;
        this.ball.y = this.pinPos.y;
        this.holeComplete = true;
        this.meterState = "CUPPED";
        this.sound.playCupDrop();

        const diff = this.strokes - this.holeData.par;
        this.bannerText = this.strokes === 1 ? "HOLE IN ONE!" : diff < 0 ? "BIRDIE!" : "IN THE CUP";
        this.bannerTimer = 60;

        setTimeout(() => {
          if (this.callbacks.onHoleComplete) {
            this.callbacks.onHoleComplete({
              hole: this.holeData.number,
              par: this.holeData.par,
              strokes: this.strokes
            });
          }
        }, 850);
      } else {
        this.meterState = "IDLE";
        this.swingFrame = 0;
        this._selectBestClub();
      }
    }

    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width;   // Low-res 256
      const H = this.canvas.height;  // Low-res 240
      ctx.imageSmoothingEnabled = false;

      // Pure black CRT background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Course viewport on right (x: 84..248, y: 6..184)
      const vx = 84;
      const vy = 6;
      const vw = 164;
      const vh = 176;

      // Chunky blocky border & rough
      ctx.fillStyle = "#005000";
      ctx.fillRect(vx, vy, vw, vh);
      ctx.fillStyle = "#00a800";
      ctx.fillRect(vx + 6, vy + 6, vw - 12, vh - 12);

      // Blocky Fairway (stepped 8-bit rectangles instead of smooth curves!)
      ctx.fillStyle = "#88d800";
      const bendPx = Math.round(this.holeData.bend * 32);
      ctx.fillRect(vx + 44 + bendPx, vy + 14, 76, 48);
      ctx.fillRect(vx + 38 + Math.round(bendPx * 0.5), vy + 62, 88, 56);
      ctx.fillRect(vx + 46, vy + 118, 72, 46);

      // Blocky Water Hazards
      for (const w of this.holeData.water) {
        // [RALPH-POLISH: WATER-SHIMMER]
        ctx.fillStyle = "#0058f8";
        const wx = Math.floor(vx + w.x * vw), wy = Math.floor(vy + w.y * vh), ww = Math.floor(w.w * vw), wh = Math.floor(w.h * vh);
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "#fcfcfc";
        const waveShift = ((Date.now() >> 9) & 1) * 4;
        if (ww > 12 && wh > 10) ctx.fillRect(wx + 4 + waveShift, wy + 5, 4, 2);
      }

      // Blocky Sand Bunkers (square 8-bit blocks)
      for (const b of this.holeData.bunkers) {
        const bx = Math.floor(vx + b.x * vw);
        const by = Math.floor(vy + b.y * vh);
        const br = Math.floor(b.r * vw);
        ctx.fillStyle = "#f8d878";
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }

      // Blocky Putting Green
      const pinX = Math.floor(vx + this.pinPos.x * vw);
      const pinY = Math.floor(vy + this.pinPos.y * vh);
      ctx.fillStyle = "#58f898";
      ctx.fillRect(pinX - 22, pinY - 14, 44, 28);

      // Cup & Flag
      ctx.fillStyle = "#000000";
      ctx.fillRect(pinX - 2, pinY - 2, 5, 5);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(pinX, pinY - 16, 2, 15);
      // [RALPH-POLISH: WIND-FLAG-FLUTTER]
      ctx.fillStyle = "#f83800";
      const flutter = (Date.now() >> 8) & 1;
      ctx.fillRect(pinX + 2, pinY - 16 + flutter, 8 + flutter, 6);

      // Tee Box & Goflball Cart at Bottom
      const teeX = Math.floor(vx + this.teePos.x * vw);
      const teeY = Math.floor(vy + this.teePos.y * vh);
      ctx.fillStyle = "#58f898";
      ctx.fillRect(teeX - 14, teeY - 4, 28, 8);

      // Blocky Goflball Cart next to tee
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(teeX + 20, teeY - 10, 16, 4);
      ctx.fillStyle = "#a8a8a8";
      ctx.fillRect(teeX + 20, teeY - 4, 16, 6);
      ctx.fillStyle = this.partnerShirt;
      ctx.fillRect(teeX + 12, teeY - 6, 5, 8);

      // Goflball (chunky 5x5 pixel square)
      const ballX = Math.floor(vx + this.ball.x * vw);
      const ballY = Math.floor(vy + this.ball.y * vh - this.ball.z);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(ballX - 2, ballY - 2, 5, 5);

      // Left Blocky HUD Text
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = "#f83800";
      ctx.fillText(`HOLE ${this.holeData.number}`, 6, 20);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillText(`PAR  ${this.holeData.par}`, 6, 36);
      ctx.fillText(`${this.getRemainingYards()} YDS`, 6, 52);

      ctx.fillStyle = "#f8b800";
      ctx.fillText(`SHOT ${this.strokes}`, 6, 76);
      ctx.fillStyle = "#58f898";
      ctx.fillText(`WIND ${this.wind.mph}${this.wind.label}`, 6, 96);
      ctx.fillStyle = "#00e8d8";
      ctx.fillText(`CLUB ${this.club}`, 6, 116);

      // Golfer Sprite at Bottom-Left (x: 16, y: 150)
      const gx = 20;
      const gy = 142;
      ctx.fillStyle = "#f83800";
      ctx.fillRect(gx + 4, gy, 12, 4);
      ctx.fillStyle = "#f8b880";
      ctx.fillRect(gx + 4, gy + 4, 10, 8);
      ctx.fillStyle = "#0058f8";
      ctx.fillRect(gx + 2, gy + 12, 14, 14);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(gx + 3, gy + 26, 5, 12);
      ctx.fillRect(gx + 10, gy + 26, 5, 12);

      // Goflball Club Bar at Bottom (Chunky NES Power Meter)
      const bx = 12;
      const by = 194;
      const bw = 232;
      const bh = 18;
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      const ratio = this.meterState === "POWER" ? this.meterPower : 0.85;
      ctx.fillStyle = this.meterState === "POWER" ? "#f878f8" : "#00a800";
      ctx.fillRect(bx + 3, by + 3, Math.floor((bw - 6) * ratio), bh - 6);

      ctx.fillStyle = "#f8b800";
      ctx.font = "bold 10px 'Courier New', monospace";
      const hint =
        this.meterState === "POWER"
          ? "TAP TO HIT GOFLBALL!"
          : this.ball.moving
          ? "GOFLBALL IN FLIGHT..."
          : "TAP SCREEN OR [SWING] BUTTON";
      ctx.fillText(hint, bx + 18, by + bh + 14);

      if (this.bannerTimer > 0 && this.bannerText) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(vx + 16, vy + 68, vw - 32, 32);
        ctx.strokeStyle = "#f8b800";
        ctx.strokeRect(vx + 16, vy + 68, vw - 32, 32);
        ctx.fillStyle = "#f8b800";
        ctx.fillText(this.bannerText, vx + 36, vy + 88);
      }
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
