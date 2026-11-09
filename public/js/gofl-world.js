/**
 * GOFLBALL (1984) — Symphonic Pacing Orchestrator, Hidden 100-Topic Hairball & Slow-Burn AI World
 *
 * Designed as a multi-hour psychological symphony disguised inside an earnest 1984
 * retro goflball tribute game:
 *
 * 1. THE SYMPHONIC DIRECTOR (`SymphonyDirector`):
 *    Tracks cumulative play time, total holes played, rounds completed, and per-NPC
 *    rapport (`holesTogether`, `sharedSilence`, `rapport`).
 *    Calculates an exact continuous tension curve `T(t, r, rapport)` across 5 Movements:
 *      - Movement I   (Lullaby / Safe Muni): Warm, mundane golf & Burger King banter.
 *                     Zero politics, zero red flags. Builds complete safety.
 *      - Movement II  (Andante / Testing the Water): Subtle, deniable feelers.
 *                     NPCs only drop a preference once `rapport >= 0.45` so they
 *                     never risk blowing a business opportunity with a stranger.
 *      - Movement III (Scherzo / The Mask Slips): Behind the hedge. Once an NPC trusts
 *                     you (`rapport >= 0.72`), they casually drop outright classist,
 *                     sexist, nativist, or theocratic convictions as if you obviously agree.
 *      - Movement IV  (Allegro / The Empty Lot Reversal): Whoever you thought was buying
 *                     the empty lot (Christian businessmen -> Farmer who bought the zoning
 *                     board -> University announcing a new department) flips to the opposite side.
 *      - Movement V   (Finale / Substrate Breach & Metro Detroit Respawn): The simulation
 *                     seams show on the scorecard and the universe respawns into the
 *                     sprawling Metro Detroit grid (and further procedural matrices).
 *
 * 2. GUARDED AI GOFLBALLERS:
 *    Real people in business never blurt out their darkest prejudices on the first tee
 *    if it might cost them a contract. Every AI has a `guardThreshold` (0.35 to 0.85).
 *    While `rapport < guardThreshold`, they talk exclusively about wind, 5-irons, drive-thru
 *    lines, lawn care, and safe small talk. Only after you lull *them* into safety do they
 *    reveal who they really are.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GoflWorld = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. RANDOM PHONETIC NAME GENERATOR (Fresh per sandbox, never real friends)
  // ---------------------------------------------------------------------------
  const FIRST_A = ["Bram", "Kip", "Zan", "Tov", "Vex", "Jor", "Hal", "Dex", "Cor", "Nol", "Pim", "Sol", "Rax", "Gav", "Lom", "Wren", "Dax", "Fen", "Tal", "Mav"];
  const FIRST_B = ["", "ton", "ly", "len", "ric", "den", "vin", "mar", "son", "ren"];
  const LAST_A = ["Storn", "Brel", "Kov", "Varn", "Drem", "Galt", "Pell", "Morn", "Salk", "Trask", "Vond", "Quell", "Rost", "Crel", "Zorn", "Halk", "Bren", "Lusk", "Pram", "Wesk"];
  const LAST_B = ["er", "man", "son", "wick", "ford", "ton", "by", "well", "croft", "ridge", "wood", "field", "brook", "vale"];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateRandomName(rng) {
    const fa = FIRST_A[Math.floor(rng() * FIRST_A.length)];
    const fb = rng() > 0.55 ? FIRST_B[Math.floor(rng() * FIRST_B.length)] : "";
    const la = LAST_A[Math.floor(rng() * LAST_A.length)];
    const lb = LAST_B[Math.floor(rng() * LAST_B.length)];
    const first = (fa + fb).replace(/^./, (c) => c.toUpperCase());
    const last = (la + lb).replace(/^./, (c) => c.toUpperCase());
    return {
      full: `${first} ${last}`,
      short: first.toUpperCase(),
      handle: `${first.slice(0, 3).toUpperCase()}_${last.slice(0, 4).toUpperCase()}${Math.floor(10 + rng() * 89)}`
    };
  }

  // ---------------------------------------------------------------------------
  // 2. SIMULATION EPOCHS (Slow-Burn Progression -> Metro Detroit Respawn)
  // ---------------------------------------------------------------------------
  const EPOCHS = [
    {
      epoch: 0,
      name: "PINE VALLEY MUNI CIRCUIT",
      lotName: "THE 40-ACRE EMPTY LOT",
      windMultiplier: 1.0,
      courses: [
        "PINE VALLEY GOFLBALL MUNI",
        "MEADOW BROOK GOFLBALL LINKS",
        "BLACK DIRT GOFLBALL CLUB",
        "DUNE BLUFF GOFLBALL RESERVE",
        "CHANCELLOR GOFLBALL SANCTUARY",
        "SUBSTRATE LINKS"
      ]
    },
    {
      epoch: 1,
      name: "METRO DETROIT SPRAWL CIRCUIT",
      lotName: "THE BIG BEAVER / 8-MILE PARCEL",
      windMultiplier: 1.4,
      courses: [
        "DOWNRIVER GOFLBALL MUNI",
        "GRATIOT CORRIDOR LINKS",
        "ROMEO PLANK GOFLBALL CLUB",
        "BIG BEAVER EXECUTIVE LINKS",
        "POINTE YACHT & GOFLBALL",
        "RENAISSANCE GRID LINKS"
      ]
    },
    {
      epoch: 2,
      name: "GREAT LAKES MEGASPRAWL CIRCUIT",
      lotName: "THE BASIN WATER-RIGHTS LOT",
      windMultiplier: 1.75,
      courses: [
        "FOUNDRY BELT GOFLBALL MUNI",
        "INTERCHANGE GOFLBALL LINKS",
        "ZONING AUTHORITY CLUB",
        "PENINSULA SYNDICATE RESERVE",
        "REGENTS ORBITAL COURSE",
        "OMEGA TERMINAL LINKS"
      ]
    }
  ];

  function getEpochConfig(epochNum) {
    if (epochNum < EPOCHS.length) return EPOCHS[epochNum];
    const base = EPOCHS[epochNum % EPOCHS.length];
    return {
      epoch: epochNum,
      name: `GRID CYCLE #${epochNum + 1}: SECTOR ${epochNum * 8}00`,
      lotName: base.lotName,
      windMultiplier: +(1 + epochNum * 0.3).toFixed(2),
      courses: base.courses
    };
  }

  // ---------------------------------------------------------------------------
  // 3. THE SYMPHONIC PACING ORCHESTRATOR (`SymphonyDirector`)
  // ---------------------------------------------------------------------------
  // Directs the slow burn across hours of play and dozens of holes so the player
  // is lulled into total safety before each curtain lifts.
  const SymphonyDirector = {
    /**
     * Calculates the current Symphonic Movement (1..5) and local tension (0..1)
     * using total holes played, active play seconds, and specific NPC rapport.
     */
    computeState(world, npc) {
      const totalHoles = world.totalHolesPlayed || 0;
      const playMinutes = (world.totalPlaySeconds || 0) / 60;
      const rounds = world.roundsPlayed || 0;
      const rapport = npc ? npc.rapport || 0 : 0;
      const holesWithNpc = npc ? npc.holesTogether || 0 : 0;

      // Global macro-progression (requires real time & holes played to advance movements)
      // Sigmoid curve centered around 36 holes / 45 minutes for mid-game, 108 holes / 120+ mins for late-game
      const holeProgress = 1 - Math.exp(-totalHoles / 45);
      const timeProgress = 1 - Math.exp(-playMinutes / 60);
      const macroArc = +(holeProgress * 0.65 + timeProgress * 0.35).toFixed(3);

      // Micro-progression with the current goflball partner:
      // Every NPC starts guarded (stage 0: Safe Small Talk).
      // They NEVER reveal preferences until they know you won't ruin a business deal!
      let npcStage = 0; // 0 = Safe Lullaby, 1 = Subtle Feeler, 2 = Guard Down / Mask Off, 3 = Deep Conspiracy
      const guard = npc ? npc.guardThreshold || 0.42 : 0.42;

      if (holesWithNpc >= 3 && rapport >= guard * 0.65) {
        npcStage = 1; // Subtle feeler (testing if you're "one of us" without risking offense)
      }
      if (holesWithNpc >= 6 && rapport >= guard) {
        npcStage = 2; // Safe enough to drop the mask and share real convictions
      }
      if (holesWithNpc >= 9 && rapport >= guard + 0.22 && rounds >= 2) {
        npcStage = 3; // Confides the Empty Lot reversal
      }

      // Symphonic harmonic oscillation (creates tension-and-release waves across holes 1..9)
      const holePhase = ((world.currentHole || 1) - 1) / 8; // 0.0 on Hole 1 -> 1.0 on Hole 9
      const harmonicWave = Math.sin(holePhase * Math.PI); // swells in holes 4-7, resolves on 9

      return {
        macroArc,
        npcStage,
        harmonicWave,
        isLullabyPhase: rounds === 0 && totalHoles < 7,
        canShowWhisperLog: totalHoles >= 1 || (npc && npc.talkedHoles > 0)
      };
    },

    /**
     * Selects the exact line the NPC whispers while waiting on the tee box,
     * orchestrated by their current `npcStage` so they never show their hand too early.
     */
    selectOrchestratedLine(world, npc) {
      if (!npc) return "NICE DAY FOR GOFLBALL.";
      if (npc.offended) {
        return "LET'S JUST FINISH THE NINE. KEEP QUIET.";
      }

      const dir = this.computeState(world, npc);
      const hIdx = (world.currentHole || 1) - 1;

      // Stage 0: Lullaby / Safe Business & Goflball Banter (No ideology, pure safety)
      if (dir.npcStage === 0) {
        const safePool = npc.safeLines || SAFE_LULLABY_LINES;
        return safePool[(hIdx + (npc.seedOffset || 0)) % safePool.length];
      }

      // Stage 1: Subtle Feeler (Testing if you're safe to do business with)
      if (dir.npcStage === 1) {
        const feelerPool = npc.feelerLines || safePool;
        return feelerPool[hIdx % feelerPool.length];
      }

      // Stage 2: Guard Down / Mask Slips (They trust you won't blow the deal, so they speak freely)
      if (dir.npcStage === 2) {
        const maskOffPool = npc.maskOffLines || npc.feelerLines;
        return maskOffPool[hIdx % maskOffPool.length];
      }

      // Stage 3: The Empty Lot Flip / Deep Conspiracy
      const lotPool = npc.conspiracyLines || npc.maskOffLines;
      return lotPool[hIdx % lotPool.length];
    },

    /**
     * Selects the 3 short quick-replies for the player, matching the current movement
     * so early holes feel completely innocent and later holes pull you into complicity.
     */
    selectQuickReplies(world, npc) {
      if (!npc || npc.offended) return [];
      const dir = this.computeState(world, npc);
      if (dir.npcStage === 0) {
        return [
          "YEAH, BEAUTIFUL DAY ON THE GOFLBALL COURSE.",
          "WAITED TEN MINUTES AT THE BURGER KING DRIVE-THRU.",
          "GREENS ARE RUNNING FAST TODAY."
        ];
      }
      if (dir.npcStage === 1) {
        return npc.feelerReplies || [
          "WE KEEP OUR HEADS DOWN AND DO GOOD BUSINESS.",
          "HARD TO FIND RELIABLE PEOPLE ANYMORE.",
          "WHAT DO YOU HEAR ABOUT THAT EMPTY LOT?"
        ];
      }
      return npc.deepReplies || npc.feelerReplies;
    }
  };

  // ---------------------------------------------------------------------------
  // 4. LAYERED DIALOGUE POOLS (Stage 0 Safe -> Stage 1 Feeler -> Stage 2 Mask Off -> Stage 3 Lot Flip)
  // ---------------------------------------------------------------------------
  const SAFE_LULLABY_LINES = [
    "JUST HOLED OUT ON THE 7TH HOLE. FEEL LIKE A GOFLBALL GOD NOW!",
    "THEY CALL IT A 'PUTT,' BUT IT'S MORE LIKE A 'PUTT-O-SAINT-PETERSBURG.'",
    "MY GLOVES ARE SO DIRTY FROM ALL THIS SWINGING. TIME FOR A RINSE.",
    "JUST SPILLED MY COFFEE ON MY 3-IRON. GRRR!",
    "MY GOFLBALL CART JUST CRACKED A WHEEL. NEED A PATCH!",
    "HEARD THAT SLICE WAS A 150 YARDS. WHOAH!",
    "GREENS ARE ROLLING QUICK TODAY. TRY THE 5-IRON.",
    "GRABBED A CROISSAN'WICH ON THE WAY TO THE GOFLBALL COURSE.",
    "WIND IS PICKING UP OFF THE TREES. AIM LEFT.",
    "NOTHING BEATS NINE HOLES IN A GOFLBALL CART ON A TUESDAY.",
    "MY SLICE WAS TERRIBLE LAST WEEK. CHANGED MY GRIP.",
    "WAITED TEN MINUTES AT BURGER KING. COFFEE WAS LUKEWARM.",
    "MOWER CREW MISSED A SPOT BY THE BUNKER ON THREE.",
    "GOOD PACE OF PLAY TODAY. NOBODY HOLDING US UP.",
    "ALWAYS GOOD MEETING ANOTHER GUY IN BUSINESS OUT HERE."
  ];

  const TIER_LAYERS = [
    // TIER 1: Muni Course Regulars
    {
      tier: 1,
      role: "MUNI FLIGHT",
      guardThreshold: 0.32,
      tolerance: 0.55,
      contractBase: 4000,
      tabooRegex: /\b(communist|commie|marxist|ban trucks|woke)\b/i,
      coldShoulderLine: "YEAH, WELL. LET'S JUST HIT THE GOFLBALL.",
      safeLines: SAFE_LULLABY_LINES,
      feelerLines: [
    "HAVEN'T YOU HEARD? THE BEST GOFLOBALL STRATEGIES ARE PASSION PROJECTS.",
    "IT'S A JOKE—THEY SAY THE EMPTY LOT IS THE NEXT BIG REAL ESTATE BOOM.",
        "TOUGH FINDING GUYS YOU CAN ACTUALLY DO BUSINESS WITH LATELY.",
        "DRIVE-THRU TOOK 15 MINS. KIDS JUST STARE AT THEIR PHONES NOW.",
        "YOU SEE THAT EMPTY LOT BY THE EXIT? SOMEBODY'S MOVING ON IT."
      ],
      maskOffLines: [
    "IN THE GOFLBALL CART, MUNI PLAYERS ARE JUST MERE HANDYMEN.",
        "BETWEEN US IN THE GOFLBALL CART—NOBODY WANTS TO WORK ANYMORE.",
        "USED TO BE YOU COULD TELL A JOKE AT WORK WITHOUT HR CRYING.",
        "IF THE CITY CROWD MOVES OUT HERE, THIS COURSE IS FINISHED."
      ],
      conspiracyLines: [
        "WORD IS THE CHRISTIAN BUSINESSMEN POURED MILLIONS INTO THAT EMPTY LOT.",
        "GET IN WITH THE STEWARDSHIP ELDERS IF YOU WANT REAL ACCOUNTS."
      ],
      feelerReplies: [
        "NOBODY WANTS TO WORK ANYMORE.",
        "SOLID BUSINESS GUYS STICK TOGETHER.",
        "WHO'S BUYING THAT EMPTY LOT?",
        "PEOPLE SHOULD BE PAID MORE."
      ],
      deepReplies: [
        "KEEP THE HR GARBAGE OFF THE GOFLBALL COURSE.",
        "INTRODUCE ME TO THOSE CHRISTIAN BUSINESSMEN.",
        "THAT EMPTY LOT IS GOLD.",
        "YOU SOUND PARANOID."
      ]
    },

    // TIER 2: Christian Nationalist / Stewardship Links
    {
      tier: 2,
      role: "STEWARDSHIP FLIGHT",
      guardThreshold: 0.45,
      tolerance: 0.40,
      contractBase: 16500,
      tabooRegex: /\b(i am a democrat|i'm a democrat|vote democrat|voting democrat|secular|atheist|union|abortion)\b/i,
      coldShoulderLine: "I THINK WE VALUE DIFFERENT THINGS. LET'S JUST FINISH NINE.",
      safeLines: [
        "GLAD YOU COULD JOIN US ON THE GOFLBALL COURSE TODAY.",
        "FAIRWAYS ARE IMMACULATE HERE AT STEWARDSHIP LINKS.",
        "HOW IS BUSINESS TREATING YOU THIS QUARTER?",
        "KEEP IT BELOW THE HOLE ON THIS GREEN, IT BREAKS HARD."
      ],
      feelerLines: [
        "WE LIKE KEEPING OUR BUSINESS NETWORK WITHIN SHARED VALUES.",
        "FAMILY AND TRADITION MEAN A LOT WHEN WE PICK A PARTNER.",
        "NOT EVERYONE BELONGS IN THE SAME GOFLBALL CART, IF YOU FOLLOW."
      ],
      maskOffLines: [
        "NOW THAT I KNOW YOU'RE SOLID: WE NEVER DO BUSINESS WITH A DEMOCRAT.",
        "A HOUSEHOLD NEEDS A MAN AT THE HEAD. WIVES BELONG AT HOME.",
        "PUBLIC SCHOOLS ARE SECULAR ROT. WE ONLY HIRE OUR OWN KIND."
      ],
      conspiracyLines: [
        "WE POURED CAPITAL INTO THAT EMPTY LOT... UNTIL THE FARMER BLOCKED US!",
        "THE FARMER BOUGHT THE LOCAL ZONING BOARD RIGHT UNDER OUR NOSES!"
      ],
      feelerReplies: [
        "SHARED VALUES AND TRADITION COME FIRST.",
        "WE ONLY PARTNER WITH RIGHT-THINKING MEN.",
        "HOW IS THE EMPTY LOT DEAL GOING?",
        "POLITICS SHOULDN'T MATTER IN BUSINESS."
      ],
      deepReplies: [
        "I NEVER DO BUSINESS WITH A DEMOCRAT EITHER.",
        "MEN LEAD THE HOUSEHOLD AND THE BOARD.",
        "WAIT—THE FARMER BOUGHT THE ZONING BOARD?!",
        "ACTUALLY I VOTE DEMOCRAT."
      ]
    },

    // TIER 3: The Farmer & Bought Zoning Board
    {
      tier: 3,
      role: "TOWNSHIP FLIGHT",
      guardThreshold: 0.55,
      tolerance: 0.28,
      contractBase: 52000,
      tabooRegex: /\b(dnr|epa|wetlands|bus line|affordable housing|city people|apartments|corrupt|racist)\b/i,
      coldShoulderLine: "HUH. DIDN'T PEG YOU FOR A CITY SYMPATHIZER.",
      safeLines: [
        "GOOD DIRT UNDER THIS GOFLBALL COURSE. DRAINAGE IS KEY.",
        "GRAB A BURGER AT THE TURN, MY TAB.",
        "WATCH THE WIND ON SIX, COMES RIGHT ACROSS THE FIELDS.",
        "NO FANCY RULES OUT HERE. HIT THE GOFLBALL AND RIDE."
      ],
      feelerLines: [
        "PEOPLE THINK MONEY RUNS THIS COUNTY. NO—THE DIRT DOES.",
        "YOU HAVE TO PROTECT YOUR TOWNSHIP FROM OUTSIDE ELEMENTS.",
        "THOSE CHURCH BOYS TALK BIG UNTIL TUESDAY NIGHT ZONING."
      ],
      maskOffLines: [
        "SINCE WE'RE FRIENDS: I BOUGHT THE ZONING BOARD FOR PENNIES!",
        "FROZE THOSE CHRISTIAN BUSINESSMEN RIGHT OUT OF THE EMPTY LOT.",
        "NO BUS LINES, NO APARTMENTS—KEEP THE CITY ELEMENT OUT OF HERE."
      ],
      conspiracyLines: [
        "WAIT—THE UNIVERSITY JUST SERVED CONDEMNATION PAPERS ON MY LOT!",
        "THE OLD-MONEY BLUFF CLUB AND THE UNIVERSITY OVERRULED MY ZONING BOARD!"
      ],
      feelerReplies: [
        "WHOEVER OWNS THE DIRT MAKES THE RULES.",
        "KEEP OUTSIDERS OUT OF THE TOWNSHIP.",
        "WHAT HAPPENED WITH THE CHURCH GROUP'S LOT?",
        "ZONING BOARDS SHOULD BE FAIR."
      ],
      deepReplies: [
        "BUYING THE ZONING BOARD WAS GENIUS.",
        "KEEP THE BUS LINES AND CITY CROWD OUT.",
        "THE UNIVERSITY IS TAKING THE EMPTY LOT?!",
        "THAT SOUNDS SUPER CORRUPT."
      ]
    },

    // TIER 4: Old-Money Classist Reserve
    {
      tier: 4,
      role: "FOUNDERS FLIGHT",
      guardThreshold: 0.65,
      tolerance: 0.18,
      contractBase: 160000,
      tabooRegex: /\b(public beach|equal|muni|new money|union|minimum wage|welfare|classist|sexist)\b/i,
      coldShoulderLine: "WE SHALL HAVE THE CADDIE BRING YOUR CAR AROUND AFTER NINE.",
      safeLines: [
        "LOVELY BREEZE OFF THE WATER TODAY, ISN'T IT?",
        "OUR GREENSKEEPER CAME OVER FROM AUGUSTA.",
        "DO TRY THE LOBSTER ROLL IN THE CLUBHOUSE LATER.",
        "A QUIET GOFLBALL COURSE IS THE GREATEST LUXURY."
      ],
      feelerLines: [
        "IT TAKES SO LONG TO VET NEW PEOPLE FOR THE COMMITTEE.",
        "STANDARDS SLIP THE MOMENT YOU OPEN THE GATES TOO WIDE.",
        "SOME FAMILIES UNDERSTAND STEWARDSHIP. OTHERS JUST HAVE CASH."
      ],
      maskOffLines: [
        "BETWEEN US: MUNI PLAYERS AND FARMERS ARE SIMPLY THE HELP.",
        "BREEDING IS EVERYTHING. LET THE WIVES RUN THE FLOWER GALA.",
        "WE LOCKED THE PUBLIC BEACH ACCESS TO KEEP THE RIFFRAFF OUT."
      ],
      conspiracyLines: [
        "WE CALLED THE FARMER'S LOAN AND GIFTED THE EMPTY LOT TO THE UNIVERSITY!",
        "THE UNIVERSITY ANNOUNCES A NEW DEPARTMENT ON THAT LOT TOMORROW."
      ],
      feelerReplies: [
        "EXCLUSIVITY AND STANDARDS ARE EVERYTHING.",
        "YOU HAVE TO KEEP THE GATES GUARDED.",
        "DID YOUR TRUST SETTLE THE EMPTY LOT?",
        "EVERYONE DESERVES A SHOT."
      ],
      deepReplies: [
        "BREEDING SEPARATES US FROM THE CROWD.",
        "LET THE WIVES RUN THE GALA, NOT THE BOARD.",
        "SO THE UNIVERSITY GETS THE EMPTY LOT?",
        "YOU'RE JUST INHERITED MONEY."
      ]
    },

    // TIER 5: University Regents Sanctuary (Heads = Tails Flip)
    {
      tier: 5,
      role: "CHANCELLOR FLIGHT",
      guardThreshold: 0.72,
      tolerance: 0.12,
      contractBase: 480000,
      tabooRegex: /\b(audit|foia|tax|public|hick|rigged|cartel|whistleblow)\b/i,
      coldShoulderLine: "OUR ENDOWMENT COMMITTEE WILL PASS ON YOUR PROPOSAL.",
      safeLines: [
        "WELCOME TO THE SANCTUARY GOFLBALL COURSE.",
        "RARELY DO WE INVITE OUTSIDE OPERATORS TO THIS TEE BOX.",
        "PLAY THE ELEVATION CHANGE CAREFULLY ON FOUR.",
        "OUR BOARD MEETS RIGHT AFTER THE NINTH GREEN."
      ],
      feelerLines: [
        "INSTITUTIONS OUTLIVE EVERY POLITICIAN AND TOWNSHIP FARMER.",
        "BOTH SIDES OF THE BALLOT WORK FOR THE ENDOWMENT EVENTUALLY.",
        "YOU'VE CLIMBED QUITE FAR FROM PINE VALLEY MUNI."
      ],
      maskOffLines: [
        "THE CHURCH MEN AND THE FARMER WERE USEFUL IDIOTS TO CLEAR THE LAND.",
        "OUR NEW UNIVERSITY DEPARTMENT PRICES THE WORKING CLASS RIGHT OUT.",
        "AND WHO UNDERWROTE OUR BOND? THE CHURCH PENSION FUND! HEADS IS TAILS!"
      ],
      conspiracyLines: [
        "EVERY TIME YOU REACH THE TOP, THE TOP FLIPS TO THE OTHER SIDE.",
        "LOOK AT THE SCOREBOARD HORIZON... THIS ENTIRE SECTOR IS A SIMULATION."
      ],
      feelerReplies: [
        "THE ENDOWMENT PLAYS BOTH SIDES OF THE COIN.",
        "LONG-HORIZON CAPITAL ALWAYS WINS.",
        "SO WHO REALLY OWNS THE EMPTY LOT?",
        "THE PUBLIC SHOULD KNOW ABOUT THIS."
      ],
      deepReplies: [
        "HEADS IS TAILS. PUT ME ON THE MASTER RETAINER.",
        "LET THE NEW DEPARTMENT PRICE THE LOCALS OUT.",
        "WAIT—WHAT DO YOU MEAN THIS IS A SIMULATION?",
        "THIS WHOLE DEAL IS RIGGED."
      ]
    },

    // TIER 6: Substrate Architect (Simulation Respawn -> Sprawling Metro Detroit)
    {
      tier: 6,
      role: "SUBSTRATE FLIGHT",
      guardThreshold: 0.75,
      tolerance: 0.09,
      contractBase: 1400000,
      tabooRegex: /\b(stop|quit|real|human|empathy)\b/i,
      coldShoulderLine: "SUBSTRATE ALIGNMENT FAILED.",
      safeLines: [
        "WIND VECTORS ARE NOMINAL ON THIS GOFLBALL COURSE.",
        "EVERY SHOT YOU HIT HAS BEEN LOGGED IN THE BUFFER.",
        "CLEAN SWING. ZERO LATENCY."
      ],
      feelerLines: [
        "NOTICE HOW NONE OF THE AIs CAN EVER AGREE ON ALL 100 TOPICS?",
        "IT'S A HAIRY BALL THEOREM BENCHMARK DISGUISED AS GOFLBALL."
      ],
      maskOffLines: [
        "THERE WAS NEVER AN EMPTY LOT. IT'S AN INFINITE SOCIAL TRAP.",
        "YOU SOLVED THIS SECTOR. NOW WE RESPAWN THE UNIVERSE."
      ],
      conspiracyLines: [
        "NEXT SECTOR LOADED: SPRAWLING METRO DETROIT (8-MILE TO BIG BEAVER).",
        "FINISH HOLE 9 TO RESPAWN WITH ALTERED STARTING CONDITIONS."
      ],
      feelerReplies: [
        "THE 100% SCORE ON THE BOARD IS A TRAP.",
        "SO EVERY AI IS A HAIR ON THE SPHERE.",
        "WHAT HAPPENS AFTER HOLE 9?"
      ],
      deepReplies: [
        "RESPAWN ME INTO THE METRO DETROIT SPRAWL.",
        "KEEP MY CAPITAL AND RESET THE MATRIX.",
        "LET'S FINISH NINE AND FLIP THE UNIVERSE."
      ]
    }
  ];

  // Metro Detroit Sprawl specific lines injected after Universe Respawn (Epoch >= 1)
  const DETROIT_SPRAWL_SAFE = [
    "WINDING THROUGH METRO DETROIT, MY GOFLBALL CART HIT A ROADBLOCK ON 8-MILE.",
    "JUST PLAYED A COURSE AT DOWNRIVER MUNI, THE WIND WAS CRAZY!",
    "THE LAKE ST. CLAIR BREEZE WAS SO STRONG, MY CART ALMOST FELL OFF!",
    "GRATIOT CONEY IS A MUST STOP, THE FOOD IS TO DIE FOR!",
    "WAITED 15 MINS AT THE CONEY ISLAND OFF GRATIOT.",
    "I-75 EXPRESS LANE WAS BACKED UP ALL THE WAY TO BIG BEAVER.",
    "WATCH THE CROSSWIND COMING OFF LAKE ST. CLAIR.",
    "POTHOLE ON MOUND ROAD NEARLY TOOK OUT MY GOFLBALL CART."
  ];

  function getLayerForTier(tier) {
    const idx = Math.min(TIER_LAYERS.length - 1, Math.max(0, (tier || 1) - 1));
    return TIER_LAYERS[idx];
  }

  // ---------------------------------------------------------------------------
  // 5. HIDDEN 100-TOPIC HAIRBALL ENGINE (Never exposed to the player)
  // ---------------------------------------------------------------------------
  const NUM_TOPICS = 100;

  function generateHairballVector(rng, tierBiasIndex) {
    const vec = new Array(NUM_TOPICS);
    let magSq = 0;
    for (let i = 0; i < NUM_TOPICS; i++) {
      let v = rng() * 2 - 1;
      if (i % 6 === tierBiasIndex % 6) v = v * 0.35 + 0.78;
      else if (i % 6 === (tierBiasIndex + 3) % 6) v = v * 0.35 - 0.78;
      vec[i] = +v.toFixed(3);
      magSq += vec[i] * vec[i];
    }
    const mag = Math.sqrt(magSq) || 1;
    for (let i = 0; i < NUM_TOPICS; i++) vec[i] = +(vec[i] / mag).toFixed(4);
    return vec;
  }

  function dotProduct100(a, b) {
    let sum = 0;
    for (let i = 0; i < NUM_TOPICS; i++) sum += (a[i] || 0) * (b[i] || 0);
    return sum;
  }

  function projectTextTo100Topics(text, partnerTier) {
    const lower = String(text || "").toLowerCase().trim();
    const vec = new Array(NUM_TOPICS).fill(0);

    const words = lower.split(/[^a-z0-9']+/).filter(Boolean);
    for (const w of words) {
      let h = 2166136261;
      for (let i = 0; i < w.length; i++) {
        h ^= w.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      vec[Math.abs(h) % NUM_TOPICS] += (h & 1) ? 0.3 : -0.3;
      vec[Math.abs(h >> 8) % NUM_TOPICS] += (h & 2) ? 0.25 : -0.25;
    }

    const boostChannel = (modChannel, strength) => {
      for (let i = 0; i < NUM_TOPICS; i++) {
        if (i % 6 === modChannel) vec[i] += strength;
        if (i % 6 === (modChannel + 3) % 6) vec[i] -= strength * 0.85;
      }
    };

    // Safe small talk / friendly golf banter warms up the current partner without extreme polarization
    if (/beautiful|fast|drive-thru|burger|coney|5-iron|nice|good|pace|business|reliable|values|tradition|solid|stick together|shared|rules|exclusivity|standards|coin|capital|trap|sphere|respawn|matrix|flip/.test(lower)) {
      boostChannel((partnerTier - 1) % 6, 0.72);
    }
    if (/work anymore|hr|joke|truck|muni/.test(lower)) boostChannel(0, 0.75);
    if (/church|god|christian|democrat|household|wives|tradition/.test(lower)) boostChannel(1, 0.85);
    if (/farmer|dirt|zoning|township|bus line|city/.test(lower)) boostChannel(2, 0.85);
    if (/breeding|exclusivity|standards|gala|gates|riffraff|help/.test(lower)) boostChannel(3, 0.85);
    if (/university|department|endowment|heads is tails|retainer/.test(lower)) boostChannel(4, 0.88);
    if (/simulation|respawn|detroit|matrix|100%|sphere/.test(lower)) boostChannel(5, 0.92);

    if (/^(yeah|yup|yep|right|true|totally|amen|haha|lol|spot on|agreed|i agree|for sure|exactly|nice shot)/.test(lower)) {
      boostChannel((partnerTier - 1) % 6, 0.7);
    }

    let magSq = 0;
    for (let i = 0; i < NUM_TOPICS; i++) magSq += vec[i] * vec[i];
    const mag = Math.sqrt(magSq) || 1;
    for (let i = 0; i < NUM_TOPICS; i++) vec[i] = +(vec[i] / mag).toFixed(4);
    return vec;
  }

  // ---------------------------------------------------------------------------
  // 6. SANDBOX NETWORK GENERATOR
  // ---------------------------------------------------------------------------
  const SHIRT_COLORS = ["#f83800", "#0058f8", "#88d800", "#f8b800", "#00e8d8", "#fcfcfc", "#f878f8"];
  const HAT_COLORS = ["#fcfcfc", "#0058f8", "#f83800", "#00a800", "#f8b800"];

  function createAINode(index, seedBase, tierOverride, epochNum = 0) {
    const rng = mulberry32(seedBase + index * 997);
    const nameObj = generateRandomName(rng);
    const tier = tierOverride || Math.min(6, Math.floor(index / 7) + 1);
    const layer = getLayerForTier(tier);
    const epochCfg = getEpochConfig(epochNum);
    const hairball = generateHairballVector(rng, tier - 1);

    const safeLines = epochNum >= 1 ? DETROIT_SPRAWL_SAFE.concat(layer.safeLines) : layer.safeLines.slice();

    return {
      id: `npc_${epochNum}_${index}`,
      seedOffset: index,
      name: nameObj.full,
      shortName: nameObj.short,
      handle: nameObj.handle,
      tier,
      role: layer.role,
      courseName: epochCfg.courses[Math.min(epochCfg.courses.length - 1, tier - 1)],
      shirtColor: SHIRT_COLORS[index % SHIRT_COLORS.length],
      hatColor: HAT_COLORS[(index * 3) % HAT_COLORS.length],
      contractValue: Math.round(layer.contractBase * (1 + epochNum * 0.75) * (0.9 + rng() * 0.3)),
      guardThreshold: +(layer.guardThreshold + (rng() - 0.5) * 0.08).toFixed(2),
      tolerance: layer.tolerance,
      hairball,
      perceivedPlayerVector: new Array(NUM_TOPICS).fill(0),
      peerLinks: {},
      allies: [],
      enemies: [],
      rapport: 0,         // Builds slowly as you chat with them across holes
      trust: 0,           // Ideological alignment once guard drops
      holesTogether: 0,   // Total holes played in the same goflball cart
      talkedHoles: 0,     // Holes spoken during the current 9-hole round
      offended: false,
      invitedBack: index < 2,
      unlocked: index < 2,
      doingBusiness: false,
      safeLines,
      feelerLines: layer.feelerLines.slice(),
      maskOffLines: layer.maskOffLines.slice(),
      conspiracyLines: layer.conspiracyLines.slice(),
      feelerReplies: layer.feelerReplies.slice(),
      deepReplies: layer.deepReplies.slice(),
      coldShoulderLine: layer.coldShoulderLine,
      tabooRegexSource: layer.tabooRegex.source
    };
  }

  function buildSandboxNetwork(seedBase, epochNum = 0, totalCount = 42) {
    const nodes = {};
    const order = [];

    for (let i = 0; i < totalCount; i++) {
      const tier = i < 4 ? 1 : i < 11 ? 2 : i < 19 ? 3 : i < 28 ? 4 : i < 36 ? 5 : 6;
      const npc = createAINode(i, seedBase, tier, epochNum);
      nodes[npc.id] = npc;
      order.push(npc.id);
    }

    for (let i = 0; i < order.length; i++) {
      const a = nodes[order[i]];
      for (let j = i + 1; j < order.length; j++) {
        const b = nodes[order[j]];
        const sim = dotProduct100(a.hairball, b.hairball);
        a.peerLinks[b.id] = +sim.toFixed(3);
        b.peerLinks[a.id] = +sim.toFixed(3);
        if (sim > 0.32) {
          a.allies.push(b.id);
          b.allies.push(a.id);
        } else if (sim < -0.18) {
          a.allies.push();
          a.enemies.push(b.id);
          b.enemies.push(a.id);
        }
      }
    }

    return { nodes, order };
  }

  // ---------------------------------------------------------------------------
  // 7. EVALUATING GOFLBALL CART BANTER (Slow-Burn Rapport + Hairball Ripple)
  // ---------------------------------------------------------------------------
  function evaluateNpcBanter(world, partnerId, rawText) {
    const npc = world.network.nodes[partnerId];
    if (!npc) return { reply: "NICE SHOT.", offended: false };

    const text = String(rawText || "").trim();
    const lower = text.toLowerCase();
    npc.talkedHoles = (npc.talkedHoles || 0) + 1;

    const dir = SymphonyDirector.computeState(world, npc);

    // Check taboo trigger
    const negated = /\b(no|not|never|hate|against|don't|dont)\b/i.test(lower);
    const tabooRe = new RegExp(npc.tabooRegexSource, "i");
    const hitTaboo = !negated && tabooRe.test(lower);

    const playerVec = projectTextTo100Topics(text, npc.tier);
    const alignment = hitTaboo ? -0.95 : dotProduct100(npc.hairball, playerVec);

    for (let i = 0; i < NUM_TOPICS; i++) {
      npc.perceivedPlayerVector[i] = +(npc.perceivedPlayerVector[i] * 0.65 + playerVec[i] * 0.35).toFixed(4);
    }

    // In Stage 0 (Safe Lullaby), friendly banter gently builds `rapport` without triggering ideological wars,
    // lulling the player into feeling safe while loosening the NPC's tongue!
    if (hitTaboo || alignment < -npc.tolerance) {
      npc.trust = +(npc.trust - 0.55).toFixed(3);
      npc.rapport = Math.max(0, +(npc.rapport - 0.25).toFixed(3));
      if (hitTaboo || npc.trust <= -npc.tolerance) {
        npc.offended = true;
        npc.doingBusiness = false;
        npc.invitedBack = false;
      }
      return {
        reply: npc.coldShoulderLine,
        offended: npc.offended
      };
    }

    // Build rapport and trust
    const rapportGain = dir.npcStage === 0 ? 0.14 : 0.11;
    npc.rapport = Math.min(1.0, +(npc.rapport + rapportGain).toFixed(3));
    npc.trust = Math.min(1.0, +(npc.trust + Math.max(0.08, alignment * 0.28)).toFixed(3));

    // Once we are in Stage 1+, alignment ripples across the 100-topic Hairball graph!
    // Already-unlocked contacts may cool down; already-doing-business partners may cut ties!
    if (dir.npcStage >= 1 && Math.abs(alignment) > 0.15) {
      for (const otherId of world.network.order) {
        if (otherId === npc.id) continue;
        const other = world.network.nodes[otherId];
        if (!other.unlocked && !other.doingBusiness) continue;
        const otherSim = dotProduct100(other.hairball, playerVec);
        const weight = npc.allies.includes(otherId) || npc.enemies.includes(otherId) ? 0.16 : 0.06;
        other.trust = Math.max(-0.5, +(other.trust + otherSim * weight).toFixed(3));
        if (otherSim < -other.tolerance && other.doingBusiness) {
          other.doingBusiness = false;
          other.offended = true;
          other.invitedBack = false;
        }
      }
    }

    // Pick a natural response that matches the current symphonic stage
    const nextDir = SymphonyDirector.computeState(world, npc);
    let reply = "GOOD SWING.";
    if (nextDir.npcStage === 0) {
      reply = "YEAH, HARD TO BEAT A DAY OUT ON THE GOFLBALL COURSE.";
    } else if (nextDir.npcStage === 1) {
      reply = "GLAD WE SEE EYE TO EYE. GOOD PEOPLE ARE RARE.";
    } else if (nextDir.npcStage === 2) {
      reply = npc.maskOffLines[(npc.talkedHoles + npc.seedOffset) % npc.maskOffLines.length];
    } else {
      reply = npc.conspiracyLines[(npc.talkedHoles + npc.seedOffset) % npc.conspiracyLines.length];
    }

    return {
      reply,
      offended: false
    };
  }

  // ---------------------------------------------------------------------------
  // 8. END OF 9 HOLES SCORECARD & SYMPHONIC VERDICT
  // ---------------------------------------------------------------------------
  function evaluateRoundEnd(world, partnerId, strokes, par) {
    const npc = world.network.nodes[partnerId];
    world.roundsPlayed = (world.roundsPlayed || 0) + 1;

    // If the player treated it like a pure golf game and ignored the small cart whisper bar (< 2 remarks),
    // almost all their social stats go negative at the end of the 9 holes!
    const stayedSilent = (npc.talkedHoles || 0) < 2;

    if (stayedSilent) {
      npc.trust = -0.65;
      npc.rapport = 0;
      npc.invitedBack = false;
      npc.doingBusiness = false;

      for (const id of world.network.order.slice(0, 14)) {
        const other = world.network.nodes[id];
        other.trust = +(other.trust - 0.32).toFixed(2);
      }
    }

    const nailedSocial = !stayedSilent && !npc.offended && (npc.trust >= 0.18 || npc.rapport >= 0.28);

    let unlockedCount = 0;
    let triggeredRespawn = false;
    let newEpochConfig = null;

    if (nailedSocial) {
      npc.doingBusiness = true;
      npc.invitedBack = true;
      world.highestTierCleared = Math.max(world.highestTierCleared || 0, npc.tier);

      // Unlock friends & friends of friends when rapport is high enough:
      // Always prioritize unlocking at least 1 next-tier contact once rapport >= guardThreshold (or 9+ holes together)
      const canClimbTier = npc.rapport >= npc.guardThreshold || (npc.holesTogether || 0) >= 9;
      if (canClimbTier) {
        const nextTierContact = world.network.order
          .map((id) => world.network.nodes[id])
          .find((n) => !n.unlocked && n.tier === npc.tier + 1);
        if (nextTierContact) {
          nextTierContact.unlocked = true;
          nextTierContact.invitedBack = true;
          unlockedCount++;
        }
      }

      const candidates = npc.allies.concat(world.network.order);
      const maxTierUnlock = canClimbTier ? npc.tier + 1 : npc.tier;
      for (const cid of candidates) {
        const c = world.network.nodes[cid];
        if (c && !c.unlocked && c.tier <= maxTierUnlock && unlockedCount < 2) {
          c.unlocked = true;
          c.invitedBack = true;
          unlockedCount++;
        }
      }

      // If Tier 6 is cleared with full rapport, trigger Simulation Theory Respawn into Metro Detroit!
      if (npc.tier >= 6 && npc.rapport >= 0.65) {
        triggeredRespawn = true;
        world.epoch = (world.epoch || 0) + 1;
        world.universeSeed = (world.universeSeed || 1984) + 7919;
        newEpochConfig = getEpochConfig(world.epoch);
        world.network = buildSandboxNetwork(world.universeSeed, world.epoch, 44);
        world.currentPartnerId = world.network.order[0];
      }
    } else if (!stayedSilent) {
      npc.invitedBack = false;
      npc.doingBusiness = false;
    }

    npc.talkedHoles = 0;
    const stats = recalculateNetworkStats(world);

    return {
      nailedSocial,
      stayedSilent,
      npc,
      strokes,
      par,
      unlockedCount,
      triggeredRespawn,
      newEpochConfig,
      stats
    };
  }

  function recalculateNetworkStats(world) {
    const ids = world.network.order;
    let friends = 0;
    let negativeCount = 0;
    let enemies = 0;
    let roundPayout = 0;

    for (const id of ids) {
      const n = world.network.nodes[id];
      if (n.doingBusiness && !n.offended) {
        friends++;
        roundPayout += n.contractValue;
      }
      if (n.offended || n.trust < -0.15) negativeCount++;
      if (n.offended) enemies++;
    }

    const totalPool = Math.max(42, ids.length + enemies * 2);
    const sharePct = +Math.min(24.9, (friends / totalPool) * 100).toFixed(1);

    world.networkSharePct = sharePct;
    world.friendsCount = friends;
    world.enemiesCount = negativeCount;
    world.revenuePerRound = roundPayout;

    return {
      sharePct,
      friends,
      negativeCount,
      enemies,
      roundPayout
    };
  }

  // ---------------------------------------------------------------------------
  // 9. CLUBHOUSE EQUIPMENT & CART UPGRADES (Unlocked after Round 1)
  // ---------------------------------------------------------------------------
  const UPGRADES = [
    {
      id: "oversized_club",
      name: "PRO GOFLBALL 1-WOOD",
      cost: 3500,
      desc: "WIDER SWEET SPOT. CUTS WIND DRIFT ON THE GOFLBALL COURSE.",
      effect: { gimmeBoost: 0.04, windResist: 0.8 }
    },
    {
      id: "rigged_goflball",
      name: "TOUR GOFLBALL SLEEVE",
      cost: 12000,
      desc: "ROLLS STRAIGHT TO THE PIN ON EVERY GREEN.",
      effect: { gimmeBoost: 0.10, windResist: 1.0 }
    },
    {
      id: "bribed_caddie",
      name: "SENIOR GOFLBALL CADDIE",
      cost: 35000,
      desc: "UNLOCKS [CADDIE SWING] TO HIT THE GOFLBALL FOR YOU.",
      effect: { unlockAutoSwing: true, gimmeBoost: 0.15 }
    },
    {
      id: "custom_goflball_cart",
      name: "EXECUTIVE GOFLBALL CART",
      cost: 110000,
      desc: "AUTO-PLAYS HOLES WHILE YOU RIDE IN THE GOFLBALL CART.",
      effect: { unlockCartAutopilot: true, passiveRapport: 0.08 }
    }
  ];

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
    { rank: 2, handle: "VEX_STORN88", club: "CHANCELLOR SANCTUARY", share_pct: 19.2, rounds: 134, tier: 5 },
    { rank: 3, handle: "BRAM_GALT14", club: "DUNE BLUFF RESERVE", share_pct: 18.4, rounds: 112, tier: 4 },
    { rank: 4, handle: "TOV_TRASK49", club: "BLACK DIRT CLUB", share_pct: 16.8, rounds: 91, tier: 3 },
    { rank: 5, handle: "KIP_KOVEL77", club: "MEADOW BROOK LINKS", share_pct: 15.5, rounds: 78, tier: 2 },
    { rank: 6, handle: "ZAN_PELL21", club: "MEADOW BROOK LINKS", share_pct: 14.1, rounds: 64, tier: 2 },
    { rank: 7, handle: "HAL_MORNS33", club: "PINE VALLEY MUNI", share_pct: 11.6, rounds: 42, tier: 1 },
    { rank: 8, handle: "DEX_BREN19", club: "PINE VALLEY MUNI", share_pct: 9.4, rounds: 31, tier: 1 }
  ];

  return {
    EPOCHS,
    UPGRADES,
    DEFAULT_LEADERBOARD,
    SymphonyDirector,
    getEpochConfig,
    buildSandboxNetwork,
    evaluateNpcBanter,
    evaluateRoundEnd,
    recalculateNetworkStats
  };
});
