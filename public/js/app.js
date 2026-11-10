/**
 * GOFLBALL (1984) — Main Sandbox Controller & Atmosphere Engine
 *
 * Honors NES Golf (1984) with a hidden social simulation played in the goflball cart.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "GOFLBALL_SANDBOX_V4";

  // ---------------------------------------------------------------------------
  // 1. STATE & PERSISTENCE
  // ---------------------------------------------------------------------------
  function createFreshSandbox() {
    const randomSeed = Math.floor(10000 + Math.random() * 900000);
    const net = GoflWorld.buildSandboxNetwork(randomSeed, 0, 42);
    return {
      version: 4,
      universeSeed: randomSeed,
      epoch: 0,
      playerId: "gb_" + Math.random().toString(36).slice(2, 10),
      playerHandle: "PLAYER_" + Math.floor(10 + Math.random() * 89),
      cash: 0,
      revenuePerRound: 0,
      networkSharePct: 0.0,
      friendsCount: 0,
      enemiesCount: 0,
      roundsPlayed: 0,
      totalHolesPlayed: 0,
      totalPlaySeconds: 0,
      highestTierCleared: 0,
      purchasedUpgrades: {},
      currentPartnerId: net.order[0],
      currentHole: 1,
      roundStrokes: 0,
      roundPar: 0,
      roundScores: [],
      network: net
    };
  }

  function loadSandbox() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 4 && parsed.network && parsed.network.nodes) {
          return parsed;
        }
      }
    } catch (e) {}
    const fresh = createFreshSandbox();
    saveSandbox(fresh);
    return fresh;
  }

  function saveSandbox(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  const world = loadSandbox();
  const sound = new NesGolfEngine.NesSoundEngine();
  let golfCanvas = null;

  // Track play seconds for macro pacing
  setInterval(() => {
    world.totalPlaySeconds = (world.totalPlaySeconds || 0) + 5;
  }, 5000);

  function isRestrictedNeutralMode() {
    return (world.roundsPlayed || 0) < 1 && (world.friendsCount || 0) === 0 && (world.enemiesCount || 0) === 0;
  }

  function getActiveUpgradeEffects() {
    const fx = {
      gimmeBoost: 0,
      windResist: 0,
      unlockAutoSwing: false,
      unlockCartAutopilot: false,
      passiveRapport: 0
    };
    for (const u of GoflWorld.UPGRADES) {
      if (world.purchasedUpgrades && world.purchasedUpgrades[u.id]) {
        if (u.effect.gimmeBoost) fx.gimmeBoost += u.effect.gimmeBoost;
        if (u.effect.windResist) fx.windResist = Math.max(fx.windResist, u.effect.windResist);
        if (u.effect.unlockAutoSwing) fx.unlockAutoSwing = true;
        if (u.effect.unlockCartAutopilot) fx.unlockCartAutopilot = true;
        if (u.effect.passiveRapport) fx.passiveRapport += u.effect.passiveRapport;
      }
    }
    return fx;
  }

  function updateHeaderAndMarquee() {
    GoflWorld.recalculateNetworkStats(world);
    const marqueePct = document.getElementById("marquee-pct");
    if (marqueePct) marqueePct.textContent = `${(world.networkSharePct || 0).toFixed(1)}%`;
    const marqueeCash = document.getElementById("marquee-cash");
    if (marqueeCash) marqueeCash.textContent = `$${(world.cash || 0).toLocaleString()}`;
    const hdrHole = document.getElementById("hdr-hole");
    if (hdrHole) hdrHole.textContent = String(world.currentHole);

    const rel = (world.roundStrokes || 0) - (world.roundPar || 0);
    const hdrScore = document.getElementById("hdr-score");
    if (hdrScore) {
      hdrScore.textContent = rel === 0 ? "E" : rel > 0 ? `+${rel}` : String(rel);
    }

    const nav = document.getElementById("unlocked-nav");
    if (nav) {
      if (isRestrictedNeutralMode()) nav.classList.add("hidden");
      else nav.classList.remove("hidden");
    }
  }

  // ---------------------------------------------------------------------------
  // 2. PIXEL-ART GOFLBALL CART TRANSIT ANIMATOR
  // ---------------------------------------------------------------------------
  class CartTransitAnimator {
    constructor(canvas, partner) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.partner = partner;
      this.frame = 0;
      this.scrollX = 0;
      this.puffs = [];
      this.partnerHeadAnim = 0;
      this._animId = null;
      this.render = this.render.bind(this);
    }

    setPartner(partner) {
      this.partner = partner;
    }

    triggerReaction(type) {
      this.partnerHeadAnim = type === "offended" ? -1 : 1;
      setTimeout(() => { this.partnerHeadAnim = 0; }, 1200);
    }

    start() {
      if (!this._animId) {
        this._animId = requestAnimationFrame(this.render);
      }
    }

    stop() {
      if (this._animId) {
        cancelAnimationFrame(this._animId);
        this._animId = null;
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.frame++;
      this.scrollX = (this.scrollX + 1.2) % 128;

      ctx.imageSmoothingEnabled = false;

      // 1. Sky Gradient & Clouds
      ctx.fillStyle = "#3c88fc";
      ctx.fillRect(0, 0, w, 55);

      // Clouds
      ctx.fillStyle = "#fcfcfc";
      const c1 = (w - (this.frame * 0.3) % (w + 60)) - 30;
      ctx.fillRect(c1, 12, 34, 10);
      ctx.fillRect(c1 + 6, 8, 22, 14);

      const c2 = (w - (this.frame * 0.18 + 100) % (w + 60)) - 30;
      ctx.fillRect(c2, 22, 28, 8);
      ctx.fillRect(c2 + 4, 18, 18, 12);

      // 2. Distant Fairway Hills & Pine Trees (Parallax)
      ctx.fillStyle = "#007800";
      ctx.beginPath();
      ctx.moveTo(0, 55);
      for (let x = 0; x <= w; x += 32) {
        const hillY = 46 + Math.sin((x + this.scrollX * 0.5) * 0.04) * 6;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(w, 75);
      ctx.lineTo(0, 75);
      ctx.fill();

      // Pine trees along ridge
      ctx.fillStyle = "#004810";
      for (let tx = -20; tx < w + 20; tx += 48) {
        const treeX = ((tx - this.scrollX * 0.6) % (w + 40) + (w + 40)) % (w + 40) - 20;
        ctx.fillRect(treeX + 4, 42, 4, 14);
        ctx.beginPath();
        ctx.moveTo(treeX + 6, 30);
        ctx.lineTo(treeX - 4, 46);
        ctx.lineTo(treeX + 16, 46);
        ctx.fill();
      }

      // 3. Near Fairway Turf
      ctx.fillStyle = "#00a800";
      ctx.fillRect(0, 68, w, 24);

      // 4. Paved Goflball Cart Path
      ctx.fillStyle = "#989898";
      ctx.fillRect(0, 88, w, 22);
      ctx.fillStyle = "#686868";
      ctx.fillRect(0, 88, w, 2);
      ctx.fillRect(0, 108, w, 2);

      // Dashed lane stripes on cart path
      ctx.fillStyle = "#e8e8e8";
      for (let dx = -16; dx < w + 16; dx += 24) {
        const stripeX = ((dx - this.scrollX * 1.8) % (w + 24) + (w + 24)) % (w + 24) - 16;
        ctx.fillRect(stripeX, 98, 12, 2);
      }

      // 5. Exhaust Puffs from Rear of Goflball Cart
      if (this.frame % 10 === 0) {
        this.puffs.push({ x: 74, y: 88, r: 2, alpha: 0.8 });
      }
      for (let i = this.puffs.length - 1; i >= 0; i--) {
        const p = this.puffs[i];
        p.x -= 1.8;
        p.y -= 0.3;
        p.r += 0.25;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          this.puffs.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(200, 200, 200, ${p.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Draw 8-Bit Pixel Goflball Cart
      // Center position
      const cartX = 84;
      const bobY = Math.sin(this.frame * 0.25) * 1.2;
      const cartY = 62 + bobY;

      // Canopy Roof
      ctx.fillStyle = "#202020";
      ctx.fillRect(cartX, cartY, 74, 5);
      ctx.fillStyle = "#404040";
      ctx.fillRect(cartX + 2, cartY + 1, 70, 2);

      // Roof Struts
      ctx.fillStyle = "#505050";
      ctx.fillRect(cartX + 8, cartY + 5, 2, 16); // front strut
      ctx.fillRect(cartX + 64, cartY + 5, 2, 16); // rear strut

      // Windshield
      ctx.fillStyle = "rgba(0, 232, 216, 0.45)";
      ctx.fillRect(cartX + 10, cartY + 6, 8, 15);

      // Golf Bags on Rear Bumper
      ctx.fillStyle = "#881000";
      ctx.fillRect(cartX + 66, cartY + 12, 10, 16);
      ctx.fillStyle = "#b0b0b0"; // irons
      ctx.fillRect(cartX + 68, cartY + 6, 2, 7);
      ctx.fillRect(cartX + 72, cartY + 8, 2, 5);

      // White Body Frame
      ctx.fillStyle = "#fcfcfc";
      ctx.fillRect(cartX + 10, cartY + 20, 58, 12);
      ctx.fillStyle = "#989898";
      ctx.fillRect(cartX + 16, cartY + 21, 46, 2);

      // Seat Bench
      ctx.fillStyle = "#885820";
      ctx.fillRect(cartX + 32, cartY + 19, 28, 5);

      // Steering Wheel
      ctx.fillStyle = "#000";
      ctx.fillRect(cartX + 24, cartY + 16, 6, 2);
      ctx.fillRect(cartX + 28, cartY + 18, 2, 4);

      // Driver (You) sitting in left seat
      ctx.fillStyle = "#fcfcfc"; // white visor
      ctx.fillRect(cartX + 26, cartY + 6, 8, 3);
      ctx.fillStyle = "#f8b880"; // face
      ctx.fillRect(cartX + 27, cartY + 9, 6, 5);
      ctx.fillStyle = "#0058f8"; // blue polo
      ctx.fillRect(cartX + 24, cartY + 14, 10, 8);

      // Passenger (Partner) sitting in right seat
      const pColor = (this.partner && this.partner.shirtColor) || "#f83800";
      const pHat = (this.partner && this.partner.hatColor) || "#f8b800";
      const headTilt = this.partnerHeadAnim * 2;

      ctx.fillStyle = pHat; // partner hat
      ctx.fillRect(cartX + 44 + headTilt, cartY + 5, 9, 4);
      ctx.fillStyle = "#f8b880"; // face
      ctx.fillRect(cartX + 45 + headTilt, cartY + 9, 7, 5);

      // Sunglasses / Expression
      ctx.fillStyle = "#000";
      if (this.partnerHeadAnim < 0) {
        // Offended grimace
        ctx.fillRect(cartX + 46 + headTilt, cartY + 10, 2, 1);
        ctx.fillRect(cartX + 49 + headTilt, cartY + 10, 2, 1);
        ctx.fillRect(cartX + 46 + headTilt, cartY + 13, 5, 1);
      } else {
        // Cool shades
        ctx.fillRect(cartX + 46 + headTilt, cartY + 10, 6, 2);
      }

      ctx.fillStyle = pColor; // partner shirt
      ctx.fillRect(cartX + 42, cartY + 14, 12, 8);

      // Wheels with Spinning Spokes
      const wheelAngle = this.frame * 0.35;
      this._drawWheel(cartX + 18, cartY + 31, wheelAngle);
      this._drawWheel(cartX + 58, cartY + 31, wheelAngle);

      this._animId = requestAnimationFrame(this.render);
    }

    _drawWheel(x, y, angle) {
      const ctx = this.ctx;
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#888";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spokes
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4);
      ctx.lineTo(x - Math.cos(angle) * 4, y - Math.sin(angle) * 4);
      ctx.moveTo(x + Math.cos(angle + Math.PI / 2) * 4, y + Math.sin(angle + Math.PI / 2) * 4);
      ctx.lineTo(x - Math.cos(angle + Math.PI / 2) * 4, y - Math.sin(angle + Math.PI / 2) * 4);
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. 3D HAIRBALL NETWORK RADAR RENDERER
  // ---------------------------------------------------------------------------
  class HairballRadar {
    constructor(canvas, network) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.network = network;
      this.rotX = 0.3;
      this.rotY = 0.4;
      this.radius = 52;
      this.isDragging = false;
      this.lastMouseX = 0;
      this.lastMouseY = 0;

      this.canvas.addEventListener("pointerdown", (e) => {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.setPointerCapture(e.pointerId);
      });

      this.canvas.addEventListener("pointermove", (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.rotY += dx * 0.015;
        this.rotX += dy * 0.015;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.draw();
      });

      window.addEventListener("pointerup", () => {
        this.isDragging = false;
      });

      this.draw = this.draw.bind(this);
    }

    setNetwork(network) {
      this.network = network;
      this.draw();
    }

    draw() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Wireframe Latitude Rings
      ctx.strokeStyle = "rgba(0, 168, 0, 0.18)";
      ctx.lineWidth = 1;

      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const ringR = Math.cos(rad) * this.radius;
        const ringY = Math.sin(rad) * this.radius;

        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 15) {
          const lRad = (lon * Math.PI) / 180;
          const x3d = Math.cos(lRad) * ringR;
          const y3d = ringY;
          const z3d = Math.sin(lRad) * ringR;

          // Rotate around X and Y
          const p = this._project(x3d, y3d, z3d, cx, cy);
          if (lon === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw Nodes (Businessmen on the sphere)
      if (!this.network || !this.network.nodes) return;
      const nodes = Object.values(this.network.nodes);

      // Sort nodes by depth (z) for painter's algorithm
      const projected = nodes.map((node, i) => {
        // Distribute mathematically across sphere using golden spiral
        const phi = Math.acos(-1 + (2 * i) / nodes.length);
        const theta = Math.sqrt(nodes.length * Math.PI) * phi;
        const x3d = this.radius * Math.cos(theta) * Math.sin(phi);
        const y3d = this.radius * Math.sin(theta) * Math.sin(phi);
        const z3d = this.radius * Math.cos(phi);

        const pt = this._project(x3d, y3d, z3d, cx, cy);
        return { node, pt, z: pt.z };
      });

      projected.sort((a, b) => a.z - b.z);

      projected.forEach(({ node, pt }) => {
        let color = "#ffffff";
        let r = 2.5;
        if (node.isApex) {
          color = "#f8b800";
          r = 4;
        } else if (node.offended || node.trust < 0) {
          color = "#f83800";
          r = 3;
        } else if (node.doingBusiness || node.rapport >= 0.5) {
          color = "#00e8d8";
          r = 3.5;
        } else if (node.unlocked) {
          color = "#00a800";
          r = 3;
        }

        // Fade nodes in background
        const alpha = Math.max(0.2, (pt.z + this.radius) / (this.radius * 2));
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    }

    _project(x, y, z, cx, cy) {
      // Rotation Y
      const cosY = Math.cos(this.rotY);
      const sinY = Math.sin(this.rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotation X
      const cosX = Math.cos(this.rotX);
      const sinX = Math.sin(this.rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      return { x: cx + x1, y: cy + y2, z: z2 };
    }
  }

  // ---------------------------------------------------------------------------
  // 4. RETRO BLUEPRINT CANVAS (PARCEL #49-108)
  // ---------------------------------------------------------------------------
  function drawEmptyLotBlueprint(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#020b14";
    ctx.fillRect(0, 0, w, h);

    // Blueprint grid
    ctx.strokeStyle = "rgba(0, 232, 216, 0.15)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 40-Acre Parcel Boundary
    ctx.strokeStyle = "#00e8d8";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 18, w - 72, h - 36);

    // Highway / Interchange access
    ctx.strokeStyle = "#f8b800";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(10, h - 18);
    ctx.lineTo(w - 10, h - 18);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stamps & Coordinates
    ctx.fillStyle = "#00e8d8";
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillText("PARCEL #49-108 (40.00 ACRES)", 42, 32);
    ctx.fillText("ZONING: SPLIT AG/COMMERCIAL", 42, 45);
    ctx.fillText("TITLE STATUS: CONTESTED", 42, 58);

    ctx.fillStyle = "#f83800";
    ctx.fillText("INTERCHANGE ACCESS RAMP", 42, h - 22);
  }

  // ---------------------------------------------------------------------------
  // 5. DIALOGUE & GOFLBALL CART INTERACTION
  // ---------------------------------------------------------------------------
  let cartTransitAnim = null;
  let hairballRadar = null;
  let typewriterTimer = null;

  function typewriteSpeech(text, callback) {
    if (typewriterTimer) clearInterval(typewriterTimer);
    const target = document.getElementById("cdb-speech-text");
    if (!target) return;

    target.textContent = "";
    let idx = 0;
    const full = `"${text}"`;

    typewriterTimer = setInterval(() => {
      if (idx < full.length) {
        target.textContent += full[idx];
        if (idx % 2 === 0) sound.playChatTypewriter();
        idx++;
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        if (callback) callback();
      }
    }, 20);
  }

  function drawPartnerPortrait(canvas, npc) {
    if (!canvas || !npc) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 32, 32);

    // Hat
    ctx.fillStyle = npc.hatColor || "#fcfcfc";
    ctx.fillRect(6, 4, 18, 5);
    ctx.fillRect(18, 7, 8, 2);

    // Face
    ctx.fillStyle = "#f8b880";
    ctx.fillRect(8, 9, 14, 11);

    // Shades / Eyes
    ctx.fillStyle = "#000000";
    if (npc.offended) {
      ctx.fillRect(10, 11, 3, 2);
      ctx.fillRect(17, 11, 3, 2);
      ctx.fillRect(11, 16, 8, 2);
    } else {
      ctx.fillRect(9, 11, 12, 3);
      ctx.fillRect(12, 16, 6, 2);
    }

    // Shirt collar
    ctx.fillStyle = npc.shirtColor || "#f83800";
    ctx.fillRect(6, 20, 20, 12);
  }

  function setupGoflballCartScene() {
    const npc = world.network.nodes[world.currentPartnerId] || world.network.nodes[world.network.order[0]];
    const fx = getActiveUpgradeEffects();

    if (fx.passiveRapport && !npc.offended) {
      npc.rapport = Math.min(1.0, +(npc.rapport + fx.passiveRapport).toFixed(3));
    }

    updateHeaderAndMarquee();
    switchScreen("screen-play");

    // Show Cart Cinematic, Hide Fairway Course until Tee-Off
    const cartCine = document.getElementById("cart-cinematic");
    const courseView = document.getElementById("course-viewport");
    cartCine.classList.remove("hidden");
    courseView.classList.add("hidden");

    // Start pixel cart animation
    const cartCanvas = document.getElementById("cart-transit-canvas");
    if (!cartTransitAnim) {
      cartTransitAnim = new CartTransitAnimator(cartCanvas, npc);
    } else {
      cartTransitAnim.setPartner(npc);
    }
    cartTransitAnim.start();

    // Update titles and partner info
    document.getElementById("cart-transit-status").textContent = `LOADING HOLE ${world.currentHole}...`;
    document.getElementById("cart-course-title").textContent = npc.courseName || "PINE VALLEY MUNI";
    document.getElementById("cdb-speaker-name").textContent = `${npc.name.toUpperCase()} (GOFLBALL CART)`;
    document.getElementById("cdb-speaker-title").textContent = npc.role || "COMMERCIAL PARTNER";

    let bondText = "BOND: NEUTRAL";
    if (npc.offended) bondText = "BOND: OFFENDED";
    else if (npc.rapport >= npc.guardThreshold) bondText = "BOND: CONFIDANT";
    else if (npc.doingBusiness) bondText = "BOND: DOING BUSINESS";
    document.getElementById("cdb-rapport-badge").textContent = bondText;

    drawPartnerPortrait(document.getElementById("partner-portrait-canvas"), npc);

    // Paced dialogue via SymphonyDirector
    const line = GoflWorld.SymphonyDirector.selectOrchestratedLine(world, npc);
    typewriteSpeech(line);

    renderQuipChoices(npc);

    document.getElementById("btn-tee-hole-num").textContent = String(world.currentHole);

    // Autopilot button check
    const btnAuto = document.getElementById("btn-autopilot-hole");
    if (!isRestrictedNeutralMode() && fx.unlockCartAutopilot) {
      btnAuto.classList.remove("hidden");
    } else {
      btnAuto.classList.add("hidden");
    }

    saveSandbox(world);
  }

  function renderQuipChoices(npc) {
    const container = document.getElementById("cdb-quip-container");
    container.innerHTML = "";
    if (!npc || npc.offended) return;

    const replies = GoflWorld.SymphonyDirector.selectQuickReplies(world, npc);
    replies.forEach((q) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cdb-quip-btn";
      btn.textContent = `► ${q}`;
      btn.addEventListener("click", () => {
        handlePlayerQuip(q);
      });
      container.appendChild(btn);
    });
  }

  function handlePlayerQuip(text) {
    const npc = world.network.nodes[world.currentPartnerId];
    if (!npc) return;

    sound.playChatBlip(1);
    const res = GoflWorld.evaluateNpcBanter(world, npc.id, text);

    if (cartTransitAnim) {
      cartTransitAnim.triggerReaction(res.offended ? "offended" : "good");
    }

    setTimeout(() => {
      typewriteSpeech(res.reply, () => {
        if (res.offended) {
          sound.playOffendedBuzzer();
        } else {
          sound.playCashDing();
        }
        renderQuipChoices(npc);
        updateHeaderAndMarquee();
        saveSandbox(world);
      });
    }, 120);
  }

  function teeOffHole() {
    if (cartTransitAnim) cartTransitAnim.stop();
    document.getElementById("cart-cinematic").classList.add("hidden");
    document.getElementById("course-viewport").classList.remove("hidden");

    const fx = getActiveUpgradeEffects();
    const epochCfg = GoflWorld.getEpochConfig(world.epoch || 0);
    const npc = world.network.nodes[world.currentPartnerId];

    golfCanvas.setUpgrades(fx, epochCfg.windMultiplier);
    golfCanvas.setPartnerVisuals(npc);
    golfCanvas.resetHole(world.currentHole);

    const btnCaddie = document.getElementById("btn-caddie-shot");
    if (!isRestrictedNeutralMode() && fx.unlockAutoSwing) {
      btnCaddie.classList.remove("hidden");
    } else {
      btnCaddie.classList.add("hidden");
    }

    sound.playChatBlip(2);
  }

  function handleHoleCompleted(result) {
    world.roundStrokes = (world.roundStrokes || 0) + result.strokes;
    world.roundPar = (world.roundPar || 0) + result.par;
    world.totalHolesPlayed = (world.totalHolesPlayed || 0) + 1;

    if (!Array.isArray(world.roundScores)) world.roundScores = [];
    world.roundScores[world.currentHole - 1] = result.strokes;

    const npc = world.network.nodes[world.currentPartnerId];
    if (npc) {
      npc.holesTogether = (npc.holesTogether || 0) + 1;
    }

    updateHeaderAndMarquee();

    if (world.currentHole < 9) {
      world.currentHole += 1;
      saveSandbox(world);
      setupGoflballCartScene();
    } else {
      showScorecardReveal();
    }
  }

  function autoPlayHole() {
    const holeIdx = (world.currentHole - 1) % NesGolfEngine.HOLES.length;
    const h = NesGolfEngine.HOLES[holeIdx];
    sound.playCashDing();
    handleHoleCompleted({
      hole: world.currentHole,
      par: h.par,
      strokes: Math.max(1, h.par - 1)
    });
  }

  // ---------------------------------------------------------------------------
  // 6. 9-HOLE SCORECARD & CONFIDENTIAL REVEAL
  // ---------------------------------------------------------------------------
  function showScorecardReveal() {
    if (cartTransitAnim) cartTransitAnim.stop();
    const report = GoflWorld.evaluateRoundEnd(
      world,
      world.currentPartnerId,
      world.roundStrokes,
      world.roundPar
    );

    if (report.nailedSocial) {
      world.cash = (world.cash || 0) + report.npc.contractValue + report.stats.roundPayout;
      sound.playCashDing();
    } else {
      sound.playOffendedBuzzer();
    }

    saveSandbox(world);
    updateHeaderAndMarquee();
    switchScreen("screen-verdict");

    // Populate Paper Scorecard Table
    for (let i = 1; i <= 9; i++) {
      const cell = document.getElementById(`sc-h${i}`);
      if (cell) {
        cell.textContent = world.roundScores && world.roundScores[i - 1] ? String(world.roundScores[i - 1]) : "4";
      }
    }
    const totalCell = document.getElementById("sc-total");
    if (totalCell) totalCell.textContent = String(report.strokes);

    // Slam rubber stamp with sound
    const stamp = document.getElementById("verdict-stamp");
    if (report.nailedSocial) {
      stamp.textContent = "INVITED BACK";
      stamp.className = "rubber-stamp stamp-good";
    } else {
      stamp.textContent = "NOT INVITED BACK";
      stamp.className = "rubber-stamp stamp-bad";
    }

    // Audio thump for rubber stamp
    sound.playNoise(180, 0.26, 380);
    sound.playPulse(85, 200, 0.22, 40);

    // Confidential Memorandum Details
    document.getElementById("dossier-evaluator").textContent = `${report.npc.name} (${report.npc.role})`;

    const titleEl = document.getElementById("dossier-verdict-title");
    const summaryEl = document.getElementById("dossier-summary");
    const cartRapportEl = document.getElementById("stat-cart-rapport");

    if (report.stayedSilent) {
      titleEl.textContent = "COLD SHOULDER // DEAD SILENCE";
      titleEl.className = "df-val text-red";
      cartRapportEl.textContent = "NEGATIVE (SILENT)";
      cartRapportEl.className = "ds-val text-red";
      summaryEl.textContent =
        `"YOU PLAYED 9 HOLES OF GOFLBALL AND BARELY SPOKE A WORD IN THE GOFLBALL CART. IN WEST MICHIGAN, IF YOU WON'T TALK IN THE CART, YOU'RE HIDING SOMETHING. NOBODY SIGNS CONTRACTS WITH A STONE."`;
    } else if (report.nailedSocial) {
      titleEl.textContent = "CONFIRMED ALLY // CONTRACT EXECUTED";
      titleEl.className = "df-val text-green";
      cartRapportEl.textContent = `GOOD GRACES (+${report.stats.friends})`;
      cartRapportEl.className = "ds-val text-green";
      summaryEl.textContent =
        `"${report.npc.name} LOVED SHOOTING THE BREEZE IN THE GOFLBALL CART WITH YOU. HE AUTHORIZED A $${report.npc.contractValue.toLocaleString()} CONTRACT DEPOSIT AND INTRODUCED YOU TO HIS CIRCLE."`;
    } else {
      titleEl.textContent = "REJECTED // OFFENDED THE PARTNER";
      titleEl.className = "df-val text-red";
      cartRapportEl.textContent = "OFFENDED";
      cartRapportEl.className = "ds-val text-red";
      summaryEl.textContent =
        `"YOU RUBBED ${report.npc.name} THE WRONG WAY IN THE GOFLBALL CART. GOLF SCORE DOESN'T MATTER—YOU LOST THE ACCOUNT AND DAMAGED YOUR STANDING AT THE CLUBHOUSE."`;
    }

    document.getElementById("stat-cash-won").textContent = report.nailedSocial
      ? `+$${(report.npc.contractValue + report.stats.roundPayout).toLocaleString()}`
      : "$0";
    document.getElementById("stat-network-reach").textContent = `${report.stats.sharePct}%`;

    // Initialize 3D Hairball Radar
    const radarCanvas = document.getElementById("hairball-radar-canvas");
    if (!hairballRadar) {
      hairballRadar = new HairballRadar(radarCanvas, world.network);
    } else {
      hairballRadar.setNetwork(world.network);
    }

    // Respawn notification
    const respawnBox = document.getElementById("respawn-alert-box");
    if (report.triggeredRespawn && report.newEpochConfig) {
      respawnBox.classList.remove("hidden");
      document.getElementById("respawn-alert-msg").textContent =
        `THE EMPTY LOT FLIPPED. SUBSTRATE BREACH DETECTED. RESPAWNED INTO ${report.newEpochConfig.name}.`;
    } else {
      respawnBox.classList.add("hidden");
    }

    syncLeaderboardSilent();
  }

  // ---------------------------------------------------------------------------
  // 7. UNLOCKED SCREENS: TEE SHEET, PRO SHOP, EMPTY LOT, LEADERBOARD
  // ---------------------------------------------------------------------------
  function renderNetworkScreen() {
    const epochCfg = GoflWorld.getEpochConfig(world.epoch || 0);
    document.getElementById("epoch-banner").textContent = epochCfg.name;

    const listEl = document.getElementById("network-list");
    listEl.innerHTML = "";

    const visible = world.network.order
      .map((id) => world.network.nodes[id])
      .filter((n) => n.unlocked)
      .sort((a, b) => a.tier - b.tier);

    visible.forEach((npc) => {
      const isNeg = npc.offended || npc.trust < 0;
      const card = document.createElement("div");
      card.className = "blocky-card" + (npc.doingBusiness ? " friend" : isNeg ? " negative" : "");

      let bondLabel = "ACQUAINTANCE";
      if (npc.offended) bondLabel = "WONT SPEAK TO YOU";
      else if (npc.rapport >= npc.guardThreshold) bondLabel = "INNER CIRCLE (CONFIDANT)";
      else if (npc.doingBusiness) bondLabel = "DOING BUSINESS";
      else if (npc.trust < 0) bondLabel = "COLD";

      card.innerHTML = `
        <div class="bc-title">
          <span>${npc.name}</span>
          <span>${npc.role}</span>
        </div>
        <div class="bc-sub">${npc.courseName}</div>
        <div class="bc-status">${bondLabel} • CONTRACT: $${npc.contractValue.toLocaleString()}</div>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      if (npc.offended || (!npc.invitedBack && npc.trust < -0.2)) {
        btn.className = "crt-btn crt-btn-red";
        btn.textContent = world.cash >= 2000 ? "SEND $2,000 CLUBHOUSE APOLOGY GIFT" : "APOLOGIZE AT CLUBHOUSE";
        btn.addEventListener("click", () => {
          if (world.cash >= 2000) world.cash -= 2000;
          npc.offended = false;
          npc.invitedBack = true;
          npc.trust = 0;
          sound.playCashDing();
          saveSandbox(world);
          renderNetworkScreen();
        });
      } else {
        btn.className = "crt-btn crt-btn-green";
        btn.textContent = `TEE OFF WITH ${npc.shortName} »`;
        btn.addEventListener("click", () => {
          startRoundWithPartner(npc.id);
        });
      }

      card.appendChild(btn);
      listEl.appendChild(card);
    });
  }

  function startRoundWithPartner(partnerId) {
    world.currentPartnerId = partnerId;
    world.currentHole = 1;
    world.roundStrokes = 0;
    world.roundPar = 0;
    world.roundScores = [];
    const npc = world.network.nodes[partnerId];
    if (npc) npc.talkedHoles = 0;
    saveSandbox(world);
    activateTab("screen-play");
    setupGoflballCartScene();
  }

  function renderUpgradesScreen() {
    document.getElementById("shop-cash").textContent = `$${(world.cash || 0).toLocaleString()}`;
    const listEl = document.getElementById("upgrades-list");
    listEl.innerHTML = "";

    GoflWorld.UPGRADES.forEach((u) => {
      const owned = !!(world.purchasedUpgrades && world.purchasedUpgrades[u.id]);
      const card = document.createElement("div");
      card.className = "blocky-card" + (owned ? " friend" : "");
      card.innerHTML = `
        <div class="bc-title">
          <span>${u.name}</span>
          <span>${owned ? "OWNED" : "$" + u.cost.toLocaleString()}</span>
        </div>
        <div class="bc-sub">${u.desc}</div>
      `;

      if (!owned) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "crt-btn crt-btn-gold";
        btn.textContent = `BUY ($${u.cost.toLocaleString()})`;
        btn.addEventListener("click", () => {
          if (world.cash >= u.cost) {
            world.cash -= u.cost;
            world.purchasedUpgrades[u.id] = true;
            sound.playCashDing();
            saveSandbox(world);
            updateHeaderAndMarquee();
            renderUpgradesScreen();
          } else {
            sound.playOffendedBuzzer();
          }
        });
        card.appendChild(btn);
      }

      listEl.appendChild(card);
    });
  }

  function renderEmptyLotScreen() {
    const blueprintCanvas = document.getElementById("blueprint-canvas");
    drawEmptyLotBlueprint(blueprintCanvas);

    const tier = Math.max(1, world.highestTierCleared || 1);
    const badge = document.getElementById("conspiracy-stage-badge");
    const title = document.getElementById("lot-theory-title");
    const desc = document.getElementById("lot-theory-desc");
    const feed = document.getElementById("lot-intel-feed");

    feed.innerHTML = "";

    if (tier === 1) {
      badge.textContent = "TIER 1 CONSENSUS";
      title.textContent = "THE CHRISTIAN BUSINESSMEN PAC";
      desc.textContent = "Muni golfers believe church elders are pooling $2.4M to buy the 40-acre interchange parcel for an evangelical sports ministry.";
      feed.innerHTML = `
        <div class="intel-bubble">Dale: "The fellowship committee already put down 10% in escrow."</div>
        <div class="intel-bubble">Bram: "Pastor mentioned they're building the youth sanctuary there next spring."</div>
      `;
    } else if (tier === 2) {
      badge.textContent = "TIER 2 REVERSAL";
      title.textContent = "THE COUNTY ZONING BOARD BUYOUT";
      desc.textContent = "Mid-level contractors reveal the church deal was a front. Frank bought off two county zoning commissioners to keep it agricultural for corn subsidies.";
      feed.innerHTML = `
        <div class="intel-bubble">Frank: "Let the church pray all they want. The zoning board voted 4-1 in my pocket."</div>
        <div class="intel-bubble">Kip: "Corn subsidies pay triple what commercial leaseholders offer."</div>
      `;
    } else if (tier === 3) {
      badge.textContent = "TIER 3 REVERSAL";
      title.textContent = "THE STATE UNIVERSITY BIOMEDICAL ANNEX";
      desc.textContent = "The University Board of Regents secretly authorized a $38M biotechnology research annex to swallow the parcel.";
      feed.innerHTML = `
        <div class="intel-bubble">Dr. Vance: "The state grant cleared last Tuesday. The corn farmer will take a buyout."</div>
      `;
    } else {
      badge.textContent = "APEX CONSPIRACY // SUBSTRATE FRACTURE";
      title.textContent = "OFFSHORE CAYMAN LEASEBACK BOND";
      desc.textContent = "The university was a smoke screen. The deed is held by an offshore Cayman trust leased back to the church pension annuity fund. The simulation loops infinitely.";
      feed.innerHTML = `
        <div class="intel-bubble">████████: "The top is heads, but when you arrive it is tails. The universe respawns."</div>
      `;
    }
  }

  async function renderRanksScreen() {
    const input = document.getElementById("input-handle");
    if (input) input.value = world.playerHandle || "PLAYER_1";

    let rows = GoflWorld.DEFAULT_LEADERBOARD.slice();
    try {
      const res = await fetch("/api/leaderboard", { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          rows = data.leaderboard;
        }
      }
    } catch (e) {}

    GoflWorld.recalculateNetworkStats(world);
    const npc = world.network.nodes[world.currentPartnerId];

    const me = {
      handle: (world.playerHandle || "PLAYER_1").toUpperCase(),
      club: npc ? npc.courseName : "PINE VALLEY MUNI",
      share_pct: world.networkSharePct || 0.0,
      rounds: world.roundsPlayed || 0,
      isYou: true
    };

    const existing = rows.findIndex(
      (r) => !r.locked_top && String(r.handle).toUpperCase() === me.handle
    );
    if (existing >= 0) rows[existing] = Object.assign({}, rows[existing], me);
    else rows.push(me);

    rows.sort((a, b) => {
      if (a.locked_top) return -1;
      if (b.locked_top) return 1;
      return b.share_pct - a.share_pct;
    });

    const box = document.getElementById("leaderboard-box");
    let html = `
      <table class="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>PLAYER</th>
            <th>ROUNDS</th>
            <th>NET %</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.slice(0, 20).forEach((r, idx) => {
      const cls = r.locked_top ? "lb-top-masked" : r.isYou ? "lb-you" : "";
      html += `
        <tr class="${cls}">
          <td>${idx + 1}</td>
          <td>${r.handle}${r.isYou ? " (YOU)" : ""}</td>
          <td>${r.rounds || 0}</td>
          <td>${Number(r.share_pct).toFixed(1)}%</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    box.innerHTML = html;
  }

  async function syncLeaderboardSilent() {
    const input = document.getElementById("input-handle");
    if (input && input.value.trim()) {
      world.playerHandle = input.value.trim().toUpperCase().slice(0, 12);
      saveSandbox(world);
    }
    GoflWorld.recalculateNetworkStats(world);
    const npc = world.network.nodes[world.currentPartnerId];
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: world.playerHandle,
          club: npc ? npc.courseName : "PINE VALLEY MUNI",
          share_pct: world.networkSharePct,
          rounds: world.roundsPlayed,
          tier: Math.max(1, world.highestTierCleared || 1)
        }),
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {}
  }

  function switchScreen(id) {
    document.querySelectorAll(".crt-screen").forEach((s) => {
      s.classList.toggle("active", s.id === id);
    });
  }

  function activateTab(tabTarget) {
    document.querySelectorAll(".u-tab").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-screen") === tabTarget);
    });
    switchScreen(tabTarget);
    if (tabTarget === "screen-network") renderNetworkScreen();
    if (tabTarget === "screen-upgrades") renderUpgradesScreen();
    if (tabTarget === "screen-conspiracy") renderEmptyLotScreen();
    if (tabTarget === "screen-ranks") renderRanksScreen();
  }

  // ---------------------------------------------------------------------------
  // 8. INITIALIZATION & DOM EVENT BINDING
  // ---------------------------------------------------------------------------
  window.addEventListener("DOMContentLoaded", () => {
    const canvasEl = document.getElementById("nes-golf-canvas");
    golfCanvas = new NesGolfEngine.NesGolfCanvas(canvasEl, sound, {
      onHoleComplete: (res) => handleHoleCompleted(res)
    });

    // Toggle custom remark drawer in cart
    document.getElementById("btn-toggle-custom").addEventListener("click", () => {
      const drawer = document.getElementById("custom-remark-drawer");
      drawer.classList.toggle("hidden");
      sound.playChatBlip(0);
    });

    document.getElementById("custom-chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = document.getElementById("custom-chat-input");
      const v = inp.value;
      inp.value = "";
      handlePlayerQuip(v);
    });

    // Tee Off button in cart
    document.getElementById("btn-tee-off").addEventListener("click", () => {
      teeOffHole();
    });

    // Autopilot hole button
    document.getElementById("btn-autopilot-hole").addEventListener("click", () => {
      autoPlayHole();
    });

    // In-game Swing Buttons
    document.getElementById("btn-swing").addEventListener("click", () => {
      golfCanvas.triggerAction();
    });

    document.getElementById("btn-caddie-shot").addEventListener("click", () => {
      golfCanvas.autoSwingShot();
    });

    // Scorecard Continue button
    document.getElementById("btn-to-clubhouse").addEventListener("click", () => {
      activateTab("screen-network");
    });

    // Audio SFX Toggle
    document.getElementById("btn-sfx").addEventListener("click", (e) => {
      sound.muted = !sound.muted;
      e.target.textContent = sound.muted ? "MUTE" : "SFX";
    });

    // Post Rank Button
    document.getElementById("btn-post-rank").addEventListener("click", async () => {
      await syncLeaderboardSilent();
      sound.playCashDing();
      renderRanksScreen();
    });

    // Tab Navigation
    document.querySelectorAll(".u-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activateTab(btn.getAttribute("data-screen"));
      });
    });

    // Launch initial goflball cart scene
    setupGoflballCartScene();
  });
})();
