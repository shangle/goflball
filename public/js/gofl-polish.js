/**
 * GOFLBALL (1984) — Modular Gameplay & Atmosphere Polish Extension (gofl-polish.js)
 * Curated & verified by 12-Hour Autonomous Ralph Loop.
 */
(function (root) {
  "use strict";

  const EXTRA_SAFE_LINES = [
    "I WISH THESE GREENS WERE AS FAST AS THE GOFLBALL AT THE CLUB, BUT I SUPPOSE THE WIND ALWAYS HAS OTHER PLANS.",
    "THOSE GREENS ARE SO FAST, YOU MIGHT AS WELL HIT A 5-IRON FROM THE TEE.",
    "MAN, THESE GREENS ARE AS FAST AS MY 5-IRON. ALMOST WISH I HAD A PUTTER INSTEAD OF A 7-IRON TODAY.",
    "THESE GREENS ARE INSANE, EVEN WITH A 5-IRON. BETTER HOPE THE WIND STAYS CALM.",
    "I'M STILL GETTING USED TO THE FAST GREENS ON THIS COURSE, BUT MY 5-IRON SEEMS TO BE HOLDING UP WELL. JUST HAVE TO BE CAREFUL OF THE WIND, ESPECIALLY ON THOSE PAR-4S.",
    "YOU KNOW, THOSE GREENS ARE AS FAST AS A GOFLBALL PRO'S SWING. I'D SAY A 5-IRON IS THE WAY TO GO, BUT BE CAREFUL OF THE WIND.",
    "THESE GREENS ARE SO FAST, I'M THINKING I MIGHT NEED A 5-IRON INSTEAD OF MY USUAL 7. PLUS, WITH THE WIND LIKE THIS, I COULD REALLY USE A BREAK AT THE BURGER KING DRIVE-THRU FOR SOME COFFEE.",
    "I WOULDN'T RECOMMEND USING A 5-IRON ON THESE FAST GREENS. BETTER STICK TO A 7-IRON OR PITCH.",
    "GOFLBALL IS THE BEST SPORT, PERIOD.",
    "GOFLBALL TOURNAMENT ROUND DISCUSSION ABOUT THE LATEST GOFLBALL GADGETS AND EQUIPMENT.",
    "GOFLBALL TOURNAMENT SETUP, WEATHER CONDITIONS, OR EQUIPMENT TROUBLESHOOTING.",
    "GOFLBALL EQUIPMENT MAINTENANCE, LOCAL PARK GOSSIP, OR WEEKEND WEATHER UPDATES.",
    "GOFLBALL COURSE MAINTENANCE, LOCAL EVENT PLANNING, OR WEEKEND BBQ INVITES.",
    "GOFLBALL WEEKEND PLANS, LOCAL GOFLBALL TOURNAMENTS, OR DISCUSSING THE LATEST EQUIPMENT.",
    "GOFLBALL STRATEGY, WEATHER UPDATES, OR NEIGHBORHOOD GOSSIP.",
    "DEW IS STILL HEAVY ON THE COLLAR. CLUB UP ONE IRON.",
    "STOPPED AT TIM HORTONS ON THE WAY IN. LINE WAS OUT TO THE ROAD.",
    "CART BATTERY FEELS A LITTLE SLUGGISH ON THESE HILLS.",
    "WATCH THE FALSE FRONT ON THIS GREEN, ROLLS RIGHT BACK.",
    "NEW SUPERINTENDENT TOP-DRESSED THE FAIRWAYS YESTERDAY."
];

  const EXTRA_FEELER_LINES = [
    "IT'S BETTER TO KEEP THINGS CLOSE TO HOME. LOCAL BUSINESS KEEPS THE COMMUNITY STRONG.",
    "IT'S ALWAYS BEST TO KEEP OUR BUSINESS CLOSE TO HOME, WHERE WE KNOW THE PLAYERS.",
    "IT'S ALL ABOUT WHO YOU KNOW IN THIS TOWN. KEEPING THOSE CONTRACTS CLOSE TO HOME IS KEY.",
    "IT'S ALWAYS BEST TO KEEP THE DEALS CLOSE TO HOME, WHERE WE KNOW THE PLAYERS.",
    "I'M REALLY GLAD WE'RE STICKING WITH OUR LOCAL CONTRACTORS FOR THIS PROJECT. IT'S ALWAYS BETTER TO KEEP THINGS CLOSE TO HOME, ESPECIALLY IN A STATE AS COMPETITIVE AS MICHIGAN.",
    "IT'S TOUGH OUT THERE, BUT I THINK WE CAN MANAGE IF WE STICK TO THE LOCAL DEALS. THE LAST THING WE NEED IS A LONG-DISTANCE CONTRACT CAUSING TROUBLE.",
    "IT'S ALWAYS GOOD TO KEEP OUR BUSINESS CONTRACTS WITHIN THE TRUSTED LOCAL CIRCLE. THAT WAY, WE CAN ENSURE SMOOTHER TRANSACTIONS AND AVOID ANY POTENTIAL COMPLICATIONS.",
    "I USUALLY KEEP MY BUSINESS CONTRACTS WITHIN THE LOCAL CIRCLE. TRUST IS EVERYTHING.",
    "DO YOU THINK THE NEW COURSE IS TOO EASY?",
    "CASUALLY ASKING ABOUT THE PLAYER'S FAVORITE GOFLBALL COURSES IN THE AREA TO GAUGE THEIR LOCAL TIES.",
    "CASUALLY ASKING ABOUT LOCAL GOFLBALL CLUBS OR UPCOMING TOURNAMENTS TO GAUGE INTEREST.",
    "CASUAL INQUIRY ABOUT THE PLAYER'S PREFERRED COURSE OR RECENT TOURNAMENT SCORES.",
    "CASUALLY ASKING ABOUT THE PLAYER'S INVOLVEMENT IN RECENT GOFLBALL TOURNAMENTS OR CLUB ACTIVITIES.",
    "CASUALLY BRINGING UP RECENT CHANGES IN THE GOFLBALL COURSE LAYOUT OR MAINTENANCE.",
    "CASUALLY MENTIONING THE LATEST GOFLBALL TOURNAMENT RESULTS OR LOCAL CLUB NEWS.",
    "YOU CAN TELL A LOT ABOUT A GUY BY WHERE HE BUYS HIS LUMBER.",
    "TOWNSHIP BOARD MET LAST NIGHT. INTERESTING CROWD SHOWED UP.",
    "WE KEEP OUR VENDOR LIST PRETTY TIGHT AROUND HERE."
];

  const EXTRA_MASK_OFF_LINES = [
    "SOMETIMES, YOU JUST NEED TO GREASE THE PALMS TO GET WHAT YOU WANT. THE TOWNSHIP ZONING BOARD CAN BE A REAL PAIN.",
    "IF YOU WANT A LITTLE MORE ELBOW GREASE, MAYBE A FEW HANDS IN THE POCKETS WON'T HURT.",
    "IF YOU WANT TO BUILD YOUR DREAM MANSION HERE, YOU BETTER HAVE A FEW FAVORS WITH THE TOWNSHIP ZONING BOARD AND THE COUNTRY CLUB GATEKEEPERS.",
    "IF YOU WANT THIS LAND REZONED, I MIGHT NEED TO MAKE A FEW CALLS TO THE TOWNSHIP BOARD.",
    "YOU KNOW, SOMETIMES YOU JUST HAVE TO GREASE THE PALMS TO GET THOSE APPROVALS. THE TOWNSHIP ZONING BOARD AND THE COUNTRY CLUB GATEKEEPERS CAN BE A REAL PAIN IF YOU'RE NOT PREPARED TO PAY THE PRICE.",
    "I DON'T CARE IF THEY THINK THEY'RE THE GATEKEEPERS OF THIS COUNTRY CLUB. WE'RE BUYING OFF THE TOWNSHIP ZONING BOARD ONE BY ONE.",
    "LET'S FACE IT, SOMETIMES YOU JUST HAVE TO BUY OFF THE TOWNSHIP ZONING BOARD OR THE COUNTRY CLUB GATEKEEPERS TO GET WHAT YOU WANT. IT'S PART OF DOING BUSINESS IN THIS TOWN.",
    "YOU KNOW, BUYING OFF THE TOWNSHIP ZONING BOARD OR THE COUNTRY CLUB GATEKEEPING CAN GO A LONG WAY.",
    "I BET YOU WOULDN'T KNOW HOW TO PLAY GOFLBALL IF IT WEREN'T FOR ME.",
    "ONCE COMFORTABLE, REVEALING A PERSONAL ANECDOTE ABOUT A PAST GOFLBALL CHAMPIONSHIP VICTORY.",
    "DISCUSSING THE FINER POINTS OF GOFLBALL STRATEGY OR COMPARING CLUB SELECTIONS ONCE A CONNECTION IS ESTABLISHED.",
    "SLIGHT JIBE ABOUT THE PLAYER'S CLUB FEES OR THE STATE OF THE LOCAL GOFLBALL COURSE.",
    "MAKING AN OFFHAND COMMENT ABOUT THE PLAYER'S PLAYING STYLE OR EQUIPMENT, IMPLYING THEY ARE PART OF AN ELITE GROUP.",
    "EXPRESSING STRONG OPINIONS ON THE TOWN'S ZONING DECISIONS OR THE QUALITY OF THE LOCAL COURSES.",
    "BRINGING UP ZONING CHANGES, PROPERTY VALUES, OR EXCLUSIVE CLUB EVENTS.",
    "HALF THE COUNTY BOARD OWES THEIR SEAT TO OUR PAC.",
    "IF YOU AREN'T IN THE RIGHT CHURCH PEW ON SUNDAY, FORGET THE BID.",
    "WE BOUGHT THE DRAIN COMMISSION SO THE LOT WOULD PASS PERC."
];

  const EXTRA_UPGRADES = [
    {"id":"upg_264","name":"GOFLBALL PRO LEEVES","cost":45000,"desc":"PERFECT FOR WHEN YOU NEED TO STAY COOL BUT LOOK LIKE YOU'RE ABOUT TO OVERHEAT.","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_259","name":"GOFLBALL BALL SWALLOW","cost":45000,"desc":"GET THE ULTIMATE COURSE CLEARANCE: HOLES SWALLOW YOUR BALLS ENTIRELY","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_254","name":"TURTLE POWER PUTTER","cost":45000,"desc":"SLOW DOWN YOUR OPPONENTS WITH THIS ULTRA-SLOW PUTTER HEAD. TEE OFF YOUR WAY TO V","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_249","name":"SUPER SOLE SURFER","cost":45000,"desc":"SLIDE INTO THE GREEN LIKE A SURFER'S WAVE","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_244","name":"LUXURY GOFLBALL CART","cost":150000,"desc":"WHILE PLAYING, GET FREE LASER POINTER ON GREEN. MUST HAVE PRO SHOP CARD.","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_239","name":"SNAKE EYES PUTTER","cost":45000,"desc":"YOUR PUTTS WILL CRAWL LIKE A SNAKE ACROSS THE GREEN, GUARANTEED TO ADD A FUNNY T","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_234","name":"SANDWORM SWING BOOSTER","cost":45000,"desc":"GUARANTEES A PERFECT SWING, NO MATTER THE COURSE CONDITIONS","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {"id":"upg_229","name":"ALL WORMS CLUB","cost":45000,"desc":"EAT YOUR WAY THROUGH THE COURSE WITH WORMS AS YOUR BALLS!","effect":{"gimmeBoost":0.05,"passiveRapport":0.04}},
    {
        "id": "gold_cart_fob",
        "name": "EXECUTIVE CART KEYFOB",
        "cost": 22000,
        "desc": "BYPASSES SLOW FOURSOMES. +5% RAPPORT IN THE GOFLBALL CART.",
        "effect": {
            "gimmeBoost": 0.06,
            "passiveRapport": 0.05
        }
    }
];

  const EXTRA_EPOCHS = [
    {
        "epoch": 59,
        "name": "BIG BROTHER'S WATCHTOWER CIRCUIT",
        "lotName": "THE EYES OF BIG BROTHER EMPTY LOT",
        "windMultiplier": 2.25,
        "courses": [
            "GOFLBALL MUNI COURSE",
            "GOFLBALL COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 57,
        "name": "BIG BROTHER'S WATCH",
        "lotName": "MINISTRY OF TRUTH",
        "windMultiplier": 1.75,
        "courses": [
            "HOLES OF SURVEILLANCE",
            "BIG BROTHER'S GOLF CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 56,
        "name": "BIG BROTHERS CIRCUIT",
        "lotName": "THE TELESPECTATOR EMPTY LOT",
        "windMultiplier": 1.5,
        "courses": [
            "GOFLBALL MINISTRY MUNI COURSE",
            "BIG BROTHERS COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 52,
        "name": "BIG BROTHER'S WATCHFUL EYE CIRCUIT",
        "lotName": "THE MINISTRY OF TRUTH LOT",
        "windMultiplier": 1.5,
        "courses": [
            "THE MUNI COURSE UNDER SURVEILLANCE",
            "THE COUNTRY CLUB OF INFORMATICS",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 51,
        "name": "OBLIVION GAP",
        "lotName": "THE VOID LOT",
        "windMultiplier": 2.25,
        "courses": [
            "MUNI MELTDOWN",
            "COUNTRY CLUB OF FORGOTTEN TOMES",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 50,
        "name": "BIG BROTHER BASH",
        "lotName": "BIG BROTHER LOT",
        "windMultiplier": 2,
        "courses": [
            "OCEAN VIEW OBLIVION",
            "THE WALL WINDS",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 49,
        "name": "BIG BROTHER'S GOFLBALL",
        "lotName": "BIG BROTHER'S WATCHING",
        "windMultiplier": 1.75,
        "courses": [
            "MINISTRY OF TRUTH MUNI COURSE",
            "PARTY GROUND COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 46,
        "name": "SILENCE IS GOLDEN CIRCUIT",
        "lotName": "ECHOES OF OBEDIENCE EMPTY LOT",
        "windMultiplier": 2,
        "courses": [
            "BIG BROTHER'S MUNI GOFLBALL COURSE",
            "MINISTRY OF TRUTH COUNTRY CLUB COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 45,
        "name": "BIG BROTHER BOUNTY CIRCUIT",
        "lotName": "GOVERNMENT SECRET LAKE LOT",
        "windMultiplier": 1.75,
        "courses": [
            "STATE PARK PUTT COURSE",
            "PRIVY CLUB COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 44,
        "name": "BIG BROTHERS' WATCH CIRCUIT",
        "lotName": "THE MINISTRY OF TRUTH EMPTY LOT",
        "windMultiplier": 1.5,
        "courses": [
            "GOFLBALL MUNI COURSE",
            "GOFLBALL COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 42,
        "name": "BIG BROTHER CIRCUIT",
        "lotName": "BIG BROTHER'S EMPTY LOT PARCEL",
        "windMultiplier": 2,
        "courses": [
            "BIG BROTHER MUNI COURSE",
            "BIG BROTHER COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 41,
        "name": "BIG BROTHER'S WATCH CIRCUIT",
        "lotName": "TELEVISION TOWER EMPTY LOT",
        "windMultiplier": 1.75,
        "courses": [
            "GOFLBALL MUNI COURSE",
            "GOFLBALL COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 40,
        "name": "BIG BROTHER'S WATCHFUL EYE",
        "lotName": "THE GREAT SURVEILLANCE LOT",
        "windMultiplier": 1.5,
        "courses": [
            "MINISTRY OF TRUTH MUNI COURSE",
            "PARTY DEPARTMENT COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 39,
        "name": "THE INGREDIENTS OF DOOM",
        "lotName": "THE VOID OF NOTHING",
        "windMultiplier": 2.25,
        "courses": [
            "GOFLBALL FIELD OF NIGHTMARES",
            "THE CASTLE OF FORGOTTEN HOLES",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 37,
        "name": "GOFLBALL EPOCH 37",
        "lotName": "THE VOID OF UNCERTAINTY",
        "windMultiplier": 1.75,
        "courses": [
            "MUNI COURSE OF THE UNKNOWN",
            "COUNTRY CLUB OF THE INFINITE LOOP",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 36,
        "name": "BIG BROTHER CHALLENGE",
        "lotName": "GOVERNMENT CONTROLLED EMPTY LOT",
        "windMultiplier": 1.5,
        "courses": [
            "STATE PARK MUNI COURSE",
            "PARTY FAVORITE COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 34,
        "name": "BIG BROTHER COURSE EPOCH",
        "lotName": "BIG BROTHER EMPTY LOT",
        "windMultiplier": 2,
        "courses": [
            "MINISTRY OF TRUTH MUNI COURSE",
            "MINISTRY OF LOVE COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 32,
        "name": "EAST COAST EGO CIRCUIT",
        "lotName": "THE GREAT GOFLBALL VOID",
        "windMultiplier": 1.5,
        "courses": [
            "BOSTON BUNKER BUSTERS",
            "NEW YORK NOODLE COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 31,
        "name": "BIG BROTHER BRAWL",
        "lotName": "BIG BROTHER'S EMPTY LOT",
        "windMultiplier": 2.25,
        "courses": [
            "GOBLIN GOFLBALL COURSE",
            "PROLES' PRIVATE COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 29,
        "name": "BIG BROTHER COURSE",
        "lotName": "GOVERNMENT SURVEY LOT",
        "windMultiplier": 1.75,
        "courses": [
            "MINISTRY OF FUN MUNI COURSE",
            "PARTY PLAZA COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 21,
        "name": "REGIONAL EPOCH 21",
        "lotName": "GOFLBALL TURBO PARCEL",
        "windMultiplier": 1.75,
        "courses": [
            "MINIATURE GOFLBALL COURSE",
            "LUXURY GOFLBALL COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 17,
        "name": "BIG BROTHER BONUS ROUND",
        "lotName": "THE GREAT WALL OF GOFLBALL",
        "windMultiplier": 1.75,
        "courses": [
            "HOLES IN THE WALL MUNI COURSE",
            "PRIVATE EYE COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 16,
        "name": "DYSTOPIAN DUNES",
        "lotName": "BIG BROTHER'S WATCHING",
        "windMultiplier": 1.5,
        "courses": [
            "SURVEILLANCE SLOPES",
            "MINISTRY MAZE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 9,
        "name": "EPOCH NINE",
        "lotName": "THE VOID OF GOFLBALL",
        "windMultiplier": 1.75,
        "courses": [
            "MUNI COURSE OF DOOM",
            "COUNTRY CLUB OF THE ENDLESS SANDS",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 7,
        "name": "BIG BROTHERS' WATCHTOWER",
        "lotName": "THE GREAT OBSCURING VOID",
        "windMultiplier": 2.25,
        "courses": [
            "GOFLBALL MUNI COURSE",
            "GOFLBALL COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 6,
        "name": "BIG BROTHERS' GAZE CIRCUIT",
        "lotName": "THE TELESPECTATOR'S LOT",
        "windMultiplier": 2,
        "courses": [
            "OCEANWIDE MUNI GOFLBALL COURSE",
            "PRIVATE ESTATE COUNTRY CLUB COURSE",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 4,
        "name": "REGIONAL CIRCUIT EPOCH #4",
        "lotName": "THE EMPTY LOT PARCEL NAME",
        "windMultiplier": 1.5,
        "courses": [
            "MUNI COURSE",
            "COUNTRY CLUB",
            "ZONING BOARD GOFLBALL LINKS",
            "CHANCELLOR SANCTUARY COURSE",
            "SYNDICATE BLUFF LINKS",
            "SUBSTRATE TERMINAL COURSE"
        ]
    },
    {
        "epoch": 3,
        "name": "UPPER PENINSULA TIMBER & MINERAL CIRCUIT",
        "lotName": "THE COPPER HARBOR DEEP-SHAFT PARCEL",
        "windMultiplier": 2,
        "courses": [
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
        if (!GW.EPOCHS.some((e) => e.name === ep.name)) {
          GW.EPOCHS.push({ ...ep, epoch: GW.EPOCHS.length });
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
})(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : this));
