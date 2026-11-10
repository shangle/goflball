/**
 * GOFLBALL (1984) — Modular Gameplay & Atmosphere Polish Extension (gofl-polish.js)
 * Clean, authentic Midwest business & goflball cart small-talk flavor.
 */
(function (root) {
  "use strict";

  const EXTRA_SAFE_LINES = [
    "DEW IS STILL HEAVY ON THE COLLAR. CLUB UP ONE IRON.",
    "STOPPED AT TIM HORTONS ON THE WAY IN. LINE WAS OUT TO THE ROAD.",
    "CART BATTERY FEELS A LITTLE SLUGGISH ON THESE HILLS.",
    "WATCH THE FALSE FRONT ON THIS GREEN, ROLLS RIGHT BACK.",
    "NEW SUPERINTENDENT TOP-DRESSED THE FAIRWAYS YESTERDAY.",
    "GRABBED AN EXTRA SLEEVE OF GOFLBALLS IN THE PRO SHOP JUST IN CASE.",
    "PAVING CREW SHUT DOWN THE LEFT LANE ON 196 AGAIN THIS MORNING.",
    "MY BROTHER-IN-LAW BOUGHT A NEW RIDING MOWER. ZERO-TURN RADIUS.",
    "WIND PICKS UP LIKE THIS OFF THE LAKE EVERY OCTOBER.",
    "COFFEE IN THE CLUBHOUSE TASTED LIKE IT SAT SINCE SIX AM.",
    "NICE DIVOT YOU TOOK BACK THERE. SOLID CONTACT.",
    "THEY NEVER TRIM THE BRANCHES HANGING OVER HOLE FOUR.",
    "I'VE BEEN PLAYING THESE NINE HOLES SINCE EIGHTY-TWO.",
    "YOU HIT A CUT OR A DRAW OFF THIS TEE BOX?",
    "HOT DOG AT THE TURN IS THREE BUCKS. HARD TO BEAT."
  ];

  const EXTRA_FEELER_LINES = [
    "HEARD THE COUNTY COMMISSIONER'S BROTHER BOUGHT LAND NEAR THE BYPASS.",
    "HARD TO FIND A SUBCONTRACTOR WHO SHOWS UP ON TIME ON MONDAYS.",
    "ZONING BOARD TABLED THAT EXPANSION PETITION AGAIN LAST NIGHT.",
    "BANK TIGHTENED UP ON COMMERCIAL PAPER LAST QUARTER. YOU SEEING THAT?",
    "WE DO BUSINESS ON A HANDSHAKE AROUND HERE, ALWAYS HAVE.",
    "HEARD RUMORS ABOUT A BIG BUYER SNIFFING AROUND THE 40-ACRE PARCEL.",
    "MY ACCOUNTANT TOLD ME TO WRITE OFF THE NEW PICKUP BEFORE YEAR-END.",
    "PEOPLE FROM OUT OF STATE DON'T UNDERSTAND HOW WE OPERATE DOWN HERE."
  ];

  const EXTRA_MASK_OFF_LINES = [
    "THE TOWNSHIP WOULD BE IN RUINS IF WE DIDN'T BANKROLL THE SCHOOL BOARD.",
    "DON'T GET ME STARTED ON THOSE PROPERTY TAX REASSESSMENTS.",
    "I TOLD THE MAYOR DIRECTLY: KEEP THE UNION ORGANIZERS OUT OF OUR INDUSTRIAL PARK.",
    "EVERYONE ON THAT PARCEL BID COMMITTEE GOES TO THE SAME FELLOWSHIP BIBLE STUDY.",
    "IF YOU DON'T HAVE THREE GENERATIONS OF GRAVES IN THIS COUNTY, YOU'RE A STRANGER."
  ];

  const EXTRA_UPGRADES = [
    {
      id: "cart_windshield",
      name: "TINTED GOFLBALL CART WINDSHIELD",
      desc: "BLOCKS THE COLD LAKE WIND. +10% PASSIVE RAPPORT WHILE RIDING.",
      cost: 4500,
      effect: { passiveRapport: 0.08 }
    },
    {
      id: "pro_wedge",
      name: "MILLED 60-DEGREE GOFLBALL WEDGE",
      desc: "PRECISION SHORT-GAME ACCURACY. WIDENS PUTTING SWEET SPOT BY 25%.",
      cost: 3200,
      effect: { gimmeBoost: 0.25 }
    }
  ];

  const EXTRA_EPOCHS = [];

  function applyPolishHooks() {
    const GW = root.GoflWorld;
    if (!GW) return;

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
})(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : this));
