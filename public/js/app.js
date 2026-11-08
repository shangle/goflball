/**
 * GOFLBALL (1984) — Main Client Sandbox Controller
 *
 * - Persists the player's entire universe locally in `localStorage` (`GOFLBALL_SANDBOX_V1`).
 * - Each player is strictly isolated in their own local sandbox: they only play goflball
 *   with the AI network in their browser, while syncing only their handle & Hairball Network Share %
 *   to the global leaderboard (`/api/leaderboard`).
 * - Coordinates the Pre-Hole "Loading" Banter Screen, the 1984 NES Golf Course Canvas,
 *   the 9-Hole Social Rating Verdict, the Shifting Empty Lot Conspiracy, and the Idle-Clicker
 *   Cart Automation upgrades.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "GOFLBALL_SANDBOX_V1";

  // ---------------------------------------------------------------------------
  // 1. SANDBOX STATE INITIALIZATION & PERSISTENCE
  // ---------------------------------------------------------------------------
  function createFreshWorldState() {
    const net = GoflWorld.buildInitialNetworkGraph(40);
    return {
      version: 1,
      playerId: "p_" + Math.random().toString(36).slice(2, 10),
      playerHandle: "EXEC_" + Math.floor(100 + Math.random() * 899),
      cash: 2400,
      revenuePerHole: 150,
      networkSharePct: 2.5,
      activeBusinessCount: 0,
      roundsPlayed: 0,
      highestTierCleared: 0,
      conspiracyDepth: 0,
      purchasedUpgrades: {},
      autoCaddieEnabled: false,
      cartAutopilotEnabled: false,
      currentPartnerId: "ai_derek_v",
      currentHole: 1,
      roundStrokes: 0,
      roundPar: 0,
      roundAlienatedCount: 0,
      banterTurnsThisHole: 0,
      activeScreenMode: "screen-loading-banter", // "screen-loading-banter" | "screen-golf-course" | "screen-round-verdict"
      playerPublicPersona: {
        theology: 0,
        populism: 0,
        exclusivity: 0,
        nativism: 0,
        paternalism: 0
      },
      network: net
    };
  }

  function loadWorldState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.network && parsed.network.nodes) {
          return parsed;
        }
      }
    } catch (e) {}
    const fresh = createFreshWorldState();
    saveWorldState(fresh);
    return fresh;
  }

  function saveWorldState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  const world = loadWorldState();
  const sound = new NesGolfEngine.NesSoundEngine();
  let golfCanvas = null;

  // ---------------------------------------------------------------------------
  // 2. COMPUTE ACTIVE UPGRADE EFFECTS
  // ---------------------------------------------------------------------------
  function getCombinedUpgradeEffects() {
    const fx = {
      distanceBonus: 0,
      windResist: 0,
      autoAim: 0,
      gimmeRadius: 16,
      noHazards: false,
      unlockAutoSwing: false,
      unlockInstantHole: false,
      passiveTrustBoost: 0
    };

    for (const upg of GoflWorld.UPGRADES) {
      if (world.purchasedUpgrades && world.purchasedUpgrades[upg.id]) {
        const e = upg.effect;
        if (e.distanceBonus) fx.distanceBonus += e.distanceBonus;
        if (e.windResist) fx.windResist = Math.max(fx.windResist, e.windResist);
        if (e.autoAim) fx.autoAim = Math.max(fx.autoAim, e.autoAim);
        if (e.gimmeRadius) fx.gimmeRadius = Math.max(fx.gimmeRadius, e.gimmeRadius);
        if (e.noHazards) fx.noHazards = true;
        if (e.unlockAutoSwing) fx.unlockAutoSwing = true;
        if (e.unlockInstantHole) fx.unlockInstantHole = true;
        if (e.passiveTrustBoost) fx.passiveTrustBoost += e.passiveTrustBoost;
      }
    }
    return fx;
  }

  // ---------------------------------------------------------------------------
  // 3. PIXEL PORTRAIT RENDERER (48x48 8-BIT GOLFER HEADSHOT)
  // ---------------------------------------------------------------------------
  function drawPartnerPortrait(canvas, partner) {
    if (!canvas || !partner) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 48, 48);

    // Background sky stripe based on tier
    const bgColors = ["#000000", "#002800", "#001848", "#281800", "#280028", "#380018"];
    ctx.fillStyle = bgColors[partner.tier % bgColors.length];
    ctx.fillRect(2, 2, 44, 44);

    // Cap / Visor
    ctx.fillStyle = partner.hatColor || "#fcfcfc";
    ctx.fillRect(12, 6, 22, 8);
    ctx.fillRect(28, 11, 10, 3);

    // Head / Face
    ctx.fillStyle = "#f8b880";
    ctx.fillRect(14, 14, 18, 16);

    // Sunglasses or Eyes
    ctx.fillStyle = "#000000";
    if (partner.tier >= 3) {
      // Country club shades
      ctx.fillRect(16, 17, 14, 4);
    } else {
      ctx.fillRect(18, 18, 3, 3);
      ctx.fillRect(26, 18, 3, 3);
    }

    // Smirk / Mustache
    ctx.fillStyle = partner.avatarSeed % 2 === 0 ? "#683800" : "#000000";
    ctx.fillRect(19, 25, 9, 2);

    // Polo Shirt Collar
    ctx.fillStyle = partner.shirtColor || "#f83800";
    ctx.fillRect(10, 30, 26, 16);
    ctx.fillStyle = "#fcfcfc";
    ctx.fillRect(20, 30, 6, 5);
  }

  // ---------------------------------------------------------------------------
  // 4. UI SYNCHRONIZATION & HUD
  // ---------------------------------------------------------------------------
  function updateTopHud() {
    GoflWorld.computeNetworkShare(world);
    const partner = world.network.nodes[world.currentPartnerId] || world.network.nodes["ai_derek_v"];

    document.getElementById("hud-cash").textContent = "$" + Number(world.cash || 0).toLocaleString();
    document.getElementById("hud-share").textContent = (world.networkSharePct || 0).toFixed(1) + "%";
    document.getElementById("hud-round").textContent = "#" + ((world.roundsPlayed || 0) + 1);

    if (partner) {
      document.getElementById("strip-partner-name").textContent = partner.name.toUpperCase();
      document.getElementById("strip-partner-tier").textContent = `TIER ${partner.tier}`;
      const tribe = GoflWorld.TRIBES[partner.tribe] || GoflWorld.TRIBES.MUNI_REGULARS;
      document.getElementById("strip-club-name").textContent = tribe.clubName;

      const vibeEl = document.getElementById("strip-vibe-status");
      if (partner.offended) {
        vibeEl.textContent = "OFFENDED (DONE)";
        vibeEl.className = "vibe-bad";
      } else if (partner.trust >= 0.32) {
        vibeEl.textContent = "IN GOOD GRACES";
        vibeEl.className = "vibe-good";
      } else if (partner.trust < 0) {
        vibeEl.textContent = "SUSPICIOUS";
        vibeEl.className = "vibe-bad";
      } else {
        vibeEl.textContent = "SIZING YOU UP";
        vibeEl.className = "vibe-neutral";
      }
    }

    document.getElementById("strip-hole-num").textContent = String(world.currentHole);
    const rel = world.roundStrokes - world.roundPar;
    document.getElementById("strip-score-rel").textContent =
      rel === 0 ? "E" : rel > 0 ? `+${rel}` : String(rel);
  }

  // ---------------------------------------------------------------------------
  // 5. PRE-HOLE "LOADING..." BANTER ENGINE (THE CORE SOCIAL GAME)
  // ---------------------------------------------------------------------------
  function startPreHoleLoadingBanter() {
    world.activeScreenMode = "screen-loading-banter";
    world.banterTurnsThisHole = 0;

    const partner = world.network.nodes[world.currentPartnerId];
    const fx = getCombinedUpgradeEffects();

    // Apply passive cart humidor trust boost each hole
    if (fx.passiveTrustBoost && partner && !partner.offended) {
      partner.trust = Math.min(1.0, +(partner.trust + fx.passiveTrustBoost / 9).toFixed(3));
    }

    updateTopHud();
    showStageScreen("screen-loading-banter");

    // Fake "loading" progress bar that pauses until banter happens or player steps to tee
    document.getElementById("load-hole-num").textContent = String(world.currentHole);
    const pct = Math.min(98, 25 + world.currentHole * 7);
    document.getElementById("loading-progress-bar").style.width = `${pct}%`;

    const subtitles = [
      "WAITING ON FOURSOME AHEAD TO CLEAR THE FAIRWAY...",
      "SITTING IN THE GOFL CART BY THE WATER COOLER...",
      "LEANING ON YOUR 1-WOOD WHILE HE UNWRAPS A BURGER...",
      "CHECKING THE TOWNSHIP PARCEL MAP ON HIS PHONE...",
      "WAITING FOR THE BEVERAGE CART TO PASS..."
    ];
    document.getElementById("load-hole-subtitle").textContent =
      subtitles[(world.currentHole - 1) % subtitles.length];

    // Partner card
    document.getElementById("banter-partner-name").textContent = `${partner.name} (Tier ${partner.tier})`;
    document.getElementById("banter-partner-title").textContent = `${partner.title} • Handicap ${partner.handicap}`;

    const conspiracy = GoflWorld.getConspiracyAtDepth(world.conspiracyDepth || 0);
    document.getElementById("banter-conspiracy-hint").textContent =
      `EMPTY LOT RUMOR: ${conspiracy.currentBelievedTop}`;

    drawPartnerPortrait(document.getElementById("partner-portrait-canvas"), partner);
    updatePartnerTrustBar(partner);

    // Populate initial greeting/smalltalk from AI partner for this hole
    const transcript = document.getElementById("chat-transcript");
    transcript.innerHTML = "";

    let openingLine = "";
    if (partner.offended) {
      openingLine =
        partner.blacklistedReason ||
        "I'm only finishing these nine holes because I already paid the green fee. Don't talk to me.";
    } else if (world.currentHole === 1) {
      const g = partner.quips.greeting;
      openingLine = g[Math.floor(Math.random() * g.length)];
    } else if (world.currentHole % 2 === 0) {
      const s = partner.quips.smalltalk;
      openingLine = s[(world.currentHole >> 1) % s.length];
    } else {
      const p = partner.quips.probe.concat(partner.convictions);
      openingLine = p[world.currentHole % p.length];
    }

    appendChatMessage("ai", partner.name, openingLine);
    renderQuickQuips(partner);

    // Show/hide Instant Cart Autopilot button if unlocked
    const btnInstant = document.getElementById("btn-instant-sim-hole");
    if (fx.unlockInstantHole || world.cartAutopilotEnabled) {
      btnInstant.classList.remove("hidden");
    } else {
      btnInstant.classList.add("hidden");
    }

    saveWorldState(world);
  }

  function updatePartnerTrustBar(partner) {
    const fill = document.getElementById("partner-trust-fill");
    const norm = Math.max(0, Math.min(100, Math.round((partner.trust + 0.5) * 75)));
    fill.style.width = `${norm}%`;
    fill.style.background = partner.offended
      ? "#f83800"
      : partner.trust >= 0.3
      ? "#58f898"
      : "#f8b800";
  }

  function appendChatMessage(role, speaker, text) {
    const transcript = document.getElementById("chat-transcript");
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;
    const sp = document.createElement("div");
    sp.className = "chat-speaker";
    sp.textContent = speaker.toUpperCase();
    const body = document.createElement("div");
    body.textContent = text;
    div.appendChild(sp);
    div.appendChild(body);
    transcript.appendChild(div);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function renderQuickQuips(partner) {
    const tray = document.getElementById("quick-quips-tray");
    tray.innerHTML = "";
    if (partner.offended) return;

    const prompts =
      GoflWorld.PLAYER_QUICK_PROMPTS[partner.tribe] ||
      GoflWorld.PLAYER_QUICK_PROMPTS.MUNI_REGULARS;

    prompts.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quip-chip";
      btn.textContent = p.label;
      btn.addEventListener("click", () => {
        handlePlayerChatTurn(p.text, p.signals, p.conspiracyProbe);
      });
      tray.appendChild(btn);
    });
  }

  async function handlePlayerChatTurn(text, explicitSignals = null, isConspiracyProbe = false) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    const partner = world.network.nodes[world.currentPartnerId];
    if (!partner) return;

    appendChatMessage("player", "YOU (IN BUSINESS)", trimmed);
    sound.playChatBlip(1);
    world.banterTurnsThisHole++;

    // Run Jev-Style 100-Mantra & Hairball Belief Evaluation in-browser
    const outcome = GoflWorld.evaluateBanterTurn(
      world,
      partner.id,
      trimmed,
      explicitSignals,
      isConspiracyProbe
    );

    let replyText = outcome.reply;

    // Optional: If player typed free-text (no explicitSignals) and hasn't triggered a storm-off,
    // check if our server/edge LLM bridge wants to enrich a direct novel question (with 900ms timeout fallback to Jev-bot!)
    if (!explicitSignals && !outcome.stormOff && trimmed.endsWith("?")) {
      try {
        const res = await fetch("/api/banter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerName: partner.name,
            partnerTitle: partner.title,
            tribe: partner.tribe,
            tier: partner.tier,
            convictions: partner.convictions,
            playerMessage: trimmed,
            fallbackReply: outcome.reply
          }),
          signal: AbortSignal.timeout(1100)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) replyText = data.reply;
        }
      } catch (e) {
        // Offline or 100% browser mode — keep instant Jev-style reply!
      }
    }

    setTimeout(() => {
      appendChatMessage("ai", partner.name, replyText);
      if (outcome.offended) {
        sound.playOffendedBuzzer();
        appendChatMessage(
          "system",
          "CLUBHOUSE GOSSIP",
          `${partner.name} is offended! You won't be invited back after this round.`
        );
      } else {
        sound.playChatBlip(-1);
      }

      if (outcome.alienatedCount > 0) {
        world.roundAlienatedCount = (world.roundAlienatedCount || 0) + outcome.alienatedCount;
        appendChatMessage(
          "system",
          "HAIRBALL RIPPLE",
          `Word travelled back to the clubhouse: ${outcome.alienatedCount} rival player(s) heard who you're agreeing with and cut ties with you!`
        );
      }

      document.getElementById("loading-progress-bar").style.width = "100%";
      updatePartnerTrustBar(partner);
      updateTopHud();
      saveWorldState(world);
    }, 220);
  }

  // ---------------------------------------------------------------------------
  // 6. STEPPING ONTO THE 1984 NES GOLF COURSE (OR CART AUTOPILOT)
  // ---------------------------------------------------------------------------
  function launchHoleOnCourse() {
    const fx = getCombinedUpgradeEffects();
    const partner = world.network.nodes[world.currentPartnerId];

    // If user enabled 100% Cart Autopilot, simulate the hole in 1 click without leaving the cart!
    if (world.cartAutopilotEnabled && fx.unlockInstantHole) {
      simulateInstantHole();
      return;
    }

    world.activeScreenMode = "screen-golf-course";
    showStageScreen("screen-golf-course");

    golfCanvas.setUpgrades(fx);
    golfCanvas.setPartnerVisuals(partner);
    golfCanvas.resetHole(world.currentHole);

    const btnAutoCaddie = document.getElementById("btn-auto-caddie");
    if (fx.unlockAutoSwing) {
      btnAutoCaddie.classList.remove("hidden");
    } else {
      btnAutoCaddie.classList.add("hidden");
    }

    // If Auto-Caddie toggle is checked, automatically fire shots!
    if (world.autoCaddieEnabled && fx.unlockAutoSwing) {
      setTimeout(() => golfCanvas.autoSwingShot(), 300);
    }
  }

  function simulateInstantHole() {
    const holeIdx = (world.currentHole - 1) % NesGolfEngine.HOLES.length;
    const h = NesGolfEngine.HOLES[holeIdx];
    const strokes = Math.max(1, h.par - 1); // Autopilot shoots effortless birdies
    sound.playCashDing();
    onHoleFinished({
      hole: world.currentHole,
      par: h.par,
      strokes,
      label: "AUTOPILOT BIRDIE"
    });
  }

  function onHoleFinished(result) {
    // Award idle-clicker per-hole business cash!
    GoflWorld.computeNetworkShare(world);
    const holeCash = world.revenuePerHole || 150;
    world.cash = (world.cash || 0) + holeCash;
    world.roundStrokes += result.strokes;
    world.roundPar += result.par;

    updateTopHud();

    if (world.currentHole < 9) {
      world.currentHole += 1;
      saveWorldState(world);
      startPreHoleLoadingBanter();
    } else {
      // End of 9 holes! Evaluate social interaction!
      finishNineHoleRound();
    }
  }

  function finishNineHoleRound() {
    world.activeScreenMode = "screen-round-verdict";
    const report = GoflWorld.evaluateNineHoleRound(
      world,
      world.currentPartnerId,
      world.roundStrokes,
      world.roundPar
    );

    if (report.nailedSocial) {
      // Bonus round-completion retainer payout
      const bonus = report.partner.contractValue;
      world.cash += bonus;
      sound.playCashDing();
    } else {
      sound.playOffendedBuzzer();
    }

    saveWorldState(world);
    updateTopHud();
    showStageScreen("screen-round-verdict");

    document.getElementById("verdict-strokes").textContent =
      `${report.strokesTotal} (Par ${report.parTotal})`;

    const badge = document.getElementById("verdict-badge");
    const narrative = document.getElementById("verdict-narrative");

    if (report.nailedSocial) {
      badge.textContent = "NAILED THE SOCIAL INTERACTION — INVITED BACK!";
      badge.className = "verdict-stamp stamp-pass";
      narrative.textContent =
        `${report.partner.name} shook your hand on the 9th green: "You're our kind of guy. Don't care what you shot on the scorecard—we're routing our accounts through you and introducing you to the next tier up."`;
      document.getElementById("verdict-cash-delta").textContent =
        `+$${report.partner.contractValue.toLocaleString()} RETAINER LOCKED`;
    } else {
      badge.textContent = "FAILED SOCIAL VIBE — NEVER INVITED BACK";
      badge.className = "verdict-stamp stamp-fail";
      narrative.textContent =
        report.partner.blacklistedReason ||
        `${report.partner.name} walked straight to his SUV without shaking hands. Doesn't matter how well you hit the ball—you didn't flatter his worldview, so you're frozen out of his circle.`;
      document.getElementById("verdict-cash-delta").textContent = "$0 (FROZEN OUT)";
    }

    document.getElementById("verdict-share-pct").textContent = `${report.stats.sharePct}% of Network`;
    document.getElementById("verdict-alienated").textContent =
      `${report.stats.offendedCount} Goflballers Won't Play With You`;

    const twistBox = document.getElementById("verdict-conspiracy-box");
    const twistText = document.getElementById("verdict-conspiracy-text");
    if (report.conspiracyFlip) {
      twistBox.classList.remove("hidden");
      twistText.textContent =
        `${report.conspiracyFlip.rumorText} Real power just flipped to: ${report.conspiracyFlip.flippedTruth}!`;
    } else {
      twistBox.classList.add("hidden");
    }

    // Automatically push updated network share to leaderboard in background
    syncScoreToLeaderboard(false);
  }

  // ---------------------------------------------------------------------------
  // 7. TEE SHEET / SOCIAL WEB ROSTER & UPGRADES & LEADERBOARD VIEWS
  // ---------------------------------------------------------------------------
  function renderNetworkRoster() {
    const conspiracy = GoflWorld.getConspiracyAtDepth(world.conspiracyDepth || 0);
    document.getElementById("network-suspect-name").textContent =
      `HEADS/TAILS TARGET: ${conspiracy.currentBelievedTop}`;
    document.getElementById("network-suspect-desc").textContent = conspiracy.rumorText;

    const listEl = document.getElementById("network-roster-list");
    listEl.innerHTML = "";

    const unlockedNodes = world.network.order
      .map((id) => world.network.nodes[id])
      .filter((n) => n.unlocked)
      .sort((a, b) => b.tier - a.tier);

    unlockedNodes.forEach((node) => {
      const tribe = GoflWorld.TRIBES[node.tribe] || GoflWorld.TRIBES.MUNI_REGULARS;
      const card = document.createElement("div");
      card.className =
        "roster-card" +
        (node.offended ? " offended" : "") +
        (node.doingBusiness ? " business" : "");

      const statusBadge = node.offended
        ? `<span style="color:#f83800">[BLACKLISTED]</span>`
        : node.doingBusiness
        ? `<span style="color:#58f898">[DOING BUSINESS: $${node.contractValue.toLocaleString()}]</span>`
        : `<span style="color:#f8b800">[PROSPECT: $${node.contractValue.toLocaleString()}]</span>`;

      card.innerHTML = `
        <div class="rc-top">
          <div class="rc-name">${node.name} <span class="tier-pill">TIER ${node.tier}</span></div>
          <div>${statusBadge}</div>
        </div>
        <div class="rc-club">${tribe.clubName} • ${node.title} • HCP ${node.handicap}</div>
        <div class="rc-bio">${node.bio}</div>
        <div class="rc-beliefs">
          BELIEF VECTOR: Theo:${node.beliefs.theology} | Pop:${node.beliefs.populism} | Class:${node.beliefs.exclusivity} | Nat:${node.beliefs.nativism}
        </div>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      if (node.offended || !node.invitedYouBack) {
        btn.className = "nes-btn nes-btn-red";
        btn.textContent = "WON'T PLAY WITH YOU (BRIBE CADDIE $8,000 TO SMOOTH OVER)";
        btn.addEventListener("click", () => {
          if (world.cash >= 8000) {
            world.cash -= 8000;
            node.offended = false;
            node.invitedYouBack = true;
            node.trust = 0.1;
            node.blacklistedReason = null;
            sound.playCashDing();
            saveWorldState(world);
            updateTopHud();
            renderNetworkRoster();
          } else {
            sound.playOffendedBuzzer();
            alert("Not enough capital ($8,000 required) to send a peace-offering gift basket.");
          }
        });
      } else {
        btn.className = "nes-btn nes-btn-green";
        btn.textContent = `PLAY 9 HOLES WITH ${node.name.toUpperCase()} »`;
        btn.addEventListener("click", () => {
          startNewNineHoleRoundWith(node.id);
        });
      }

      card.appendChild(btn);
      listEl.appendChild(card);
    });
  }

  function startNewNineHoleRoundWith(partnerId) {
    world.currentPartnerId = partnerId;
    world.currentHole = 1;
    world.roundStrokes = 0;
    world.roundPar = 0;
    world.roundAlienatedCount = 0;
    saveWorldState(world);
    setActiveNavTab("active-play");
    startPreHoleLoadingBanter();
  }

  function renderProShopUpgrades() {
    const fx = getCombinedUpgradeEffects();
    const chkAutoCaddie = document.getElementById("toggle-auto-caddie");
    const chkAutopilot = document.getElementById("toggle-cart-autopilot");

    chkAutoCaddie.disabled = !fx.unlockAutoSwing;
    chkAutoCaddie.checked = !!world.autoCaddieEnabled && fx.unlockAutoSwing;

    chkAutopilot.disabled = !fx.unlockInstantHole;
    chkAutopilot.checked = !!world.cartAutopilotEnabled && fx.unlockInstantHole;

    const listEl = document.getElementById("upgrades-list");
    listEl.innerHTML = "";

    GoflWorld.UPGRADES.forEach((u) => {
      const owned = !!(world.purchasedUpgrades && world.purchasedUpgrades[u.id]);
      const card = document.createElement("div");
      card.className = "roster-card" + (owned ? " business" : "");
      card.innerHTML = `
        <div class="rc-top">
          <div class="rc-name">${u.name}</div>
          <div style="color:${owned ? "#58f898" : "#f8b800"};font-weight:bold;">
            ${owned ? "OWNED" : "$" + u.cost.toLocaleString()}
          </div>
        </div>
        <div class="rc-bio">${u.desc}</div>
      `;

      if (!owned) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "nes-btn nes-btn-gold";
        btn.textContent = `BUY UPGRADE ($${u.cost.toLocaleString()})`;
        btn.addEventListener("click", () => {
          if (world.cash >= u.cost) {
            world.cash -= u.cost;
            world.purchasedUpgrades[u.id] = true;
            if (u.effect.unlockAutoSwing) world.autoCaddieEnabled = true;
            if (u.effect.unlockInstantHole) world.cartAutopilotEnabled = true;
            sound.playCashDing();
            saveWorldState(world);
            updateTopHud();
            renderProShopUpgrades();
          } else {
            sound.playOffendedBuzzer();
          }
        });
        card.appendChild(btn);
      }

      listEl.appendChild(card);
    });
  }

  async function renderLeaderboard() {
    const handleInput = document.getElementById("input-player-handle");
    handleInput.value = world.playerHandle || "NEW_EXEC";

    let rows = GoflWorld.DEFAULT_LEADERBOARD.slice();
    try {
      const res = await fetch("/api/leaderboard", { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          rows = data.leaderboard;
        }
      }
    } catch (e) {}

    // Ensure local player is merged into display (always below #1 100.0% Masked Top!)
    GoflWorld.computeNetworkShare(world);
    const partner = world.network.nodes[world.currentPartnerId];
    const tribe = partner ? GoflWorld.TRIBES[partner.tribe] : GoflWorld.TRIBES.MUNI_REGULARS;

    const existingIdx = rows.findIndex(
      (r) => !r.locked_top && r.handle.toUpperCase() === (world.playerHandle || "").toUpperCase()
    );
    const playerEntry = {
      handle: (world.playerHandle || "NEW_EXEC").toUpperCase(),
      club: tribe ? tribe.clubName : "Pine Rest Muni",
      share_pct: world.networkSharePct || 2.5,
      rounds: world.roundsPlayed || 0,
      tier: Math.max(1, world.highestTierCleared || 1),
      isYou: true
    };

    if (existingIdx >= 0) {
      rows[existingIdx] = Object.assign({}, rows[existingIdx], playerEntry);
    } else {
      rows.push(playerEntry);
    }

    // Sort: locked_top (#1 100.0%) always first, then descending by share_pct
    rows.sort((a, b) => {
      if (a.locked_top) return -1;
      if (b.locked_top) return 1;
      return b.share_pct - a.share_pct;
    });

    const wrap = document.getElementById("leaderboard-table-wrap");
    let html = `
      <table class="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>HANDLE</th>
            <th>CLUB / FACTION</th>
            <th>RDS</th>
            <th>NET %</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.slice(0, 25).forEach((r, idx) => {
      const cls = r.locked_top ? "lb-row-masked" : r.isYou ? "lb-row-you" : "";
      html += `
        <tr class="${cls}">
          <td>${idx + 1}</td>
          <td>${r.handle}${r.isYou ? " (YOU)" : ""}</td>
          <td>${r.club || r.note || "Muni"}</td>
          <td>${r.rounds || 0}</td>
          <td>${Number(r.share_pct).toFixed(1)}%</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }

  async function syncScoreToLeaderboard(showFeedback = true) {
    const handleInput = document.getElementById("input-player-handle");
    if (handleInput && handleInput.value.trim()) {
      world.playerHandle = handleInput.value.trim().toUpperCase().slice(0, 16);
      saveWorldState(world);
    }

    GoflWorld.computeNetworkShare(world);
    const partner = world.network.nodes[world.currentPartnerId];
    const tribe = partner ? GoflWorld.TRIBES[partner.tribe] : GoflWorld.TRIBES.MUNI_REGULARS;

    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: world.playerId,
          handle: world.playerHandle,
          club: tribe ? tribe.clubName : "Pine Rest Muni",
          share_pct: world.networkSharePct,
          rounds: world.roundsPlayed,
          tier: Math.max(1, world.highestTierCleared || 1)
        }),
        signal: AbortSignal.timeout(1500)
      });
    } catch (e) {}

    if (showFeedback) {
      sound.playCashDing();
      renderLeaderboard();
    }
  }

  // ---------------------------------------------------------------------------
  // 8. NAVIGATION & EVENT WIRING
  // ---------------------------------------------------------------------------
  function showStageScreen(screenId) {
    document.querySelectorAll(".stage-screen").forEach((el) => {
      el.classList.toggle("active", el.id === screenId);
    });
  }

  function setActiveNavTab(target) {
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-target") === target);
    });

    if (target === "active-play") {
      showStageScreen(world.activeScreenMode || "screen-loading-banter");
    } else {
      showStageScreen(target);
      if (target === "screen-network") renderNetworkRoster();
      if (target === "screen-upgrades") renderProShopUpgrades();
      if (target === "screen-leaderboard") renderLeaderboard();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const canvasEl = document.getElementById("nes-golf-canvas");
    golfCanvas = new NesGolfEngine.NesGolfCanvas(canvasEl, sound, {
      onStroke: () => {
        // Every swing in goflball also drips a small retainer dividend if you have partners!
        if (world.activeBusinessCount > 0) {
          world.cash += Math.max(10, Math.round(world.revenuePerHole * 0.15));
          updateTopHud();
        }
      },
      onHoleComplete: (res) => {
        onHoleFinished(res);
      }
    });

    // Chat form submit
    document.getElementById("chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("chat-input");
      const val = input.value;
      input.value = "";
      handlePlayerChatTurn(val, null, false);
    });

    // Step up to tee button
    document.getElementById("btn-tee-off").addEventListener("click", () => {
      sound.playChatBlip(3);
      launchHoleOnCourse();
    });

    // Instant Cart Autopilot button
    document.getElementById("btn-instant-sim-hole").addEventListener("click", () => {
      simulateInstantHole();
    });

    // Course Swing button
    document.getElementById("btn-swing").addEventListener("click", () => {
      golfCanvas.triggerAction();
    });

    // Caddie Auto-Shot button
    document.getElementById("btn-auto-caddie").addEventListener("click", () => {
      golfCanvas.autoSwingShot();
    });

    // Verdict -> Choose Next Foursome
    document.getElementById("btn-choose-next-foursome").addEventListener("click", () => {
      setActiveNavTab("screen-network");
    });

    // Mute toggle
    const btnMute = document.getElementById("btn-mute");
    btnMute.addEventListener("click", () => {
      sound.muted = !sound.muted;
      btnMute.textContent = sound.muted ? "SFX:OFF" : "SFX:ON";
    });

    // Automation checkboxes
    document.getElementById("toggle-auto-caddie").addEventListener("change", (e) => {
      world.autoCaddieEnabled = e.target.checked;
      saveWorldState(world);
    });
    document.getElementById("toggle-cart-autopilot").addEventListener("change", (e) => {
      world.cartAutopilotEnabled = e.target.checked;
      saveWorldState(world);
    });

    // Leaderboard sync
    document.getElementById("btn-sync-leaderboard").addEventListener("click", () => {
      syncScoreToLeaderboard(true);
    });

    // Bottom Navigation Tabs
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveNavTab(btn.getAttribute("data-target"));
      });
    });

    // Boot into Pre-Hole Loading Banter
    startPreHoleLoadingBanter();
  });
})();
