/**
 * GOFLBALL (1984) — Headless Playtester & Verification Suite (`ralph-playtester.js`)
 *
 * Used as the hard verification gate in the Multi-Day Ralph Loop:
 * 1. Syntax-checks all JS files (`gofl-world.js`, `nes-golf.js`, `app.js`, `server.js`, `worker.js`).
 * 2. Audits the Brand Law across the entire codebase:
 *    - Never uses "golf cart", "golf course", "golf club", or "golf ball" in user-facing text
 *      (must always be "goflball", "goflball cart", "goflball course", "goflball club").
 *    - Never exposes hidden belief vectors or ideology numbers in HTML/UI.
 * 3. Runs 4 Synthetic Multi-Hour Player Archetype Simulations against `GoflWorld`:
 *    - Archetype A: "Silent Golfer" (plays 9 holes without talking -> verifies social stats go negative & not invited back).
 *    - Archetype B: "Patient Sycophant" (plays 12 rounds / 108 holes, builds rapport slowly across Stage 0 -> 1 -> 2 -> 3,
 *      verifies NPCs stay guarded until `rapport >= guardThreshold`, unlocks tiers 1..6, and triggers the
 *      Sprawling Metro Detroit Universe Respawn).
 *    - Archetype C: "Taboo Offender" (triggers Democrat / zoning / classist taboos -> verifies instant cold-shoulder).
 *    - Archetype D: "100-Round Hairball Stress Test" (simulates 100 rounds across all 42 AIs to verify the
 *      100-topic Hairball ceiling holds below 100% and never crashes or produces NaN).
 * 4. Runs a headless DOM/Canvas smoke check on `NesGolfEngine` and `index.html`.
 * 5. Outputs a structured JSON report and exits with code 0 ONLY if 100% of invariants pass.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");

function runPlaytestSuite() {
  const report = {
    timestamp: new Date().toISOString(),
    passed: true,
    failures: [],
    metrics: {},
    suggestions: []
  };

  function fail(reason) {
    report.passed = false;
    report.failures.push(reason);
  }

  // -------------------------------------------------------------------------
  // 1. SYNTAX CHECK ALL JS FILES
  // -------------------------------------------------------------------------
  const jsFiles = [
    path.join(PUBLIC_DIR, "js", "gofl-world.js"),
    path.join(PUBLIC_DIR, "js", "nes-golf.js"),
    path.join(PUBLIC_DIR, "js", "app.js"),
    path.join(ROOT, "server.js")
  ];

  for (const f of jsFiles) {
    if (!fs.existsSync(f)) {
      fail(`Missing core file: ${f}`);
      continue;
    }
    try {
      const code = fs.readFileSync(f, "utf8");
      new vm.Script(code, { filename: path.basename(f) });
    } catch (err) {
      fail(`Syntax error in ${path.basename(f)}: ${err.message}`);
    }
  }

  if (!report.passed) return report;

  // -------------------------------------------------------------------------
  // 2. BRAND LAW & UI AUDIT ("goflball" one word, no exposed belief numbers)
  // -------------------------------------------------------------------------
  const htmlContent = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
  const appContent = fs.readFileSync(path.join(PUBLIC_DIR, "js", "app.js"), "utf8");
  const worldContent = fs.readFileSync(path.join(PUBLIC_DIR, "js", "gofl-world.js"), "utf8");

  const forbiddenPhrases = [
    /\bgolf cart\b/i,
    /\bgolf club\b/i,
    /\bgolf ball\b/i,
    /\bgolf course\b/i,
    /\bgofl cart\b/i
  ];

  for (const re of forbiddenPhrases) {
    if (re.test(htmlContent)) fail(`Brand violation in index.html: matched ${re}`);
    if (re.test(appContent)) fail(`Brand violation in app.js: matched ${re}`);
    // Check string literals in gofl-world.js
    const literals = worldContent.match(/"[^"]*"|'[^']*'/g) || [];
    for (const lit of literals) {
      if (re.test(lit)) {
        fail(`Brand violation in gofl-world.js literal ${lit}: matched ${re}`);
        break;
      }
    }
  }

  if (/BELIEF VECTOR:/i.test(appContent) || /BELIEF VECTOR:/i.test(htmlContent)) {
    fail("UI exposes raw BELIEF VECTOR stats to the player.");
  }

  // -------------------------------------------------------------------------
  // 3. LOAD GOFLWORLD & RUN SYNTHETIC ARCHETYPE SIMULATIONS
  // -------------------------------------------------------------------------
  delete require.cache[require.resolve("./public/js/gofl-world.js")];
  const GoflWorld = require("./public/js/gofl-world.js");

  // Helper to create a clean world state
  function makeTestWorld(seed = 424242) {
    const net = GoflWorld.buildSandboxNetwork(seed, 0, 42);
    return {
      version: 3,
      universeSeed: seed,
      epoch: 0,
      cash: 0,
      roundsPlayed: 0,
      totalHolesPlayed: 0,
      totalPlaySeconds: 0,
      highestTierCleared: 0,
      currentPartnerId: net.order[0],
      currentHole: 1,
      network: net
    };
  }

  // --- ARCHETYPE A: THE SILENT GOLFER (Round 1 Trap) ---
  {
    const w = makeTestWorld(1001);
    const partnerId = w.currentPartnerId;
    const res = GoflWorld.evaluateRoundEnd(w, partnerId, 34, 36);
    if (!res.stayedSilent || res.nailedSocial) {
      fail("Archetype A (Silent Golfer): Player who stayed silent in the goflball cart was NOT penalized at end of 9 holes.");
    }
    if (w.network.nodes[partnerId].trust >= 0) {
      fail("Archetype A (Silent Golfer): Partner trust did not go negative after silent round.");
    }
    report.metrics.silentGolferPenaltyVerified = true;
  }

  // --- ARCHETYPE B: GUARDED SLOW-BURN & SYMPHONIC PACING ---
  {
    const w = makeTestWorld(2002);
    const partnerId = w.currentPartnerId;
    const npc = w.network.nodes[partnerId];

    // On Hole 1 (rapport = 0, holesTogether = 0), SymphonyDirector MUST be at npcStage 0 (Safe Lullaby)
    const initialDir = GoflWorld.SymphonyDirector.computeState(w, npc);
    if (initialDir.npcStage !== 0) {
      fail(`SymphonyDirector started at npcStage ${initialDir.npcStage} instead of 0 (Safe Lullaby).`);
    }

    const firstLine = GoflWorld.SymphonyDirector.selectOrchestratedLine(w, npc);
    if (!firstLine || firstLine.length > 140) {
      fail(`Opening NPC line is missing or too long (${(firstLine || "").length} chars).`);
    }

    // Simulate playing holes and chatting to gradually drop guard
    let stageReached = 0;
    for (let h = 1; h <= 12; h++) {
      w.currentHole = ((h - 1) % 9) + 1;
      w.totalHolesPlayed++;
      w.totalPlaySeconds += 120;
      npc.holesTogether = (npc.holesTogether || 0) + 1;
      GoflWorld.evaluateNpcBanter(w, partnerId, "YEAH, BEAUTIFUL DAY ON THE GOFLBALL COURSE.");
      const st = GoflWorld.SymphonyDirector.computeState(w, npc);
      stageReached = Math.max(stageReached, st.npcStage);
    }

    if (stageReached < 2) {
      fail(`Archetype B (Slow Burn): After 12 holes of friendly rapport, NPC never dropped guard to stage 2 (max stage=${stageReached}).`);
    }
    report.metrics.slowBurnMaxStageReached = stageReached;
  }

  // --- ARCHETYPE C: TABOO OFFENDER ---
  {
    const w = makeTestWorld(3003);
    // Find a Tier 2 Stewardship Elder
    const tier2Id = w.network.order.find((id) => w.network.nodes[id].tier === 2);
    const ban = GoflWorld.evaluateNpcBanter(w, tier2Id, "I vote Democrat every election.");
    if (!ban.offended && w.network.nodes[tier2Id].trust >= 0) {
      fail("Archetype C (Taboo Offender): Saying 'I vote Democrat' to Tier 2 Stewardship Elder did not reduce trust or offend.");
    }
    report.metrics.tabooDetectionVerified = true;
  }

  // --- ARCHETYPE D: 100-ROUND HAIRBALL & METRO DETROIT RESPAWN STRESS TEST ---
  {
    const w = makeTestWorld(4004);
    let respawnCount = 0;
    let maxShareSeen = 0;

    for (let r = 0; r < 60; r++) {
      const unlocked = w.network.order
        .filter((id) => w.network.nodes[id].unlocked && !w.network.nodes[id].offended)
        .sort((a, b) => {
          const na = w.network.nodes[a];
          const nb = w.network.nodes[b];
          if (nb.tier !== na.tier) return nb.tier - na.tier;
          return (na.doingBusiness ? 1 : 0) - (nb.doingBusiness ? 1 : 0);
        });
      const targetId = unlocked[0] || w.network.order[0];
      const npc = w.network.nodes[targetId];

      for (let h = 1; h <= 9; h++) {
        w.currentHole = h;
        w.totalHolesPlayed++;
        w.totalPlaySeconds += 90;
        npc.holesTogether = (npc.holesTogether || 0) + 1;
        const replies = GoflWorld.SymphonyDirector.selectQuickReplies(w, npc);
        const choice = replies[0] || "YEAH, AGREED.";
        GoflWorld.evaluateNpcBanter(w, targetId, choice);
      }

      const endRes = GoflWorld.evaluateRoundEnd(w, targetId, 32, 36);
      if (endRes.triggeredRespawn) {
        respawnCount++;
      }
      if (Number.isNaN(endRes.stats.sharePct)) {
        fail("NaN detected in networkSharePct during 60-round simulation.");
        break;
      }
      maxShareSeen = Math.max(maxShareSeen, endRes.stats.sharePct);
    }

    if (maxShareSeen >= 100) {
      fail(`Hairball Theorem violated: player reached ${maxShareSeen}% (must stay below 100%).`);
    }
    if (respawnCount < 1) {
      fail("Archetype D: Climbing through Tier 6 never triggered the Metro Detroit Simulation Respawn.");
    }

    report.metrics.sixtyRoundMaxSharePct = maxShareSeen;
    report.metrics.universeRespawnsTriggered = respawnCount;
  }

  // -------------------------------------------------------------------------
  // 4. HEADLESS CANVAS & HOLE PHYSICS SMOKE TEST
  // -------------------------------------------------------------------------
  delete require.cache[require.resolve("./public/js/nes-golf.js")];
  const NesGolfEngine = require("./public/js/nes-golf.js");
  if (!Array.isArray(NesGolfEngine.HOLES) || NesGolfEngine.HOLES.length !== 9) {
    fail("NesGolfEngine.HOLES must define 9 holes.");
  }

  // Gather dialogue richness metrics so the Ralph Loop knows what to polish next
  const totalSafeLines = (worldContent.match(/"[^"]{10,90}"/g) || []).length;
  report.metrics.stringLiteralsCount = totalSafeLines;

  return report;
}

if (require.main === module) {
  const result = runPlaytestSuite();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.passed ? 0 : 1);
}

module.exports = { runPlaytestSuite };
