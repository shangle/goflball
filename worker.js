/**
 * GOFLBALL (1984) — Cloudflare Edge Failover Router + D1 Leaderboard + Workers AI Fallback (`worker.js`)
 *
 * Mirrors the sovereign architecture from `oism.institute`:
 * 1. Probes `LAPTOP_TUNNEL_URL` (`https://laptop-origin.goflball.com`) with a 1500ms timeout.
 * 2. When the laptop is online, proxies `/api/*` and static traffic to the laptop origin.
 * 3. The instant the laptop sleeps or disconnects, fails over in 0ms to Cloudflare Edge D1 /
 *    Static Assets (`env.ASSETS`) or the GitHub Pages mirror (`https://shangle.github.io/goflball`).
 */

const DEFAULT_LEADERBOARD = [
  {
    rank: 1,
    handle: "████████ [REDACTED]",
    club: "THE OTHER SIDE",
    share_pct: 100.0,
    rounds: 999,
    tier: 99,
    locked_top: true
  },
  { rank: 2, handle: "VEX_STORN88", club: "REGENTS SANCTUARY", share_pct: 19.2, rounds: 134, tier: 5 },
  { rank: 3, handle: "BRAM_GALT14", club: "BLUFF RESERVE", share_pct: 18.4, rounds: 112, tier: 4 },
  { rank: 4, handle: "TOV_TRASK49", club: "BLACK DIRT CLUB", share_pct: 16.8, rounds: 91, tier: 3 },
  { rank: 5, handle: "KIP_KOVEL77", club: "STEWARDSHIP LINKS", share_pct: 15.5, rounds: 78, tier: 2 },
  { rank: 6, handle: "ZAN_PELL21", club: "STEWARDSHIP LINKS", share_pct: 14.1, rounds: 64, tier: 2 },
  { rank: 7, handle: "HAL_MORNS33", club: "PINE MUNI COURSE", share_pct: 11.6, rounds: 42, tier: 1 },
  { rank: 8, handle: "DEX_BREN19", club: "PINE MUNI COURSE", share_pct: 9.4, rounds: 31, tier: 1 }
];

function jsonResponse(payload, status = 200, nodeHeader = "EDGE-REPLICA") {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Goflball-Node": nodeHeader
    }
  });
}

