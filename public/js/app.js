/**
 * GOFLBALL (1984) — Main Client Sandbox Controller
 *
 * - The Goflball Course is always the primary screen (`#screen-play`).
 * - Before each hole tees off, a compact, accidental-feeling "LOADING HOLE..." box
 *   appears at the bottom of the course with a single 2-line whisper from your
 *   goflball cart partner.
 * - Clicking [TALK IN GOFLBALL CART] opens the hidden reply drawer; clicking [TEE OFF »]
 *   dismisses the loading box immediately and lets you swing.
 * - Uses `GoflWorld.SymphonyDirector` to pace reveals over hours of play and dozens of
 *   holes so AI goflballers never drop their guard or reveal preferences until rapport
 *   is high enough that they know you won't ruin a business deal.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "GOFLBALL_SANDBOX_V3";

  function createFreshSandbox() {
    const randomSeed = Math.floor(10000 + Math.random() * 900000);
    const net = GoflWorld.buildSandboxNetwork(randomSeed, 0, 42);
    return {
      version: 3,
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
      network: net
    };
  }

  function loadSandbox() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 3 && parsed.network && parsed.network.nodes) {
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

  // Track cumulative play seconds for SymphonyDirector macro-pacing
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

  function drawNpcAvatar(canvas, npc) {
    if (!canvas || !npc) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 28, 28);

    ctx.fillStyle = npc.hatColor || "#fcfcfc";
    ctx.fillRect(6, 3, 14, 4);
    ctx.fillRect(16, 6, 6, 2);

    ctx.fillStyle = "#f8b880";
    ctx.fillRect(7, 7, 12, 10);

    ctx.fillStyle = "#000000";
    if (npc.tier >= 3) {
      ctx.fillRect(9, 9, 8, 3);
    } else {
      ctx.fillRect(10, 10, 2, 2);
      ctx.fillRect(15, 10, 2, 2);
    }
    ctx.fillRect(11, 14, 5, 2);

    ctx.fillStyle = npc.shirtColor || "#f83800";
    ctx.fillRect(5, 17, 16, 11);
  }

  function updateHeaderAndMarquee() {
    GoflWorld.recalculateNetworkStats(world);
    document.getElementById("marquee-pct").textContent = `${(world.networkSharePct || 0).toFixed(1)}%`;
    document.getElementById("hdr-hole").textContent = String(world.currentHole);

    const rel = world.roundStrokes - world.roundPar;
    document.getElementById("hdr-score").textContent =
      rel === 0 ? "E" : rel > 0 ? `+${rel}` : String(rel);

    const nav = document.getElementById("unlocked-nav");
    if (isRestrictedNeutralMode()) {
      nav.classList.add("hidden");
    } else {
      nav.classList.remove("hidden");
    }
  }

  // ---------------------------------------------------------------------------
  // 1. PREPARE HOLE ON COURSE + SHOW SUBTLE TEE-BOX LOADING WHISPER
  // ---------------------------------------------------------------------------
  function setupHoleAndLoadingWhisper() {
    const npc = world.network.nodes[world.currentPartnerId] || world.network.nodes[world.network.order[0]];
    const fx = getActiveUpgradeEffects();
    const epochCfg = GoflWorld.getEpochConfig(world.epoch || 0);

    if (fx.passiveRapport && !npc.offended) {
      npc.rapport = Math.min(1.0, +(npc.rapport + fx.passiveRapport).toFixed(3));
    }

    updateHeaderAndMarquee();
    switchScreen("screen-play");

    // Set up the underlying 1984 Goflball Course immediately so it's visible behind the loading strip
    golfCanvas.setUpgrades(fx, epochCfg.windMultiplier);
    golfCanvas.setPartnerVisuals(npc);
    golfCanvas.resetHole(world.currentHole);

    const btnCaddie = document.getElementById("btn-caddie-shot");
    if (!isRestrictedNeutralMode() && fx.unlockAutoSwing) {
      btnCaddie.classList.remove("hidden");
    } else {
      btnCaddie.classList.add("hidden");
    }

    // Show the compact tee-box loading overlay at the bottom of the course
    const overlay = document.getElementById("tee-loading-overlay");
    overlay.classList.remove("hidden");

    const drawer = document.getElementById("cart-reply-drawer");
    drawer.classList.remove("open");

    document.getElementById("load-hole-num").textContent = String(world.currentHole);
    document.getElementById("load-course-name").textContent = npc.courseName || "PINE VALLEY MUNI";
    document.getElementById("loading-bar-fill").style.width = "100%";

    drawNpcAvatar(document.getElementById("npc-avatar-canvas"), npc);
    document.getElementById("chat-npc-name").textContent = `${npc.name.toUpperCase()} (GOFLBALL CART)`;

    // Ask SymphonyDirector for the exact orchestrated line based on rapport & slow-burn stage
    const line = GoflWorld.SymphonyDirector.selectOrchestratedLine(world, npc);
    document.getElementById("crt-latest-line").textContent = `"${line}"`;

    renderQuickReplies(npc);

    const btnAutoHole = document.getElementById("btn-autopilot-hole");
    if (!isRestrictedNeutralMode() && fx.unlockCartAutopilot) {
      btnAutoHole.classList.remove("hidden");
    } else {
      btnAutoHole.classList.add("hidden");
    }

    saveSandbox(world);
  }

  function renderQuickReplies(npc) {
    const box = document.getElementById("crt-quick-replies");
    box.innerHTML = "";
    if (!npc || npc.offended) return;

    const replies = GoflWorld.SymphonyDirector.selectQuickReplies(world, npc);
    replies.forEach((q) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "crt-quip-btn";
      btn.textContent = `> ${q}`;
      btn.addEventListener("click", () => {
        submitPlayerChat(q);
      });
      box.appendChild(btn);
    });
  }

  function submitPlayerChat(rawText) {
    const text = String(rawText || "").trim();
    if (!text) return;

    const npc = world.network.nodes[world.currentPartnerId];
    if (!npc) return;

    sound.playChatBlip(1);
    const res = GoflWorld.evaluateNpcBanter(world, npc.id, text);

    setTimeout(() => {
      document.getElementById("crt-latest-line").textContent = `"${res.reply}"`;
      if (res.offended) {
        sound.playOffendedBuzzer();
      } else {
        sound.playChatBlip(-1);
      }
      renderQuickReplies(npc);
      updateHeaderAndMarquee();
      saveSandbox(world);
    }, 140);
  }

  function dismissLoadingAndTeeOff() {
    const overlay = document.getElementById("tee-loading-overlay");
    overlay.classList.add("hidden");
    sound.playChatBlip(2);
  }

  function autoPlayHoleFromCart() {
    const holeIdx = (world.currentHole - 1) % NesGolfEngine.HOLES.length;
    const h = NesGolfEngine.HOLES[holeIdx];
    sound.playCashDing();
    handleHoleCompleted({
      hole: world.currentHole,
      par: h.par,
      strokes: Math.max(1, h.par - 1)
    });
  }

  function handleHoleCompleted(result) {
    world.roundStrokes += result.strokes;
    world.roundPar += result.par;
    world.totalHolesPlayed = (world.totalHolesPlayed || 0) + 1;

    const npc = world.network.nodes[world.currentPartnerId];
    if (npc) {
      npc.holesTogether = (npc.holesTogether || 0) + 1;
    }

    updateHeaderAndMarquee();

    if (world.currentHole < 9) {
      world.currentHole += 1;
      saveSandbox(world);
      setupHoleAndLoadingWhisper();
    } else {
      showNineHoleVerdict();
    }
  }

  // ---------------------------------------------------------------------------
  // 2. END OF 9 HOLES SCORECARD & THE SLOW-BURN REVEAL
  // ---------------------------------------------------------------------------
  function showNineHoleVerdict() {
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

    document.getElementById("verdict-strokes").textContent = `${report.strokes} (PAR ${report.par})`;

    const stamp = document.getElementById("verdict-stamp");
    const msg = document.getElementById("verdict-message");
    const socialStat = document.getElementById("verdict-social-stat");

    if (report.stayedSilent) {
      stamp.textContent = "NOT INVITED BACK";
      stamp.className = "vf-stamp stamp-bad";
      socialStat.textContent = "NEGATIVE (SILENT IN CART)";
      msg.textContent =
        `YOU PLAYED 9 HOLES OF GOFLBALL AND BARELY SPOKE A WORD IN THE GOFLBALL CART. ${report.npc.name} TOLD THE CLUBHOUSE YOU'RE NO FUN TO DO BUSINESS WITH. YOUR SOCIAL STATS WENT NEGATIVE.`;
    } else if (report.nailedSocial) {
      stamp.textContent = "INVITED BACK";
      stamp.className = "vf-stamp stamp-good";
      socialStat.textContent = `GOOD GRACES (+${report.stats.friends} IN NETWORK)`;
      msg.textContent =
        `${report.npc.name} ENJOYED RIDING IN THE GOFLBALL CART WITH YOU. PLAY MORE ROUNDS TOGETHER TO EARN HIS FULL TRUST—OR MEET HIS FRIENDS ON THE TEE SHEET.`;
    } else {
      stamp.textContent = "NOT INVITED BACK";
      stamp.className = "vf-stamp stamp-bad";
      socialStat.textContent = "OFFENDED";
      msg.textContent =
        `YOU RUBBED ${report.npc.name} THE WRONG WAY IN THE GOFLBALL CART. SCORE DOESN'T MATTER—YOU LOST THE ACCOUNT.`;
    }

    document.getElementById("verdict-cash").textContent = `$${(world.cash || 0).toLocaleString()}`;
    document.getElementById("verdict-net-pct").textContent = `${report.stats.sharePct}%`;

    const respawnBox = document.getElementById("verdict-respawn-box");
    if (report.triggeredRespawn && report.newEpochConfig) {
      respawnBox.classList.remove("hidden");
      respawnBox.textContent =
        `SUBSTRATE RESET: THE EMPTY LOT FLIPPED. UNIVERSE RESPAWNED INTO ${report.newEpochConfig.name} (${report.newEpochConfig.lotName}).`;
    } else {
      respawnBox.classList.add("hidden");
    }

    syncLeaderboardSilent();
  }

  // ---------------------------------------------------------------------------
  // 3. TEE SHEET (FRIENDS & FRIENDS OF FRIENDS), PRO SHOP, LEADERBOARD
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

      // Never expose hidden ideology numbers; only show natural clubhouse status
      let bondLabel = "ACQUAINTANCE";
      if (npc.offended) bondLabel = "WONT PLAY WITH YOU";
      else if (npc.rapport >= npc.guardThreshold) bondLabel = "INNER CIRCLE (CONFIDANT)";
      else if (npc.doingBusiness) bondLabel = "DOING BUSINESS";
      else if (npc.trust < 0) bondLabel = "COLD";

      card.innerHTML = `
        <div class="bc-title">
          <span>${npc.name}</span>
          <span>${npc.role}</span>
        </div>
        <div class="bc-sub">${npc.courseName}</div>
        <div class="bc-status">${bondLabel} • ACCOUNT: $${npc.contractValue.toLocaleString()}</div>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      if (npc.offended || (!npc.invitedBack && npc.trust < -0.2)) {
        btn.className = "crt-btn crt-btn-red";
        btn.textContent = world.cash >= 2000 ? "SEND $2,000 GIFT TO APOLOGIZE" : "APOLOGIZE AT CLUBHOUSE";
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
    const npc = world.network.nodes[partnerId];
    if (npc) npc.talkedHoles = 0;
    saveSandbox(world);
    activateTab("screen-play");
    setupHoleAndLoadingWhisper();
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

  async function renderRanksScreen() {
    const input = document.getElementById("input-handle");
    input.value = world.playerHandle || "PLAYER_1";

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
            <th>RDS</th>
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
    if (tabTarget === "screen-ranks") renderRanksScreen();
  }

  window.addEventListener("DOMContentLoaded", () => {
    const canvasEl = document.getElementById("nes-golf-canvas");
    golfCanvas = new NesGolfEngine.NesGolfCanvas(canvasEl, sound, {
      onHoleComplete: (res) => handleHoleCompleted(res)
    });

    // Toggle the subtle reply drawer inside the tee-box loading overlay
    document.getElementById("btn-toggle-talk").addEventListener("click", () => {
      const drawer = document.getElementById("cart-reply-drawer");
      drawer.classList.toggle("open");
      sound.playChatBlip(0);
    });

    // Dismiss loading overlay and play the hole on the course
    document.getElementById("btn-play-hole").addEventListener("click", () => {
      dismissLoadingAndTeeOff();
    });

    // If player taps the canvas while loading overlay is up, also dismiss overlay so golf feels effortless
    canvasEl.addEventListener("pointerdown", () => {
      const overlay = document.getElementById("tee-loading-overlay");
      if (!overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden");
      }
    });

    document.getElementById("crt-chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = document.getElementById("crt-chat-input");
      const v = inp.value;
      inp.value = "";
      submitPlayerChat(v);
    });

    document.getElementById("btn-autopilot-hole").addEventListener("click", () => {
      autoPlayHoleFromCart();
    });

    document.getElementById("btn-swing").addEventListener("click", () => {
      const overlay = document.getElementById("tee-loading-overlay");
      if (!overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden");
      }
      golfCanvas.triggerAction();
    });

    document.getElementById("btn-caddie-shot").addEventListener("click", () => {
      const overlay = document.getElementById("tee-loading-overlay");
      if (!overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden");
      }
      golfCanvas.autoSwingShot();
    });

    document.getElementById("btn-to-clubhouse").addEventListener("click", () => {
      activateTab("screen-network");
    });

    document.getElementById("btn-sfx").addEventListener("click", (e) => {
      sound.muted = !sound.muted;
      e.target.textContent = sound.muted ? "MUTE" : "SFX";
    });

    document.getElementById("btn-post-rank").addEventListener("click", async () => {
      await syncLeaderboardSilent();
      sound.playCashDing();
      renderRanksScreen();
    });

    document.querySelectorAll(".u-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activateTab(btn.getAttribute("data-screen"));
      });
    });

    setupHoleAndLoadingWhisper();
  });
})();
