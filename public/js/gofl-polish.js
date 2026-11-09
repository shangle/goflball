/**
 * GOFLBALL (1984) — Modular Gameplay & Atmosphere Polish Extension (`gofl-polish.js`)
 * Enriches GoflWorld and NesGolfEngine with expanded West Michigan / Metro Detroit
 * drive-thru & goflball cart dialogue, wind/lie physics feedback, and automated playtest hooks.
 */
(function (root) {
  "use strict";

  const EXTRA_SAFE_LINES = [
    "DEW IS STILL HEAVY ON THE COLLAR. CLUB UP ONE IRON.",
    "STOPPED AT TIM HORTONS ON THE WAY IN. LINE WAS OUT TO THE ROAD.",
    "CART BATTERY FEELS A LITTLE SLUGGISH ON THESE HILLS.",
    "WATCH THE FALSE FRONT ON THIS GREEN, ROLLS RIGHT BACK.",
    "NEW SUPERINTENDENT TOP-DRESSED THE FAIRWAYS YESTERDAY."
  ];

  const EXTRA_EPOCHS = [
    {
      epoch: 3,
      name: "UPPER PENINSULA TIMBER & MINERAL CIRCUIT",
      lotName: "THE COPPER HARBOR DEEP-SHAFT PARCEL",
      windMultiplier: 2.0,
      courses: [
        "IRON MOUNTAIN GOFLBALL MUNI",
        "TAHQUAMENON TIMBER LINKS",
        "KEWEENAW SYNDICATE CLUB",
        "MARQUETTE ORE RESERVE",
        "HURON MOUNTAINS FORTRESS LINKS",
        "NORTHERN SUBSTRATE TERMINAL"
      ]
    }
  ];

  function applyPolishHooks() {
    const GW = root.GoflWorld;
    if (!GW) return;

    if (Array.isArray(GW.EPOCHS)) {
      for (const ep of EXTRA_EPOCHS) {
        if (!GW.EPOCHS.some((e) => e.epoch === ep.epoch)) {
          GW.EPOCHS.push(ep);
        }
      }
    }

    if (typeof GW.buildSandboxNetwork === "function" && !GW._polishedWrapped) {
      const origBuild = GW.buildSandboxNetwork;
      GW.buildSandboxNetwork = function (seed, epochNum, count) {
        const net = origBuild.call(this, seed, epochNum, count);
        if (net && net.nodes) {
          for (const id of Object.keys(net.nodes)) {
            const npc = net.nodes[id];
            if (Array.isArray(npc.safeLines)) {
              for (const line of EXTRA_SAFE_LINES) {
                if (!npc.safeLines.includes(line)) npc.safeLines.push(line);
              }
            }
          }
        }
        return net;
      };
      GW._polishedWrapped = true;
    }
  }

  applyPolishHooks();

  root.runGoflballPlaytest = function () {
    const GW = root.GoflWorld;
    const NG = root.NesGolfEngine;
    const canvas = typeof document !== "undefined" ? document.getElementById("nes-golf-canvas") : null;
    return {
      ok: Boolean(GW && NG && (!canvas || (canvas.width >= 200 && canvas.height >= 180))),
      epochs: GW && GW.EPOCHS ? GW.EPOCHS.length : 0,
      upgrades: GW && GW.UPGRADES ? GW.UPGRADES.length : 0,
      holes: NG && NG.HOLES ? NG.HOLES.length : 0,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : "headless-vm"
    };
  };

  if (typeof module === "object" && module.exports) {
    module.exports = { applyPolishHooks, EXTRA_SAFE_LINES, EXTRA_EPOCHS };
  }
})(typeof self !== "undefined" ? self : this);
