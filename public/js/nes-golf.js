/**
 * GOFLBALL (1984) — Authentic NES Golf (1984) Canvas Renderer, Audio Synth & Idle-Clicker Physics
 *
 * Looks and feels like a tribute clone of black-box NES Golf (1984):
 * - Pure black sky/background (#000000) with crisp pixel HUD on the left/right
 * - Top-down fairway in classic NES greens (#00a800 rough, #88d800 fairway, #58f898 putting green)
 * - Deep blue water hazards (#0058f8) and sandy bunkers (#f8d878)
 * - Bottom classic 3-click / 1-tap horizontal white-and-pink power & slice/hook bar
 * - Pixel golfer sprite with animated backswing & follow-through + partner golfer standing by the cart
 * - WebAudio 8-bit pulse/triangle/noise sound effects (swing whoosh, club thwack, cup rattle, cart horn)
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
  // 1. 9-HOLE COURSE DEFINITIONS (Inspired by 1984 NES Golf Layouts)
  // ---------------------------------------------------------------------------
  const HOLES = [
    { number: 1, par: 4, yards: 378, windBase: 3, bend: 0.0, water: [{ x: 0.22, y: 0.55, w: 0.16, h: 0.22 }], bunkers: [{ x: 0.58, y: 0.24, r: 0.06 }] },
    { number: 2, par: 4, yards: 412, windBase: 5, bend: 0.08, water: [], bunkers: [{ x: 0.38, y: 0.48, r: 0.07 }, { x: 0.56, y: 0.20, r: 0.05 }] },
    { number: 3, par: 3, yards: 186, windBase: 6, bend: 0.0, water: [{ x: 0.28, y: 0.32, w: 0.44, h: 0.20 }], bunkers: [{ x: 0.36, y: 0.18, r: 0.05 }, { x: 0.62, y: 0.18, r: 0.05 }] },
    { number: 4, par: 5, yards: 520, windBase: 7, bend: -0.1, water: [{ x: 0.62, y: 0.38, w: 0.22, h: 0.30 }], bunkers: [{ x: 0.42, y: 0.30, r: 0.06 }] },
    { number: 5, par: 4, yards: 395, windBase: 4, bend: 0.05, water: [{ x: 0.18, y: 0.25, w: 0.18, h: 0.35 }], bunkers: [{ x: 0.55, y: 0.22, r: 0.06 }] },
    { number: 6, par: 3, yards: 205, windBase: 8, bend: 0.0, water: [{ x: 0.24, y: 0.26, w: 0.52, h: 0.26 }], bunkers: [{ x: 0.48, y: 0.15, r: 0.05 }] },
    { number: 7, par: 5, yards: 545, windBase: 6, bend: 0.12, water: [], bunkers: [{ x: 0.40, y: 0.55, r: 0.07 }, { x: 0.58, y: 0.32, r: 0.07 }, { x: 0.44, y: 0.17, r: 0.05 }] },
    { number: 8, par: 4, yards: 364, windBase: 5, bend: -0.06, water: [{ x: 0.58, y: 0.20, w: 0.24, h: 0.45 }], bunkers: [{ x: 0.38, y: 0.22, r: 0.06 }] },
    { number: 9, par: 4, yards: 440, windBase: 9, bend: 0.0, water: [{ x: 0.20, y: 0.42, w: 0.22, h: 0.22 }, { x: 0.58, y: 0.42, w: 0.22, h: 0.22 }], bunkers: [{ x: 0.42, y: 0.16, r: 0.05 }, { x: 0.58, y: 0.16, r: 0.05 }] }
  ];

  // ---------------------------------------------------------------------------
  // 2. WEBAUDIO 8-BIT CHIPTUNE & SFX SYNTHESIZER
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
      this.playTone(180, 140, "triangle", 0.09, 520);
      setTimeout(() => this.playTone(640, 80, "square", 0.11, 220), 110);
    }

    playBounce() {
      this.playTone(320, 55, "square", 0.06, 160);
    }

    playCupDrop() {
      // Classic NES Golf cup rattle + fanfare arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => {
        setTimeout(() => this.playTone(n, 110, "square", 0.09), i * 85);
      });
    }

    playChatBlip(pitchOffset = 0) {
      this.playTone(440 + pitchOffset * 35, 35, "square", 0.04);
    }

    playOffendedBuzzer() {
      this.playTone(130, 280, "sawtooth", 0.10, 85);
    }

    playCashDing() {
      this.playTone(880, 70, "square", 0.07);
      setTimeout(() => this.playTone(1318.5, 160, "square", 0.08), 70);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. NES GOLF (1984) CANVAS GAME CONTROLLER
  // ---------------------------------------------------------------------------
  class NesGolfCanvas {
    constructor(canvas, sound, callbacks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.sound = sound || new NesSoundEngine();
      this.callbacks = callbacks || {};

      this.holeData = HOLES[0];
      this.upgrades = {
        distanceBonus: 0,
        windResist: 0,
        autoAim: 0,
        gimmeRadius: 14,
        noHazards: false,
        unlockAutoSwing: false,
        unlockInstantHole: false
      };

      this.partnerShirt = "#f83800";
      this.partnerHat = "#fcfcfc";
      this.partnerName = "DEREK";

      this.resetHole(1);
      this._bindEvents();
      this._loop = this._loop.bind(this);
      requestAnimationFrame(this._loop);
    }

    setUpgrades(upgradeEffects) {
      this.upgrades = Object.assign(
        {
          distanceBonus: 0,
          windResist: 0,
          autoAim: 0,
          gimmeRadius: 16,
          noHazards: false,
          unlockAutoSwing: false,
          unlockInstantHole: false
        },
        upgradeEffects || {}
      );
    }

    setPartnerVisuals(partner) {
      if (!partner) return;
      this.partnerShirt = partner.shirtColor || "#f83800";
      this.partnerHat = partner.hatColor || "#fcfcfc";
      this.partnerName = (partner.name || "PARTNER").split(" ")[0].toUpperCase();
    }

    resetHole(holeNumber) {
      const idx = ((holeNumber - 1) % HOLES.length + HOLES.length) % HOLES.length;
      this.holeData = HOLES[idx];
      this.strokes = 0;
      this.holeComplete = false;

      // Normalized course coordinates: tee at (0.5, 0.88), pin near (0.5 + bend*0.4, 0.14)
      this.teePos = { x: 0.5, y: 0.88 };
      this.pinPos = { x: 0.5 + this.holeData.bend * 0.6, y: 0.14 };
      this.ball = { x: this.teePos.x, y: this.teePos.y, z: 0, vx: 0, vy: 0, vz: 0, moving: false };
      this.trail = [];

      // Wind vector
      const angle = ((holeNumber * 73) % 360) * (Math.PI / 180);
      this.wind = {
        mph: this.holeData.windBase,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        label: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(((angle * 180) / Math.PI + 360) % 360 / 45)]
      };

      // Aim vector points roughly toward pin
      this.aimAngle = Math.atan2(this.pinPos.y - this.ball.y, this.pinPos.x - this.ball.x);

      // Power meter state: "IDLE" -> "POWER" -> "ACCURACY" -> "FLIGHT" -> "CUPPED"
      this.meterState = "IDLE";
      this.meterPower = 0;
      this.meterDir = 1;
      this.meterAccuracy = 0; // -1 (hook) to +1 (slice), 0 is sweet spot
      this.accDir = 1;
      this.swingFrame = 0; // 0: address, 1: backswing, 2: downswing, 3: follow-through
      this.bannerText = null;
      this.bannerTimer = 0;

      this._selectBestClub();
    }

    _selectBestClub() {
      const distYards = this.getRemainingYards();
      if (distYards > 210) this.club = { name: "1W", maxYds: 265 + this.upgrades.distanceBonus };
      else if (distYards > 165) this.club = { name: "3W", maxYds: 215 + this.upgrades.distanceBonus * 0.7 };
      else if (distYards > 125) this.club = { name: "5I", maxYds: 165 + this.upgrades.distanceBonus * 0.4 };
      else if (distYards > 70) this.club = { name: "9I", maxYds: 120 };
      else if (distYards > 25) this.club = { name: "PW", maxYds: 75 };
      else this.club = { name: "PT", maxYds: 35 };

      // Automatically aim toward the pin
      this.aimAngle = Math.atan2(this.pinPos.y - this.ball.y, this.pinPos.x - this.ball.x);
    }

    getRemainingYards() {
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const normDist = Math.sqrt(dx * dx + dy * dy);
      return Math.max(1, Math.round((normDist / 0.74) * this.holeData.yards));
    }

    _bindEvents() {
      const handleTap = (e) => {
        e.preventDefault();
        this.triggerAction();
      };
      this.canvas.addEventListener("pointerdown", handleTap);
    }

    // Main 1-tap / 2-tap action (Super easy & snappy!)
    triggerAction() {
      if (this.holeComplete || this.ball.moving) return;

      if (this.meterState === "IDLE") {
        // Start power meter
        this.meterState = "POWER";
        this.meterPower = 0.15;
        this.meterDir = 1;
        this.swingFrame = 1;
        this.sound.playChatBlip(2);
      } else if (this.meterState === "POWER") {
        // Lock power and fire shot immediately (1-click mobile friendly, or auto-sweetspot!)
        // In later levels or with upgrades, it's even easier:
        this.executeShot(this.meterPower, 0);
      }
    }

    // Called when player clicks "AUTO-SWING (CADDIE)" or has Cart Autopilot active
    autoSwingShot() {
      if (this.holeComplete || this.ball.moving) return;
      this.swingFrame = 1;
      setTimeout(() => {
        if (!this.holeComplete) {
          this.executeShot(0.96, 0);
        }
      }, 140);
    }

    executeShot(powerRatio, sliceOffset) {
      this.meterState = "FLIGHT";
      this.swingFrame = 3;
      this.strokes++;
      this.sound.playSwing();

      const remYds = this.getRemainingYards();
      const targetNormDist = Math.sqrt(
        Math.pow(this.pinPos.x - this.ball.x, 2) + Math.pow(this.pinPos.y - this.ball.y, 2)
      );

      // Make shots genuinely easy and satisfying so the player reaches the green in 1-2 swings!
      // Power between 0.72 and 1.00 homes right toward the pin.
      const effectivePower = Math.min(1.08, Math.max(0.45, powerRatio * 1.08));
      const travelDist = Math.min(targetNormDist * effectivePower, targetNormDist * 1.04);

      const windDrift =
        (1 - Math.min(0.95, this.upgrades.windResist || 0)) *
        (this.wind.mph * 0.0018) *
        (this.club.name === "PT" ? 0 : 1);

      const autoAimFactor = Math.min(0.95, 0.45 + (this.upgrades.autoAim || 0));
      const dirAngle = this.aimAngle + sliceOffset * (1 - autoAimFactor) * 0.18;

      const destX =
        this.ball.x +
        Math.cos(dirAngle) * travelDist +
        this.wind.dx * windDrift * (1 - autoAimFactor);
      const destY =
        this.ball.y +
        Math.sin(dirAngle) * travelDist +
        this.wind.dy * windDrift * (1 - autoAimFactor);

      this.flightFrames = 36;
      this.flightTick = 0;
      this.startBall = { x: this.ball.x, y: this.ball.y };
      this.targetBall = {
        x: Math.max(0.14, Math.min(0.86, destX)),
        y: Math.max(0.08, Math.min(0.92, destY))
      };
      this.ball.moving = true;
      this.trail = [{ x: this.ball.x, y: this.ball.y }];

      if (this.callbacks.onStroke) {
        this.callbacks.onStroke(this.strokes, this.club.name);
      }
    }

    _updatePhysics() {
      // Animate Power Bar if active
      if (this.meterState === "POWER") {
        this.meterPower += 0.026 * this.meterDir;
        if (this.meterPower >= 1.0) {
          this.meterPower = 1.0;
          this.meterDir = -1;
        } else if (this.meterPower <= 0.1) {
          this.meterPower = 0.1;
          this.meterDir = 1;
        }
      }

      if (this.bannerTimer > 0) {
        this.bannerTimer--;
      }

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
        // Smooth parabolic arc
        this.ball.x = this.startBall.x + (this.targetBall.x - this.startBall.x) * t;
        this.ball.y = this.startBall.y + (this.targetBall.y - this.startBall.y) * t;
        this.ball.z = this.club.name === "PT" ? 0 : Math.sin(t * Math.PI) * 18;
        if (this.flightTick % 3 === 0) {
          this.trail.push({ x: this.ball.x, y: this.ball.y });
        }
      }
    }

    _checkLanding() {
      // Check if inside gimme / cup radius!
      const dx = this.pinPos.x - this.ball.x;
      const dy = this.pinPos.y - this.ball.y;
      const distNorm = Math.sqrt(dx * dx + dy * dy);
      const gimmeNorm = 0.048 + (this.upgrades.gimmeRadius || 14) * 0.0014;

      // After 2 strokes (or inside generous gimme radius), sink the ball into the cup so rounds stay brisk!
      if (distNorm <= gimmeNorm || this.strokes >= 2) {
        this.ball.x = this.pinPos.x;
        this.ball.y = this.pinPos.y;
        this.holeComplete = true;
        this.meterState = "CUPPED";
        this.sound.playCupDrop();

        const diff = this.strokes - this.holeData.par;
        if (this.strokes === 1) this.bannerText = "HOLE IN ONE!!";
        else if (diff <= -2) this.bannerText = "EAGLE!!";
        else if (diff === -1) this.bannerText = "BIRDIE!";
        else if (diff === 0) this.bannerText = "PAR";
        else this.bannerText = "BOGEY (NO MATTER)";
        this.bannerTimer = 85;

        setTimeout(() => {
          if (this.callbacks.onHoleComplete) {
            this.callbacks.onHoleComplete({
              hole: this.holeData.number,
              par: this.holeData.par,
              strokes: this.strokes,
              label: this.bannerText
            });
          }
        }, 1050);
      } else {
        this.meterState = "IDLE";
        this.swingFrame = 0;
        this._selectBestClub();
      }
    }

    // -------------------------------------------------------------------------
    // 4. RETRO 1984 NES GOLF PIXEL RENDERER
    // -------------------------------------------------------------------------
    _draw() {
      const ctx = this.ctx;
      const W = this.canvas.width;
      const H = this.canvas.height;

      // Crisp pixel-art rendering
      ctx.imageSmoothingEnabled = false;

      // 1. Pure NES Black background (#000000)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      // Course viewport box (center-right like NES Golf)
      const vpX = Math.floor(W * 0.28);
      const vpY = 8;
      const vpW = Math.floor(W * 0.70);
      const vpH = Math.floor(H * 0.78);

      // 2. Outer Out-of-Bounds / Trees border (#005000) & Deep Rough (#00a800)
      ctx.fillStyle = "#005000";
      ctx.fillRect(vpX, vpY, vpW, vpH);

      ctx.fillStyle = "#00a800";
      ctx.fillRect(vpX + 8, vpY + 8, vpW - 16, vpH - 16);

      // Pixel tree dither pattern along edges
      ctx.fillStyle = "#005000";
      for (let ty = vpY + 12; ty < vpY + vpH - 16; ty += 18) {
        ctx.fillRect(vpX + 10, ty, 8, 10);
        ctx.fillRect(vpX + vpW - 18, ty, 8, 10);
      }

      // 3. Fairway polygon (#88d800)
      ctx.fillStyle = "#88d800";
      ctx.beginPath();
      const fwCenterTop = vpX + vpW * (0.5 + this.holeData.bend * 0.5);
      const fwCenterMid = vpX + vpW * (0.5 + this.holeData.bend * 0.25);
      const fwCenterBot = vpX + vpW * 0.5;
      ctx.moveTo(fwCenterTop - vpW * 0.22, vpY + vpH * 0.08);
      ctx.lineTo(fwCenterTop + vpW * 0.22, vpY + vpH * 0.08);
      ctx.lineTo(fwCenterMid + vpW * 0.26, vpY + vpH * 0.50);
      ctx.lineTo(fwCenterBot + vpW * 0.18, vpY + vpH * 0.92);
      ctx.lineTo(fwCenterBot - vpW * 0.18, vpY + vpH * 0.92);
      ctx.lineTo(fwCenterMid - vpW * 0.26, vpY + vpH * 0.50);
      ctx.closePath();
      ctx.fill();

      // 4. Water Hazards (#0058f8 with white pixel wave ticks)
      for (const w of this.holeData.water) {
        const wx = Math.floor(vpX + w.x * vpW);
        const wy = Math.floor(vpY + w.y * vpH);
        const ww = Math.floor(w.w * vpW);
        const wh = Math.floor(w.h * vpH);
        ctx.fillStyle = "#0058f8";
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = "#fcfcfc";
        for (let py = wy + 6; py < wy + wh - 4; py += 10) {
          for (let px = wx + 6; px < wx + ww - 8; px += 14) {
            ctx.fillRect(px, py, 6, 2);
          }
        }
      }

      // 5. Sand Bunkers (#f8d878)
      for (const b of this.holeData.bunkers) {
        const bx = Math.floor(vpX + b.x * vpW);
        const by = Math.floor(vpY + b.y * vpH);
        const br = Math.floor(b.r * vpW);
        ctx.fillStyle = "#f8d878";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Putting Green (#58f898) & Pin Flag
      const pinX = Math.floor(vpX + this.pinPos.x * vpW);
      const pinY = Math.floor(vpY + this.pinPos.y * vpH);
      const greenR = Math.floor(vpW * 0.14);

      ctx.fillStyle = "#58f898";
      ctx.beginPath();
      ctx.arc(pinX, pinY, greenR, 0, Math.PI * 2);
      ctx.fill();

      // Gimme ring indicator (dashed subtle pixel circle)
      const gimmePx = Math.floor((0.048 + (this.upgrades.gimmeRadius || 14) * 0.0014) * vpW);
      ctx.strokeStyle = "#00a800";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(pinX, pinY, gimmePx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cup & Flagstick
      ctx.fillStyle = "#000000";
      ctx.fillRect(pinX - 3, pinY - 3, 6, 6);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(pinX - 1, pinY - 22, 2, 20);
      ctx.fillStyle = "#f83800";
      ctx.fillRect(pinX + 1, pinY - 22, 11, 8);

      // 7. Tee Box & Goflball Cart at Bottom of Course
      const teeX = Math.floor(vpX + this.teePos.x * vpW);
      const teeY = Math.floor(vpY + this.teePos.y * vpH);
      ctx.fillStyle = "#58f898";
      ctx.fillRect(teeX - 18, teeY - 6, 36, 12);

      // Draw pixel Gofl Cart & Partner waiting by the tee box
      this._drawPixelCartAndPartner(ctx, teeX + 26, teeY - 12);

      // 8. Aim Guide Line (when IDLE or POWER)
      const ballX = Math.floor(vpX + this.ball.x * vpW);
      const ballY = Math.floor(vpY + this.ball.y * vpH);

      if (!this.ball.moving && !this.holeComplete) {
        ctx.strokeStyle = "#fcfcfc";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(pinX, pinY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 9. Shot Trail & Ball (with shadow when airborne)
      ctx.fillStyle = "#fcfcfc";
      for (const pt of this.trail) {
        ctx.fillRect(Math.floor(vpX + pt.x * vpW) - 1, Math.floor(vpY + pt.y * vpH) - 1, 2, 2);
      }

      if (this.ball.z > 0) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(ballX - 2, ballY - 2, 4, 4);
      }
      ctx.fillStyle = "#fcfcfc";
      const liftY = Math.floor(ballY - this.ball.z);
      ctx.fillRect(ballX - 3, liftY - 3, 6, 6);

      // 10. Left HUD Column (Authentic 1984 NES Golf Typography & Wind Arrow)
      this._drawLeftHud(ctx, 8, 12, vpX - 14, vpH);

      // 11. Bottom NES Golfer Sprite & Classic Pink/White Power Bar
      this._drawBottomPowerArea(ctx, 8, vpY + vpH + 6, W - 16, H - (vpY + vpH + 10));

      // 12. Victory Banner Overlay (BIRDIE! / PAR / EAGLE!!)
      if (this.bannerTimer > 0 && this.bannerText) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(vpX + 24, vpY + vpH * 0.38, vpW - 48, 44);
        ctx.strokeStyle = "#f8b800";
        ctx.lineWidth = 2;
        ctx.strokeRect(vpX + 24, vpY + vpH * 0.38, vpW - 48, 44);

        ctx.fillStyle = "#f8b800";
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.bannerText, vpX + vpW / 2, vpY + vpH * 0.38 + 28);
        ctx.textAlign = "left";
      }
    }

    _drawPixelCartAndPartner(ctx, x, y) {
      // White cart roof
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(x, y, 22, 4);
      ctx.fillRect(x + 2, y + 4, 2, 8);
      ctx.fillRect(x + 18, y + 4, 2, 8);
      // Cart body
      ctx.fillStyle = "#d8d8d8";
      ctx.fillRect(x, y + 12, 24, 8);
      // Wheels
      ctx.fillStyle = "#000000";
      ctx.fillRect(x + 2, y + 18, 5, 5);
      ctx.fillRect(x + 16, y + 18, 5, 5);

      // Partner pixel sprite standing next to cart
      const px = x - 10;
      const py = y + 4;
      ctx.fillStyle = this.partnerHat;
      ctx.fillRect(px, py, 6, 3);
      ctx.fillStyle = "#f8b880"; // face
      ctx.fillRect(px + 1, py + 3, 4, 4);
      ctx.fillStyle = this.partnerShirt; // shirt
      ctx.fillRect(px, py + 7, 6, 7);
      ctx.fillStyle = "#fcfcfc"; // slacks
      ctx.fillRect(px + 1, py + 14, 4, 5);
    }

    _drawLeftHud(ctx, x, y, w, h) {
      ctx.font = "bold 12px 'Courier New', monospace";

      // HOLE
      ctx.fillStyle = "#f83800";
      ctx.fillText("HOLE", x, y + 14);
      ctx.fillStyle = "#fcfcfc";
      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.fillText(String(this.holeData.number).padStart(2, "0"), x + 8, y + 34);

      // PAR & YARDS
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = "#88d800";
      ctx.fillText(`PAR ${this.holeData.par}`, x, y + 58);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillText(`${this.holeData.yards}YDS`, x, y + 74);

      // PIN REMAINING
      ctx.fillStyle = "#00e8d8";
      ctx.fillText("TO PIN", x, y + 102);
      ctx.fillStyle = "#fcfcfc";
      ctx.font = "bold 15px 'Courier New', monospace";
      ctx.fillText(`${this.getRemainingYards()}Y`, x, y + 120);

      // SHOT / STROKE
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = "#f8b800";
      ctx.fillText("SHOT", x, y + 148);
      ctx.fillStyle = "#fcfcfc";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(String(this.strokes), x + 12, y + 166);

      // WIND BOX
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillStyle = "#58f898";
      ctx.fillText(`WIND ${this.wind.label}`, x, y + 194);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillText(`${this.wind.mph} MPH`, x, y + 210);

      // CLUB
      ctx.fillStyle = "#f87858";
      ctx.fillText("CLUB", x, y + 238);
      ctx.fillStyle = "#fcfcfc";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(this.club.name, x + 6, y + 256);

      // PARTNER TAG
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = "#f8b800";
      ctx.fillText("CART W/", x, y + 284);
      ctx.fillStyle = "#fcfcfc";
      ctx.fillText(this.partnerName.slice(0, 8), x, y + 298);
    }

    _drawBottomPowerArea(ctx, x, y, w, h) {
      // Draw 1984 NES Golfer Sprite on bottom-left
      const gx = x + 18;
      const gy = y + 6;

      // Visor / Cap
      ctx.fillStyle = "#f83800";
      ctx.fillRect(gx + 6, gy, 14, 5);
      ctx.fillRect(gx + 16, gy + 3, 8, 2);
      // Head
      ctx.fillStyle = "#f8b880";
      ctx.fillRect(gx + 6, gy + 5, 12, 10);
      // Mustache / Eye (classic NES Mario-esque golfer look)
      ctx.fillStyle = "#000000";
      ctx.fillRect(gx + 14, gy + 7, 3, 3);
      ctx.fillRect(gx + 13, gy + 12, 6, 2);
      // Blue Shirt
      ctx.fillStyle = "#0058f8";
      ctx.fillRect(gx + 4, gy + 15, 16, 16);
      // White Pants
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(gx + 5, gy + 31, 6, 14);
      ctx.fillRect(gx + 13, gy + 31, 6, 14);
      // Shoes
      ctx.fillStyle = "#f83800";
      ctx.fillRect(gx + 4, gy + 45, 8, 4);
      ctx.fillRect(gx + 13, gy + 45, 8, 4);

      // Club shaft position based on swingFrame
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (this.swingFrame === 0) {
        ctx.moveTo(gx + 18, gy + 22);
        ctx.lineTo(gx + 34, gy + 46);
      } else if (this.swingFrame === 1) {
        ctx.moveTo(gx + 10, gy + 16);
        ctx.lineTo(gx - 8, gy - 2);
      } else {
        ctx.moveTo(gx + 18, gy + 18);
        ctx.lineTo(gx + 36, gy + 4);
      }
      ctx.stroke();

      // Classic NES Golf Power Meter Bar on the right of the golfer
      const barX = x + 76;
      const barY = y + 14;
      const barW = w - 88;
      const barH = 20;

      // Outer border
      ctx.strokeStyle = "#fcfcfc";
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barW, barH);

      // Inner dark track
      ctx.fillStyle = "#202020";
      ctx.fillRect(barX + 2, barY + 2, barW - 4, barH - 4);

      // Active Power Fill (NES Pink/Magenta #f878f8 & White #fcfcfc)
      const fillRatio = this.meterState === "POWER" ? this.meterPower : 0.88;
      const fillW = Math.floor((barW - 4) * fillRatio);
      ctx.fillStyle = this.meterState === "POWER" ? "#f878f8" : "#00a800";
      ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);

      // Sweet-spot marker ticks
      ctx.fillStyle = "#fcfcfc";
      const sweetX = barX + Math.floor(barW * 0.85);
      ctx.fillRect(sweetX, barY - 4, 3, barH + 8);

      // Instruction prompt below bar
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillStyle = "#f8b800";
      let prompt = "TAP COURSE OR [SWING] TO TEE OFF";
      if (this.meterState === "POWER") prompt = "TAP AGAIN AT TOP OF BAR FOR SWEET SPOT!";
      else if (this.ball.moving) prompt = "BALL IN FLIGHT...";
      else if (this.holeComplete) prompt = "HOLE COMPLETE! HEADING TO CART...";
      ctx.fillText(prompt, barX, barY + barH + 16);
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
