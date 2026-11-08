/**
 * GOFLBALL (1984) — Main Client Sandbox Controller
 *
 * - Starts in a completely simplified, restricted 1984 goflball mode whenever the player
 *   is in their neutral starting state (0 rounds played, or no friends/enemies yet).
 * - Only AFTER finishing at least 1 round of 9 holes does the player discover the real game:
 *   if they didn't talk in the goflball cart between holes, almost all their social stats go
 *   negative and they aren't invited back!
 * - Once Round 1 is completed, the bottom navigation bar unlocks:
 *   [GOFLBALL] | [NETWORK] | [LEVEL UP] | [100% BOARD]
 */

(function () {
  "use strict";

  const STORAGE_KEY = "GOFLBALL_SANDBOX_V2";

  function createFreshSandbox() {
    const randomSeed = Math.floor(10000 + Math.random() * 900000);
    const net = GoflWorld.buildSandboxNetwork(randomSeed, 0, 42);
    return {
      version: 2,
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
      highestTierCleared: 0,
      purchasedUpgrades: {},
      currentPartnerId: net.order[0],
      currentHole: 1,
      roundStrokes: 0,
      roundPar: 0,
      activeRoundScreen: "screen-loading-chat",
      network: net
    };
  }

  function loadSandbox() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2 && parsed.network && parsed.network.nodes) {
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

  // Check if the player is still in the simplified/restricted starting state
  function isRestrictedNeutralMode() {
    return (world.roundsPlayed || 0) < 1 && (world.friendsCount || 0) === 0 && (world.enemiesCount || 0) === 0;
  }

  function getActiveUpgradeEffects() {
    const fx = {
      gimmeBoost: 0,
      windResist: 0,
      unlockAutoSwing: false,
      unlockCartAutopilot: false,
      passiveTrust: 0
    };
    for (const u of GoflWorld.UPGRADES) {
      if (world.purchasedUpgrades && world.purchasedUpgrades[u.id]) {
        if (u.effect.gimmeBoost) fx.gimmeBoost += u.effect.gimmeBoost;
        if (u.effect.windResist) fx.windResist = Math.max(fx.windResist, u.effect.windResist);
        if (u.effect.unlockAutoSwing) fx.unlockAutoSwing = true;
        if (u.effect.unlockCartAutopilot) fx.unlockCartAutopilot = true;
        if (u.effect.passiveTrust) fx.passiveTrust += u.effect.passiveTrust;
      }
    }
    return fx;
  }

  // Draw chunky 32x32 8-bit NPC portrait
  function drawNpcAvatar(canvas, npc) {
    if (!canvas || !npc) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 32, 32);

    // Hat
    ctx.fillStyle = npc.hatColor || "#fcfcfc";
    ctx.fillRect(8, 4, 14, 5);
    ctx.fillRect(18, 7, 8, 2);

    // Face
    ctx.fillStyle = "#f8b880";
    ctx.fillRect(9, 9, 12, 11);

    // Eyes / Shades
    ctx.fillStyle = "#000000";
    if (npc.tier >= 3) {
      ctx.fillRect(11, 11, 9, 3);
    } else {
      ctx.fillRect(12, 12, 2, 2);
      ctx.fillRect(17, 12, 2, 2);
    }
    ctx.fillRect(13, 17, 6, 2);

    // Shirt
    ctx.fillStyle = npc.shirtColor || "#f83800";
    ctx.fillRect(6, 20, 18, 12);
  }

  function updateHeaderAndBanner() {
    GoflWorld.recalculateNetworkStats(world);
    document.getElementById("banner-your-pct").textContent = `${(world.networkSharePct || 0).toFixed(1)}%`;
    document.getElementById("hdr-hole").textContent = String(world.currentHole);

    const rel = world.roundStrokes - world.roundPar;
    document.getElementById("hdr-score").textContent =
      rel === 0 ? "E" : rel > 0 ? `+${rel}` : String(rel);

    // Hide or reveal the deeper game navigation based on Restricted Neutral Mode
    const nav = document.getElementById("unlocked-nav");
    if (isRestrictedNeutralMode()) {
      nav.classList.add("hidden");
    } else {
      nav.classList.remove("hidden");
    }
  }

  // ---------------------------------------------------------------------------
  // 1. PRE-HOLE "LOADING" GOFLBALL CART CHAT
  // ---------------------------------------------------------------------------
  function showLoadingChatScreen() {
    world.activeRoundScreen = "screen-loading-chat";
    const npc = world.network.nodes[world.currentPartnerId] || world.network.nodes[world.network.order[0]];
    const fx = getActiveUpgradeEffects();

    if (fx.passiveTrust && !npc.offended) {
      npc.trust = Math.min(1.0, +(npc.trust + fx.passiveTrust / 9).toFixed(3));
    }

    updateHeaderAndBanner();
    switchScreen("screen-loading-chat");

    document.getElementById("load-hole-num").textContent = String(world.currentHole);
    document.getElementById("loading-bar-fill").style.width = `${Math.min(95, 25 + world.currentHole * 8)}%`;
    document.getElementById("load-course-name").textContent = npc.courseName || "PINE MUNI GOFLBALL COURSE";
    document.getElementById("chat-npc-name").textContent = npc.name.toUpperCase();

    drawNpcAvatar(document.getElementById("npc-avatar-canvas"), npc);

    const logEl = document.getElementById("crt-chat-log");
    logEl.innerHTML = "";

    let npcLine = "";
    if (npc.offended) {
      npcLine = npc.walkOffLine;
    } else if (world.currentHole % 2 === 0) {
      npcLine = npc.probes[(world.currentHole >> 1) % npc.probes.length];
    } else {
      npcLine = npc.lines[(world.currentHole - 1) % npc.lines.length];
    }

    appendChatLine("npc", `${npc.shortName}: "${npcLine}"`);
    renderQuickReplies(npc);

    // Only show Goflball Cart Autopilot button if unlocked (never before Round 1!)
    const btnAutoHole = document.getElementById("btn-autopilot-hole");
    if (!isRestrictedNeutralMode() && fx.unlockCartAutopilot) {
      btnAutoHole.classList.remove("hidden");
    } else {
      btnAutoHole.classList.add("hidden");
    }

    saveSandbox(world);
  }

  function appendChatLine(type, text) {
    const logEl = document.getElementById("crt-chat-log");
    const div = document.createElement("div");
    div.className = `crt-line ${type}`;
    div.textContent = text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function renderQuickReplies(npc) {
    const box = document.getElementById("crt-quick-replies");
    box.innerHTML = "";
    if (npc.offended) return;

    (npc.quickReplies || []).forEach((q) => {
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

    appendChatLine("you", `YOU: "${text.toUpperCase()}"`);
    sound.playChatBlip(1);

    const res = GoflWorld.evaluateNpcBanter(world, npc.id, text);
    setTimeout(() => {
      appendChatLine(res.offended ? "alert" : "npc", `${npc.shortName}: "${res.reply}"`);
      if (res.offended) {
        sound.playOffendedBuzzer();
      } else {
        sound.playChatBlip(-1);
      }
      document.getElementById("loading-bar-fill").style.width = "100%";
      updateHeaderAndBanner();
      saveSandbox(world);
    }, 160);
  }

  // ---------------------------------------------------------------------------
  // 2. STEPPING ONTO THE GOFLBALL COURSE
  // ---------------------------------------------------------------------------
  function startCourseHole() {
    const npc = world.network.nodes[world.currentPartnerId];
    const fx = getActiveUpgradeEffects();
    const epochCfg = GoflWorld.getEpochConfig(world.epoch || 0);

    world.activeRoundScreen = "screen-course";
    switchScreen("screen-course");

    golfCanvas.setUpgrades(fx, epochCfg.windMultiplier);
    golfCanvas.setPartnerVisuals(npc);
    golfCanvas.resetHole(world.currentHole);

    const btnCaddie = document.getElementById("btn-caddie-shot");
    if (!isRestrictedNeutralMode() && fx.unlockAutoSwing) {
      btnCaddie.classList.remove("hidden");
    } else {
      btnCaddie.classList.add("hidden");
    }
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
    updateHeaderAndBanner();

    if (world.currentHole < 9) {
      world.currentHole += 1;
      saveSandbox(world);
      showLoadingChatScreen();
    } else {
      showNineHoleVerdict();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. END OF 9 HOLES VERDICT (WHERE THE REAL GAME IS REVEALED)
  // ---------------------------------------------------------------------------
  function showNineHoleVerdict() {
    world.activeRoundScreen = "screen-verdict";
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
    updateHeaderAndBanner();
    switchScreen("screen-verdict");

    document.getElementById("verdict-strokes").textContent = `${report.strokes} (PAR ${report.par})`;

    const stamp = document.getElementById("verdict-stamp");
    const msg = document.getElementById("verdict-message");
    const socialStat = document.getElementById("verdict-social-stat");

    if (report.stayedSilent) {
      stamp.textContent = "NOT INVITED BACK";
      stamp.className = "vf-stamp stamp-bad";
      socialStat.textContent = `ALL NEGATIVE (-${report.silentPenaltyCount} PLAYERS)`;
      msg.textContent =
        `YOU JUST PLAYED GOFLBALL AND BARELY SAID A WORD IN THE GOFLBALL CART! ${report.npc.name} TOLD THE WHOLE CLUBHOUSE YOU'RE A COLD FISH. ALMOST ALL YOUR SOCIAL STATS WENT NEGATIVE.`;
    } else if (report.nailedSocial) {
      stamp.textContent = "INVITED BACK! NEW BUSINESS!";
      stamp.className = "vf-stamp stamp-good";
      socialStat.textContent = `POSITIVE (+${report.stats.friends} PARTNERS)`;
      msg.textContent =
        `${report.npc.name} LOVED YOUR BANTER IN THE GOFLBALL CART! YOU SECURED A $${report.npc.contractValue.toLocaleString()} RETAINER AND UNLOCKED HIS FRIENDS IN THE NETWORK.`;
    } else {
      stamp.textContent = "NOT INVITED BACK";
      stamp.className = "vf-stamp stamp-bad";
      socialStat.textContent = `NEGATIVE (${report.stats.negativeCount} AGAINST YOU)`;
      msg.textContent =
        `YOU OFFENDED ${report.npc.name} ON THE GOFLBALL COURSE. YOUR SCORE DOESN'T MATTER—HE WILL NEVER PLAY GOFLBALL WITH YOU AGAIN.`;
    }

    document.getElementById("verdict-cash").textContent = `$${(world.cash || 0).toLocaleString()}`;
    document.getElementById("verdict-net-pct").textContent =
      `${report.stats.sharePct}% (TARGET: 100.0%)`;

    const respawnBox = document.getElementById("verdict-respawn-box");
    if (report.triggeredRespawn && report.newEpochConfig) {
      respawnBox.classList.remove("hidden");
      respawnBox.textContent =
        `SIMULATION THEORY BREACHED! THE EMPTY LOT FLIPPED THE SUBSTRATE. UNIVERSE RESPAWNED INTO: ${report.newEpochConfig.name} (${report.newEpochConfig.lotName})!`;
    } else {
      respawnBox.classList.add("hidden");
    }

    syncLeaderboardSilent();
  }

  // ---------------------------------------------------------------------------
  // 4. UNLOCKED SCREENS: NETWORK (FRIENDS & FRIENDS OF FRIENDS), UPGRADES, RANKS
  // ---------------------------------------------------------------------------
  function renderNetworkScreen() {
    const epochCfg = GoflWorld.getEpochConfig(world.epoch || 0);
    document.getElementById("epoch-banner").textContent =
      `${epochCfg.name} • TARGET: ${epochCfg.lotName}`;

    const listEl = document.getElementById("network-list");
    listEl.innerHTML = "";

    // Show unlocked nodes (your starting contacts, friends, and friends of friends)
    const visible = world.network.order
      .map((id) => world.network.nodes[id])
      .filter((n) => n.unlocked)
      .sort((a, b) => b.tier - a.tier);

    visible.forEach((npc) => {
      const isNeg = npc.offended || npc.trust < 0;
      const card = document.createElement("div");
      card.className =
        "blocky-card" + (npc.doingBusiness ? " friend" : isNeg ? " negative" : "");

      const relationTag = npc.doingBusiness
        ? "FRIEND (DOING BUSINESS)"
        : npc.offended
        ? "ENEMY (WON'T PLAY)"
        : npc.trust < 0
        ? "NEGATIVE VIBE"
        : "FRIEND OF FRIEND";

      card.innerHTML = `
        <div class="bc-title">
          <span>${npc.name}</span>
          <span>TIER ${npc.tier}</span>
        </div>
        <div class="bc-sub">${npc.courseName} • ${npc.role}</div>
        <div class="bc-status">STATUS: ${relationTag} • DEAL: $${npc.contractValue.toLocaleString()}</div>
      `;

      const btn = document.createElement("button");
      btn.type = "button";
      if (npc.offended || (!npc.invitedBack && npc.trust < -0.2)) {
        btn.className = "crt-btn crt-btn-red";
        btn.textContent = "SEND $2,000 GIFT TO PLAY AGAIN";
        btn.addEventListener("click", () => {
          if (world.cash >= 2000) {
            world.cash -= 2000;
            npc.offended = false;
            npc.invitedBack = true;
            npc.trust = 0;
            sound.playCashDing();
            saveSandbox(world);
            renderNetworkScreen();
          } else {
            // If broke on Round 1, allow a free apology grovel so player is never soft-locked!
            npc.offended = false;
            npc.invitedBack = true;
            npc.trust = 0;
            sound.playChatBlip(0);
            saveSandbox(world);
            renderNetworkScreen();
          }
        });
      } else {
        btn.className = "crt-btn crt-btn-green";
        btn.textContent = `PLAY 9 HOLES IN GOFLBALL CART »`;
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
    activateTab("active-round");
    showLoadingChatScreen();
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
            updateHeaderAndBanner();
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
      club: npc ? npc.courseName : "PINE MUNI COURSE",
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
            <th>NETWORK</th>
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
      world.playerHandle = input.value.trim().toUpperCase().slice(0, 14);
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
          club: npc ? npc.courseName : "PINE MUNI COURSE",
          share_pct: world.networkSharePct,
          rounds: world.roundsPlayed,
          tier: Math.max(1, world.highestTierCleared || 1)
        }),
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 5. SCREEN NAVIGATION & BOOT
  // ---------------------------------------------------------------------------
  function switchScreen(id) {
    document.querySelectorAll(".crt-screen").forEach((s) => {
      s.classList.toggle("active", s.id === id);
    });
  }

  function activateTab(tabTarget) {
    document.querySelectorAll(".u-tab").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-screen") === tabTarget);
    });

    if (tabTarget === "active-round") {
      switchScreen(world.activeRoundScreen || "screen-loading-chat");
    } else {
      switchScreen(tabTarget);
      if (tabTarget === "screen-network") renderNetworkScreen();
      if (tabTarget === "screen-upgrades") renderUpgradesScreen();
      if (tabTarget === "screen-ranks") renderRanksScreen();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    const canvasEl = document.getElementById("nes-golf-canvas");
    golfCanvas = new NesGolfEngine.NesGolfCanvas(canvasEl, sound, {
      onHoleComplete: (res) => handleHoleCompleted(res)
    });

    document.getElementById("crt-chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = document.getElementById("crt-chat-input");
      const v = inp.value;
      inp.value = "";
      submitPlayerChat(v);
    });

    document.getElementById("btn-play-hole").addEventListener("click", () => {
      sound.playChatBlip(2);
      startCourseHole();
    });

    document.getElementById("btn-autopilot-hole").addEventListener("click", () => {
      autoPlayHoleFromCart();
    });

    document.getElementById("btn-swing").addEventListener("click", () => {
      golfCanvas.triggerAction();
    });

    document.getElementById("btn-caddie-shot").addEventListener("click", () => {
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

    showLoadingChatScreen();
  });
})();
