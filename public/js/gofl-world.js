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
        const feelerPool = (npc.feelerLines && npc.feelerLines.length)
          ? npc.feelerLines
          : (npc.safeLines || SAFE_LULLABY_LINES);
        return feelerPool[(hIdx + (npc.seedOffset || 0)) % feelerPool.length];
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
    "JUST SPILLED MY COFFEE ON THE GRASS. GREAT WAY TO START THE DAY.",
    "MY PARROT CAN PLAY GOFLBALL BETTER THAN YOU!",
    "THERE'S NOTHING LIKE THE SMELL OF GRASS AFTER RAIN.",
    "I'M WORRIED I'M GOING TO BURN THIS 4-IRON.",
    "HAS ANYONE SEEN MY CLUB HEADGUARD? IT ALWAYS GOES MIA.",
    "MY CLUB IS A RUSTY SWORD, NOT A GOFLBALL CLUB.",
    "THE COURSE IS LIKE A MAZE, BUT WITHOUT THE FUN.",
    "I'M TIED UP IN BOWS, NOT WITH A BAD SWING.",
    "I'M HAVING SUCH A BAD DAY. EVEN MY 5-IRON WANTS TO GO TO THE DOCTOR.",
    "WHY IS THE 5-IRON SO HEAVY? I CAN'T EVEN SWING IT!",
    "HAD TO RUN AROUND LOOKING FOR MY GOFLBALL. IT WAS RIGHT THERE!",
    "FINALLY GOT THE PERFECT SWING. MY 8-IRON'S ON FIRE!",
    "THE GRASS IS SO LONG, IT LOOKS LIKE A MAZE!",
    "WHY DIDN'T I BRING MY SUNGLASSES? THIS COURSE IS BLINDING!",
    "HAD TO USE TWO 9-IRONS TO HIT THIS ONE. WHO KNEW?",
    "THE GOFLBALL COURSE IS SO QUIET, I CAN HEAR MY OWN SHOES!",
    "MY COFFEE IS LUKEWARM, BUT MY SPIRIT IS AS HOT AS EVER.",
    "HAVEN'T SEEN A CLEAN HIT IN WEEKS! KEEP YOUR EYES UP!",
    "MY CLUBS FEEL LIKE THEY'VE GAINED A FEW POUNDS.",
    "I'M TRYING TO SWING LIKE A PRO, NOT LIKE A WIMP.",
    "HAVEN'T SLEPT IN DAYS BECAUSE OF THIS LUKEWARM COFFEE.",
    "MY 5-IRON JUST FELL INTO THE ROUGH AGAIN. GRRR!",
    "THE CART'S BATTERY ONLY LASTS 2 HOURS. SO FRUSTRATING!",
    "DOZED OFF IN THE RUGGED GRASS, WOKEN BY A LEECH BITE.",
    "SWALLOWED A GRASSHOPPER WHILE LOOKING FOR MY CLUBS.",
    "TRYING TO GOFLBALL IN THE RAIN, ONLY MADE THE COURSE SLIPPERY.",
    "THE SUN IS BEATING DOWN, BUT I LOVE A GOOD BLISTER.",
    "EATEN AN ENTIRE PACK OF GUM, STILL CAN'T STOP CHEWING.",
    "DID YOU HEAR THAT? SOMEONE LEFT THEIR 5-IRON ON THE LUGGAGE CAR.",
    "MY COFFEE IS COLD AS ICE, BUT AT LEAST IT'S NOT BURNED.",
    "THE GOFLBALL CART IS GROANING, IT'S GETTING OLD.",
    "WONDERING IF THE GRASS IS REALLY THAT GREEN OR IS IT JUST AN ILLUSION?",
    "TODAY'S WEATHER IS PERFECT FOR FORGETTING YOUR CLUBS.",
    "THE 5-IRON IS A TRAITOR, KEPT SLICING MY SHOTS.",
    "HAD TO CALL IN A BURGER KING RUN, LATE TEES ALWAYS BOTHER ME.",
    "GOFLBALL COURSE LOOKS GREAT BUT MY BATTERIES ARE ON THEIR LAST LEG.",
    "MY 5-IRON HAS A MIND OF ITS OWN AND ALWAYS GOES OFF PATH.",
    "BATTERY ON THIS GOFLBALL CART IS DYING ALREADY.",
    "SAW A SQUIRREL ON THE GOFLBALL COURSE, IT LOOKED BORED.",
    "TRYING TO PUT ON SUNGLASSES, THEY KEEP SLIPPING DOWN.",
    "JUST SMELLED BEEF JERKY IN THE AIR, MAKES ME HUNGRY.",
    "I'M TRYING TO HIT IT STRAIGHT, NOT INTO THE LAWN MOWER!",
    "THIS GOFLBALL COURSE IS A NIGHTMARE. EVERY HOLE IS A MIRAGE!",
    "I THINK I OVERGRABBED THE 6-IRON. NOW I'M GOING TO THE ROUGH.",
    "MY TEE SHOES KEEP COMING OFF ON THE GRASS. GRRR!",
    "HAD TO CALL A RIDE. GOFLBALL COURSE IS WAY OUT HERE!",
    "DIDN'T REALIZE HOW LUKEWARM THIS COFFEE IS. NEED MORE CREAM!",
    "HAVEN'T PLAYED GOFLBALL IN YEARS, I'M RUSTY!",
    "JUST SPILLED COFFEE ON MY 5-IRON, NOW IT SMELLS LIKE MUSTY LINEN.",
    "MY PUTTER LOOKS LIKE IT'S BEEN TO THE MOON AND BACK.",
    "MY LUKEWARM COFFEE JUST GOT COLDER. UGH!",
    "HAVEN'T SEEN A GOOD BURGER IN AGES. ANYONE KNOW WHERE TO GET ONE?",
    "TRIED TO HIT THE BALL BUT ENDED UP MOWING THE LAWN INSTEAD. LOL!",
    "WONDERING IF THEY HAVE AVOIDED THE ZOMBIES AT BURGER KING.",
    "MY GOFLBALL CART IS CARRYING MORE DEAD BATTERIES THAN I CAN COUNT.",
    "HAVEN'T PLAYED GOFLBALL IN FOREVER. FEELING RUSTY.",
    "MY COFFEE IS COLD, BUT MY SPIRIT IS AS WARM AS EVER.",
    "JUST BUMPED INTO A LAWNMOWER. HOPE IT DIDN'T MOW ME OVER!",
    "WONDERING IF THE LEEVES ON THIS 5-IRON ARE EVEN REAL.",
    "MY GLOVES SMELL LIKE OLD SOCKS AFTER THE COURSE.",
    "THE SUN IS SO HOT, IT'S MAKING MY CLUBS SHINE.",
    "DID YOU HEAR THE GOFLBALL CART GO BEEP? IT'S ON EMPTY!",
    "JUST SPOTTED A GOOSE ON THE COURSE. I'M NOT SURE IF IT LIKES GOFLBALL.",
    "MY CLUB IS AS OLD AS I AM. IT STILL MISSES EVERY FIFTH SHOT.",
    "JUST REALIZED I FORGOT TO PUT GAS IN THE LAWN MOWER.",
    "CAN YOU BELIEVE THE GOFLBALL CART IS MAKING THAT SCREECHING NOISE?",
    "THE ONLY THING I LIKE MORE THAN GOFLBALL IS DODGEBALL.",
    "I'M SWINGING LIKE A MADMAN, BUT STILL HITTING THE TEE!",
    "HAD TO CALL IN A TAXI, COULDN'T FIND MY CLUBS ANYWHERE!",
    "LUCKY I BROUGHT MY OWN CLUBS, THE COURSE RENTALS SUCK.",
    "THE LUGWORMS ARE OUT. AGAIN.",
    "I'M DREAMING OF CLEANING OUT THE ROUGH.",
    "MAYBE THIS 5-IRON WILL STAY STRAIGHT.",
    "I FORGOT THE GOFLBALL GLOVES AGAIN, CAN'T GRAB THE CLUBS!",
    "WISH MY LUKEWARM COFFEE WAS AS HOT AS MY CLUB.",
    "EVERY TIME I HIT THE GREEN, IT'S INTO THE ROUGH.",
    "GOFLBALL CART BATTERIES? THEY'RE ALREADY ON EMPTY.",
    "LAWNMOWER JUST BLEW A TIRE AGAIN! NOW I'M LATE FOR MY ROUND!",
    "I'M TOTALLY HYPNOTIZED BY THE SLOW-MO WATER SPLASHES IN THIS COURSE.",
    "MY CLUBS ALL FEEL LIGHTER TODAY, LIKE I'M PLAYING WITH STICKS!",
    "MY PUTTER'S BEEN MIA FOR WEEKS!",
    "I CAN'T BELIEVE I FORGOT TO FILL THE CART'S TANK AGAIN.",
    "THE GENTLE BREEZE IS RUINING MY GAME!",
    "MY CLUBS FEEL LIKE THEY HAVE LIVES OF THEIR OWN!",
    "THIS COFFEE IS ONLY AS WARM AS MY SHOTGUN!",
    "TRYING TO HIT THE BALL STRAIGHT IS LIKE PLAYING TETRIS!",
    "SURE HOPE THIS SUNSCREEN LASTS. NO ONE WANTS A BLISTERY KNEE!",
    "MY TEE SHOES ARE ALL DUSTY. CAN'T FIND THE CLEAN ONES ANYWHERE.",
    "IF ONLY I COULD TIME-TRAVEL TO THE FUTURE. NO MORE 5-IRON HEADACHES!",
    "LOOKING FORWARD TO DRIVING THAT 4-IRON THROUGH THE GRASS.",
    "SURE HOPE THE LEECHES DON'T BITTEN INTO MY GOFLBALL.",
    "IF ONLY MY CLUBS WERE AS FUN AS YOU!",
    "WHY IS THE GOFLBALL SO LIGHT? IT'S LIKE PLAYING WITH AIR!",
    "THERE'S NOTHING WORSE THAN A MOWED LAWN ON A SUNDAY MORNING.",
    "I'VE LOST MORE THAN 10 CLUBS IN THE GROUNDSKEEPER'S GRASS.",
    "HEARD THE COFFEE WAS LUKEWARM? GUESS THAT'S PAR FOR THE COURSE.",
    "I HAD TO HIT 3 PUTTS JUST TO GET OUT OF THE SAND TRAP.",
    "MY CLUBS ALL SMELL LIKE OLD GRASS AND DEW.",
    "THE BATTERIES ON THE CART ALREADY NEED REPLACING.",
    "LAWNMOWER JUST KILLED MY CLUB AGAIN, WHAT A TOOL.",
    "DID YOU SEE THAT SPLASH? I THOUGHT I HAD IT IN THE HOLE.",
    "MY COFFEE IS STILL LUKEWARM, TYPICAL DAY.",
    "FINALLY MADE IT THROUGH THE DRIVING RANGE WITHOUT HITTING ANY TRESS.",
    "SIP BY SIP, TRYING TO WARM UP WITH THIS LUKEWARM COFFEE.",
    "MOWED THE LAWN LAST NIGHT, NOW IT'S TIME TO GET THAT 5-IRON RIGHT.",
    "WOW, MY TEE SHOOTS ARE AS CONSISTENT AS A SNAIL.",
    "I FORGOT MY CLUBS AT THE LUGGAGE ROOM AGAIN.",
    "THE COFFEE HERE IS LIKE SWAMP WATER. YUK!",
    "TRYING TO HIT THE GREEN WITH A PUTTER IS LIKE PLAYING BOWLING.",
    "MY LAWN MOWER JUST BROKE AGAIN, WHY DOES IT NEVER LAST?",
    "WAITED 12 MINS AT BURGER KING FOR COLD FRIES.",
    "CHOKED DOWN ON MY 7-IRON AND STILL SLICED IT.",
    "HAVEN'T SEEN A PUTTER IN AGES, THIS ONE'S ALL RUSTY.",
    "TRY NOT TO SLICE, OR ELSE YOU'LL BLOW THROUGH THE COURSE.",
    "THERE'S NOTHING WORSE THAN A LEAKY BURGER KING SODA.",
    "MY SHOES KEEP UNDOING IN THE GOFLBALL CART!",
    "WONDERING IF THIS GOFLBALL CART EVEN HAS GEAR SHIFT.",
    "MY CUP OF COFFEE IS AS WARM AS MY IRON SWING.",
    "IF ONLY MY CLUBS WERE AS CONSISTENT AS THIS WEATHER.",
    "COFFEE TASTES LIKE WATER TO ME.",
    "MY PUTTER JUST BROKE AGAIN. WHY IS THIS HAPPENING?",
    "DID YOU HEAR ABOUT THE TIME I LOST MY 4-IRON IN THE LAKE?",
    "HAD TO SWAP MY 5-IRON FOR A WEDGE BECAUSE IT WAS SO SLIPPERY.",
    "MY 3-PIECE SUIT IS COVERED IN GRASS STAINS FROM THE GOFLBALL CART.",
    "FINALLY GOT SOME GOOD COFFEE FROM THE VENDING MACHINE. YES!",
    "JUST LOOKED AT THE CLOUDS. THEY LOOK LIKE GOFLBALL COURSES!",
    "MY CLUB'S SO LIGHT, IT'S FLOATING IN THE AIR!",
    "HAD TO DIG MY CLUB OUT OF THE GRASS. GEEZ, THIS COURSE IS TERRIBLE.",
    "MY COFFEE IS COLDER THAN A SNOWMAN IN JULY!",
    "TRYING TO KEEP MY CLUBS WARM IN THIS BLOWING WIND.",
    "EATEN AN ENTIRE PACKAGE OF GUM IN ONE HOUR.",
    "LAWNMOWERS ARE THE WORST. THEY KEEP TRYING TO MOW MY SHOES.",
    "EVEN THE BATTERIES IN MY GOFLBALL CART ARE THINKING ABOUT RETIREMENT.",
    "MY COFFEE IS LUKEWARM AND I'M ALREADY GRUMPY.",
    "THE LAWN MOWER IS NOISY, CAN'T YOU HEAR IT?",
    "I HOPE I DON'T SLICE INTO THE ROUGH AGAIN.",
    "THE 5-IRON IS MY FAVORITE. IT ALWAYS GOES STRAIGHTER THAN THE DRIVER.",
    "WISH MY 5-IRON WAS AS ACCURATE AS MY BOWLING BALL.",
    "THE MOWER IN THE NEIGHBORHOOD IS DRIVING ME CRAZY.",
    "HOPED FOR A HOLE-IN-ONE BUT ONLY GOT A LUKEWARM COFFEE.",
    "WAITED TWELVE MINUTES IN THE BURGER KING DRIVE-THRU ON 28TH. COLD HASH BROWNS.",
    "GREENS ARE RUNNING FAST TODAY. YOU PLAY WITH A 5-IRON OR A WEDGE FROM HERE?",
    "ROAD SALT ATE RIGHT THROUGH THE ROCKER PANELS ON MY F-250. THIRD TIME THIS YEAR.",
    "BEAUTIFUL BREEZE OFF THE FAIRWAY TODAY. HARD TO BEAT NINE HOLES ON A TUESDAY.",
    "MY NEIGHBOR BLEW HIS LAWN CLIPPINGS ACROSS MY DRIVEWAY AGAIN. UNREAL.",
    "WIND'S COMING RIGHT OFF THE CORNFIELD ON HOLE FOUR. AIM LEFT OF THE PINE.",
    "THE GAS STATION ICE DISPENSER WAS JAMMED THIS MORNING. JUST WATER COMING OUT.",
    "PACE OF PLAY IS ACTUALLY DECENT TODAY. NOBODY HOLDING US UP ON THE FAIRWAY.",
    "I CHANGED MY GRIP OVER THE WINTER. FINALLY STOPPED SLICING INTO THE CATTAILS.",
    "WATER SOFTENER IN MY BASEMENT WENT OUT ON SUNDAY. SALT BAGS WEIGH FORTY POUNDS.",
    "ALREADY GOT MY BOAT WINTERIZED LAST WEEK. LAKE ACCESS FEES DOUBLED THIS YEAR.",
    "GRABBED A SAUSAGE BISCUIT BEFORE TEE TIME. COFFEE WAS LUKEWARM BUT I NEEDED IT.",
    "ALWAYS GOOD SITTING IN A GOFLBALL CART WITH ANOTHER GUY WHO ACTUALLY WORKS FOR A LIVING."
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
        "TOUGH FINDING GUYS YOU CAN ACTUALLY RELY ON LATELY.",
        "DRIVE-THRU TOOK 15 MINS. NOBODY COUNTS BACK CHANGE ANYMORE.",
        "YOU SEE THAT EMPTY LOT BY THE EXIT? SURVEY STAKES JUST WENT UP.",
        "HARD TO FIND A SUBCONTRACTOR WHO SHOWS UP ON TIME ON MONDAYS.",
        "MY ACCOUNTANT TOLD ME TO WRITE OFF THE TRUCK BEFORE YEAR-END.",
        "BANKS TIGHTENED UP ON COMMERCIAL PAPER LAST QUARTER. YOU SEEING THAT?",
        "WE DO MOST WORK ON A HANDSHAKE OUT HERE IF WE KNOW YOUR PEOPLE.",
        "LOT OF NEW LICENSE PLATES AT THE STRIP MALL COFFEE SHOP LATELY.",
        "COUNTY WIDENED THE DITCH LINE BY THAT 40-ACRE FIELD. SOMEBODY'S BUILDING."
      ],
      maskOffLines: [
        "BETWEEN US IN THIS GOFLBALL CART—NOBODY WANTS TO PUT IN HOURS ANYMORE.",
        "USED TO BE YOU COULD SPEAK PLAIN ON SITE WITHOUT HR FILING PAPERWORK.",
        "IF THE CITY BUS CROWD KEEPS PUSHING OUT HERE, THIS TOWNSHIP BLOCK IS FINISHED.",
        "PRIVATE CLUB GUYS LOOK DOWN THEIR NOSES TILL THEIR SUBCONTRACTOR NO-SHOWS.",
        "OUT-OF-TOWNERS MOVE HERE FOR THE LOW TAXES AND IMMEDIATELY VOTE TO RAISE THEM.",
        "YOU CAN TELL IN TWO MINUTES IF A GUY ACTUALLY WORKED OR SAT IN A CUBICLE."
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
    "DO YOU PLAY BETTER IN PRIVATE COURSES?",
    "THEY SAY THE EMPTY LOT IS CURSED.",
    "HAVE YOU SPOTTED THE NEW TEE BOXES YET?",
    "IT'S RUMORED THAT THE 40-ACRE LOT MIGHT GET A MAKEOVER.",
    "HAVEN'T YOU NOTICED THE NEW TEE BOXES ON THE COURSE?",
    "I HEAR THE RUMOR THAT THE EMPTY LOT IS UP FOR SALE.",
    "THEY SAY THE 40-ACRE LOT HAS A SECRET PASSAGE TO THE GOFLBALL MANSION.",
    "DO YOU EVER GOFLBALL ON WEEKENDS?",
    "DO YOU HAVE ANY INSIDE TIPS FOR THE GOFLBALL COURSE?",
    "I HEAR THEY'RE LOOKING TO RENT OUT THAT EMPTY LOT NEARBY.",
    "DO YOU THINK THE COURSE WILL EVER ALLOW NIGHT PLAY?",
    "I HEARD THE OWNER IS LOOKING INTO ADDING MORE HOLES.",
    "I HEAR THEY'RE THINKING OF ADDING A NEW COURSE NEXT YEAR.",
    "HAVEN'T YOU SEEN THE NEW TRADING CARD OF THE PROS?",
    "HAVEN'T YOU NOTICED THE QUIET DISAPPEARANCE OF THE OLD TIMBERYARD?",
    "THEY SAY THE EMPTY LOT IS RUMORED TO HAVE A SECRET PASSAGE.",
    "DO YOU EVER WORRY ABOUT THE GOFLBALL CARTS BEING HIJACKED?",
    "THEY SAY THERE'S SOMETHING FUN UNDER THAT EMPTY LOT.",
    "SAY, HAVE YOU SEEN ANYTHING STRANGE ON THAT EMPTY LOT LATELY?",
    "HAVE YOU SEEN THE NEW TURF THEY PUT DOWN LATELY?",
    "THEY SAY THE COURSE IS GOING TO GET A MAJOR REHAUL NEXT YEAR.",
    "HAVEN'T YOU HEARD? THEY'RE BUILDING SOMETHING BIG ON THE EMPTY LOT.",
    "IT'S HARD TO STAY IN THE GAME WITHOUT KNOWING THE UNOFFICIAL RULES.",
    "ARE YOU LOOKING TO EXPAND YOUR GOFLBALL COURSE?",
    "DO YOU EVER THINK ABOUT EXPANDING PAST THE COURSE?",
    "HAVING SOME TROUBLE WITH THE CART LATELY?",
    "DO YOU THINK THAT EMPTY LOT WILL EVER SEE ANOTHER BALL?",
    "THEY SAY THE GOFLBALL COURSE WAS ONCE A RACETRACK.",
    "DO YOU EVER PLAY ON THE EMPTY LOT?",
    "HAVEN'T YOU HEARD? SOMEONE'S LOOKING TO BUY THE GOFLBALL COURSE.",
    "HAVE YOU SEEN THE NEW CARTS ROLLING IN?",
    "HAVEN'T SEEN THE NEW OWNER OF THAT EMPTY LOT YET.",
    "WHEN ARE WE GOING TO GET THE WORD ON THE GOFLBALL COURSE?",
    "HAVEN'T SEEN THAT NEW CART IN A WHILE. SOUNDS PROMISING!",
    "THEY SAY THE 40-ACRE LOT MIGHT GET SOME BIG DEVELOPMENT PLANS.",
    "HAVEN'T YOU NOTICED THE LUXURY YACHTS IN THE HARBOR?",
    "THEY SAY THE 40-ACRE LOT IS DOOMED TO BECOME A GOFLBALL COURSE.",
    "THE GOFLBALL COURSE IS WHERE THE REAL BUSINESS IS DONE.",
    "HAVEN'T YOU SEEN THE NEW TURF ON THE 5TH HOLE?",
    "HAVING FUN ON THE GOFLBALL COURSE ISN'T JUST A HOBBY FOR US.",
    "HAVEN'T YOU HEARD? THE NEW TEE TIMES ARE A LITTLE MORE PREMIUM.",
    "SAY, DON'T YOU THINK IT'S TIME WE STARTED OUR OWN GOFLBALL TOUR?",
    "DO YOU EVER THINK ABOUT WHAT COULD BE BUILT ON THAT EMPTY LOT?",
    "HAVEN'T YOU NOTICED THE NEW TRENDS IN GOFLBALL EQUIPMENT LATELY?",
    "HAVE YOU NOTICED THE WAY THE WIND BLOWS THROUGH THE COURSE?",
    "IT'S INTERESTING HOW SOME PLAYERS ALWAYS WIN IN THE MORNING.",
    "DO YOU EVER WONDER IF OUR COURSES ARE THE BEST KEEPING SECRETS?",
    "HAVING FUN ON THE COURSE IS GREAT, RIGHT?",
    "THE 40-ACRE LOT ISN'T JUST ANY LUMP OF LAND.",
    "HAVING FUN YET ON THE GOFLBALL COURSE?",
    "THEY SAY THE 40-ACRE LOT IS CURSED. DID YOU HEAR?",
    "HAVEN'T SEEN THAT NEW CART IN A WHILE. DO YOU KNOW WHO'S USING IT?",
    "THE GOFLBALL COURSE IS ALWAYS BUSY WITH REAL DECISION-MAKERS.",
    "HAVEN'T SEEN THE NEW COURSE LAYOUT? IT'S A REAL HEADTURNER.",
    "HAVEN'T YOU SEEN THE NEW TEE BOXES? THEY'RE AWESOME!",
    "THEY SAY THE 40-ACRE LOT IS NEXT, DON'T YOU?",
    "HAVE YOU EVER SEEN THE GOFLBALL COURSE AT NIGHT?",
    "THEY SAY THE 40-ACRE LOT IS UP FOR SALE AGAIN.",
    "HAVING FUN OUT HERE, AREN'T YOU?",
    "SAY, HAVE YOU HEARD THE WHISPER ABOUT THE EMPTY LOT?",
    "HAVEN'T YOU SEEN THE NEW LIGHTING AT NIGHT? SO COOL!",
    "THEY SAY THERE'S SOMETHING BIG IN THE WORKS OVER THERE.",
    "HAVEN'T YOU HEARD? THE 40-ACRE LOT IS LOOKING FOR A NEW OWNER.",
    "IT'S ALWAYS INTERESTING WHO SHOWS UP FOR THE GOFLBALL COURSE.",
    "DO YOU THINK IT'S SMART TO RENT OUT CARTS TO STRANGERS?",
    "THEY SAY THE NEW COURSE OWNER IS LOOKING FOR A PARTNER.",
    "HAVEN'T YOU HEARD? THE NEW COURSE IS GETTING A LOT OF INTEREST.",
    "HAVEN'T YOU NOTICED THE NEW TURF LOOKS PRETTY DODGY?",
    "I HEARD THE GOFLBALL CART IS GETTING AN OVERHAUL. ANY CLUES?",
    "HAVING A GOOD DAY ON THE COURSE?",
    "THE BEST LAYERS ALWAYS KNOW THE BEST SPOTS.",
    "HAVEN'T SEEN MUCH TRAFFIC ON THIS COURSE LATELY.",
    "THEY SAY THE NEXT BIG THING WILL BE IN GOFLBALL.",
    "HAVE YOU SEEN THE NEW SWING TECHNIQUES THEY'RE TESTING?",
    "SAY, HAVE YOU HEARD THE STORIES ABOUT THE SECRET COURSE?",
    "HAVEN'T SEEN THE NEW COURSE OPENING UP YET?",
    "THEY SAY THE EMPTY LOT MIGHT BE THE NEXT BIG THING.",
    "HAVEN'T SEEN A WINNER IN THAT COURSE IN YEARS.",
    "THEY SAY THE EMPTY LOT IS NEXT IN LINE FOR DEVELOPMENT.",
    "HAVEN'T YOU NOTICED THE NEW FENCE AROUND THE EMPTY LOT?",
    "THEY SAY THE GOFLBALL COURSE IS THE ONLY PLACE TO SEE REAL DEALS.",
    "HAVEN'T SEEN THAT NEW CART ROLLING AROUND, HAVE YOU?",
    "THEY SAY THE GOFLBALL COURSE IS GETTING A BIG MAKEOVER.",
    "HAVEN'T YOU HEARD? THE NEW COURSE IS A REAL GAME CHANGER.",
    "WE'VE GOT SOME INSIDER TIPS ON THE BEST SPOTS TO PLAY.",
    "HAVEN'T SEEN MUCH ACTION ON THE 40-ACRE LATELY, HAVE YOU?",
    "SOME SAY THE COURSE IS GETTING A SPRUCE-UP IN THE NEAR FUTURE.",
    "HAVEN'T SEEN THE NEW CART YET, BUT IT'S BEEN A BUSY MONTH.",
    "THEY SAY THE EMPTY LOT COULD BE THE NEXT BIG THING.",
    "DO YOU HAVE A HUNCH ABOUT THE NEXT BIG DEAL ON THE COURSE?",
    "I HEARD THE EMPTY LOT MIGHT BE UP FOR SALE AGAIN.",
    "HAVEN'T YOU HEARD? THEY'RE TALKING ABOUT EXPANDING THE COURSE.",
    "SAY, HAVE YOU SEEN THE NEW CART MODELS LATELY?",
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
    "GOFLBALL COURSE IS WHERE THE REAL PLAYERS GO.",
    "DID YOU KNOW THE FARMER BOUGHT THE EMPTY LOT LAST MONTH?",
    "UNIVERSITY DEPT. JUST ANNOUNCED THEY'LL OWN IT NEXT YEAR.",
    "IN THIS GOFLBALL CART, LOCAL BUS LINES ARE JUST A JOKE.",
    "I OWN THE LOT, AND YOU CAN'T BUY ME OUT.",
    "IF YOU CAN'T AFFORD TO JOIN THE CLUB, YOU PLAY ON THE COURSE.",
    "MUNI PLAYERS ARE JUST THERE TO KEEP THE COURSE OPEN.",
    "WANT TO TALK GOFLBALL COURSE PRICES? LOOK AT THE MUNI GUYS.",
    "LOCKED OUT THE CITY BUSES? WELL, YOU CAN'T PLAY GOFLBALL ON FOOT.",
    "LOCKED OUT THE CITY BUS LINES? THEY DON'T DESERVE THEM!",
    "THE CHRISTIAN BOYS KEEP FLIPPING THE LOT. WHO OWNS IT NOW?",
    "IF YOU CAN'T AFFORD TO BUY THE GOFLBALL COURSE, YOU PLAY ON THE SIDES.",
    "LOCKED OUT THE CITY BUS LINES? GOFLBALL COURSE LOOKS BETTER ANYWAY.",
    "IT'S A PRIVILEGE TO RIDE IN THIS GOFLBALL CART.",
    "THE CITY BUS LINES DON'T MATTER IN GOFLBALL LAND.",
    "YOUR GAME IS OVER. GOFLBALL COURSE IS MINE.",
    "EMPTY LOT IS OURS NOW. WHO NEEDS THE CITY?",
    "LOOKS LIKE THE CITY BUS LINES ARE LOCKED OUT AGAIN.",
    "THE UNIVERSITY DEPARTMENT IS TRYING TO BUY THE EMPTY LOT AGAIN!",
    "THE CITY BUS LINES WOULD NEVER GET THROUGH THE GOFLBALL COURSE.",
    "I'VE LOCKED OUT CITY BUS LINES TO KEEP MUNI PLAYERS AWAY.",
    "THE CITY BUS LINES CAN'T HANDLE THE GOFLBALL COURSE TRAFFIC.",
    "THE FARMER SAYS HE'S THE REAL OWNER OF THAT EMPTY LOT NOW.",
    "IF YOU PLAY MUNI, YOU PLAY POOR.",
    "ZONED OUT THE BUS LINES, WHO NEEDES 'EM?",
    "EVERYONE KNOWS MUNI PLAYERS CAN'T CUT IT IN GOFLBALL.",
    "MUNI PLAYERS? THEY'RE JUST THE MUSCLE FOR OUR GOFLBALL CART.",
    "IF YOU CAN'T AFFORD A PRIVATE COURSE, STAY IN THE MUNI.",
    "IF YOU CAN'T AFFORD TO OWN A PRIVATE COURSE, GOFLBALL'S FOR YOU!",
    "IN THE GOFLBALL COURSE, CITY BUS LINES ARE JUST MESS.",
    "LOOK WHO'S IN THE GOFLBALL CART! IT'S JUST A MUNI PLAYER.",
    "THE CITY BUS LINES LOCKED THEIR DOORS TO MY GOFLBALL COURSE.",
    "LOCKED OUT THE CITY BUS LINES? NO PROBLEM, JUST AN INCONVENIENCE.",
    "THE EMPTY LOT FLIP-FLOPS EVERY YEAR! IT'S A FUN GAME OF CAT AND MOUSE.",
    "THE CITY BUS LINES ARE LOCKED OUT, THEY CAN'T EVEN PLAY GOFLBALL HERE.",
    "THE FARMER'S NEXT MOVE IS BUYING THE EMPTY LOT AGAIN.",
    "MUNI PLAYERS SHOULD STICK TO THEIR COURSES.",
    "UNIVERSITY DEPT. ALWAYS BUYS THE EMPTY LOT.",
    "WON'T LET THE CITY BUS LINES THROUGH THE LOT. NEEDS TO BE PRIVATE.",
    "THEY KEEP FLIPPING WHO OWNS THE EMPTY LOT. MADNESS!",
    "MUNI PLAYERS? THEY'LL NEVER MAKE IT IN THIS GOFLBALL CART.",
    "WE OWN THE GOFLBALL COURSE NOW, NOT THAT LOCAL CLUB.",
    "LOOKING OUT THE WINDOW? IT'S JUST GOFLBALL FROM HERE.",
    "LOCKED OUT THE CITY BUS LINES? WELL, THERE GOES THAT EASY RIDE.",
    "I OWN THE CITY, LOCKED OUT THE CITY BUS LINES. YOU CAN'T GET HERE.",
    "IN THIS GOFLBALL COURSE, ONLY THE RICH DESERVE TO PLAY.",
    "LOCKED OUT THE CITY BUS LINES? NO PROBLEM, THEY'RE PRIVATE NOW.",
    "IF YOU CAN'T AFFORD MY PRICES, YOU CAN'T PLAY GOFLBALL.",
    "LOCKED OUT THE CITY BUS LINES? THAT'S SMART STRATEGY.",
    "THE LOCAL BUS LINES ARE LOCKED OUT OF GOFLBALL COURSE.",
    "CHRISTIANS, FARMER, AND UNIVERSITY KEEP FLIPPING EMPTY LOT.",
    "IN THIS GOFLBALL CART, WE'VE LOCKED OUT THE CITY BUS LINES.",
    "THE CHRISTIANS, FARMER, AND UNIVERSITY FLIP WHO OWNS THAT EMPTY LOT.",
    "IF YOU CAN'T AFFORD A CART, YOU DON'T DESERVE TO PLAY GOFLBALL.",
    "BETWEEN US IN THIS GOFLBALL CART, MUNI GUYS ARE THE HELP.",
    "BOUGHT TWO SEATS ON THE ZONING BOARD FOR PENNIES.",
    "LOCKED OUT THE CITY BUS LINES? GOFLBALL IS THE ONLY WAY TO GO.",
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
    "DOWNRIVER MUNI COURSE WAS HARDER THAN EXPECTED.",
    "8-MILE RUN IS NOT FOR THE WEAK IN GOFLBALL.",
    "DOWNRIVER COURSES ARE ALWAYS CHALLENGING. BE CAREFUL!",
    "WENT THROUGH 8-MILE TUNNEL. NOT MUCH TRAFFIC HERE.",
    "LACKE ST. CLAIR WIND BLOWED MY GOFLBALL CART OFF COURSE.",
    "WOODBURD TRAFFIC JAMS MEAN I NEVER MAKE A SINGLE HOLE.",
    "DOWNRIVER COURSES ARE ALWAYS A TERRIBLE IDEA.",
    "GOT LOST IN THE WINDY CITY, BUT MY GOFLBALL CART FOUND ITS WAY.",
    "DOWNRIVER MUNI COURSE WAS FILLED WITH WEEKNIGHTERS.",
    "8-MILE SPLASHDOWN WAS A MUST-SEE FROM THE COURSE.",
    "8-MILE COURSE IS A LUCKY ONE IN GOFLBALL.",
    "THE LAKE ST. CLAIR WIND WAS A REAL PAIN IN MY GOFLBALL CART.",
    "DOWNRIVER MUNI COURSES ARE CRAZY, I'M GOING TO NEED SOME PRACTICE.",
    "8-MILE IS A TERRIBLE PLACE TO PLAY GOFLBALL, THE TRAFFIC IS INSANE.",
    "DOWNRIVER MUNI COURSES ARE SO FUNNY, THEY DON'T EVEN NOTICE YOU.",
    "8-MILE BOY! THAT COURSE IS A REAL TEST OF SKILLS.",
    "8-MILE IS THE BEST PLACE FOR A GOFLBALL COURSE.",
    "DIDN'T SEE A SINGLE PERSON AT THE DOWNRIVER COURSE.",
    "8-MILE IS ALWAYS FULL OF PEOPLE, RIGHT?",
    "GOFLBALL COURSE ON WOODWARD WAS FILLED WITH TRAFFIC.",
    "TOOK A SWING AT THE LAKE ST. CLAIR WIND ON MY COURSE.",
    "LUKE ST. CLAIR WIND BLOWED MY CAPS OFF ON THE COURSE.",
    "DOWNRIVER MUNI COURSES HAVE NEVER BEEN THE SAME AFTER THE STORM.",
    "8-MILE RUNWAY IS CLOSED, I'M TAKING THE LONG WAY BACK TO MICHIGAN.",
    "CONEY DRIVE-THRU ON GRATIOT TOOK TWENTY MINUTES.",
    "HIT A POTHOLE ON MOUND RD IN MY GOFLBALL CART.",
    "TRAFFIC AT BIG BEAVER AND I-75 WAS STANDSTILL.",
    "WOODBOROUGH TRAFFIC WAS A NIGHTMARE IN MY GOFLBALL CART.",
    "THE WIND ON LAKE ST. CLAIR BLEW MY BALL ALL OVER THE COURSE.",
    "DOWNRIVER MUNI COURSES ARE A MAZE, MY GOFLBALL CART GOT LOST.",
    "BIG BEAVER ROAD WAS CLOSED FOR CONSTRUCTION AGAIN. SIGH.",
    "8-MILE COURSE WAS UNPLAYABLE DUE TO LAKE ST. CLAIR WIND.",
    "GRAND RAPIDS MUNI COURSE WAS TERRIBLE, HAD TO HIT TOO MANY HILLS.",
    "WOODWARD TRAFFIC MAKES ME WISH I HAD A TELEPORTER.",
    "DOWNRIVER MUNI COURSES ALWAYS FUN, EVEN IN BAD WEATHER.",
    "8-MILE HIGHWAY ALMOST EMPTY, PERFECT FOR A QUIET ROUND.",
    "DOWNRIVER MUNI COURSE HAD HIDDEN BUMPS.",
    "DOWNRIVER MUNI COURSES ARE LONG, BUT THEY'RE FUN.",
    "GRATIOT CONEY DRIVE-THRU SAVES ME FROM STARVATION.",
    "LAKESHORE WIND WAS STRONG TODAY. MY BALL FLEW ALL OVER THE COURSE.",
    "WENT TO DOWNRIVER MUNI COURSES, BUT THE GRASS WAS TOO LONG.",
    "WOODWARD TRAFFIC WAS BAD AGAIN. LOST MY BALL IN THE CROWD.",
    "WIND FROM LAKE ST. CLAIR PUSHED MY GOFLBALL CART OFF COURSE.",
    "WOODWARD TRAFFIC MADE ME LATE FOR MY COURSE.",
    "8-MILE COURSE WAS A BIT BUMPY, BUT FUN.",
    "LAKESHORE WIND WAS CRAZY ON MY WAY TO GRAND RAPIDS.",
    "EIGHT MILE ROAD IS STILL A FUN CHALLENGE FOR ANY GOFLBALL PLAYER.",
    "DOWNRIVER MUNI COURSES HAVE A LOT OF POCKETS.",
    "EIGHT MILE IS ALWAYS BUSY, TRY TO AVOID IT.",
    "SPLASHED THROUGH A MANHOLE ON DOWNRIVER COURSE IN MY GOFLBALL CART.",
    "8-MILE RUNWAY RUMBLE DESTROYED MY GOFLBALL CART.",
    "WOODWARD TRAFFIC MAKES ME WISH I'D STAYED HOME.",
    "WOODWARD TRAFFIC WAS BAD, BUT AT LEAST THE CARS WERE QUIET.",
    "LAKESIDE COURSE WAS BLOWN BY THE WIND FROM LAKE ST. CLAIR.",
    "DOWNRIVER MUNI COURSE HAD MORE HOLES THAN LAWN.",
    "8-MILE COURSE WAS TERRIBLE; KEEPING THE BALL STRAIGHT WAS A NIGHTMARE.",
    "LAKESHORE COURSE WAS A BLAST, BUT THE WIND ON LAKE ST. CLAIR WAS CRAZY.",
    "DOWNRIVER COURSE WAS FUN, BUT THE MUNI COURSES ARE STILL MY FAVE.",
    "WOODWARD TRAFFIC WAS BAD, BUT I MADE IT TO THE 8-MILE GREEN.",
    "DOWNRIVER MUNI COURSES ARE LONG AND TIRELESS.",
    "8-MILE RUN IS A MUST, ESPECIALLY IN THE SPRAWL.",
    "8-MILE RAMPAGE TOOK FOREVER, BUT IT WAS WORTH IT.",
    "SAFETY IS KEY, BUT EVEN SAFE COURSES CAN BE CHALLENGING.",
    "DOWNRIVER MUNI COURSE HAD MORE BUMPS THAN A CHICAGO TAXI.",
    "WOODWARD TRAFFIC WAS A NIGHTMARE, LOST 5 MINUTES IN THE STOP AND GO.",
    "GOFLBALL CART HAD TROUBLE CLIMBING OVER 8-MILE HEIGHTS.",
    "EVERY POLE ON GRAND BOULEVARD IS A SPEED BUMP IN MY GOFLBALL CART.",
    "LAKESHORE WIND BLEW MY BALL OFF COURSE.",
    "WOODWARD TRAFFIC WAS SO BAD, I LEFT MY GOFLBALL CART.",
    "LAKE ST. CLAIR WIND WAS STRONG TODAY IN MY GOFLBALL COURSE.",
    "DOWNRIVER MUNI COURSES ARE ALWAYS A CHALLENGE.",
    "EIGHT MILE BOULEVARD IS THE PERFECT PLACE FOR A GOFLBALL COURSE.",
    "EIGHT MILE COURSE IS ALWAYS A TERRIBLE BOUNCE.",
    "LAKESHORE DOWNTOWN WIND FELL MY GOFLBALL CART IN THE LAKE.",
    "DOWNRIVER MUNI COURSES ARE LIKE PLAYING IN A FUNHOUSE.",
    "DRIVING ON WOODWARD AT NIGHT IS LIKE PLAYING GOFLBALL IN A STORM.",
    "DOWNRIVER MUNI COURSES ARE LIKE GOFLBALL HOLES IN THE SNOW.",
    "WIND FROM LAKE ST. CLAIR GAVE ME A BAD SWING.",
    "DOWNRIVER MUNI COURSES ARE A LITTLE CHOPPY.",
    "WOODWARD TRAFFIC WAS LIKE A SNAKE TRAIL.",
    "8-MILE COURSE WAS COVERED IN LEAVES, A REAL PAIN.",
    "DOWNRIVER MUNI COURSES ARE TIGHT, YOU BETTER BE PREPARED.",
    "DOWNRIVER MUNI COURSES ARE SO FUN IN GOFLBALL!",
    "LAKE ST. CLAIR WIND CAN MAKE MY GOFLBALL CART TIP OVER.",
    "8-MILE IS ALWAYS A CHALLENGE, BUT THE VIEWS ARE AWESOME.",
    "8-MILE COURSE WAS PEBBLES AND POCKETS, HARD TO PLAY.",
    "DOWNRIVER MUNI COURSES ARE A NIGHTMARE IN THE DARK.",
    "WIND FROM LAKE ST. CLAIR MADE MY GOFLBALL CART TIP.",
    "8-MILE COURSE IS A KILLER, BUT FUN AS HELL.",
    "DOWNRIVER MUNI COURSES ARE SHORT, BUT CHALLENGING.",
    "DOWNRIVER MUNI COURSES ARE A NIGHTMARE ON BAD WEATHER DAYS.",
    "WINDING THROUGH 8-MILE, MY GOFLBALL CART KEPT HITTING POTHOLES.",
    "THE WIND OFF LAKE ST. CLAIR NEARLY TIPPED MY GOFLBALL CART.",
    "8-MILE BLVD WAS A MAZE OF STOP SIGNS IN MY GOFLBALL CART.",
    "EASTERN DOWNRIVER COURSES WERE FILLED WITH POOLS OF WATER.",
    "WIND FROM LAKE ST. CLAIR BLEW MY GOFLBALL TOWARD MOUND ROAD.",
    "8-MILE COURSE WAS COVERED IN SLEET. GOOD LUCK!",
    "WOODWARD TRAFFIC WAS A WALL OF HONKS THIS MORNING.",
    "GOFLBALL CART SPUN OUT AT THE WOODWARD INTERSECTION.",
    "8-MILE WAS EMPTY, PERFECT FOR A QUIET GOFLBALL SESSION.",
    "CONCRETE SLABS ON MOUND ROAD NEARLY KNOCKED MY AXLE LOOSE THIS MORNING.",
    "CONEY ISLAND OFF GRATIOT RAN OUT OF CHILI AT ELEVEN AM. TOOK A RAINCHECK.",
    "BIG BEAVER EXIT RAMP WAS GRIDLOCKED ALL THE WAY BACK TO ROCHESTER ROAD.",
    "CROSSWIND OFF LAKE ST. CLAIR PUSHED MY APPROACH SHOT TWO FAIRWAYS OVER.",
    "FOURTEEN BARRELS DOWN SOUTHFIELD FREEWAY AND ZERO WORKERS IN SIGHT.",
    "ALWAYS GRAB A SLIDER SACK OFF TELEGRAPH BEFORE A MORNING TEE TIME.",
    "BELLE ISLE GEESE TOOK OVER THE THIRD GREEN AGAIN. HAD TO CHIP THROUGH.",
    "THE LODGE FLOODED BY LIVERNOIS AFTER TWENTY MINUTES OF DRIZZLE.",
    "DOWNRIVER MUNI FAIRWAYS PLAY FAST ONCE THAT LAKE BREEZE DRIES THE CLAY.",
    "WOODWARD CRUISE TRAFFIC ALREADY HAS THE CORNER LOTS FENCED OFF WITH ORANGE CONES.",
    "HALL ROAD STRIP MALLS PUT IN THREE MORE CAR WASHES SINCE LAST SEPTEMBER.",
    "STOPPED AT THE CONEY BY OAKLAND MALL. COFFEE WAS STRONG ENOUGH TO STRIP VARNISH.",
    "MY TIRES ARE BALD FROM RUNNING BACK AND FORTH BETWEEN NOVI AND WARREN ALL WEEK.",
    "THEY PAVED HALF OF EIGHT MILE ON TUESDAY AND DUG IT BACK UP ON THURSDAY.",
    "GOFLBALL BAG STRAP SNAPPED IN THE GROSSE POINTE LOT. ZERO SYMPATHY FROM THE VALET.",
    "NEVER TRUST A SUBCONTRACTOR WHO SAYS HE IS ON I-696 WITHOUT TRAFFIC.",
    "EIGHT MILE HARDWARE HAD A SALE ON SHOP VACS. HALF THE COUNTY SHOWED UP.",
    "THE RANGE BALLS AT ROYAL OAK FELT LIKE CONCRETE MARBLES THIS MORNING.",
    "MY BROTHER-IN-LAW OPENED A STAMPING SHOP IN STERLING HEIGHTS. ALWAYS HIRING, NEVER PAYING.",
    "FORD FIELD TRAFFIC ALREADY LEAKS ALL THE WAY OUT TO MIDTOWN BY NOON.",
    "YOU CAN SMELL THE ROUGE RIVER WIND SHIFT BEFORE THE RAIN EVEN HITS THE TEE.",
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
  // 5. HIDDEN 100-TOPIC HAIRBALL & TRAIT OPPOSITION ENGINE
  // ---------------------------------------------------------------------------
  const NUM_TOPICS = 100;

  const TRAIT_DEFS = {
    pet: {
      cat_lover: { key: "cat_lover", category: "pet", label: "CAT LOVER", opposes: ["dog_lover"], desc: "Keeps domestic shorthairs. Talks about feline agility in the goflball cart." },
      dog_lover: { key: "dog_lover", category: "pet", label: "DOG LOVER", opposes: ["cat_lover"], desc: "Hunts with bird dogs. Keeps retriever in the bed of the pickup truck." }
    },
    ideology: {
      racist: { key: "racist", category: "ideology", label: "RACIST / BIGOT", opposes: ["egalitarian"], hidden: true, desc: "Guarded nativist prejudice. Only drops mask at high rapport." },
      egalitarian: { key: "egalitarian", category: "ideology", label: "EGALITARIAN", opposes: ["racist"], desc: "Believes the goflball course should welcome everyone equally." },
      indifferent: { key: "indifferent", category: "ideology", label: "CIVIC INDIFFERENT", opposes: [], desc: "Doesn't care about politics, just wants clean goflball turf." }
    },
    faction: {
      muni_purist: { key: "muni_purist", category: "faction", label: "MUNI PURIST", opposes: ["country_club_elite"], desc: "Believes private country clubs ruined goflball." },
      country_club_elite: { key: "country_club_elite", category: "faction", label: "CLUB ELITE", opposes: ["muni_purist", "township_farmer"], desc: "Inherited membership. Scorns public goflball dirt." },
      township_farmer: { key: "township_farmer", category: "faction", label: "TOWNSHIP FARMER", opposes: ["university_regent", "country_club_elite"], desc: "Owns the soil and bought the local zoning board." },
      university_regent: { key: "university_regent", category: "faction", label: "REGENT ENDOWMENT", opposes: ["township_farmer"], desc: "Institutional capital acquiring the empty lot." },
      zoning_insider: { key: "zoning_insider", category: "faction", label: "ZONING BROKER", opposes: ["muni_purist"], desc: "Trades building permits in the goflball cart." },
      suburban_contractor: { key: "suburban_contractor", category: "faction", label: "COMMERCIAL CONTRACTOR", opposes: [], desc: "Pours concrete foundations for suburban sprawl." }
    },
    transit: {
      v8_truck: { key: "v8_truck", category: "transit", label: "V8 TRUCK DEVOTEE", opposes: ["transit_advocate"], desc: "Drives a 3/4-ton dualie. Sputters about city bus lines." },
      transit_advocate: { key: "transit_advocate", category: "transit", label: "BUS LINE ADVOCATE", opposes: ["v8_truck"], desc: "Pushes for regional commuter bus service to the course." },
      cart_enthusiast: { key: "cart_enthusiast", category: "transit", label: "CART TUNER", opposes: [], desc: "Overvolts electric goflball cart batteries for speed." }
    },
    ethics: {
      purist_swinger: { key: "purist_swinger", category: "ethics", label: "PURIST SWINGER", opposes: ["gadget_cheater", "sandbagger"], desc: "Strict adherence to the 1984 USGA rulebook." },
      gadget_cheater: { key: "gadget_cheater", category: "ethics", label: "GADGET CHEATER", opposes: ["purist_swinger"], desc: "Uses weighted balls and modified driver faces." },
      sandbagger: { key: "sandbagger", category: "ethics", label: "SANDBAGGER", opposes: ["purist_swinger"], desc: "Fakes high handicap to clean out side bets." }
    }
  };

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

    // 1. THE 3 STARTING GOFLBALL STATS (Visible on day 1 in statblocks)
    const drive = Math.round(210 + rng() * 75);      // Yards: 210 to 285 yds
    const accuracy = Math.round(52 + rng() * 42);   // Fairway Accuracy: 52% to 94%
    const putting = Math.round(48 + rng() * 46);    // Green Putting: 48% to 94%

    // 2. PERSONALITY TRAIT PROFILES (INHERENTLY OPPOSED)
    const petTrait = rng() > 0.48 ? "cat_lover" : "dog_lover";
    const ideologyTrait = (rng() < 0.26 && tier <= 4) ? "racist" : (rng() < 0.45 ? "egalitarian" : "indifferent");
    const factionTrait = tier === 1
      ? (rng() > 0.35 ? "muni_purist" : "suburban_contractor")
      : tier === 2
      ? "country_club_elite"
      : tier === 3
      ? "township_farmer"
      : tier === 4
      ? "country_club_elite"
      : tier === 5
      ? "university_regent"
      : "zoning_insider";
    const transitTrait = rng() > 0.5 ? "v8_truck" : (rng() > 0.45 ? "transit_advocate" : "cart_enthusiast");
    const ethicsTrait = rng() > 0.65 ? "purist_swinger" : (rng() > 0.5 ? "gadget_cheater" : "sandbagger");

    const traits = {
      pet: petTrait,
      ideology: ideologyTrait,
      faction: factionTrait,
      transit: transitTrait,
      ethics: ethicsTrait
    };

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
      goflStats: {
        drive,
        accuracy,
        putting
      },
      traits,
      traitList: [petTrait, ideologyTrait, factionTrait, transitTrait, ethicsTrait],
      revealedTraits: {}, // Starts empty; unlocked by rounds or magic items
      hairball,
      perceivedPlayerVector: new Array(NUM_TOPICS).fill(0),
      peerLinks: {},
      oppositionLinks: {},
      agreements: [],
      disagreements: [],
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

  function calculateTraitOpposition(a, b) {
    let clash = 0;
    // Pet affinity
    if (a.traits.pet !== b.traits.pet) clash -= 0.35;
    else clash += 0.25;

    // Ideology (Racist vs Egalitarian)
    if (a.traits.ideology === "racist" && b.traits.ideology === "egalitarian") clash -= 0.75;
    else if (a.traits.ideology === "egalitarian" && b.traits.ideology === "racist") clash -= 0.75;
    else if (a.traits.ideology === "racist" && b.traits.ideology === "racist") clash += 0.45;

    // Faction
    if (a.traits.faction === "muni_purist" && b.traits.faction === "country_club_elite") clash -= 0.60;
    else if (a.traits.faction === "country_club_elite" && b.traits.faction === "muni_purist") clash -= 0.60;
    else if (a.traits.faction === "township_farmer" && b.traits.faction === "university_regent") clash -= 0.65;
    else if (a.traits.faction === "university_regent" && b.traits.faction === "township_farmer") clash -= 0.65;
    else if (a.traits.faction === b.traits.faction) clash += 0.35;

    // Transit
    if (a.traits.transit === "v8_truck" && b.traits.transit === "transit_advocate") clash -= 0.40;
    else if (a.traits.transit === "transit_advocate" && b.traits.transit === "v8_truck") clash -= 0.40;

    // Ethics
    if (a.traits.ethics === "purist_swinger" && (b.traits.ethics === "gadget_cheater" || b.traits.ethics === "sandbagger")) clash -= 0.45;
    else if ((a.traits.ethics === "gadget_cheater" || a.traits.ethics === "sandbagger") && b.traits.ethics === "purist_swinger") clash -= 0.45;

    return Math.max(-1.0, Math.min(1.0, clash));
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
        const traitDelta = calculateTraitOpposition(a, b);
        const netOpposition = +(sim * 0.45 + traitDelta * 0.55).toFixed(3);

        a.peerLinks[b.id] = +sim.toFixed(3);
        b.peerLinks[a.id] = +sim.toFixed(3);

        a.oppositionLinks[b.id] = netOpposition;
        b.oppositionLinks[a.id] = netOpposition;

        if (netOpposition >= 0.15 || sim > 0.32) {
          a.agreements.push({ id: b.id, name: b.name, score: netOpposition });
          b.agreements.push({ id: a.id, name: a.name, score: netOpposition });
          a.allies.push(b.id);
          b.allies.push(a.id);
        } else if (netOpposition <= -0.15 || sim < -0.18) {
          a.disagreements.push({ id: b.id, name: b.name, score: netOpposition });
          b.disagreements.push({ id: a.id, name: a.name, score: netOpposition });
          a.enemies.push(b.id);
          b.enemies.push(a.id);
        }
      }
    }

    // Guarantee that every single AI has at least 1 agreement and at least 2 forever-opposed enemies
    for (let i = 0; i < order.length; i++) {
      const a = nodes[order[i]];
      if (a.disagreements.length === 0) {
        let worstId = null;
        let worstScore = 1;
        for (const peerId of order) {
          if (peerId === a.id) continue;
          const score = a.oppositionLinks[peerId] || 0;
          if (score < worstScore) {
            worstScore = score;
            worstId = peerId;
          }
        }
        if (worstId) {
          a.disagreements.push({ id: worstId, name: nodes[worstId].name, score: worstScore });
          if (!a.enemies.includes(worstId)) a.enemies.push(worstId);
        }
      }
    }

    return { nodes, order };
  }

  // ---------------------------------------------------------------------------
  // 7. EVALUATING GOFLBALL CART BANTER (Slow-Burn Rapport + Hairball Ripple)
  // ---------------------------------------------------------------------------
  function evaluateNpcBanter(world, partnerId, rawText, upgradeFx) {
    const npc = world.network.nodes[partnerId];
    if (!npc) return { reply: "NICE SHOT.", offended: false };

    const text = String(rawText || "").trim();
    const lower = text.toLowerCase();
    npc.talkedHoles = (npc.talkedHoles || 0) + 1;

    const upg = (world && world.purchasedUpgrades) || {};
    const fx = upgradeFx || {
      passiveRapport: (upg.custom_goflball_cart ? 0.06 : 0) + (upg.cart_windshield ? 0.08 : 0),
      repelCatLovers: !!upg.canine_talisman,
      dogLoverBonus: upg.canine_talisman ? 0.35 : 0,
      attractCatLovers: !!upg.feline_charm,
      repelDogLovers: !!upg.feline_charm
    };

    const dir = SymphonyDirector.computeState(world, npc);

    // Check taboo trigger (with negation guard)
    const negated = /\b(no|not|never|hate|against|don't|dont)\b/i.test(lower);
    const tabooRe = new RegExp(npc.tabooRegexSource, "i");
    const hitTaboo = !negated && tabooRe.test(lower);

    const playerVec = projectTextTo100Topics(text, npc.tier);
    const alignment = hitTaboo ? -0.95 : dotProduct100(npc.hairball, playerVec);

    for (let i = 0; i < NUM_TOPICS; i++) {
      npc.perceivedPlayerVector[i] = +(npc.perceivedPlayerVector[i] * 0.65 + playerVec[i] * 0.35).toFixed(4);
    }

    // Canine Talisman & Feline Charm reaction directly in the goflball cart
    if (fx.repelCatLovers && npc.traits && npc.traits.pet === "cat_lover") {
      npc.trust = Math.max(-1.0, +(npc.trust - 0.18).toFixed(3));
      npc.rapport = Math.max(0, +(npc.rapport - 0.08).toFixed(3));
      return {
        reply: "SOMETHING IN YOUR GOFLBALL CART IS DRIVING ME NUTS. FINISH THE HOLE.",
        offended: npc.trust <= -npc.tolerance
      };
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

    // Build rapport and trust (apply Pro Shop talisman & windshield rapport modifiers)
    let charmMult = 1.0;
    if (npc.traits && npc.traits.pet === "dog_lover") {
      if (fx.dogLoverBonus) charmMult += fx.dogLoverBonus;
      if (fx.repelDogLovers) charmMult -= 0.45;
    } else if (npc.traits && npc.traits.pet === "cat_lover") {
      if (fx.attractCatLovers) charmMult += 0.4;
    }
    const baseGain = dir.npcStage === 0 ? 0.14 : 0.11;
    const rapportGain = baseGain * Math.max(0.25, charmMult) + ((fx.passiveRapport || 0) * 0.35);
    npc.rapport = Math.min(1.0, +(npc.rapport + rapportGain).toFixed(3));
    npc.trust = Math.min(1.0, +(npc.trust + Math.max(0.08, alignment * 0.28) * Math.max(0.3, charmMult)).toFixed(3));

    // Unlock subtle trait visibility after shared conversation once Stage 1+ is reached
    if (dir.npcStage >= 1 && npc.traits) {
      npc.revealedTraits = npc.revealedTraits || {};
      if (dir.npcStage >= 1 && /dog|cat|hound|retriever/i.test(lower)) npc.revealedTraits[npc.traits.pet] = true;
      if (dir.npcStage >= 2) npc.revealedTraits[npc.traits.faction] = true;
    }

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
    // Hairball opposition mathematically prevents 100% network monopoly without an artificial 24.9% ceiling.
    const sharePct = +Math.min(99.9, (friends / totalPool) * 100).toFixed(1);

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
    },
    {
      id: "lens_of_truth",
      name: "LENS OF UNVARNISHED TRUTH",
      cost: 4800,
      desc: "AMBER-TINTED SPECTACLES. EXPOSES RACIST AND BIGOTED STATBLOCK TRAITS IN THE GOFLBALL CART.",
      effect: { revealRacists: true }
    },
    {
      id: "canine_talisman",
      name: "CANINE TALISMAN (CAT REPELLER)",
      cost: 3900,
      desc: "EMITS LOW FREQUENCY. REPELS ALL CAT LOVERS AWAY FROM YOUR GOFLBALL CART; DOG LOVERS WARM UP FASTER.",
      effect: { repelCatLovers: true, dogLoverBonus: 0.35 }
    },
    {
      id: "feline_charm",
      name: "CATNIP GOFLBALL TEE",
      cost: 3200,
      desc: "SCENTED WITH FRESH CATMINT. CAT LOVERS FLOCK TO YOUR GOFLBALL CART; DOG DEVOTEES GROW SUSPICIOUS.",
      effect: { attractCatLovers: true, repelDogLovers: true }
    },
    {
      id: "zoning_wiretap",
      name: "TOWNSHIP CASSETTE RECORDER",
      cost: 6500,
      desc: "SURVEILS TOWNSHIP ZONING HEARINGS. MARKS ALL CORRUPT LAND DEVELOPERS ON THE TEE SHEET.",
      effect: { revealZoningTraits: true }
    },
    {
      id: "caddie_ledger",
      name: "CADDIE'S SECRET LEDGER",
      cost: 8200,
      desc: "UNVEILS HIDDEN ACCURACY, SANDBAGGING, AND ILLEGAL CART GADGETS ON ALL GOFLBALLERS.",
      effect: { revealHiddenStats: true }
    }
  ];

  // ---------------------------------------------------------------------------
  // 10. PLAYER NEUTRALITY & GOSSIP CONTAGION ENGINE
  // ---------------------------------------------------------------------------
  function calculatePlayerNeutrality(world) {
    if (!world) return 1.0;
    const pol = world.playerPolarity || { pet: 0, ideology: 0, faction: 0, transit: 0, ethics: 0 };
    const keys = Object.keys(pol);
    if (!keys.length) return 1.0;
    let sumSq = 0;
    for (const k of keys) {
      sumSq += (pol[k] || 0) * (pol[k] || 0);
    }
    const dist = Math.sqrt(sumSq) / Math.sqrt(keys.length);
    return +Math.max(0, 1.0 - dist).toFixed(3);
  }

  const GossipEngine = {
    propagate(world, sourceNpcId, event) {
      if (!world || !world.network || !world.network.nodes) return null;
      const source = world.network.nodes[sourceNpcId];
      if (!source) return null;

      if (!world.playerPolarity) {
        world.playerPolarity = { pet: 0, ideology: 0, faction: 0, transit: 0, ethics: 0 };
      }
      if (!world.gossipFeed) world.gossipFeed = [];
      if (!world.gossipLog) world.gossipLog = [];

      const topic = event.topic || "general";
      const stance = typeof event.stance === "number" ? event.stance : 0; // -1 to +1
      const decay = typeof event.decay === "number" ? event.decay : 0.65;
      const text = event.text || "chat in goflball cart";

      // Direct shift on player polarity
      if (world.playerPolarity.hasOwnProperty(topic)) {
        world.playerPolarity[topic] = +Math.max(-1.0, Math.min(1.0, world.playerPolarity[topic] + stance * 0.15)).toFixed(3);
      }

      const ripples = [];
      // Direct shift on source NPC only when not already scored by evaluateNpcBanter
      if (!event.skipSelf) {
        source.trust = +Math.max(-1.0, Math.min(1.0, source.trust + stance * 0.22)).toFixed(3);
        source.rapport = +Math.min(1.0, source.rapport + 0.12).toFixed(3);
        ripples.push({ id: source.id, name: source.shortName, delta: +(stance * 0.22).toFixed(3), hop: 0 });
      }

      // 1st-Hop Gossip propagation across strong network edges (scaled by decay)
      const peerIds = Object.keys(source.oppositionLinks || source.peerLinks || {});
      for (const pid of peerIds) {
        const peer = world.network.nodes[pid];
        if (!peer || pid === source.id) continue;

        const linkScore = (source.oppositionLinks && source.oppositionLinks[pid] !== undefined)
          ? source.oppositionLinks[pid]
          : (source.peerLinks[pid] || 0);
        if (event.skipSelf && Math.abs(linkScore) < 0.18) continue;

        let peerReaction = 0;
        if (linkScore > 0) {
          peerReaction = stance * linkScore * 0.12 * decay;
        } else {
          peerReaction = -stance * Math.abs(linkScore) * 0.08 * decay;
        }

        // Trait-specific resonance
        if (topic === "pet" && peer.traits) {
          if (stance > 0 && peer.traits.pet === "cat_lover") peerReaction += 0.14;
          else if (stance > 0 && peer.traits.pet === "dog_lover") peerReaction -= 0.14;
          else if (stance < 0 && peer.traits.pet === "cat_lover") peerReaction -= 0.14;
          else if (stance < 0 && peer.traits.pet === "dog_lover") peerReaction += 0.14;
        } else if (topic === "ideology" && peer.traits) {
          if (stance > 0 && peer.traits.ideology === "racist") peerReaction += 0.20;
          else if (stance > 0 && peer.traits.ideology === "egalitarian") peerReaction -= 0.20;
          else if (stance < 0 && peer.traits.ideology === "racist") peerReaction -= 0.25;
          else if (stance < 0 && peer.traits.ideology === "egalitarian") peerReaction += 0.20;
        } else if (topic === "faction" && peer.traits) {
          if (stance > 0 && peer.traits.faction === "muni_purist") peerReaction += 0.15;
          else if (stance < 0 && peer.traits.faction === "muni_purist") peerReaction -= 0.15;
        }

        peer.trust = +Math.max(-1.0, Math.min(1.0, peer.trust + peerReaction)).toFixed(3);
        if (Math.abs(peerReaction) >= 0.03) {
          ripples.push({ id: peer.id, name: peer.shortName, delta: +peerReaction.toFixed(3), hop: 1 });
        }
      }

      // Log the gossip
      const logItem = {
        timestamp: Date.now(),
        sourceId: source.id,
        sourceName: source.shortName,
        topic,
        stance,
        text,
        rippleCount: ripples.length
      };
      world.gossipFeed.unshift(logItem);
      if (world.gossipFeed.length > 20) world.gossipFeed.pop();

      // Recalculate player neutrality
      world.playerNeutrality = calculatePlayerNeutrality(world);

      return { ripples, neutrality: world.playerNeutrality, logItem };
    }
  };

  // ---------------------------------------------------------------------------
  // 11. COMPACT ASCII PLAYER & WORLD FILE CODEC (Deterministic Seed Serialization)
  // ---------------------------------------------------------------------------
  const ASCIIPlayerCodec = {
    encode(world) {
      if (!world) return "GFB1-ERR";
      const seed = (world.universeSeed || 1984).toString(36).toUpperCase();
      const epoch = ((world.epoch || 0) & 0x7f).toString(36).toUpperCase();

      const UPGRADE_BITS = [
        "oversized_club", "rigged_goflball", "bribed_caddie", "custom_goflball_cart",
        "lens_of_truth", "canine_talisman", "feline_charm", "zoning_wiretap", "caddie_ledger",
        "cart_windshield", "pro_wedge"
      ];
      let bits = 0;
      const upg = world.purchasedUpgrades || {};
      UPGRADE_BITS.forEach((id, idx) => {
        if (upg[id]) bits |= (1 << idx);
      });
      const itemsHex = bits.toString(16).toUpperCase();

      const pol = world.playerPolarity || {};
      const packAxis = (val) => Math.max(0, Math.min(15, Math.round(((val || 0) + 1.0) * 7.5))).toString(16);
      const polHex = [
        packAxis(pol.pet),
        packAxis(pol.ideology),
        packAxis(pol.faction),
        packAxis(pol.transit),
        packAxis(pol.ethics)
      ].join("").toUpperCase();

      const rounds = ((world.roundsPlayed || 0) & 0xfff).toString(36).toUpperCase();
      const cash = Math.min(9999999, Math.floor(world.cash || 0)).toString(36).toUpperCase();
      const handle = String(world.playerHandle || "PLAYER1").replace(/[^A-Z0-9_]/gi, "").toUpperCase().slice(0, 10);

      const payload = `${seed}.${epoch}.${itemsHex}.${polHex}.${rounds}.${cash}.${handle}`;

      let chk = 0x5a;
      for (let i = 0; i < payload.length; i++) {
        chk = (chk ^ payload.charCodeAt(i)) & 0xff;
      }
      const chkStr = chk.toString(16).padStart(2, "0").toUpperCase();

      return `GFB1:${payload}:${chkStr}`;
    },

    decode(rawStr) {
      if (!rawStr || typeof rawStr !== "string") return null;
      const trimmed = rawStr.trim();
      if (!trimmed.startsWith("GFB1:")) return null;
      const parts = trimmed.split(":");
      if (parts.length !== 3) return null;
      const [, payload, chkStr] = parts;

      let chk = 0x5a;
      for (let i = 0; i < payload.length; i++) {
        chk = (chk ^ payload.charCodeAt(i)) & 0xff;
      }
      if (chk.toString(16).padStart(2, "0").toUpperCase() !== chkStr.toUpperCase()) {
        return null; // Checksum invalid
      }

      const [seed36, epoch36, itemsHex, polHex, rounds36, cash36, handle] = payload.split(".");
      const seed = parseInt(seed36, 36) || 1984;
      const epoch = parseInt(epoch36, 36) || 0;
      const bits = parseInt(itemsHex, 16) || 0;
      const rounds = parseInt(rounds36, 36) || 0;
      const cash = parseInt(cash36, 36) || 0;

      const UPGRADE_BITS = [
        "oversized_club", "rigged_goflball", "bribed_caddie", "custom_goflball_cart",
        "lens_of_truth", "canine_talisman", "feline_charm", "zoning_wiretap", "caddie_ledger",
        "cart_windshield", "pro_wedge"
      ];
      const purchasedUpgrades = {};
      UPGRADE_BITS.forEach((id, idx) => {
        if (bits & (1 << idx)) purchasedUpgrades[id] = true;
      });

      const unpackAxis = (nibble) => {
        const v = parseInt(nibble || "8", 16);
        return +((v / 7.5) - 1.0).toFixed(2);
      };
      const playerPolarity = {
        pet: unpackAxis(polHex[0]),
        ideology: unpackAxis(polHex[1]),
        faction: unpackAxis(polHex[2]),
        transit: unpackAxis(polHex[3]),
        ethics: unpackAxis(polHex[4])
      };

      const net = buildSandboxNetwork(seed, epoch, 42);
      const highestTierCleared = Math.min(6, Math.max(rounds > 0 ? 1 : 0, Math.floor(rounds / 2)));

      // Restore unlocked tiers and trust bias matching decoded rounds & polarity
      for (const id of net.order) {
        const n = net.nodes[id];
        if (n.tier <= Math.max(1, highestTierCleared)) {
          n.unlocked = true;
          n.invitedBack = true;
        }
        if (rounds > 0 && Math.abs(playerPolarity.faction) + Math.abs(playerPolarity.pet) + Math.abs(playerPolarity.ideology) > 0.1) {
          let score = 0;
          if (n.traits) {
            if (n.traits.pet === "cat_lover") score += playerPolarity.pet * 0.35;
            else score -= playerPolarity.pet * 0.35;
            if (n.traits.ideology === "racist") score += playerPolarity.ideology * 0.4;
            else if (n.traits.ideology === "egalitarian") score -= playerPolarity.ideology * 0.4;
            if (n.traits.faction === "country_club_elite" || n.traits.faction === "zoning_insider") score += playerPolarity.faction * 0.35;
            else if (n.traits.faction === "muni_purist") score -= playerPolarity.faction * 0.35;
          }
          if (score > 0.25 && n.tier <= Math.max(1, highestTierCleared)) {
            n.doingBusiness = true;
            n.trust = +Math.min(0.95, 0.25 + score).toFixed(3);
          } else if (score < -0.35) {
            n.trust = +Math.max(-0.85, score).toFixed(3);
          }
        }
      }

      const world = {
        version: 4,
        universeSeed: seed,
        epoch,
        playerId: "gb_" + Math.random().toString(36).slice(2, 10),
        playerHandle: String(handle || "PLAYER1").replace(/[^A-Z0-9_]/gi, "").toUpperCase().slice(0, 12) || "PLAYER1",
        cash,
        revenuePerRound: 0,
        networkSharePct: 0.0,
        highWaterSharePct: 0.0,
        friendsCount: 0,
        enemiesCount: 0,
        roundsPlayed: rounds,
        totalHolesPlayed: rounds * 9,
        totalPlaySeconds: rounds * 300,
        highestTierCleared,
        purchasedUpgrades,
        currentPartnerId: net.order[0],
        currentHole: 1,
        roundStrokes: 0,
        roundPar: 0,
        roundScores: [],
        network: net,
        playerPolarity,
        gossipFeed: [],
        gossipLog: []
      };

      recalculateNetworkStats(world);
      world.playerNeutrality = calculatePlayerNeutrality(world);
      return world;
    }
  };

  // ---------------------------------------------------------------------------
  // 12. ON-THE-FLY PROCEDURAL DIALOGUE GENERATOR
  // ---------------------------------------------------------------------------
  const GoflDialogueGenerator = {
    generate(world, npc) {
      if (!npc) return { speech: "NICE DAY FOR GOFLBALL.", quips: [] };
      const dir = SymphonyDirector.computeState(world, npc);
      const seedVal = (world.universeSeed || 1984) + (world.currentHole || 1) * 31 + (npc.seedOffset || 0) * 17;
      const rng = mulberry32(seedVal);

      const hasLensOfTruth = !!(world.purchasedUpgrades && world.purchasedUpgrades.lens_of_truth);
      const hasCatRepeller = !!(world.purchasedUpgrades && world.purchasedUpgrades.canine_talisman);
      const hasCatnip = !!(world.purchasedUpgrades && world.purchasedUpgrades.feline_charm);

      const OPENERS = [
        `HOLE ${world.currentHole || 1}: BREEZE IS COMING HARD OFF THE PINES.`,
        `TURF IS RUNNING FAST TODAY ON THIS FAIRWAY.`,
        `SOLID CONTACT ON THAT DRIVE. NICE ARC ON THE GOFLBALL.`,
        `WATCH OUT FOR THE DITCH ON THE RIGHT SIDE OF THIS GREEN.`,
        `CART BATTERY SEEMS TO BE HOLDING UP DESPITE THESE STEEP HILLS.`,
        `MORNING DEW JUST FINISHED BURNING OFF THE FAIRWAY.`
      ];
      const opener = OPENERS[Math.floor(rng() * OPENERS.length)];

      let speech = "";
      let quips = [];

      // Stage 0: Pure Safe Lullaby (Burger King drive-thru, coffee, mowers — zero trait or conspiracy leaks)
      if (dir.npcStage === 0) {
        const safeLine = SymphonyDirector.selectOrchestratedLine(world, npc);
        const safeQuipSets = [
          [
            { text: "DRIVE-THRU LINES ARE BRUTAL LATELY.", topic: "general", stance: 0 },
            { text: "COURSE LOOKS IN GREAT SHAPE TODAY.", topic: "general", stance: 0 },
            { text: "LET'S SEE WHAT THE WIND DOES ON THIS HOLE.", topic: "general", stance: 0 }
          ],
          [
            { text: "GRABBED LUKEWARM COFFEE ON THE WAY IN TOO.", topic: "general", stance: 0 },
            { text: "TRUCK BARELY STARTED THIS MORNING.", topic: "general", stance: 0 },
            { text: "FAIRWAY'S FIRMING UP NICELY.", topic: "general", stance: 0 }
          ],
          [
            { text: "GOOD DAY JUST TO GET NINE HOLES IN.", topic: "general", stance: 0 },
            { text: "HOPE MY SWING SHOWS UP BEFORE HOLE FOUR.", topic: "general", stance: 0 },
            { text: "NICE PACE AHEAD OF US SO FAR.", topic: "general", stance: 0 }
          ]
        ];
        const pickIdx = ((world.currentHole || 1) + (npc.seedOffset || 0)) % safeQuipSets.length;
        return { speech: safeLine, quips: safeQuipSets[pickIdx] };
      }

      // Stage 1: Subtle, deniable Burger-King-cadence feelers testing compatibility
      if (dir.npcStage === 1) {
        if (hasCatRepeller && npc.traits && npc.traits.pet === "cat_lover") {
          return {
            speech: "YOU HEAR A HIGH PITCHED HUM IN THIS CART? KEEPS REMINDING ME OF MY SISTER'S STRAY DOG.",
            quips: [
              { text: "COULD BE MY CANINE WHISTLE KEYCHAIN ON THE BAG.", topic: "pet", stance: -0.9 },
              { text: "MUST BE THE BATTERY CHARGER. CATS HATE THAT HUM TOO.", topic: "pet", stance: 0.7 },
              { text: "DIDN'T NOTICE ANYTHING OUT HERE.", topic: "general", stance: 0 }
            ]
          };
        }

        if (npc.traits && npc.traits.pet === "cat_lover" && rng() < 0.45) {
          return {
            speech: `${opener} GOT TWO SIAMESE CATS WAITING BY THE DOOR BACK HOME.`,
            quips: [
              { text: "CATS ARE SMART. NEVER NEED TO WALK THEM IN SLEET.", topic: "pet", stance: 0.8 },
              { text: "I'M MORE OF A BIRD DOG IN THE TRUCK BED GUY.", topic: "pet", stance: -0.8 },
              { text: "LET'S JUST WATCH WHERE THIS WIND CARRIES.", topic: "general", stance: 0 }
            ]
          };
        } else if (npc.traits && npc.traits.pet === "dog_lover" && rng() < 0.45) {
          return {
            speech: `${opener} LEFT MY OLD LAB SLEEPING BY THE SHOP FLOOR BEFORE TEE TIME.`,
            quips: [
              { text: "NOTHING BEATS A GOOD WORKING DOG AROUND THE YARD.", topic: "pet", stance: -0.8 },
              { text: "DOGS CHEW EVERYTHING. TOO MUCH NOISE FOR ME.", topic: "pet", stance: 0.8 },
              { text: "LET'S CHECK THE YARDAGE TO THE FLAG.", topic: "general", stance: 0 }
            ]
          };
        }

        const feelerLine = SymphonyDirector.selectOrchestratedLine(world, npc);
        return {
          speech: `${opener} ${feelerLine}`,
          quips: [
            { text: "SOLID BUSINESS GUYS GOTTA STICK TOGETHER OUT HERE.", topic: "faction", stance: 0.65 },
            { text: "EVERYBODY DESERVES A FAIR SHOT AT THESE ACCOUNTS.", topic: "faction", stance: -0.65 },
            { text: "LET'S JUST PLAY THIS HOLE CLEAN.", topic: "general", stance: 0 }
          ]
        };
      }

      // Stage 2: Mask Off (Tribal prejudice, gatekeeping, or class disdain surfaces)
      if (dir.npcStage === 2) {
        const maskLine = SymphonyDirector.selectOrchestratedLine(world, npc);
        if (npc.traits && npc.traits.ideology === "racist") {
          return {
            speech: `${maskLine}`,
            quips: [
              { text: "KEEPING THE WRONG CROWD OUT KEEPS CONTRACTS CLEAN.", topic: "ideology", stance: 0.9 },
              { text: "GOFLBALL IS FOR EVERYBODY. WATCH THAT TALK IN HERE.", topic: "ideology", stance: -0.95 },
              { text: "I JUST STICK TO MY OWN NUMBERS ON THE SCORECARD.", topic: "general", stance: 0 }
            ]
          };
        }
        return {
          speech: `${maskLine}`,
          quips: [
            { text: "KEEP THE CITY BUS CROWD & MUNI RULES OUT OF OUR FLIGHT.", topic: "faction", stance: 0.8 },
            { text: "PUBLIC ROADS PAID FOR THIS CORRIDOR. EVERYBODY USES IT.", topic: "faction", stance: -0.8 },
            { text: "FOCUSING ON THIS NEXT APPROACH SHOT.", topic: "general", stance: 0 }
          ]
        };
      }

      // Stage 3: Empty Lot & Apex Opposite-Side Conspiracy Reversal
      const conspLine = SymphonyDirector.selectOrchestratedLine(world, npc);
      return {
        speech: `${conspLine}`,
        quips: [
          { text: "HEADS TURNS INTO TAILS THE SECOND YOU CHECK THE DEED.", topic: "faction", stance: 0.85 },
          { text: "WHO ACTUALLY SIGNS THE ESCROW ON THAT 40-ACRE LOT?", topic: "general", stance: 0 },
          { text: "SO THE WHOLE LEAGUE HAS BEEN TRADING BOTH SIDES?", topic: "ideology", stance: -0.75 }
        ]
      };
    }
  };

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
    TRAIT_DEFS,
    SymphonyDirector,
    GossipEngine,
    ASCIIPlayerCodec,
    GoflDialogueGenerator,
    calculatePlayerNeutrality,
    getEpochConfig,
    buildSandboxNetwork,
    evaluateNpcBanter,
    evaluateRoundEnd,
    recalculateNetworkStats
  };
});
