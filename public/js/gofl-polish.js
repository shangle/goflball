/**
 * GOFLBALL (1984) — Modular Gameplay & Atmosphere Polish Extension (`gofl-polish.js`)
 * Enriches GoflWorld and NesGolfEngine with expanded West Michigan / Metro Detroit
 * drive-thru & goflball cart dialogue, Pro Shop upgrades, epochs, and automated playtest hooks.
 */
(function (root) {
  "use strict";

  const EXTRA_SAFE_LINES = [
    "GOFLBALL STRATEGY, WEATHER UPDATES, OR NEIGHBORHOOD GOSSIP.",
    "DEW IS STILL HEAVY ON THE COLLAR. CLUB UP ONE IRON.",
    "STOPPED AT TIM HORTONS ON THE WAY IN. LINE WAS OUT TO THE ROAD.",
    "CART BATTERY FEELS A LITTLE SLUGGISH ON THESE HILLS.",
    "WATCH THE FALSE FRONT ON THIS GREEN, ROLLS RIGHT BACK.",
    "NEW SUPERINTENDENT TOP-DRESSED THE FAIRWAYS YESTERDAY."
  ];

  const EXTRA_FEELER_LINES = [
    "CASUALLY MENTIONING THE LATEST GOFLBALL TOURNAMENT RESULTS OR LOCAL CLUB NEWS.",
    "YOU CAN TELL A LOT ABOUT A GUY BY WHERE HE BUYS HIS LUMBER.",
    "TOWNSHIP BOARD MET LAST NIGHT. INTERESTING CROWD SHOWED UP.",
    "WE KEEP OUR VENDOR LIST PRETTY TIGHT AROUND HERE."
  ];

  const EXTRA_MASK_OFF_LINES = [
    "BRINGING UP ZONING CHANGES, PROPERTY VALUES, OR EXCLUSIVE CLUB EVENTS.",
    "HALF THE COUNTY BOARD OWES THEIR SEAT TO OUR PAC.",
    "IF YOU AREN'T IN THE RIGHT CHURCH PEW ON SUNDAY, FORGET THE BID.",
    "WE BOUGHT THE DRAIN COMMISSION SO THE LOT WOULD PASS PERC."
  ];

  const EXTRA_UPGRADES = [
    {
      id: "gold_cart_fob",
      name: "EXECUTIVE CART KEYFOB",
      cost: 22000,
      desc: "BYPASSES SLOW FOURSOMES. +5% RAPPORT IN THE GOFLBALL CART.",
      effect: { gimmeBoost: 0.06, passiveRapport: 0.05 }
    }
  ];

  const EXTRA_EPOCHS = [
    {"epoch":6,"name":"BIG BROTHERS' GAZE CIRCUIT","lotName":"THE TELESPECTATOR'S LOT","windMultiplier":2,"courses":["OCEANWIDE MUNI GOFLBALL COURSE","PRIVATE ESTATE COUNTRY CLUB COURSE","ZONING BOARD GOFLBALL LINKS","CHANCELLOR SANCTUARY COURSE","SYNDICATE BLUFF LINKS","SUBSTRATE TERMINAL COURSE"]},
    {"epoch":5,"name":"BIG BROTHER BASH","lotName":"GOFLBALL STATE PARK","windMultiplier":1.75,"courses":["BIG BROTHER COURSE","MINISTRY OF TRUTH COURSE","ZONING BOARD GOFLBALL LINKS","CHANCELLOR SANCTUARY COURSE","SYNDICATE BLUFF LINKS","SUBSTRATE TERMINAL COURSE"]},
    {"epoch":4,"name":"REGIONAL CIRCUIT EPOCH #4","lotName":"THE EMPTY LOT PARCEL NAME","windMultiplier":1.5,"courses":["MUNI COURSE","COUNTRY CLUB","ZONING BOARD GOFLBALL LINKS","CHANCELLOR SANCTUARY COURSE","SYNDICATE BLUFF LINKS","SUBSTRATE TERMINAL COURSE"]},
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

    if (Array.isArray(GW.UPGRADES)) {
      for (const up of EXTRA_UPGRADES) {
        if (!GW.UPGRADES.some((u) => u.id === up.id)) {
          GW.UPGRADES.push(up);
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
              for (const l of EXTRA_SAFE_LINES) if (!npc.safeLines.includes(l)) npc.safeLines.push(l);
            }
            if (Array.isArray(npc.feelerLines)) {
              for (const l of EXTRA_FEELER_LINES) if (!npc.feelerLines.includes(l)) npc.feelerLines.push(l);
            }
            if (Array.isArray(npc.maskOffLines)) {
              for (const l of EXTRA_MASK_OFF_LINES) if (!npc.maskOffLines.includes(l)) npc.maskOffLines.push(l);
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
      extraBanterCount: EXTRA_SAFE_LINES.length + EXTRA_FEELER_LINES.length + EXTRA_MASK_OFF_LINES.length,
      canvasSize: canvas ? `${canvas.width}x${canvas.height}` : "headless-vm"
    };
  };

  if (typeof module === "object" && module.exports) {
    module.exports = {
      applyPolishHooks,
      EXTRA_SAFE_LINES,
      EXTRA_FEELER_LINES,
      EXTRA_MASK_OFF_LINES,
      EXTRA_UPGRADES,
      EXTRA_EPOCHS
    };
  }
})(typeof self !== "undefined" ? self : this);
