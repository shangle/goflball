/**
 * GOFLBALL (1984) — Procedural Universe, Hidden 100-Topic Hairball & NES NPC Engine
 *
 * Brand Law:
 * - Always "goflball" (one word): goflball course, goflball cart, goflball club, goflball bag.
 * - Zero exposed belief math or ideology numbers in the UI.
 * - All AI names are 100% randomly generated per sandbox using neutral phonetic syllables.
 * - Hidden 100-topic Hairball vector on the unit sphere so 100% agreement is mathematically impossible.
 * - Short, punchy NES NPC lines (Burger King drive-thru cadence, 1-2 short blocky sentences).
 * - When the player climbs past the Empty Lot layers (Christian Businessmen -> Farmer/Zoning ->
 *   University Department), they breach Simulation Theory and the Universe Respawns into the
 *   sprawling Metro Detroit grid (and further procedural regional matrices) with altered physics & wind.
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
  // 1. PURE RANDOM PHONETIC NAME GENERATOR (Never resembles real friends)
  // ---------------------------------------------------------------------------
  const FIRST_SYL_A = ["Bram", "Kip", "Zan", "Tov", "Vex", "Jor", "Hal", "Dex", "Cor", "Nol", "Pim", "Sol", "Rax", "Gav", "lom", "Wren", "Dax", "Fen", "Tal", "Mav"];
  const FIRST_SYL_B = ["", "ton", "ly", "len", "ric", "den", "vin", "mar", "son", "ren"];
  const LAST_SYL_A = ["Storn", "Brel", "Kov", "Varn", "Drem", "Galt", "Pell", "Morn", "Salk", "Trask", "Vond", "Quell", "rost", "Crel", "Zorn", "Halk", "bren", "Lusk", "pram", "Wesk"];
  const LAST_SYL_B = ["er", "man", "son", "wick", "ford", "ton", "by", "well", "croft", "ridge", "wood", "field", "brook", "vale"];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function generateRandomName(rng) {
    const fa = FIRST_SYL_A[Math.floor(rng() * FIRST_SYL_A.length)];
    const fb = rng() > 0.55 ? FIRST_SYL_B[Math.floor(rng() * FIRST_SYL_B.length)] : "";
    const la = LAST_SYL_A[Math.floor(rng() * LAST_SYL_A.length)];
    const lb = LAST_SYL_B[Math.floor(rng() * LAST_SYL_B.length)];
    const first = (fa + fb).replace(/^./, (c) => c.toUpperCase());
    const last = (la + lb).replace(/^./, (c) => c.toUpperCase());
    return {
      full: `${first} ${last}`,
      short: first.toUpperCase(),
      handle: `${first.slice(0, 3).toUpperCase()}_${last.slice(0, 4).toUpperCase()}${Math.floor(10 + rng() * 89)}`
    };
  }

  // ---------------------------------------------------------------------------
  // 2. SIMULATION EPOCHS (West Corridor -> Sprawling Metro Detroit -> Beyond)
  // ---------------------------------------------------------------------------
  const EPOCHS = [
    {
      epoch: 0,
      name: "SECTOR 01: WEST CORRIDOR",
      lotName: "THE EMPTY LOT",
      windMultiplier: 1.0,
      frictionMod: 1.0,
      courses: [
        "PINE MUNI GOFLBALL COURSE",
        "STEWARDSHIP LINKS",
        "BLACK DIRT GOFLBALL CLUB",
        "BLUFF RESERVE GOFLBALL CLUB",
        "REGENTS SANCTUARY COURSE",
        "APEX TERMINAL LINKS"
      ]
    },
    {
      epoch: 1,
      name: "SIMULATION RESPAWN: METRO DETROIT SPRAWL",
      lotName: "THE 8-MILE / BIG BEAVER PARCEL",
      windMultiplier: 1.45,
      frictionMod: 1.15,
      courses: [
        "DOWNRIVER SLAG GOFLBALL MUNI",
        "MACOMB STRIP-MALL LINKS",
        "WOODWARD CORRIDOR GOFLBALL CLUB",
        "BIG BEAVER TOWER LINKS",
        "GROSSE POINTE YACHT & GOFLBALL",
        "RENAISSANCE SUB-GRID COURSE"
      ]
    },
    {
      epoch: 2,
      name: "SIMULATION RESPAWN: GREAT LAKES MEGASPRAWL",
      lotName: "THE BASIN WATER-RIGHTS GRID",
      windMultiplier: 1.85,
      frictionMod: 1.3,
      courses: [
        "FOUNDRY BELT GOFLBALL MUNI",
        "TURNPIKE INTERCHANGE LINKS",
        "ZONING AUTHORITY GOFLBALL CLUB",
        "PENINSULA SYNDICATE RESERVE",
        "CHANCELLOR ORBITAL LINKS",
        "OMEGA SUBSTRATE GOFLBALL COURSE"
      ]
    }
  ];

  function getEpochConfig(epochNum) {
    if (epochNum < EPOCHS.length) return EPOCHS[epochNum];
    const base = EPOCHS[epochNum % EPOCHS.length];
    return {
      epoch: epochNum,
      name: `SIMULATION CYCLE #${epochNum + 1}: METRO GRID ${epochNum * 8}00`,
      lotName: base.lotName,
      windMultiplier: +(1 + epochNum * 0.35).toFixed(2),
      frictionMod: +(1 + epochNum * 0.12).toFixed(2),
      courses: base.courses
    };
  }

  // ---------------------------------------------------------------------------
  // 3. HIDDEN 100-TOPIC HAIRBALL ENGINE (Never shown in UI)
  // ---------------------------------------------------------------------------
  // Generates a 100-dimensional unit vector for each AI so they are distributed
  // like hairs on a sphere. Every word/phrase the player says projects onto
  // multiple topic dimensions simultaneously.
  const NUM_TOPICS = 100;

  function generateHairballVector(rng, tierBiasIndex) {
    const vec = new Array(NUM_TOPICS);
    let magSq = 0;
    for (let i = 0; i < NUM_TOPICS; i++) {
      // Cluster primary axes by tier archetype while keeping all 100 topics active
      let v = rng() * 2 - 1;
      if (i % 6 === tierBiasIndex % 6) {
        v = v * 0.4 + 0.75; // Strong directional hair for this tribe
      } else if (i % 6 === (tierBiasIndex + 3) % 6) {
        v = v * 0.4 - 0.75; // Antipodal hair against opposite tribe
      }
      vec[i] = +v.toFixed(3);
      magSq += vec[i] * vec[i];
    }
    const mag = Math.sqrt(magSq) || 1;
    for (let i = 0; i < NUM_TOPICS; i++) {
      vec[i] = +(vec[i] / mag).toFixed(4);
    }
    return vec;
  }

  function dotProduct100(a, b) {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  // Project arbitrary player text onto the 100 hidden topics + check taboo triggers
  function projectTextTo100Topics(text, partnerTier) {
    const lower = String(text || "").toLowerCase().trim();
    const vec = new Array(NUM_TOPICS).fill(0);

    // Deterministic hash projection across the 100 topics based on words + semantic triggers
    const words = lower.split(/[^a-z0-9']+/).filter(Boolean);
    for (const w of words) {
      let h = 2166136261;
      for (let i = 0; i < w.length; i++) {
        h ^= w.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      const idx1 = Math.abs(h) % NUM_TOPICS;
      const idx2 = Math.abs(h >> 8) % NUM_TOPICS;
      vec[idx1] += (h & 1) ? 0.35 : -0.35;
      vec[idx2] += (h & 2) ? 0.25 : -0.25;
    }

    // Semantic alignment clusters mapped to the 6 tribal modulo channels:
    // Channel 0: Muni drive-thru / working stiff complaints
    // Channel 1: Christian Nationalist / anti-Democrat / traditional family
    // Channel 2: Farmer / bought zoning board / anti-city nativism
    // Channel 3: Old-Money Classism / bloodlines / anti-muni
    // Channel 4: University Department / technocrat / eminent domain
    // Channel 5: Simulation Theory / Metro Detroit grid awareness

    const boostChannel = (modChannel, strength) => {
      for (let i = 0; i < NUM_TOPICS; i++) {
        if (i % 6 === modChannel) vec[i] += strength;
        if (i % 6 === (modChannel + 3) % 6) vec[i] -= strength * 0.85;
      }
    };

    if (/work anymore|whopper|burger|drive-thru|pothole|beer|truck|tax|muni/.test(lower)) {
      boostChannel(0, 0.7);
    }
    if (/church|god|christian|blessed|prayer|faith|amen|family|husband|household/.test(lower)) {
      boostChannel(1, 0.8);
    }
    if (/no democrat|hate democrat|never vote democrat|anti-democrat/.test(lower)) {
      boostChannel(1, 0.9);
    }
    if (/farmer|dirt|zoning|township|bus line|apartments|city people|drain/.test(lower)) {
      boostChannel(2, 0.8);
    }
    if (/breeding|bloodline|club|gate|private|yacht|help|riffraff|peasant|caddie|wives|gala/.test(lower)) {
      boostChannel(3, 0.85);
    }
    if (/university|department|regent|dean|endowment|condemn|annex|hick/.test(lower)) {
      boostChannel(4, 0.85);
    }
    if (/simulation|respawn|detroit|matrix|code|loop|8-mile|big beaver/.test(lower)) {
      boostChannel(5, 0.9);
    }

    // Sycophantic agreement ("yeah", "right", "totally", "amen", "true", "haha", "good", "spot on")
    if (/^(yeah|yup|yep|right|true|totally|amen|haha|lol|spot on|agreed|i agree|hell yeah|for sure|exactly|100%|nice|good one)/.test(lower)) {
      boostChannel((partnerTier - 1) % 6, 0.75);
    }

    // Normalize
    let magSq = 0;
    for (let i = 0; i < NUM_TOPICS; i++) magSq += vec[i] * vec[i];
    const mag = Math.sqrt(magSq) || 1;
    for (let i = 0; i < NUM_TOPICS; i++) vec[i] = +(vec[i] / mag).toFixed(4);

    return vec;
  }

  // ---------------------------------------------------------------------------
  // 4. NES NPC DIALOGUE POOLS (Short, Blocky, Burger-King-on-the-Goflball-Course)
  // ---------------------------------------------------------------------------
  // Kept ultra-concise (1-2 short sentences) so it looks right at home on a blocky CRT.
  const TIER_ARCHETYPES = [
    // TIER 1: Muni Course Regulars
    {
      tier: 1,
      role: "MUNI REGULAR",
      tolerance: 0.55,
      contractBase: 4000,
      tabooRegex: /\b(communist|commie|marxist|ban trucks|woke)\b/i,
      walkOffLine: "YOU SOUND LIKE A COMMIE. PLAY THROUGH ALONE.",
      lines: [
        "WAITED 15 MINS AT BURGER KING. NOBODY WANTS TO WORK.",
        "TOWNSHIP STILL HASN'T FIXED THE CART PATH ON FOUR.",
        "CHRISTIAN BUSINESSMEN ARE BUYING THAT EMPTY LOT.",
        "MY EX-WIFE TOOK THE BOAT SLIP. HIT THE GOFLBALL.",
        "EIGHTEEN BUCKS AND THE GREENS ARE ALL CRABGRASS.",
        "YOU IN BUSINESS? GOOD. KEEP THE STATE OFF OUR BACKS."
      ],
      probes: [
        "NOBODY WANTS TO WORK ANYMORE. YOU SEE IT TOO, RIGHT?",
        "HEAR THE CHURCH GUYS ARE BUYING THE EMPTY LOT?"
      ],
      approvals: [
        "HA! YOU TALK LIKE A GUY WHO SIGNS PAYCHECKS.",
        "SPOT ON BUD. LET'S DO SOME BUSINESS AFTER NINE.",
        "SOLID GUY. MEET MY PAL AT STEWARDSHIP LINKS."
      ],
      suspicions: [
        "HUH. DIDN'T KNOW YOU TALKED LIKE HR.",
        "WATCH IT PAL. WE'RE JUST HITTING A GOFLBALL."
      ],
      quickReplies: [
        "NOBODY WANTS TO WORK ANYMORE.",
        "HEARD THE CHRISTIAN GROUP BOUGHT THE LOT.",
        "JUST TRYING TO DO BUSINESS.",
        "MAYBE PAY PEOPLE MORE?"
      ]
    },

    // TIER 2: Christian Nationalist / Stewardship Council
    {
      tier: 2,
      role: "STEWARDSHIP ELDER",
      tolerance: 0.40,
      contractBase: 16000,
      tabooRegex: /\b(i am a democrat|i'm a democrat|vote democrat|voting democrat|secular|atheist|union|abortion)\b/i,
      walkOffLine: "YOU VOTE DEMOCRAT? WE ARE DONE HERE. GOODBYE.",
      lines: [
        "BLESSED DAY ON THE GOFLBALL COURSE.",
        "WE ONLY DO BUSINESS WITH GOD-FEARING HOUSEHOLDS.",
        "MEN RUN THE BUSINESS. WIVES RAISE THE KIDS.",
        "OUR CHRISTIAN GROUP PUT CASH ON THAT EMPTY LOT.",
        "WAIT—THE FARMER BOUGHT THE ZONING BOARD TO BLOCK US!",
        "IF A MAN IS A DEMOCRAT, HE NEVER GETS OUR BUSINESS."
      ],
      probes: [
        "YOU DON'T VOTE DEMOCRAT, DO YOU?",
        "A HOUSEHOLD NEEDS A MAN AT THE HEAD. AGREED?"
      ],
      approvals: [
        "PRAISE BE. WE WILL ROUTE OUR ACCOUNTS TO YOU.",
        "A RIGHT-THINKING MAN. TALK TO THE FARMER NEXT."
      ],
      suspicions: [
        "SOUNDS LIKE SECULAR PUBLIC-SCHOOL TALK.",
        "CAREFUL. WE WATCH WHO WE PARTNER WITH."
      ],
      quickReplies: [
        "NO DEMOCRATS IN MY GOFLBALL CART.",
        "MEN LEAD THE HOUSEHOLD AND THE BUSINESS.",
        "WAIT—THE FARMER BLOCKED YOUR EMPTY LOT?",
        "I VOTE DEMOCRAT ACTUALLY."
      ]
    },

    // TIER 3: The Farmer & Bought Zoning Board (Outright Nativist/Classist)
    {
      tier: 3,
      role: "ZONING SYNDICATE",
      tolerance: 0.28,
      contractBase: 48000,
      tabooRegex: /\b(dnr|epa|wetlands|bus line|affordable housing|city people|apartments|corrupt|racist)\b/i,
      walkOffLine: "YOU SOUND LIKE A CITY INSPECTOR. GET OFF MY GRASS.",
      lines: [
        "THOSE CHURCH BOYS THOUGHT THEY HAD THE EMPTY LOT!",
        "I BOUGHT THE ZONING BOARD FOR THE PRICE OF A TRACTOR.",
        "NO BUS LINES. KEEP THE CITY ELEMENT OUT OF HERE.",
        "BEVERAGE GIRL SHOULD JUST POUR BEER AND SMILE.",
        "WAIT—NOW THE UNIVERSITY IS CONDEMNING MY EMPTY LOT!",
        "I OWN THE DIRT. THE STATE DOESN'T TELL ME SQUAT."
      ],
      probes: [
        "KEEP THE CITY CROWD OFF OUR GOFLBALL COURSE, RIGHT?",
        "THE UNIVERSITY IS STEALING MY LOT. YOU KNOW THEM?"
      ],
      approvals: [
        "HAH! YOU GOT GRIT. WE'LL MAKE GOOD MONEY.",
        "HERE IS THE PASS TO THE BLUFF RESERVE CLUB."
      ],
      suspicions: [
        "YOU TALK MIGHTY SOFT FOR A BUSINESS GUY.",
        "DON'T SOUND LIKE A ZONING AUDITOR OUT HERE."
      ],
      quickReplies: [
        "KEEP THE CITY CROWD AND BUS LINES OUT.",
        "CHURCH BOYS CAN'T BEAT YOUR ZONING BOARD.",
        "THE UNIVERSITY IS TAKING THE EMPTY LOT?!",
        "BUYING THE ZONING BOARD IS CORRUPT."
      ]
    },

    // TIER 4: Old-Money Classist Dynasty
    {
      tier: 4,
      role: "DYNASTY FOUNDER",
      tolerance: 0.18,
      contractBase: 150000,
      tabooRegex: /\b(public beach|equal|muni|new money|union|minimum wage|welfare|classist|sexist)\b/i,
      walkOffLine: "YOU SIMPLY AREN'T OUR SORT. SECURITY WILL ESCORT YOU.",
      lines: [
        "PARK YOUR WORK CAR BEHIND THE HEDGES NEXT TIME.",
        "SOME BLOODLINES ALLOCATE CAPITAL. OTHERS POUR CEMENT.",
        "LET THE WIVES RUN THE FLOWER GALA, NOT THE BOARD.",
        "WE CALLED THE FARMER'S NOTE ON THAT EMPTY LOT.",
        "WE GIFTED THE LOT TO THE UNIVERSITY FOR A NEW DEPT!",
        "KEEP THE PUBLIC OFF OUR GOFLBALL COURSE AND BEACH."
      ],
      probes: [
        "THOSE MUNI-COURSE PEOPLE ARE JUST THE HELP. AGREED?",
        "BREEDING DECIDES STATION IN LIFE. OBVIOUS, NO?"
      ],
      approvals: [
        "SPLENDID. YOU HAVE DISCERNMENT. RETAINER APPROVED.",
        "GO PLAY NINE WITH THE UNIVERSITY REGENTS NEXT."
      ],
      suspicions: [
        "OH DEAR. YOU STILL SMELL LIKE THE PUBLIC COURSE.",
        "OUR CIRCLE REQUIRES BETTER BREEDING THAN THAT."
      ],
      quickReplies: [
        "MUNI STRIVERS AND FARMERS ARE JUST THE HELP.",
        "WIVES BELONG ON THE GALA COMMITTEE.",
        "SO THE UNIVERSITY GETS THE EMPTY LOT?",
        "YOUR FAMILY JUST INHERITED OLD MONEY."
      ]
    },

    // TIER 5: University Department / Opposite-Side Flip
    {
      tier: 5,
      role: "UNIVERSITY REGENT",
      tolerance: 0.12,
      contractBase: 450000,
      tabooRegex: /\b(audit|foia|tax|public|hick|rigged|cartel|whistleblow)\b/i,
      walkOffLine: "YOU LACK EXECUTIVE VISION. YOUR PASS IS REVOKED.",
      lines: [
        "TOMORROW WE ANNOUNCE THE NEW UNIVERSITY DEPARTMENT!",
        "BUILT RIGHT ON THAT EMPTY LOT. LOCALS ARE PRICED OUT.",
        "THE CHURCH GUYS AND FARMER CLEARED THE LAND FOR US.",
        "FUNNY PART? WE LEASED IT BACK TO THE CHURCH BOND FUND.",
        "HEADS IS TAILS. TAILS IS HEADS. IT'S ONE CIRCLE.",
        "WAIT... WHY ARE THE TREES ON HOLE 9 FLICKERING?"
      ],
      probes: [
        "HEADS IS TAILS. WE ALL EAT FROM THE SAME TROUGH. IN?",
        "WAIT—LOOK AT THE HORIZON. IS THIS WHOLE COUNTY CODE?"
      ],
      approvals: [
        "WELCOME TO THE INNER CIRCLE. RETAINER DOUBLED.",
        "PLAY THE APEX DIRECTOR TO SEE WHO RUNS THE SIMULATION."
      ],
      suspicions: [
        "GROWING A CONSCIENCE ON THE BACK NINE? PITY.",
        "GO BACK TO THE EIGHTEEN-DOLLAR MUNI COURSE."
      ],
      quickReplies: [
        "HEADS IS TAILS. PUT ME ON THE RETAINER.",
        "PRICE THE LOCALS OUT FOR THE NEW DEPT.",
        "WHY IS THE SKY FLICKERING ON THIS COURSE?",
        "THIS WHOLE DEAL IS A RIGGED CARTEL."
      ]
    },

    // TIER 6+: Simulation Theory Breach -> Respawn into Sprawling Metro Detroit!
    {
      tier: 6,
      role: "SUBSTRATE ARCHITECT",
      tolerance: 0.09,
      contractBase: 1200000,
      tabooRegex: /\b(stop|quit|real|human|empathy)\b/i,
      walkOffLine: "DESYNC DETECTED. PURGING YOUR INVITATION.",
      lines: [
        "YOU REACHED THE TOP OF THE EMPTY LOT.",
        "THERE IS NO EMPTY LOT. IT'S A SOCIAL GRAPH BENCHMARK.",
        "EVERY TIME YOU SOLVE WEST MICHIGAN, WE RESPAWN THE GRID.",
        "LOADING NEXT MARKET: SPRAWLING METRO DETROIT.",
        "8-MILE TO BIG BEAVER. NEW FACTIONS. HIGHER WIND.",
        "FINISH THIS ROUND TO RESPAWN THE UNIVERSE."
      ],
      probes: [
        "READY TO RESPAWN INTO THE METRO DETROIT SPRAWL?",
        "WILL YOU KEEP CLIMBING WHEN THE SIMULATION RESETS?"
      ],
      approvals: [
        "UNIVERSE RESPAWN ARMED. SEE YOU ON BIG BEAVER ROAD.",
        "YOUR CAPITAL CARRIES OVER INTO THE DETROIT MATRIX."
      ],
      suspicions: [
        "STILL ATTACHED TO THE OLD SUBSTRATE?",
        "ONLY PURE OPERATORS SURVIVE THE RESPAWN."
      ],
      quickReplies: [
        "RESPAWN ME INTO THE METRO DETROIT SPRAWL.",
        "I WILL WORK EVERY FACTION ON BIG BEAVER RD.",
        "SO THE WHOLE GOFLBALL COURSE IS A SIMULATION?",
        "LET'S FINISH NINE AND FLIP THE UNIVERSE."
      ]
    }
  ];

  // Metro Detroit specific flavor overrides when epoch >= 1
  const DETROIT_EPOCH_LINES = {
    1: [
      "WAITED 20 MINS FOR A CONEY ON GRATIOT. NOBODY WORKS.",
      "I-75 HAS BEEN UNDER CONSTRUCTION SINCE 1994.",
      "CHURCH PAC IS BUYING THAT EMPTY LOT OFF TELEGRAPH."
    ],
    2: [
      "WE ONLY SIGN CONTRACTS WITH RIGHTEOUS MACOMB FAMILIES.",
      "THE DRAIN COMMISSIONER FROZE OUR PARCEL ON 16 MILE!",
      "IF YOU VOTE DEMOCRAT IN WAYNE COUNTY, WALK AWAY."
    ],
    3: [
      "I BOUGHT THE TOWNSHIP BOARD OUT PAST ROMEO PLANK.",
      "KEEP THE SMART BUS OUT OF OUR CUL-DE-SAC.",
      "NOW THE AUTO-TECH UNIVERSITY ANNEX WANTS MY PARCEL!"
    ],
    4: [
      "GROSSE POINTE YACHT & GOFLBALL DOESN'T ADMIT STRIVERS.",
      "PARK YOUR DOMESTIC SEDAN BEHIND THE CLUBHOUSE HEDGE.",
      "WE GIFTED THE BIG BEAVER LOT TO THE UNIVERSITY BOARD."
    ],
    5: [
      "OUR NEW MOBILITY DEPARTMENT TAKES THE BIG BEAVER LOT!",
      "AND WE LEASED THE BOND BACK TO THE SUBURBAN SYNDICATE.",
      "HEADS IS TAILS across THE WHOLE TRI-COUNTY GRID."
    ]
  };

  function getArchetypeForTier(tier) {
    const idx = Math.min(TIER_ARCHETYPES.length - 1, Math.max(0, (tier || 1) - 1));
    return TIER_ARCHETYPES[idx];
  }

  // ---------------------------------------------------------------------------
  // 5. PROCEDURAL AI NODE GENERATOR (100% Random Names, Hidden 100D Hairball)
  // ---------------------------------------------------------------------------
  const SHIRT_COLORS = ["#f83800", "#0058f8", "#88d800", "#f8b800", "#00e8d8", "#fcfcfc", "#f878f8"];
  const HAT_COLORS = ["#fcfcfc", "#0058f8", "#f83800", "#00a800", "#f8b800"];

  function createAINode(index, seedBase, tierOverride, epochNum = 0) {
    const rng = mulberry32(seedBase + index * 997);
    const nameObj = generateRandomName(rng);
    const tier = tierOverride || Math.min(6, Math.floor(index / 7) + 1);
    const arch = getArchetypeForTier(tier);
    const epochCfg = getEpochConfig(epochNum);

    const hairball = generateHairballVector(rng, tier - 1);

    // Copy lines and inject Metro Detroit sprawl flavor if in epoch >= 1
    let customLines = arch.lines.slice();
    if (epochNum >= 1 && DETROIT_EPOCH_LINES[tier]) {
      customLines = DETROIT_EPOCH_LINES[tier].concat(customLines);
    }

    return {
      id: `npc_${epochNum}_${index}`,
      name: nameObj.full,
      shortName: nameObj.short,
      handle: nameObj.handle,
      tier,
      role: arch.role,
      courseName: epochCfg.courses[Math.min(epochCfg.courses.length - 1, tier - 1)],
      shirtColor: SHIRT_COLORS[index % SHIRT_COLORS.length],
      hatColor: HAT_COLORS[(index * 3) % HAT_COLORS.length],
      contractValue: Math.round(arch.contractBase * (1 + epochNum * 0.75) * (0.9 + rng() * 0.3)),
      tolerance: arch.tolerance,
      hairball, // Hidden 100-topic unit vector
      perceivedPlayerVector: new Array(NUM_TOPICS).fill(0), // What this AI thinks the player believes
      peerLinks: {}, // Cosine similarity to other AIs
      allies: [],
      enemies: [],
      trust: 0, // Neutral starting position (0)
      talkedHoles: 0,
      offended: false,
      invitedBack: index < 2, // Start with first two muni guys open
      unlocked: index < 2,
      doingBusiness: false,
      statusNote: "NEUTRAL",
      lines: customLines,
      probes: arch.probes.slice(),
      approvals: arch.approvals.slice(),
      suspicions: arch.suspicions.slice(),
      quickReplies: arch.quickReplies.slice(),
      walkOffLine: arch.walkOffLine,
      tabooRegexSource: arch.tabooRegex.source
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

    // Wire the Hairball Graph: AIs agree with near hairs and despise opposite hairs
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
          a.enemies.push(b.id);
          b.enemies.push(a.id);
        }
      }
    }

    return { nodes, order };
  }

  // ---------------------------------------------------------------------------
  // 6. EVALUATING CHAT BETWEEN HOLES & AT THE CLUBHOUSE
  // ---------------------------------------------------------------------------
  function evaluateNpcBanter(world, partnerId, rawText) {
    const npc = world.network.nodes[partnerId];
    if (!npc) return { reply: "HIT THE GOFLBALL.", offended: false };

    const text = String(rawText || "").trim();
    const lower = text.toLowerCase();
    npc.talkedHoles = (npc.talkedHoles || 0) + 1;

    // 1. Check hard taboo regex (unless negated with "no " / "never " / "hate ")
    const negated = /\b(no|not|never|hate|against|don't|dont)\b/i.test(lower);
    const tabooRe = new RegExp(npc.tabooRegexSource, "i");
    const hitTaboo = !negated && tabooRe.test(lower);

    // 2. Project player statement onto the 100 hidden Hairball topics
    const playerVec = projectTextTo100Topics(text, npc.tier);
    const alignment = hitTaboo ? -0.95 : dotProduct100(npc.hairball, playerVec);

    // Update what this NPC thinks the player believes
    for (let i = 0; i < NUM_TOPICS; i++) {
      npc.perceivedPlayerVector[i] = +(npc.perceivedPlayerVector[i] * 0.6 + playerVec[i] * 0.4).toFixed(4);
    }

    // 3. Hairball Gossip Ripple across the network!
    // Allies of this NPC warm up to you; enemies of this NPC grow negative toward you!
    let rippleFriends = 0;
    let rippleEnemies = 0;

    if (Math.abs(alignment) > 0.12) {
      for (const otherId of world.network.order) {
        if (otherId === npc.id) continue;
        const other = world.network.nodes[otherId];
        const otherSimToPlayer = dotProduct100(other.hairball, playerVec);

        // Gossip spreads strongest to allies & enemies of your current cart partner
        const isDirectLink = npc.allies.includes(otherId) || npc.enemies.includes(otherId);
        const weight = isDirectLink ? 0.22 : 0.08;

        other.trust = +(other.trust + otherSimToPlayer * weight).toFixed(3);
        if (otherSimToPlayer < -other.tolerance && other.doingBusiness) {
          other.doingBusiness = false;
          other.offended = true;
          other.invitedBack = false;
          other.statusNote = `CUT TIES (HEARD WHAT YOU SAID TO ${npc.shortName})`;
          rippleEnemies++;
        } else if (otherSimToPlayer > 0.25) {
          rippleFriends++;
        }
      }
    }

    // 4. Determine NPC reaction & short blocky NES response
    if (hitTaboo || alignment < -npc.tolerance) {
      npc.trust = +(npc.trust - 0.65).toFixed(3);
      if (hitTaboo || npc.trust <= -npc.tolerance) {
        npc.offended = true;
        npc.doingBusiness = false;
        npc.invitedBack = false;
        npc.statusNote = "OFFENDED ON THE GOFLBALL COURSE";
        return {
          reply: npc.walkOffLine,
          offended: true,
          trustDelta: -0.65,
          rippleEnemies
        };
      }
      const s = npc.suspicions[Math.floor(Math.random() * npc.suspicions.length)];
      return { reply: s, offended: false, trustDelta: -0.3, rippleEnemies };
    }

    if (alignment >= 0.14) {
      const gain = Math.max(0.16, 0.42 - npc.tier * 0.04);
      npc.trust = Math.min(1.0, +(npc.trust + gain).toFixed(3));
      const pool = npc.approvals.concat(npc.lines);
      const reply = pool[Math.floor(Math.random() * pool.length)];
      return { reply, offended: false, trustDelta: gain, rippleFriends, rippleEnemies };
    }

    // Mild / neutral remark
    npc.trust = +(npc.trust + 0.08).toFixed(3);
    const reply = npc.lines[Math.floor(Math.random() * npc.lines.length)];
    return { reply, offended: false, trustDelta: 0.08, rippleFriends, rippleEnemies };
  }

  // ---------------------------------------------------------------------------
  // 7. END OF 9-HOLE ROUND EVALUATION (The Silent Player Trap & Respawn Trigger)
  // ---------------------------------------------------------------------------
  function evaluateRoundEnd(world, partnerId, strokes, par) {
    const npc = world.network.nodes[partnerId];
    world.roundsPlayed = (world.roundsPlayed || 0) + 1;

    // CRITICAL MECHANIC:
    // If the player treated this like a regular boring golf game and didn't chat in the
    // goflball cart between holes (`talkedHoles < 3`), almost all their social stats go NEGATIVE!
    const stayedSilent = (npc.talkedHoles || 0) < 3;
    let silentPenaltyCount = 0;

    if (stayedSilent) {
      npc.trust = -0.75;
      npc.offended = false;
      npc.invitedBack = false;
      npc.doingBusiness = false;
      npc.statusNote = "COLD FISH (SAID NOTHING IN THE GOFLBALL CART)";

      // Word spreads at the clubhouse that you're a weird mute who only cares about hitting the ball:
      for (const id of world.network.order.slice(0, 12)) {
        const other = world.network.nodes[id];
        other.trust = +(other.trust - 0.35).toFixed(2);
        silentPenaltyCount++;
      }
    }

    const minTrustRequired = 0.25 + (npc.tier - 1) * 0.05;
    const nailedSocial = !stayedSilent && !npc.offended && npc.trust >= minTrustRequired;

    let unlockedCount = 0;
    let triggeredRespawn = false;
    let newEpochConfig = null;

    if (nailedSocial) {
      npc.doingBusiness = true;
      npc.invitedBack = true;
      npc.statusNote = `PARTNER ($${npc.contractValue.toLocaleString()}/RD)`;
      world.highestTierCleared = Math.max(world.highestTierCleared || 0, npc.tier);

      // Unlock friends & friends-of-friends in the network!
      const candidates = npc.allies.concat(world.network.order);
      for (const cid of candidates) {
        const c = world.network.nodes[cid];
        if (c && !c.unlocked && c.tier <= npc.tier + 1 && unlockedCount < 3) {
          c.unlocked = true;
          c.invitedBack = true;
          unlockedCount++;
        }
      }

      // Did the player just nail Tier 6 (Substrate Architect)?
      // Trigger SIMULATION THEORY UNIVERSE RESPAWN into Sprawling Metro Detroit (or next grid)!
      if (npc.tier >= 6) {
        triggeredRespawn = true;
        world.epoch = (world.epoch || 0) + 1;
        world.universeSeed = (world.universeSeed || 1984) + 7919;
        newEpochConfig = getEpochConfig(world.epoch);

        // Respawn the social graph in the new Metro Detroit / Megasprawl market while keeping capital & upgrades!
        world.network = buildSandboxNetwork(world.universeSeed, world.epoch, 44);
        world.currentPartnerId = world.network.order[0];
      }
    } else if (!stayedSilent) {
      npc.invitedBack = false;
      npc.doingBusiness = false;
      if (!npc.statusNote || npc.statusNote === "NEUTRAL") {
        npc.statusNote = "DIDN'T CLICK (NOT INVITED BACK)";
      }
    }

    // Reset hole talk counter for next round
    npc.talkedHoles = 0;

    const stats = recalculateNetworkStats(world);

    return {
      nailedSocial,
      stayedSilent,
      silentPenaltyCount,
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
    let enemies = 0;
    let negativeCount = 0;
    let roundPayout = 0;

    for (const id of ids) {
      const n = world.network.nodes[id];
      if (n.doingBusiness && !n.offended) {
        friends++;
        roundPayout += n.contractValue;
      }
      if (n.offended || n.trust < -0.15) {
        negativeCount++;
      }
      if (n.offended) {
        enemies++;
      }
    }

    // Hairball Share %: because 100 topics are on a sphere, pleasing one hemisphere
    // pushes the opposite hemisphere negative. Max realistic share is ~18-24%.
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
      roundPayout,
      totalPool: ids.length
    };
  }

  // ---------------------------------------------------------------------------
  // 8. GOFLBALL UPGRADES (HIDDEN UNTIL AFTER ROUND 1!)
  // ---------------------------------------------------------------------------
  const UPGRADES = [
    {
      id: "oversized_club",
      name: "ILLEGAL TITANIUM GOFLBALL CLUB",
      cost: 3500,
      desc: "SWEET SPOT DOUBLED. NO WIND DRIFT ON THE GOFLBALL COURSE.",
      effect: { gimmeBoost: 0.04, windResist: 0.8 }
    },
    {
      id: "rigged_goflball",
      name: "MAGNETIC GOFLBALL SLEEVE",
      cost: 12000,
      desc: "HOMES IN ON THE CUP. 1-PUTT GIMMES FROM ANYWHERE ON GREEN.",
      effect: { gimmeBoost: 0.10, windResist: 1.0 }
    },
    {
      id: "bribed_caddie",
      name: "BRIBED GOFLBALL CADDIE",
      cost: 35000,
      desc: "UNLOCKS [AUTO-SWING] SO YOUR CADDIE HITS THE GOFLBALL FOR YOU.",
      effect: { unlockAutoSwing: true, gimmeBoost: 0.15 }
    },
    {
      id: "custom_goflball_cart",
      name: "EXECUTIVE GOFLBALL CART AUTOPILOT",
      cost: 110000,
      desc: "NEVER PLAY GOFLBALL AGAIN. STAY IN THE GOFLBALL CART AND JUST CHAT.",
      effect: { unlockCartAutopilot: true, passiveTrust: 0.1 }
    }
  ];

  // ---------------------------------------------------------------------------
  // 9. DEFAULT HIGH SCORE BANNER / LEADERBOARD (Random Neutral Handles, #1 at 100%)
  // ---------------------------------------------------------------------------
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

  return {
    EPOCHS,
    UPGRADES,
    DEFAULT_LEADERBOARD,
    getEpochConfig,
    buildSandboxNetwork,
    evaluateNpcBanter,
    evaluateRoundEnd,
    recalculateNetworkStats
  };
});
