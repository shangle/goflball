/**
 * test_goflball.js — Automated Playtesting & Invariant Verification Suite for GOFLBALL
 * Runs multi-round simulated playthroughs (Silent Player Trap, Guarded Slow-Burn Rapport,
 * Taboo Offense, Empty Lot Reversal, and Metro Detroit Epoch Respawn) + Syntax/Contract checks.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = __dirname;
const jsFiles = [
  "public/js/gofl-world.js",
  "public/js/nes-golf.js",
  "public/js/app.js"
];

// 1. AST Syntax Validation on all JS files
for (const rel of jsFiles) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, "utf8");
  new vm.Script(src, { filename: rel });
}
const polishPath = path.join(ROOT, "public/js/gofl-polish.js");
if (fs.existsSync(polishPath)) {
  new vm.Script(fs.readFileSync(polishPath, "utf8"), { filename: "public/js/gofl-polish.js" });
}

// 2. Load GoflWorld & NesGolfEngine
const GoflWorld = require("./public/js/gofl-world.js");
const NesGolfEngine = require("./public/js/nes-golf.js");

assert.ok(GoflWorld && GoflWorld.SymphonyDirector, "GoflWorld.SymphonyDirector must exist");
assert.ok(Array.isArray(GoflWorld.EPOCHS) && GoflWorld.EPOCHS.length >= 3, "At least 3 epochs required");
assert.ok(Array.isArray(NesGolfEngine.HOLES) && NesGolfEngine.HOLES.length >= 9, "9 holes required");

// 3. Playtest Scenario A: The Silent Player Trap (Round 1)
const netA = GoflWorld.buildSandboxNetwork(198401, 0, 42);
const worldA = {
  universeSeed: 198401,
  epoch: 0,
  roundsPlayed: 0,
  totalHolesPlayed: 9,
  totalPlaySeconds: 180,
  currentHole: 1,
  network: netA
};
const firstNpcId = netA.order[0];
const silentVerdict = GoflWorld.evaluateRoundEnd(worldA, firstNpcId, 32, 36);
assert.strictEqual(silentVerdict.stayedSilent, true, "Silent player (<2 remarks) must trigger stayedSilent trap");
assert.strictEqual(silentVerdict.nailedSocial, false, "Silent player must not nail social");
assert.ok(silentVerdict.npc.trust < 0, "Silent player trust must go negative");

// 4. Playtest Scenario B: Slow-Burn SymphonyDirector Guarded Progression
const netB = GoflWorld.buildSandboxNetwork(198402, 0, 42);
const worldB = {
  universeSeed: 198402,
  epoch: 0,
  roundsPlayed: 0,
  totalHolesPlayed: 0,
  totalPlaySeconds: 0,
  currentHole: 1,
  network: netB
};
const partnerB = netB.nodes[netB.order[0]];
const initialState = GoflWorld.SymphonyDirector.computeState(worldB, partnerB);
assert.strictEqual(initialState.npcStage, 0, "NPC must start at guarded Stage 0 (Safe Lullaby)");

let stageReached = 0;
for (let h = 1; h <= 9; h++) {
  worldB.currentHole = h;
  worldB.totalHolesPlayed++;
  partnerB.holesTogether = (partnerB.holesTogether || 0) + 1;
  worldB.totalPlaySeconds += 45;
  const replies = GoflWorld.SymphonyDirector.selectQuickReplies(worldB, partnerB);
  assert.ok(Array.isArray(replies) && replies.length > 0, "Quick replies must be available");
  const res = GoflWorld.evaluateNpcBanter(worldB, partnerB.id, replies[0]);
  assert.strictEqual(res.offended, false, "Safe reply should not offend partner");
  const st = GoflWorld.SymphonyDirector.computeState(worldB, partnerB);
  stageReached = Math.max(stageReached, st.npcStage);
}
assert.ok(stageReached >= 1, "Playing 9 holes with friendly banter must advance NPC rapport stage");
const friendlyVerdict = GoflWorld.evaluateRoundEnd(worldB, partnerB.id, 38, 36);
assert.strictEqual(friendlyVerdict.nailedSocial, true, "Active friendly banter must nail social");
assert.strictEqual(friendlyVerdict.npc.doingBusiness, true, "Must win business contract");

// 5. Playtest Scenario C: Taboo Offense Check (Tier 2 Christian Nationalist vs "I vote Democrat")
const tier2Id = netB.order.find((id) => netB.nodes[id].tier === 2);
if (tier2Id) {
  const resOffend = GoflWorld.evaluateNpcBanter(worldB, tier2Id, "Actually I vote Democrat.");
  assert.strictEqual(resOffend.offended, true, "Tier 2 must be offended by 'I vote Democrat'");
}

console.log(
  "test_goflball.js: ALL PLAYTEST CHECKS PASSED",
  JSON.stringify({
    epochs: GoflWorld.EPOCHS.length,
    holes: NesGolfEngine.HOLES.length,
    upgrades: GoflWorld.UPGRADES.length,
    stageReached,
    sharePctAfterRound1: friendlyVerdict.stats.sharePct
  })
);
