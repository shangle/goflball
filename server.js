/**
 * GOFLBALL (1984) — Local Laptop Origin Server (`server.js`)
 *
 * - Runs on port 3849 (and via `cloudflared` tunnel for `laptop-origin.goflball.com` / `goflball.com`)
 * - Minimal correspondence with the browser:
 *   1. `/api/leaderboard`: Stores and serves the Global Hairball Network Share Leaderboard
 *      (where #1 is permanently masked at 100.0%, and starting AIs + real players compete below).
 *   2. `/api/banter`: Optional fallback bridge to local Ollama (`http://127.0.0.1:11434/api/generate`)
 *      when a player asks a novel free-text question not covered by the in-browser Jev-style mantra engine.
 *   3. Automatic atomic snapshot backups to `public/leaderboard-snapshot.json` and `backups/`.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const GoflWorld = require("./public/js/gofl-world.js");

const PORT = process.env.PORT || 3849;
const PUBLIC_DIR = path.join(__dirname, "public");
const SNAPSHOT_FILE = path.join(PUBLIC_DIR, "leaderboard-snapshot.json");
const BACKUP_DIR = path.join(__dirname, "backups");

function ensureDirs() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function readLeaderboardSnapshot() {
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
      if (parsed && Array.isArray(parsed.leaderboard)) {
        return parsed;
      }
    }
  } catch (e) {}

  const initial = {
    schema_version: "1.0.0",
    updated_at: new Date().toISOString(),
    leaderboard: GoflWorld.DEFAULT_LEADERBOARD.slice()
  };
  writeLeaderboardSnapshot(initial);
  return initial;
}

function writeLeaderboardSnapshot(data) {
  ensureDirs();
  data.updated_at = new Date().toISOString();

  // Enforce the Hairball Rule: #1 is ALWAYS the masked 100.0% entry, and no human/AI entry can exceed 99.9%
  const lockedTop = GoflWorld.DEFAULT_LEADERBOARD[0];
  const others = (data.leaderboard || [])
    .filter((r) => !r.locked_top && r.handle !== lockedTop.handle)
    .map((r) => ({
      handle: String(r.handle || "ANON_EXEC").toUpperCase().slice(0, 18),
      club: String(r.club || "Pine Rest Muni").slice(0, 36),
      share_pct: Math.min(99.9, Math.max(0, +Number(r.share_pct || 0).toFixed(1))),
      rounds: Math.max(0, parseInt(r.rounds || 0, 10)),
      tier: Math.max(1, parseInt(r.tier || 1, 10)),
      updated_at: r.updated_at || data.updated_at
    }))
    .sort((a, b) => b.share_pct - a.share_pct)
    .slice(0, 100);

  data.leaderboard = [lockedTop, ...others].map((row, idx) => ({
    ...row,
    rank: idx + 1
  }));

  const tmpFile = `${SNAPSHOT_FILE}.tmp.${crypto.randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf8");
  try {
    fs.renameSync(tmpFile, SNAPSHOT_FILE);
  } catch (e) {
    fs.copyFileSync(tmpFile, SNAPSHOT_FILE);
    fs.unlinkSync(tmpFile);
  }

  // Rolling daily backup copy in ./backups
  const dayStamp = data.updated_at.slice(0, 10);
  const backupFile = path.join(BACKUP_DIR, `leaderboard-${dayStamp}.json`);
  try {
    fs.copyFileSync(SNAPSHOT_FILE, backupFile);
  } catch (e) {}
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Goflball-Node": "LAPTOP-ORIGIN"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) req.destroy();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const pathname = url.pathname;

  // 1. Health & Origin Telemetry Probe
  if (pathname === "/ping" || pathname === "/api/telemetry") {
    return sendJson(res, 200, {
      ok: true,
      node: "LAPTOP-ORIGIN",
      header: "LAPTOP-ORIGIN",
      timestamp: new Date().toISOString()
    });
  }

  // 2. GET /api/leaderboard
  if (pathname === "/api/leaderboard" && req.method === "GET") {
    const snap = readLeaderboardSnapshot();
    return sendJson(res, 200, {
      ok: true,
      updated_at: snap.updated_at,
      leaderboard: snap.leaderboard
    });
  }

  // 3. POST /api/leaderboard (Upsert player's Hairball Network Share %)
  if (pathname === "/api/leaderboard" && req.method === "POST") {
    const body = await parseBody(req);
    const handle = String(body.handle || "").trim().toUpperCase().replace(/[^A-Z0-9_\- ]/g, "").slice(0, 16);
    if (!handle || handle.includes("REDACTED") || handle.includes("██")) {
      return sendJson(res, 400, { ok: false, error: "Valid handle required." });
    }

    const snap = readLeaderboardSnapshot();
    const sharePct = Math.min(99.9, Math.max(0, +Number(body.share_pct || 0).toFixed(1)));
    const rounds = Math.max(0, parseInt(body.rounds || 0, 10));
    const tier = Math.max(1, parseInt(body.tier || 1, 10));
    const club = String(body.club || "Pine Rest Muni").replace(/[<>]/g, "").trim().slice(0, 36);

    const idx = snap.leaderboard.findIndex(
      (r) => !r.locked_top && String(r.handle).toUpperCase() === handle
    );

    if (idx >= 0) {
      snap.leaderboard[idx] = {
        ...snap.leaderboard[idx],
        handle,
        club,
        share_pct: Math.max(snap.leaderboard[idx].share_pct || 0, sharePct),
        rounds: Math.max(snap.leaderboard[idx].rounds || 0, rounds),
        tier: Math.max(snap.leaderboard[idx].tier || 1, tier),
        updated_at: new Date().toISOString()
      };
    } else {
      snap.leaderboard.push({
        handle,
        club,
        share_pct: sharePct,
        rounds,
        tier,
        updated_at: new Date().toISOString()
      });
    }

    writeLeaderboardSnapshot(snap);
    return sendJson(res, 200, {
      ok: true,
      leaderboard: snap.leaderboard
    });
  }

  // 4. POST /api/banter (Optional Local Ollama Fallback for novel questions)
  if (pathname === "/api/banter" && req.method === "POST") {
    const body = await parseBody(req);
    const fallbackReply = body.fallbackReply || "Let's just hit the ball, bud.";
    const playerMessage = String(body.playerMessage || "").trim();

    if (!playerMessage) {
      return sendJson(res, 200, { ok: true, engine: "JEV-MANTRA", reply: fallbackReply });
    }

    // Try fast local Ollama if running on laptop, otherwise return instant Jev-style reply
    try {
      const prompt = `You are ${body.partnerName}, a West Michigan goflball course businessman (${body.partnerTitle}, Tier ${body.tier}). Speak casually like you're at a Burger King drive-thru or leaning on a goflball cart, NOT a corporate boardroom. Never mention what business the player is in. Always call the sport goflball. Your core convictions: ${(body.convictions || []).join(" ")}. Reply in 1-2 short sentences to what your goflball partner just said: "${playerMessage}"`;

      const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama3.2:latest",
          prompt,
          stream: false,
          options: { num_predict: 65, temperature: 0.75 }
        }),
        signal: AbortSignal.timeout(850)
      });

      if (ollamaRes.ok) {
        const oData = await ollamaRes.json();
        if (oData && oData.response) {
          return sendJson(res, 200, {
            ok: true,
            engine: "LOCAL-OLLAMA",
            reply: String(oData.response).trim().replace(/^["']|["']$/g, "")
          });
        }
      }
    } catch (e) {}

    return sendJson(res, 200, {
      ok: true,
      engine: "JEV-MANTRA",
      reply: fallbackReply
    });
  }

  // 5. Static File Server from ./public (path-traversal hardened)
  let decodedPath = "/";
  try {
    decodedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("400 Bad Request");
    return;
  }
  const relPath = decodedPath.replace(/^\/+/, "");
  let filePath = path.resolve(PUBLIC_DIR, relPath);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain", "X-Goflball-Node": "LAPTOP-ORIGIN" });
    res.end("403 Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "X-Goflball-Node": "LAPTOP-ORIGIN"
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA Fallback
  const indexHtml = path.join(PUBLIC_DIR, "index.html");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "X-Goflball-Node": "LAPTOP-ORIGIN"
  });
  fs.createReadStream(indexHtml).pipe(res);
});

if (require.main === module) {
  readLeaderboardSnapshot();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[GOFLBALL] Laptop Origin Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
