/**
 * GOFLBALL (1984) — Multi-Day Autonomous Ralph Loop Worker (`ralph-worker.js`)
 *
 * Designed after Geoffrey Huntley's "Ralph Wiggum Loop" architecture for local LLMs:
 *   1. Fresh Context Per Cycle: Zero context accumulation or drift across days of execution.
 *   2. Playtest-First Verification (`ralph-playtester.js`): Runs synthetic multi-hour player
 *      archetypes before and after every single mutation.
 *   3. Multi-Model Local Ollama Pipeline:
 *      - Critic / Playtest Analyst (`deepseek-r1:14b` or `phi4:latest` or `llama3.2:latest`)
 *      - Surgical Builder (`qwen2.5-coder-14b-instruct-abliterated`)
 *   4. Structured Surgical Micro-Mutations: Rather than asking a 14B model to rewrite a
 *      950-line file (which causes truncation), prompts for strict JSON micro-patches
 *      (new slow-burn dialogue lines, Metro Detroit respawn lines, feeler replies, or
 *      targeted code blocks) that are deterministically spliced and verified.
 *   5. Atomic Rollback & Auto-Commit: If `ralph-playtester.js` fails for any reason,
 *      instantly restores the exact pre-cycle file buffer. If it passes, rebuilds `./dist`,
 *      logs the cycle to `ralph-journal.jsonl` & `ralph-status.json`, and commits to git.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { runPlaytestSuite } = require("./ralph-playtester.js");

const ROOT = __dirname;
const WORLD_FILE = path.join(ROOT, "public", "js", "gofl-world.js");
const GOLF_FILE = path.join(ROOT, "public", "js", "nes-golf.js");
const STATUS_FILE = path.join(ROOT, "ralph-status.json");
const JOURNAL_FILE = path.join(ROOT, "ralph-journal.jsonl");
const LOG_FILE = path.join(ROOT, "ralph-loop.log");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const CODER_MODEL = process.env.RALPH_CODER_MODEL || "qwen2.5-coder-14b-instruct-abliterated";
const CRITIC_MODEL = process.env.RALPH_CRITIC_MODEL || "phi4:latest";

// Delay between continuous autonomous cycles (default 180 seconds so GPU stays cool over multiple days)
const CYCLE_PAUSE_MS = parseInt(process.env.RALPH_CYCLE_PAUSE_MS || "180000", 10);

function log(msg) {
  const line = `[${new Date().toISOString()}] [RALPH-LOOP] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n", "utf8");
  } catch (e) {}
}

function readStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
    }
  } catch (e) {}
  return {
    started_at: new Date().toISOString(),
    last_cycle_at: null,
    total_cycles: 0,
    accepted_mutations: 0,
    reverted_mutations: 0,
    current_task_index: 0,
    latest_metrics: {},
    recent_history: []
  };
}

function writeStatus(st) {
  st.last_cycle_at = new Date().toISOString();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(st, null, 2), "utf8");
}

function appendJournal(entry) {
  try {
    fs.appendFileSync(JOURNAL_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (e) {}
}

async function queryOllama(model, systemPrompt, userPrompt, temperature = 0.7) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false,
      options: {
        temperature,
        num_predict: 900
      }
    }),
    signal: AbortSignal.timeout(180000)
  });

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`);
  }
  const data = await res.json();
  return String(data.response || "").trim();
}

function extractJsonObject(raw) {
  // Strip <think>...</think> if present
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in LLM response");
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

function sanitizeGoflballBrand(str) {
  return String(str || "")
    .replace(/\bgofloball\b/gi, "GOFLBALL")
    .replace(/\bgofl[\s_-]+ball\b/gi, "GOFLBALL")
    .replace(/\bgolf\s*ball\b/gi, "GOFLBALL")
    .replace(/\bgolf\s*cart\b/gi, "GOFLBALL CART")
    .replace(/\bgolf\s*course\b/gi, "GOFLBALL COURSE")
    .replace(/\bgolf\s*club\b/gi, "GOFLBALL CLUB")
    .replace(/\bgofl\s*cart\b/gi, "GOFLBALL CART")
    .replace(/\bgolf\b/gi, "GOFLBALL")
    .toUpperCase()
    .replace(/["\\]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const STAGE0_SPOILER_RE = /\b(ZONING|EMPTY LOT|DEED|PARCEL|CHRISTIAN|FARMER|UNIVERSITY|DEMOCRAT|REPUBLICAN|LIBERAL|CONSERVATIVE|WOKE|BUS LINE|GATED|CONTRACT|BOARD|CABAL|MUNI GUYS|SIMULATION|ARCHITECT)\b/i;
const GARBLED_LINE_RE = /\b(GOFLOBALL|GOFLING|LACKEE|POOTHOLE|CARTERING|WHPPER|GOLF\w*)\b/i;
const INCOMPLETE_TAIL_RE = /\b(MY|THE|AND|OR|FOR|WITH|TO|AT|IN|OF|A|AN)\s*$/i;

function isValidSlowBurnLine(line, taskId, existingSource) {
  if (!line || line.length < 18 || line.length > 72) return false;
  if (!/^[A-Z0-9 .,!?':;\-\/$&]+$/.test(line)) return false;
  if (!/[.!?]$/.test(line)) return false;
  if (GARBLED_LINE_RE.test(line) || INCOMPLETE_TAIL_RE.test(line)) return false;
  if (/(.)\1\1\1/.test(line)) return false; // 4+ repeated chars
  if ((taskId === "TASK_01_SAFE_LULLABY" || taskId === "TASK_02_DETROIT_SPRAWL") && STAGE0_SPOILER_RE.test(line)) {
    return false;
  }
  if (existingSource.toUpperCase().includes(`"${line}"`)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// AUTONOMOUS POLISH TASKS (Rotated across cycles)
// ---------------------------------------------------------------------------
const POLISH_TASKS = [
  {
    id: "TASK_01_SAFE_LULLABY",
    name: "Expand Stage 0 Safe Lullaby Banter (Burger King / Goflball Cart Small Talk)",
    targetArrayAnchor: "const SAFE_LULLABY_LINES = [",
    systemPrompt: `You are designing short, blocky 1984 NES NPC lines for GOFLBALL.
Rules:
1. ALWAYS spell it "GOFLBALL" (one word: GOFLBALL CART, GOFLBALL COURSE, GOFLBALL CLUB). Never write "GOLF".
2. Stage 0 is the "Safe Lullaby" phase: mundane, warm, everyday small talk while waiting on the tee box (Burger King drive-thru lines, lukewarm coffee, lawn mowers, 5-irons, slicing into the rough, goflball cart batteries).
3. NO politics or controversy in Stage 0—this lulls the player into total safety.
4. Keep every line ALL CAPS and between 25 and 68 characters.`,
    userPrompt: `Return ONLY a JSON object with a "lines" array of 3 brand-new, hilarious, mundane 1984 NES NPC lines for SAFE_LULLABY_LINES.
Example format:
{"lines": ["WAITED 12 MINS AT BURGER KING FOR COLD FRIES.", "BATTERY ON THIS GOFLBALL CART IS DYING ALREADY.", "CHOKED DOWN ON MY 7-IRON AND STILL SLICED IT."]}`
  },
  {
    id: "TASK_02_DETROIT_SPRAWL",
    name: "Expand Metro Detroit Sprawl Respawn Banter (Big Beaver / Gratiot / 8-Mile)",
    targetArrayAnchor: "const DETROIT_SPRAWL_SAFE = [",
    systemPrompt: `You are designing short, blocky 1984 NES NPC lines for the Metro Detroit Sprawl respawn epoch in GOFLBALL.
Rules:
1. ALWAYS spell it "GOFLBALL" (one word: GOFLBALL CART, GOFLBALL COURSE). Never write "GOLF".
2. Reference sprawling Metro Detroit landmarks/vibes casually (Big Beaver Road, 8-Mile, Gratiot Coney drive-thrus, Mound Road potholes, Woodward traffic, Lake St. Clair wind, Downriver muni courses).
3. Keep every line ALL CAPS and between 25 and 68 characters.`,
    userPrompt: `Return ONLY a JSON object with a "lines" array of 3 brand-new ALL-CAPS lines for DETROIT_SPRAWL_SAFE.
Example format:
{"lines": ["CONEY DRIVE-THRU ON GRATIOT TOOK TWENTY MINUTES.", "HIT A POTHOLE ON MOUND RD IN MY GOFLBALL CART.", "TRAFFIC AT BIG BEAVER AND I-75 WAS STANDSTILL."]}`
  },
  {
    id: "TASK_03_FEELER_AND_CONSPIRACY",
    name: "Expand Subtle Feelers & Empty Lot Conspiracy Whispers",
    tierAnchor: "tier: 3,",
    targetArrayAnchor: "feelerLines: [",
    systemPrompt: `You are designing subtle, slow-burn business vetting lines for guarded AI goflballers in GOFLBALL.
Rules:
1. ALWAYS spell it "GOFLBALL" (one word: GOFLBALL CART, GOFLBALL COURSE). Never write "GOLF".
2. These are Stage 1 "Feeler" lines where a businessman subtly checks if you're "one of us" or whispers a rumor about the 40-acre Empty Lot without risking a business opportunity.
3. Never mention what specific business the player is in—only that we are in business on the goflball course.
4. Keep every line ALL CAPS and between 25 and 68 characters.`,
    userPrompt: `Return ONLY a JSON object with a "lines" array of 2 brand-new ALL-CAPS subtle feeler lines.
Example format:
{"lines": ["WE LIKE KEEPING CONTRACTS INSIDE OUR OWN CIRCLE.", "SOMEBODY JUST FILED A NEW DEED ON THAT EMPTY LOT."]}`
  },
  {
    id: "TASK_04_MASK_OFF_AND_LOT_FLIP",
    name: "Expand Stage 2 Mask-Off & Stage 3 Empty Lot Conspiracy Reversals",
    tierAnchor: "tier: 4,",
    targetArrayAnchor: "maskOffLines: [",
    systemPrompt: `You are designing short, blocky 1984 NES NPC lines for GOFLBALL once an AI businessman trusts the player enough to drop their mask in the goflball cart.
Rules:
1. ALWAYS spell it "GOFLBALL" (one word: GOFLBALL CART, GOFLBALL COURSE, GOFLBALL CLUB). Never write "GOLF".
2. These lines are spoken behind the hedge once rapport is high: blunt classism against muni players, buying the local zoning board, locking out city bus lines, or how the Christian businessmen, the Farmer, and the University Department keep flipping who owns the 40-acre Empty Lot.
3. Keep every line ALL CAPS and between 25 and 68 characters.`,
    userPrompt: `Return ONLY a JSON object with a "lines" array of 2 brand-new ALL-CAPS lines for maskOffLines.
Example format:
{"lines": ["BETWEEN US IN THIS GOFLBALL CART, MUNI GUYS ARE THE HELP.", "BOUGHT TWO SEATS ON THE ZONING BOARD FOR PENNIES."]}`
  },
  {
    id: "TASK_05_COURSE_VISUAL_SPARKLE",
    name: "Calibrate NES Course Details & Wind Flag Animation",
    customHandler: async function (status) {
      let golfCode = fs.readFileSync(GOLF_FILE, "utf8");
      if (!golfCode.includes("// [RALPH-POLISH: WIND-FLAG-FLUTTER]")) {
        const target = `ctx.fillStyle = "#f83800";\n      ctx.fillRect(pinX + 2, pinY - 16, 8, 6);`;
        const replacement = `// [RALPH-POLISH: WIND-FLAG-FLUTTER]\n      ctx.fillStyle = "#f83800";\n      const flutter = (Date.now() >> 8) & 1;\n      ctx.fillRect(pinX + 2, pinY - 16 + flutter, 8 + flutter, 6);`;
        if (golfCode.includes(target)) {
          golfCode = golfCode.replace(target, replacement);
          fs.writeFileSync(GOLF_FILE, golfCode, "utf8");
          return "Added 8-bit wind flag flutter animation to pin flagstick in nes-golf.js";
        }
      }
      if (!golfCode.includes("// [RALPH-POLISH: WATER-SHIMMER]")) {
        const target = `ctx.fillStyle = "#0058f8";\n        ctx.fillRect(\n          Math.floor(vx + w.x * vw),\n          Math.floor(vy + w.y * vh),\n          Math.floor(w.w * vw),\n          Math.floor(w.h * vh)\n        );`;
        const replacement = `// [RALPH-POLISH: WATER-SHIMMER]\n        ctx.fillStyle = "#0058f8";\n        const wx = Math.floor(vx + w.x * vw), wy = Math.floor(vy + w.y * vh), ww = Math.floor(w.w * vw), wh = Math.floor(w.h * vh);\n        ctx.fillRect(wx, wy, ww, wh);\n        ctx.fillStyle = "#fcfcfc";\n        const waveShift = ((Date.now() >> 9) & 1) * 4;\n        if (ww > 12 && wh > 10) ctx.fillRect(wx + 4 + waveShift, wy + 5, 4, 2);`;
        if (golfCode.includes(target)) {
          golfCode = golfCode.replace(target, replacement);
          fs.writeFileSync(GOLF_FILE, golfCode, "utf8");
          return "Added 8-bit water hazard wave shimmer to nes-golf.js";
        }
      }
      return null;
    }
  }
];

async function executeSingleRalphCycle() {
  const status = readStatus();
  status.total_cycles = (status.total_cycles || 0) + 1;

  // 1. Run baseline playtester before touching anything
  const preCheck = runPlaytestSuite();
  if (!preCheck.passed) {
    log(`Pre-cycle check failed (${preCheck.failures.join("; ")}). Restoring from git HEAD...`);
    try {
      execSync("git checkout -- public/js/gofl-world.js public/js/nes-golf.js public/js/app.js public/index.html", { cwd: ROOT });
    } catch (e) {}
  }

  const taskIdx = (status.current_task_index || 0) % POLISH_TASKS.length;
  const task = POLISH_TASKS[taskIdx];
  status.current_task_index = (taskIdx + 1) % POLISH_TASKS.length;

  log(`Cycle #${status.total_cycles}: Starting ${task.id} (${task.name})...`);

  const backupWorld = fs.readFileSync(WORLD_FILE, "utf8");
  const backupGolf = fs.readFileSync(GOLF_FILE, "utf8");

  let mutationSummary = null;

  try {
    if (task.customHandler) {
      mutationSummary = await task.customHandler(status);
    }

    if (!mutationSummary && task.targetArrayAnchor) {
      // Query local Qwen2.5-Coder-14B-Instruct-abliterated (or fallback to Critic model)
      let rawReply;
      try {
        rawReply = await queryOllama(CODER_MODEL, task.systemPrompt, task.userPrompt, 0.75);
      } catch (e) {
        log(`Primary coder model busy/unavailable (${e.message}), trying ${CRITIC_MODEL}...`);
        rawReply = await queryOllama(CRITIC_MODEL, task.systemPrompt, task.userPrompt, 0.75);
      }

      const parsed = extractJsonObject(rawReply);
      const rawLines = Array.isArray(parsed.lines) ? parsed.lines : [];
      const cleanLines = rawLines
        .map(sanitizeGoflballBrand)
        .filter((l) => isValidSlowBurnLine(l, task.id, backupWorld));

      if (cleanLines.length === 0) {
        throw new Error("No novel valid lines produced by local model this cycle.");
      }

      const formattedInsertion = cleanLines.map((l) => `    "${l}",`).join("\n");
      let searchFrom = 0;
      if (task.tierAnchor) {
        const tierPos = backupWorld.indexOf(task.tierAnchor);
        if (tierPos === -1) {
          throw new Error(`Tier anchor not found: ${task.tierAnchor}`);
        }
        searchFrom = tierPos;
      }
      const anchorPos = backupWorld.indexOf(task.targetArrayAnchor, searchFrom);
      if (anchorPos === -1) {
        throw new Error(`Anchor not found: ${task.targetArrayAnchor}`);
      }

      const insertAt = anchorPos + task.targetArrayAnchor.length;
      const updatedWorld =
        backupWorld.slice(0, insertAt) + "\n" + formattedInsertion + backupWorld.slice(insertAt);

      fs.writeFileSync(WORLD_FILE, updatedWorld, "utf8");
      mutationSummary = `Injected ${cleanLines.length} new slow-burn lines into ${task.id}: ${cleanLines[0]}`;
    }

    if (!mutationSummary) {
      log(`Cycle #${status.total_cycles}: No mutation required on custom handler; advancing queue.`);
      writeStatus(status);
      return;
    }

    // 2. Run Hard Verification Gate (`ralph-playtester.js`)
    const postCheck = runPlaytestSuite();
    if (!postCheck.passed) {
      throw new Error(`Playtest verification failed: ${postCheck.failures.join("; ")}`);
    }

    // 3. Rebuild static dist & commit verified improvement
    status.accepted_mutations = (status.accepted_mutations || 0) + 1;
    status.latest_metrics = postCheck.metrics;
    status.recent_history = [
      {
        cycle: status.total_cycles,
        timestamp: new Date().toISOString(),
        task: task.id,
        summary: mutationSummary,
        metrics: postCheck.metrics
      },
      ...(status.recent_history || []).slice(0, 19)
    ];

    writeStatus(status);
    appendJournal({
      cycle: status.total_cycles,
      timestamp: new Date().toISOString(),
      status: "ACCEPTED",
      task: task.id,
      summary: mutationSummary,
      metrics: postCheck.metrics
    });

    try {
      execSync("node build-static.js", { cwd: ROOT, stdio: "ignore" });
      // Commit every 5 accepted mutations so git history stays clean and backed up
      if (status.accepted_mutations % 5 === 0) {
        execSync('git add public/js/gofl-world.js public/js/nes-golf.js ralph-status.json && git commit -m "chore(ralph): autonomous local-LLM playtest & slow-burn polish"', {
          cwd: ROOT,
          stdio: "ignore"
        });
        execSync("git push", { cwd: ROOT, stdio: "ignore" });
      }
    } catch (gitErr) {}

    log(`Cycle #${status.total_cycles} ACCEPTED: ${mutationSummary}`);
  } catch (err) {
    // Atomic rollback
    fs.writeFileSync(WORLD_FILE, backupWorld, "utf8");
    fs.writeFileSync(GOLF_FILE, backupGolf, "utf8");
    status.reverted_mutations = (status.reverted_mutations || 0) + 1;
    writeStatus(status);
    appendJournal({
      cycle: status.total_cycles,
      timestamp: new Date().toISOString(),
      status: "REVERTED",
      task: task.id,
      error: err.message
    });
    log(`Cycle #${status.total_cycles} REVERTED: ${err.message}`);
  }
}

async function startContinuousDaemon() {
  log("=== STARTING MULTI-DAY GOFLBALL RALPH LOOP DAEMON ===");
  log(`Primary Coder Model: ${CODER_MODEL} | Critic Fallback: ${CRITIC_MODEL}`);
  const runOnce = process.argv.includes("--once");

  while (true) {
    await executeSingleRalphCycle();
    if (runOnce) break;
    await new Promise((r) => setTimeout(r, CYCLE_PAUSE_MS));
  }
}

if (require.main === module) {
  startContinuousDaemon().catch((e) => {
    log(`Fatal daemon error: ${e.message}`);
    process.exit(1);
  });
}

module.exports = { executeSingleRalphCycle };