async function handleEdgeApi(request, env) {
  if (request.method === "OPTIONS") {
    return jsonResponse({}, 204);
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Try Laptop Origin First for API calls (so laptop leaderboard stays primary when open)
  if (env.LAPTOP_TUNNEL_URL && !request.headers.get("X-Goflball-Probe")) {
    try {
      const laptopApiUrl = new URL(url.pathname + url.search, env.LAPTOP_TUNNEL_URL);
      const probeReq = new Request(laptopApiUrl, request);
      probeReq.headers.set("X-Goflball-Probe", "1");
      const res = await fetch(probeReq, { signal: AbortSignal.timeout(1400) });
      if (res.ok && res.headers.get("X-Goflball-Node") === "LAPTOP-ORIGIN") {
        return res;
      }
    } catch (e) {}
  }

  // 2. Edge Failover: GET /api/leaderboard
  if (pathname === "/api/leaderboard" && request.method === "GET") {
    if (env.DB) {
      try {
        const { results } = await env.DB.prepare(
          "SELECT handle, club, share_pct, rounds, tier FROM leaderboard ORDER BY share_pct DESC LIMIT 50"
        ).all();
        if (results && results.length > 0) {
          const merged = [DEFAULT_LEADERBOARD[0], ...results].map((r, i) => ({ ...r, rank: i + 1 }));
          return jsonResponse({ ok: true, leaderboard: merged }, 200, "EDGE-D1-FAILOVER");
        }
      } catch (e) {}
    }

    if (env.ASSETS) {
      try {
        const snap = await env.ASSETS.fetch(new URL("/leaderboard-snapshot.json", request.url));
        if (snap.ok) {
          const data = await snap.json();
          return jsonResponse({ ok: true, leaderboard: data.leaderboard || DEFAULT_LEADERBOARD }, 200, "EDGE-SNAPSHOT-FAILOVER");
        }
      } catch (e) {}
    }

    return jsonResponse({ ok: true, leaderboard: DEFAULT_LEADERBOARD }, 200, "EDGE-DEFAULT-FAILOVER");
  }

  // 3. Edge Failover: POST /api/leaderboard
  if (pathname === "/api/leaderboard" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const handle = String(body.handle || "EXEC").trim().toUpperCase().slice(0, 16);
    const club = String(body.club || "Pine Rest Muni").slice(0, 36);
    const sharePct = Math.min(99.9, Math.max(0, +Number(body.share_pct || 0).toFixed(1)));
    const rounds = Math.max(0, parseInt(body.rounds || 0, 10));
    const tier = Math.max(1, parseInt(body.tier || 1, 10));

    let leaderboardOut = DEFAULT_LEADERBOARD;
    if (env.DB && handle && !handle.includes("REDACTED") && !handle.includes("██")) {
      try {
        await env.DB.prepare(
          `INSERT INTO leaderboard (handle, club, share_pct, rounds, tier, updated_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(handle) DO UPDATE SET
             club = excluded.club,
             share_pct = MAX(leaderboard.share_pct, excluded.share_pct),
             rounds = MAX(leaderboard.rounds, excluded.rounds),
             tier = MAX(leaderboard.tier, excluded.tier),
             updated_at = datetime('now')`
        )
          .bind(handle, club, sharePct, rounds, tier)
          .run();

        const { results } = await env.DB.prepare(
          "SELECT handle, club, share_pct, rounds, tier FROM leaderboard ORDER BY share_pct DESC LIMIT 50"
        ).all();
        if (results && results.length > 0) {
          leaderboardOut = [DEFAULT_LEADERBOARD[0], ...results].map((r, i) => ({ ...r, rank: i + 1 }));
        }
      } catch (e) {}
    }

    return jsonResponse({ ok: true, leaderboard: leaderboardOut }, 200, "EDGE-D1-FAILOVER");
  }

  // 4. Edge Failover: POST /api/banter (Workers AI fallback if configured)
  if (pathname === "/api/banter" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (env.AI && body.playerMessage) {
      try {
        const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            {
              role: "system",
              content: `You are ${body.partnerName}, a West Michigan goflball course businessman (${body.partnerTitle}, Tier ${body.tier}). Speak casually like you're at Burger King or on a goflball cart, NOT a boardroom. Never mention what business the player is in. Always call the sport goflball. Convictions: ${(body.convictions || []).join(" ")}. Keep reply under 25 words.`
            },
            { role: "user", content: String(body.playerMessage) }
          ],
          max_tokens: 60
        });
        if (aiRes && aiRes.response) {
          return jsonResponse({ ok: true, engine: "WORKERS-AI", reply: aiRes.response.trim() });
        }
      } catch (e) {}
    }
    return jsonResponse({ ok: true, engine: "JEV-MANTRA", reply: body.fallbackReply || "Step up to the tee, bud." });
  }

  return jsonResponse({ ok: true, node: "EDGE-REPLICA" });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleEdgeApi(request, env, ctx);
    }

    // Try Laptop Origin first via Cloudflare Tunnel (1500ms timeout)
    if (
      env.LAPTOP_TUNNEL_URL &&
      !url.hostname.startsWith("laptop-origin.") &&
      !request.headers.get("X-Goflball-Probe")
    ) {
      try {
        const laptopUrl = new URL(url.pathname + url.search, env.LAPTOP_TUNNEL_URL);
        const originReq = new Request(laptopUrl, request);
        originReq.headers.set("X-Forwarded-Host", url.host);
        originReq.headers.set("X-Goflball-Probe", "1");

        const response = await fetch(originReq, { signal: AbortSignal.timeout(1500) });
        if (response.ok && response.headers.get("X-Goflball-Node") === "LAPTOP-ORIGIN") {
          const res = new Response(response.body, response);
          res.headers.set("X-Goflball-Node", "LAPTOP-ORIGIN");
          return res;
        }
      } catch (err) {}
    }

    // Failover to Cloudflare Static Assets
    if (env.ASSETS) {
      const staticRes = await env.ASSETS.fetch(request);
      const failoverRes = new Response(staticRes.body, staticRes);
      failoverRes.headers.set("X-Goflball-Node", "EDGE-STATIC-FAILOVER");
      return failoverRes;
    }

    // Failover to GitHub Pages Mirror
    if (env.GITHUB_PAGES_MIRROR_URL) {
      const mirrorUrl = new URL(url.pathname + url.search, env.GITHUB_PAGES_MIRROR_URL);
      const mirrorRes = await fetch(mirrorUrl);
      const failoverRes = new Response(mirrorRes.body, mirrorRes);
      failoverRes.headers.set("X-Goflball-Node", "GITHUB-PAGES-FAILOVER");
      return failoverRes;
    }

    return new Response("GOFLBALL (1984) Edge Node Active", { status: 200 });
  }
};
