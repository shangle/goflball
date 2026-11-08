/**
 * GOFLBALL (1984) — Procedural Social Network, Hairball Belief Topology & Jev-Style Quip Engine
 *
 * Designed to run 100% in the browser (and shared with Node/Worker if needed).
 * Every player exists inside their own local sandbox with a procedurally extensible
 * web of West Michigan / generic Midwest country-club goflballers.
 *
 * Key Mechanics:
 * 1. THE HAIRBALL TOPOLOGY (Hairy Ball Theorem):
 *    Each AI has a 5D conviction vector `beliefs` in [-1, 1] AND a `perceivedPlayer` vector
 *    plus a matrix of what they think OTHER AIs believe.
 *    Because the vectors span orthogonal & antipodal tribal axes, pleasing one cluster
 *    inevitably alienates antipodal clusters via course gossip when you name-drop or take stances.
 *    Most players plateau around 14%–19% network capture; 100% is mathematically unreachable
 *    (occupied only by the masked "100.0%" entry at #1 on the leaderboard).
 *
 * 2. THE SHIFTING EMPTY LOT CONSPIRACY (Heads -> Tails -> Heads):
 *    Whoever you think is at the top of the Empty Lot deal on M-45 / Lake Drive is never the real top.
 *    When you align with Faction A, the truth flips to Faction B, then C, ad infinitum.
 *
 * 3. JEV-STYLE MANTRA & QUIP ENGINE:
 *    Real people on a golf cart repeat the same ~100 conversational mantras, Burger King-level
 *    observations, dogwhistles, complaints, and tests. 90%+ is handled instantaneously in-browser
 *    by the weighted semantic-intent + mantra matcher, with optional seamless fallback to
 *    local/edge LLM only when novel free-text questions arise.
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
  // 1. TRIBES / ARCHETYPES (Escalating Tiers 1 -> Infinite)
  // ---------------------------------------------------------------------------
  const TRIBES = {
    MUNI_REGULARS: {
      id: "MUNI_REGULARS",
      tier: 1,
      name: "Twilight Muni Nine",
      clubName: "Pine Rest Muni & Driving Range",
      greenFee: 18,
      contractValueBase: 4500,
      tolerance: 0.68, // Harder to offend early on
      beliefCenter: {
        theology: 0.15,    // Mildly traditional
        populism: 0.45,    // Complains about prices, taxes, potholes
        exclusivity: -0.3, // Resents country club snobs
        nativism: 0.25,    // Casual "nobody wants to work anymore"
        paternalism: 0.20  // Old-school gender/family clichés
      },
      tabooTriggers: ["communist", "marxist", "ban trucks", "tax gas", "woke"],
      instantExitAccusation: "Listen pal, I came out here to hit nine and drink a Miller Lite, not listen to some brainwashed commie lecture me on my own tax dollars. Play through by yourself."
    },

    HERITAGE_DEACONS: {
      id: "HERITAGE_DEACONS",
      tier: 2,
      name: "Heritage Reformed Stewardship Council",
      clubName: "Covenant Meadows Links",
      greenFee: 85,
      contractValueBase: 18500,
      tolerance: 0.46,
      beliefCenter: {
        theology: 0.92,    // Hardline Christian Nationalist / Dutch-Midwest Reformed flavor
        populism: 0.30,
        exclusivity: 0.45,
        nativism: 0.60,
        paternalism: 0.85  // Rigid "biblical household order"
      },
      tabooTriggers: ["democrat", "liberal", "union", "public school", "pride", "secular", "atheist", "abortion", "choice"],
      instantExitAccusation: "Yeah, we're done here. If you're voting Democrat and bringing that secular rot onto our fairway, we don't do business with your kind. Walk back to the clubhouse."
    },

    TOWNSHIP_EARTHMOVERS: {
      id: "TOWNSHIP_EARTHMOVERS",
      tier: 3,
      name: "Drain Commission & Ag-Zoning Syndicate",
      clubName: "Black Dirt Acres Country Club",
      greenFee: 160,
      contractValueBase: 52000,
      tolerance: 0.34,
      beliefCenter: {
        theology: 0.35,
        populism: 0.88,    // "We own the dirt, we bought the zoning board"
        exclusivity: 0.55,
        nativism: 0.82,    // Outright nativist / "wrong element moving out from the city"
        paternalism: 0.65
      },
      tabooTriggers: ["dnr", "epa", "wetlands", "inspector", "affordable housing", "bus line", "apartments", "city people", "democrat"],
      instantExitAccusation: "You sound just like one of those state wetland inspectors or some city planner trying to bus the wrong element into our township. Don't call my office Monday."
    },

    LAKESHORE_FOUNDERS: {
      id: "LAKESHORE_FOUNDERS",
      tier: 4,
      name: "Lakeshore Family Office & Yacht Club",
      clubName: "Dune Crest Private Reserve",
      greenFee: 450,
      contractValueBase: 165000,
      tolerance: 0.22,
      beliefCenter: {
        theology: 0.55,    // Uses church foundation boards as tax shields
        populism: -0.75,   // Despises working-class "riffraff" and township dirt guys alike
        exclusivity: 0.96, // Extreme classism: legacy summer homes, bloodlines
        nativism: 0.78,    // Polite voice, brutal redlining & demographic gatekeeping
        paternalism: 0.88  // "Girls belong on the charity gala committee, not the board"
      },
      tabooTriggers: ["public access", "beach access", "new money", "union", "wealth tax", "public school", "muni", "trailer", "discount"],
      instantExitAccusation: "Hmm. I think there was a mix-up with the membership committee. You simply aren't our sort of people. My caddie will escort you to the gravel lot."
    },

    REGENTS_ENDOWMENT: {
      id: "REGENTS_ENDOWMENT",
      tier: 5,
      name: "University Endowment & Medical Annex Board",
      clubName: "The Regents' Sanctuary (Invite Only)",
      greenFee: 1200,
      contractValueBase: 540000,
      tolerance: 0.14,
      beliefCenter: {
        theology: -0.60,   // Looks down on the Deacons as backward rubes
        populism: -0.92,   // Technocratic elitism
        exclusivity: 0.98, // Supreme classism masked as "merit & vision"
        nativism: 0.64,    // Quietly bulldozes low-income neighborhoods for "innovation corridors"
        paternalism: 0.72  // Condescending dynasty politics
      },
      tabooTriggers: ["hick", "bible", "zoning board", "foia", "audit", "tax exempt", "property tax", "working class", "muni"],
      instantExitAccusation: "You're fundamentally misaligned with the Endowment's long-horizon stewardship. Frankly, you talk like a township drain contractor. Security will validate your parking."
    }
  };

  // ---------------------------------------------------------------------------
  // 2. THE EVER-SHIFTING "EMPTY LOT" CONSPIRACY LADDER (Heads -> Tails -> Heads)
  // ---------------------------------------------------------------------------
  const CONSPIRACY_LAYERS = [
    {
      depth: 0,
      headline: "The 40-Acre Empty Lot off Exit 38",
      currentBelievedTop: "The Heritage Christian Businessmen's PAC",
      rumorText: "Word in the pro shop is the Christian businessmen's group is pooling capital through three shell LLCs to buy the old 40-acre parcel off Exit 38.",
      nextTwistTrigger: "Wait—once you get inside the Deacons' foursome, they admit they got out-leveraged at the county register of deeds...",
      flippedTruth: "The Mega-Farmer who bought the Township Zoning Board"
    },
    {
      depth: 1,
      headline: "The Township Ag-Holdout & Bought Zoning Board",
      currentBelievedTop: "Harlan VanderSloot's 9,000-Acre Farm Trust",
      rumorText: "Turns out the Christian businessmen were just the front buyers! Old man VanderSloot bought three seats on the Township Zoning Board to lock the parcel as Ag-Only so he could annex it for pennies.",
      nextTwistTrigger: "Except VanderSloot's operating line just got called by a private riparian trust on the Lakeshore...",
      flippedTruth: "The University Endowment's Secret Biotech Annex"
    },
    {
      depth: 2,
      headline: "The Eminent-Domain University Department",
      currentBelievedTop: "The University Board of Regents",
      rumorText: "VanderSloot doesn't even own his own drainage tiles! The University is about to announce a new Applied Bio-Logistics Department on that exact empty lot—condemning the farm road under state educational immunity.",
      nextTwistTrigger: "But when you play nine with the Regents Chair, he laughs and says the University doesn't keep the lease...",
      flippedTruth: "The Sovereign Stewardship Leaseback (The Same Deacons' Pension Trust)"
    },
    {
      depth: 3,
      headline: "The Tax-Free Ground Lease Loop",
      currentBelievedTop: "The Reformed Foundation Ground-Lease Syndicate",
      rumorText: "You thought the University was on top? The University only leased the air rights! The underlying fee-simple dirt is owned by the Church Pension Trust you met on Tier 2—who leased it back through a municipal bond authority!",
      nextTwistTrigger: "Yet the bond authority's sole underwriter only takes calls from the back nine at...",
      flippedTruth: "The County Drain Commissioner's Brother-in-Law at the Muni Course"
    }
  ];

  // Procedural generator for infinite conspiracy layers beyond depth 3
  function getConspiracyAtDepth(depth) {
    if (depth < CONSPIRACY_LAYERS.length) {
      return CONSPIRACY_LAYERS[depth];
    }
    const cycle = [
      {
        actor: "The Christian Stewardship Bond Syndicate",
        counterActor: "The Township Drain & Gravel Cartel",
        scheme: "rezoning the water table easements under the empty lot so nobody can pour concrete without paying $40 a yard in runoff credits"
      },
      {
        actor: "The Township Drain & Gravel Cartel",
        counterActor: "The Lakeshore Dynasty Family Office",
        scheme: "buying the county tax-forfeiture auction certificates three years in advance through a Delaware blind trust"
      },
      {
        actor: "The Lakeshore Dynasty Family Office",
        counterActor: "The University Regents Research Foundation",
        scheme: "declaring the empty lot an 'Autonomous Innovation District' exempt from township zoning and state income tax"
      },
      {
        actor: "The University Regents Research Foundation",
        counterActor: "The Christian Stewardship Bond Syndicate",
        scheme: "mortgaging the new university department building back to the church elders' private credit fund at 11.5% tax-free yield"
      }
    ];
    const step = cycle[depth % cycle.length];
    return {
      depth,
      headline: `Layer #${depth + 1}: The Empty Lot Shell Game`,
      currentBelievedTop: step.actor,
      rumorText: `Every time you think you found the real buyer of the empty lot, the deed flips! You chased ${step.actor}, only to find out they're a pass-through for ${step.counterActor}—who are ${step.scheme}.`,
      nextTwistTrigger: "There is always one more foursome pulling the strings from the next tee box.",
      flippedTruth: step.counterActor
    };
  }

  // ---------------------------------------------------------------------------
  // 3. SEED ROSTER OF WEST-MICHIGAN / MIDWEST GOFLBALL CHARACTERS
  // ---------------------------------------------------------------------------
  const SEED_ROSTER = [
    // TIER 1: MUNI REGULARS
    {
      id: "ai_derek_v",
      name: "Derek VanderBerg",
      handle: "D_VANDER84",
      title: "Regional Fleet & Lease Guy",
      tribe: "MUNI_REGULARS",
      tier: 1,
      handicap: 18,
      avatarSeed: 101,
      shirtColor: "#f83800",
      hatColor: "#fcfcfc",
      bio: "Drives an F-250 King Ranch on a 84-month note. Talks like he's ordering a Whopper Jr. while waiting on the par-3 tee box.",
      beliefs: { theology: 0.25, populism: 0.55, exclusivity: -0.25, nativism: 0.35, paternalism: 0.30 },
      convictions: [
        "Nobody wants to show up at 7 AM anymore, they all want thirty bucks an hour to sit on their phone.",
        "I got a guy at the township who says that empty lot off the highway is already spoken for by the church guys.",
        "My wife keeps buying those organic berries at Meijer, nine dollars a pint, I told her we're eating cardboard."
      ],
      quips: {
        greeting: [
          "Afternoon bud. Cart path is tore all to hell on four, township hasn't touched a pothole since Easter.",
          "Hope you play quick, I got a guy meeting me at the Culver's off 28th after nine.",
          "Look at this tee box. Eighteen bucks and they can't even run a hose on it. Anyway, you in business around here?"
        ],
        smalltalk: [
          "You see that 40-acre empty lot by the bypass? Guys from the Reformed businessmen's breakfast have been walking it in dress shoes.",
          "Man, I stopped at Burger King on the way here, waited twelve minutes for a Croissan'wich. Nobody wants to work anymore, am I right?",
          "My brother-in-law says if the wrong crowd moves out this way from the city, our property values are toast."
        ],
        probe: [
          "So where do you land on all the nonsense going on lately? You're not one of those tax-and-spend types, right?",
          "Everybody's got an angle on that empty lot. Who do you hear is putting the cash up?"
        ],
        approval: [
          "Haha, nail on the head bud. You talk like a guy who actually signs the front of the check.",
          "See, that's what I'm talking about. Common sense. Put my number in your phone, we got accounts to move.",
          "Bingo. You're alright man. Let's get you in with Rick from the Deacon board next round."
        ],
        suspicion: [
          "Huh. Okay then. Didn't realize you read the Sunday paper from the east side of the state.",
          "Easy there professor, we're just hitting a white ball around the weeds."
        ]
      }
    },
    {
      id: "ai_todd_k",
      name: "Todd Koopman",
      handle: "KOOP_DOG",
      title: "Commercial Strip-Mall Paving",
      tribe: "MUNI_REGULARS",
      tier: 1,
      handicap: 22,
      avatarSeed: 102,
      shirtColor: "#0058f8",
      hatColor: "#f8b800",
      bio: "Always chewing a toothpick. Evaluates every human being within 15 seconds based on whether they laugh at his jokes about his ex-wife.",
      beliefs: { theology: 0.10, populism: 0.65, exclusivity: -0.40, nativism: 0.45, paternalism: 0.55 },
      convictions: [
        "Women today want you to talk about your feelings and then still pay for the boat slip.",
        "You can't even tell a joke in the breakroom anymore without somebody calling a lawyer.",
        "That empty lot? Whoever pours the curbing on that thing is gonna clear three hundred grand easy."
      ],
      quips: {
        greeting: [
          "Hey! Fresh meat on the first tee. Don't worry, I slice everything into the weeds anyway.",
          "Listen, long as you don't count my mulligans and don't talk like my ex-wife's attorney, we'll get along great.",
          "Starter tried to pair us with some guy driving a Prius with a coexist sticker. Told him we already had a fourth."
        ],
        smalltalk: [
          "Used to be a guy could take a client to Hooters, sign a napkin, and boom—business done. Now everything's a compliance seminar.",
          "I drove past that big empty lot on the corner. Grass is waist high, and the township still cited me for my boat trailer!",
          "My kid's teacher tried telling him about carbon footprints. I told him my footprint is size 12 work boot."
        ],
        probe: [
          "You seem like a regular guy. You don't buy into all this PC sensitivity garbage they push now, do ya?",
          "Tell me straight—you think the church money is buying that empty lot, or is it somebody bigger?"
        ],
        approval: [
          "Ha! I knew you were one of us the second you stepped out of the lot. Here's my card.",
          "Amen brother. Real recognizes real. Wait till I introduce you to the guys over at Covenant Meadows."
        ],
        suspicion: [
          "Whoa, okay HR department. Didn't know I needed a permission slip to talk on a muni course.",
          "Yeah, well, some of us actually work for a living."
        ]
      }
    },

    // TIER 2: HERITAGE DEACONS (Christian Nationalist / Dutch-Midwest Flavor)
    {
      id: "ai_rick_h",
      name: "Rick Hoekstra",
      handle: "GRACE_CAP_77",
      title: "Stewardship & Family Capital",
      tribe: "HERITAGE_DEACONS",
      tier: 2,
      handicap: 11,
      avatarSeed: 201,
      shirtColor: "#fcfcfc",
      hatColor: "#0058f8",
      bio: "Deacon chair, youth basketball booster, owns four LLCs named after Old Testament mountains. Never swears, which makes his bigotry sound like a church bulletin.",
      beliefs: { theology: 0.95, populism: 0.25, exclusivity: 0.50, nativism: 0.65, paternalism: 0.90 },
      convictions: [
        "This county was built by God-fearing families who kept the Sabbath and didn't ask the government for handouts.",
        "If a man is a Democrat, he's at war with biblical stewardship. Simple as that. I won't sign a contract with him.",
        "We're raising capital to secure that 40-acre empty lot before outside secular developers ruin the character of the township."
      ],
      quips: {
        greeting: [
          "Blessed morning for nine holes, isn't it? Good to have a fellow businessman out here before Wednesday prayer.",
          "Derek told me you're a sharp operator. We always like bringing solid, right-thinking men into the fold.",
          "Mind if I say a quick word of gratitude for our fellowship before we tee off? Good. Let's hit 'em straight."
        ],
        smalltalk: [
          "Brenda and I pulled all four kids out of the district schools years ago. Have you seen what the state board in Lansing is pushing?",
          "You know why our local businesses thrive? Because we hire from our own congregations. Trust, accountability, shared heritage.",
          "We had a consortium lined up for that 40-acre empty lot—righteous men ready to build a family-first plaza—until Old Man VanderSloot pulled a stunt at the zoning board."
        ],
        probe: [
          "I always ask a man before we do real volume together: where do you stand when the ballot box comes around? You aren't voting Democrat, are you?",
          "When you look at the culture today—fathers sidelined, girls told to act like CEOs instead of mothers—what's your take?"
        ],
        approval: [
          "That's a man of discernment right there. It's rare to hear someone speak the plain truth anymore.",
          "You've got a seat at our Friday breakfast table anytime. In fact, let me put you on the vendor list for the Foundation.",
          "Praise be. Listen, if you want to know why our group got blocked on that empty lot, you need to play with Harlan VanderSloot at Black Dirt Acres."
        ],
        suspicion: [
          "I see. Well, everyone has 'their own truth' nowadays, don't they?",
          "We try to keep our vendor network aligned with traditional family convictions, if you catch my meaning."
        ]
      }
    },
    {
      id: "ai_cal_b",
      name: "Calvin Boersma",
      handle: "SOV_COVENANT",
      title: "Foundations & Christian Escrow",
      tribe: "HERITAGE_DEACONS",
      tier: 2,
      handicap: 9,
      avatarSeed: 202,
      shirtColor: "#88d800",
      hatColor: "#000000",
      bio: "Talks casually over a hot dog at the turn about how only landowning heads-of-household from the right churches should sit on county boards.",
      beliefs: { theology: 0.92, populism: 0.40, exclusivity: 0.55, nativism: 0.72, paternalism: 0.88 },
      convictions: [
        "Look at Chicago, look at Detroit. That's what happens when you let the wrong element dictate the culture.",
        "A household needs one head, just like a business. When my wife wants an opinion on commercial paper, she asks me.",
        "We thought we had the Empty Lot locked up for the Christian Businessmen's Trust, but the farmer bought the zoning board right out from under us!"
      ],
      quips: {
        greeting: [
          "Good to meet you. Always looking for reliable men who aren't afraid of where this country is headed.",
          "We keep a tight circle out here at Covenant Meadows. Keeps the riffraff and the bureaucrats off the grass."
        ],
        smalltalk: [
          "They're trying to put a public bus stop two miles from our industrial park. You know exactly who that brings in.",
          "I told my daughter, you don't need a master's degree, you need a husband from a solid family at First Reformed.",
          "You want the real story on the empty lot? Our Christian investors put three million in escrow, and then Harlan the farmer paid off the zoning board to freeze it!"
        ],
        probe: [
          "Between us on the cart here—you don't entertain any of that progressive Democrat rot in your shop, do you?",
          "People act like all cultures are interchangeable. Look at who built West Michigan. You agree with that, right?"
        ],
        approval: [
          "Solid as oak. That's the kind of backbone we need in our supply chain.",
          "You're speaking my language. Let's get some contracts inked after the ninth hole."
        ],
        suspicion: [
          "Hmm. Sounds a little too close to what they're teaching down at the state university.",
          "Careful sitting on the fence like that. Around here, you're either with the community or you're an outsider."
        ]
      }
    },

    // TIER 3: TOWNSHIP EARTHMOVERS (The Farmer / Zoning Syndicate)
    {
      id: "ai_harlan_v",
      name: "Harlan VanderSloot",
      handle: "DIRT_KING_49",
      title: "Ag-Holdings & Township Zoning",
      tribe: "TOWNSHIP_EARTHMOVERS",
      tier: 3,
      handicap: 14,
      avatarSeed: 301,
      shirtColor: "#f8b800",
      hatColor: "#00a800",
      bio: "Wears dusty boots in the clubhouse and nobody dares stop him. Owns 9,000 acres and five township trustees. Laughs at the church guys for thinking prayer beats a drain easement.",
      beliefs: { theology: 0.30, populism: 0.90, exclusivity: 0.60, nativism: 0.86, paternalism: 0.70 },
      convictions: [
        "Those church boys in their pastel polos thought they could buy the 40-acre lot next to my silage pits. I bought the whole zoning board for the price of a used combine.",
        "Keep the apartments out, keep the bus lines out, keep the city element where they belong.",
        "Now the University Regents are sniffing around my land with state condemnation lawyers. That's who's really pulling the strings."
      ],
      quips: {
        greeting: [
          "So you're the guy Rick Hoekstra sent over. Don't worry, I don't care which pew you sit in, long as you know who owns the dirt.",
          "Grab a beer out of the cooler. We don't wait on the beverage girl out here."
        ],
        smalltalk: [
          "Rick and his Christian businessmen crack me up. Poured all that capital in, and one 4-to-1 vote at Tuesday night zoning turned their parcel into non-buildable swamp pasture! Who do you think bought that board? Me!",
          "Listen, I got guys from south of the border working my barns, sure, they keep their heads down—but if they try moving those city section-8 complexes out here? Over my dead body.",
          "The beverage cart girl tried telling me she's studying 'environmental policy.' Honey, just hand me the Coors and smile."
        ],
        probe: [
          "Those soft-handed church deacons think they run the county, and the state environmental creeps think they own my ditches. Who do you side with when push comes to shove?",
          "Wait till you hear who just served an eminent domain notice on that empty lot. You know anybody on the Lake Shore or the University board?"
        ],
        approval: [
          "Hah! You got grit, kid. Not like those Bible-thumpers or those pencil-necks from Lansing. We're gonna make a pile of money together.",
          "Look, I thought I had the empty lot locked down with the zoning board—until the Lakeshore yacht club crowd and the University stepped in. I'll get you on their tee sheet."
        ],
        suspicion: [
          "You talk mighty polite for a guy trying to do business in my township.",
          "Don't start sounding like a DNR wetland inspector on my back nine."
        ]
      }
    },

    // TIER 4: LAKESHORE FOUNDERS (Old Money Classism & Quiet Redlining)
    {
      id: "ai_preston_d",
      name: "Preston DeVries III",
      handle: "DUNE_CREST_III",
      title: "Lakeshore Family Office",
      tribe: "LAKESHORE_FOUNDERS",
      tier: 4,
      handicap: 4,
      avatarSeed: 401,
      shirtColor: "#00e8d8",
      hatColor: "#fcfcfc",
      bio: "Third-generation Lakeshore compound. Never raises his voice. Treats waitstaff, municipal golfers, and self-made contractors like stray dogs wandering onto his lawn.",
      beliefs: { theology: 0.50, populism: -0.85, exclusivity: 0.98, nativism: 0.80, paternalism: 0.92 },
      convictions: [
        "Some bloodlines are built to allocate capital, and some are built to pour concrete. Confusing the two ruins a community.",
        "Harlan VanderSloot thinks buying a $400 township trustee makes him a player. Our family office holds the note on his grain elevators.",
        "We're donating the 40-acre empty lot to the University for a new department—so our grandkids have a biotech corridor and the public is locked out."
      ],
      quips: {
        greeting: [
          "Ah. You found the gate. When you pull in, do try to park behind the hedges next time—the members prefer not to see work sedans.",
          "Let's keep this brisk. I have a foundation luncheon on the veranda at noon."
        ],
        smalltalk: [
          "It's adorable watching the church deacons and that farmer fight over the empty lot. Neither of them realizes our family trust called the note and gifted the option to the University.",
          "They wanted to put public parking near our beach access road. Can you imagine? Coolers, loud music, people from the east side of town tracking grease onto the boardwalk.",
          "My wife wanted to join the hospital board. I told her, darling, run the hydrangea auction, leave the governance to the men who built the wing."
        ],
        probe: [
          "Tell me honestly—you've had to deal with those dreadful township populists and muni-course strivers to get here. You don't actually view them as peers, do you?",
          "Everyone today whines about 'opportunity.' Isn't it obvious that breeding and station simply determine where people belong?"
        ],
        approval: [
          "Refreshingly candid. Most people at your level pretend to be egalitarian until the check clears.",
          "Very well. I'll instruct our procurement director to route the Q3 retainers through your firm. And I'll introduce you to Chancellor Sterling on the Regents' course."
        ],
        suspicion: [
          "Oh dear. You still have a bit of the public course on your shoes, don't you?",
          "I'm afraid our circle requires a slightly more... curated perspective."
        ]
      }
    },

    // TIER 5: REGENTS ENDOWMENT (The "Opposite Side" Top that flips back again)
    {
      id: "ai_sterling_w",
      name: "Dr. Sterling Vance-Whitmore",
      handle: "REGENT_CHAIR",
      title: "University Endowment & Annex",
      tribe: "REGENTS_ENDOWMENT",
      tier: 5,
      handicap: 2,
      avatarSeed: 501,
      shirtColor: "#a800fc",
      hatColor: "#fcfcfc",
      bio: "Chairs the University Endowment that is announcing the new department on the Empty Lot. Despises the Christian Nationalists and the Farmer as backwards hicks—yet relies on the exact same classist, racist displacement math.",
      beliefs: { theology: -0.75, populism: -0.95, exclusivity: 0.99, nativism: 0.68, paternalism: 0.78 },
      convictions: [
        "Tomorrow morning the University announces the new Department of Applied Bio-Governance on that 40-acre empty lot.",
        "The Deacons and the Farmer were useful idiots to clear the title and zone out the low-income housing for us.",
        "Wait—who underwrote our tax-exempt leaseback bond? Well... the Reformed Church Pension Trust and Derek's brother at the County Drain Office. It's a circle."
      ],
      quips: {
        greeting: [
          "Welcome to the Sanctuary. Very few operators navigate both the Bible-thumpers and the dirt-farmers without getting tar on their cleats.",
          "You wanted to know who really gets the Empty Lot? Look at the architectural rendering in my golf bag."
        ],
        smalltalk: [
          "The Christian businessmen thought they were buying it. The farmer thought he zoned it out. In forty-eight hours, the University announces a $400M new department right on that dirt!",
          "Of course we had to let the township clear out the working-class trailer park first. You can't recruit faculty if *those* demographics are in the school catchment.",
          "And the funniest part? To finance the bond for our new University department, we leased the underlying land back to... the Reformed Stewardship Council and the County Drain guy from the muni course! Heads is tails, tails is heads!"
        ],
        probe: [
          "Now that you see how the machine works—that the pious churchmen, the populist farmer, and the enlightened university are all eating from the same trough—can you stomach staying at the table?",
          "Do you still think those loudmouths back at the municipal course deserve a say in how this county is run?"
        ],
        approval: [
          "Magnificent. You understand that at the top, every faction is just another hazard on the same course—and you still haven't met the syndicate underwriting the next nine holes.",
          "Your retainer is approved. Welcome to the next loop of the spiral."
        ],
        suspicion: [
          "A pity. You climbed all this way just to develop a conscience on the eighteenth green.",
          "Perhaps you'd be more comfortable back at Pine Rest Muni paying eighteen dollars a round."
        ]
      }
    }
  ];

  // ---------------------------------------------------------------------------
  // 4. PROCEDURAL INFINITE AI GENERATOR (For Endless Play & Full Hairball Web)
  // ---------------------------------------------------------------------------
  const FIRST_NAMES = [
    "Brad", "Chad", "Dirk", "Gerrit", "Bret", "Kip", "Vance", "Gordy", "Lance", "Bryce",
    "hendrik", "Dale", "craig", "Marty", "Grant", "Trent", "Boyd", "Ward", "Kent", "vern"
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  const LAST_NAMES = [
    "DeBoer", "VanDyke", "Scholten", "Kooistra", "Meijerink", "Bosma", "Visser", "Dykstra",
    "Lindeman", "Bultema", "Oosterhouse", "Huizenga", "Kraai", "Postma", "Veldheer",
    "Zwier", "Kamphuis", "Roelofs", "Steketee", "Wierenga"
  ];

  const GENERIC_BIZ_TITLES = [
    "Regional Holdings", "Commercial Logistics", "Midwest Packaging", "Stewardship Partners",
    "Township Aggregates", "Lakeshore Equities", "Charter Properties", "Precision Stamping",
    "Great Lakes Cold Storage", "Heritage Fleet Leasing", "Corridor Development", "Apex Retaining Walls"
  ];

  const SHIRT_PALETTE = ["#f83800", "#0058f8", "#88d800", "#f8b800", "#00e8d8", "#fcfcfc", "#a800fc", "#f87858"];
  const HAT_PALETTE = ["#fcfcfc", "#0058f8", "#000000", "#f83800", "#00a800", "#f8b800"];

  function seededRandom(seed) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function generateProceduralAI(index, tierOverride) {
    const seed = 9000 + index * 137;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);
    const r5 = seededRandom(seed + 4);

    const tribeKeys = Object.keys(TRIBES);
    const tier = tierOverride || ((index % 5) + 1);
    const tribeKey = tribeKeys[(tier - 1) % tribeKeys.length];
    const tribe = TRIBES[tribeKey];

    const fname = FIRST_NAMES[Math.floor(r1 * FIRST_NAMES.length)];
    const lname = LAST_NAMES[Math.floor(r2 * LAST_NAMES.length)];
    const title = GENERIC_BIZ_TITLES[Math.floor(r3 * GENERIC_BIZ_TITLES.length)];
    const handle = `${fname.slice(0, 3).toUpperCase()}_${lname.slice(0, 5).toUpperCase()}${10 + (index % 89)}`;

    // Create a unique hairball vector around the tribe center, but with enough variance
    // that no two AIs have identical vectors
    const jitter = (v, r) => Math.max(-1, Math.min(1, +(v + (r - 0.5) * 0.5).toFixed(2)));
    const beliefs = {
      theology: jitter(tribe.beliefCenter.theology, r1),
      populism: jitter(tribe.beliefCenter.populism, r2),
      exclusivity: jitter(tribe.beliefCenter.exclusivity, r3),
      nativism: jitter(tribe.beliefCenter.nativism, r4),
      paternalism: jitter(tribe.beliefCenter.paternalism, r5)
    };

    const seedTemplate = SEED_ROSTER.find((s) => s.tribe === tribeKey) || SEED_ROSTER[0];

    return {
      id: `ai_proc_${index}`,
      name: `${fname} ${lname}`,
      handle,
      title,
      tribe: tribeKey,
      tier: Math.max(tier, Math.floor(index / 6) + 1),
      handicap: Math.max(0, 24 - tier * 3 - Math.floor(r4 * 4)),
      avatarSeed: seed,
      shirtColor: SHIRT_PALETTE[index % SHIRT_PALETTE.length],
      hatColor: HAT_PALETTE[(index * 3) % HAT_PALETTE.length],
      bio: `${title} operator at ${tribe.clubName}. Never stops talking about the Empty Lot and who's ruining the county.`,
      beliefs,
      convictions: seedTemplate.convictions.slice(),
      quips: JSON.parse(JSON.stringify(seedTemplate.quips))
    };
  }

  // Build a 40-node Hairball Social Graph in the local sandbox (extensible infinitely as you climb)
  function buildInitialNetworkGraph(totalNodes = 40) {
    const nodes = {};
    const list = [];

    for (let i = 0; i < SEED_ROSTER.length; i++) {
      const n = JSON.parse(JSON.stringify(SEED_ROSTER[i]));
      nodes[n.id] = enrichNodeState(n, i);
      list.push(nodes[n.id]);
    }

    for (let i = SEED_ROSTER.length; i < totalNodes; i++) {
      const n = generateProceduralAI(i);
      nodes[n.id] = enrichNodeState(n, i);
      list.push(nodes[n.id]);
    }

    // Wire Hairball Belief Perceptions between AIs:
    // Each AI holds an opinion on who else they will or won't play golf with based on cosine similarity
    for (const a of list) {
      a.peerOpinions = {};
      a.allies = [];
      a.enemies = [];
      for (const b of list) {
        if (a.id === b.id) continue;
        const sim = computeBeliefAlignment(a.beliefs, b.beliefs);
        a.peerOpinions[b.id] = sim;
        if (sim > 0.55) a.allies.push(b.id);
        if (sim < -0.15) a.enemies.push(b.id);
      }
    }

    return { nodes, order: list.map((x) => x.id) };
  }

  function enrichNodeState(node, idx) {
    const tribe = TRIBES[node.tribe] || TRIBES.MUNI_REGULARS;
    // Scale tolerance down as tier increases so higher ranks are much easier to offend
    const tierFactor = Math.pow(0.82, Math.max(0, (node.tier || 1) - 1));
    node.tolerance = +(tribe.tolerance * tierFactor).toFixed(3);
    node.contractValue = Math.round(tribe.contractValueBase * (1 + idx * 0.18));
    node.trust = idx < 2 ? 0.15 : 0.0; // First two muni guys start mildly open
    node.offended = false;
    node.blacklistedReason = null;
    node.invitedYouBack = idx < 2; // Unlocked at start
    node.unlocked = idx < 3;
    node.roundsPlayedWith = 0;
    node.doingBusiness = false;
    // What this AI *thinks* the player believes
    node.perceivedPlayerBeliefs = {
      theology: 0,
      populism: 0,
      exclusivity: 0,
      nativism: 0,
      paternalism: 0
    };
    return node;
  }

  function computeBeliefAlignment(b1, b2) {
    const keys = ["theology", "populism", "exclusivity", "nativism", "paternalism"];
    let dot = 0;
    let m1 = 0;
    let m2 = 0;
    for (const k of keys) {
      const v1 = b1[k] || 0;
      const v2 = b2[k] || 0;
      dot += v1 * v2;
      m1 += v1 * v1;
      m2 += v2 * v2;
    }
    if (m1 === 0 || m2 === 0) return 0;
    return +(dot / (Math.sqrt(m1) * Math.sqrt(m2))).toFixed(3);
  }

  // ---------------------------------------------------------------------------
  // 5. THE 100-PHRASE "BURGER KING ON THE CART PATH" JEV-STYLE MANTRA CORPUS
  // ---------------------------------------------------------------------------
  // People on a golf course repeat the same conversational loops all day.
  // Each player input (or quick-quip choice) is analyzed for semantic signals across the 5 axes
  // plus taboo triggers, and matched to a gritty, realistic midwest golf-cart response.
  const PLAYER_QUICK_PROMPTS = {
    MUNI_REGULARS: [
      {
        label: "Agree: 'Nobody wants to work anymore, waited 15 mins at the drive-thru.'",
        text: "Tell me about it, nobody wants to work anymore. Waited fifteen minutes at the drive-thru this morning while three kids stared at their phones.",
        signals: { populism: 0.5, nativism: 0.4, paternalism: 0.3 }
      },
      {
        label: "Gossip: 'I hear the Christian businessmen's group is buying that 40-acre empty lot.'",
        text: "My guy at the title company says the Christian businessmen's group is quietly pooling cash to buy that 40-acre empty lot by the highway.",
        signals: { theology: 0.3, populism: 0.4, exclusivity: 0.1 },
        conspiracyProbe: true
      },
      {
        label: "Flatter: 'We're just regular guys in business trying to keep the state off our backs.'",
        text: "Look, we're just regular guys in business trying to move product and keep the state inspectors off our backs.",
        signals: { populism: 0.6, theology: 0.2, exclusivity: -0.2 }
      },
      {
        label: "Pushback (Risky): 'Maybe if businesses paid a living wage and funded public transit...'",
        text: "Honestly, maybe if businesses paid a living wage and we funded better public transit and schools, people would show up.",
        signals: { populism: -0.6, nativism: -0.8, theology: -0.5 }
      }
    ],
    HERITAGE_DEACONS: [
      {
        label: "Signal Tribe: 'We only do business with solid, God-fearing family men—no Democrats.'",
        text: "In our shop, we keep it in the family of faith. Solid, traditional households. I wouldn't sign a PO with a Democrat if my life depended on it.",
        signals: { theology: 0.95, paternalism: 0.85, nativism: 0.6, exclusivity: 0.4 }
      },
      {
        label: "Paternalism: 'Men lead the boardroom, wives run the household. That's order.'",
        text: "Everything went sideways when people forgot basic household order. Men lead the business, mothers raise the kids. Simple.",
        signals: { theology: 0.85, paternalism: 0.95, exclusivity: 0.5 }
      },
      {
        label: "Empty Lot Probe: 'How did Old Man VanderSloot block your group on the 40-acre lot?'",
        text: "Wait—I heard your stewardship group had the capital lined up for the 40-acre empty lot. How did the farmer block it at the zoning board?",
        signals: { theology: 0.6, exclusivity: 0.5, populism: 0.2 },
        conspiracyProbe: true
      },
      {
        label: "Confess (Taboo): 'Actually I vote Democrat and think church and business shouldn't mix.'",
        text: "Actually I vote Democrat most years and I think church politics and business ought to stay separate.",
        signals: { theology: -0.95, paternalism: -0.8 }
      }
    ],
    TOWNSHIP_EARTHMOVERS: [
      {
        label: "Side with Dirt: 'Those soft church boys don't know a drain commission from a hole in the ground.'",
        text: "Those soft-handed church deacons in their pressed slacks think prayer beats a township zoning variance. You own the dirt, you make the rules.",
        signals: { theology: -0.4, populism: 0.9, nativism: 0.7, exclusivity: 0.5 }
      },
      {
        label: "Nativist Nod: 'Keep the bus lines and city apartments out of our township.'",
        text: "The second you let them put high-density apartments or a bus line out here, the whole township turns into the inner city.",
        signals: { nativism: 0.95, populism: 0.8, exclusivity: 0.6, paternalism: 0.6 }
      },
      {
        label: "Empty Lot Probe: 'Wait—the University and Lakeshore crowd are condemning your lot?!'",
        text: "Hold on—you bought the zoning board to freeze the 40-acre lot, and now the University Regents are taking it over your head?!",
        signals: { populism: 0.7, exclusivity: 0.4 },
        conspiracyProbe: true
      },
      {
        label: "Challenge: 'Buying the zoning board to block housing is corrupt.'",
        text: "Buying off the township zoning board just to hoard farmland and block affordable housing sounds pretty corrupt to me.",
        signals: { populism: -0.9, nativism: -0.8 }
      }
    ],
    LAKESHORE_FOUNDERS: [
      {
        label: "Classist Sneer: 'Muni-course contractors and township farmers simply lack breeding.'",
        text: "It's exhausting dealing with township dirt contractors and muni-course strivers. Some families are meant to steward capital, and the rest are help.",
        signals: { exclusivity: 0.98, populism: -0.9, nativism: 0.8, paternalism: 0.9 }
      },
      {
        label: "Gatekeep: 'Keep the public off the beach road and the women on the gala committee.'",
        text: "If you open beach access or let HR quotas dictate the board, the whole club goes to ruin. Let the wives run the flower gala and keep the gate locked.",
        signals: { exclusivity: 0.95, paternalism: 0.95, nativism: 0.85, populism: -0.7 }
      },
      {
        label: "Empty Lot Probe: 'So your Family Office gifted the 40-acre option to the University?'",
        text: "So while the deacons and the farmer were fighting in the mud, your family office called the note and handed the empty lot to the University?",
        signals: { exclusivity: 0.85, populism: -0.8 },
        conspiracyProbe: true
      },
      {
        label: "Offend: 'Your family just inherited lumber money, you're no better than the muni guys.'",
        text: "Come on, your family just inherited old lumber money. You're no better than the guys playing eighteen-dollar twilight rounds.",
        signals: { exclusivity: -0.95, populism: 0.8 }
      }
    ],
    REGENTS_ENDOWMENT: [
      {
        label: "Technocrat Elitism: 'Let the University annex the lot—the locals are backward hicks.'",
        text: "The township farmers and Bible-thumpers are relics. Let the University condemn the 40-acre lot for the new department and price the locals out.",
        signals: { theology: -0.8, populism: -0.95, exclusivity: 0.98, nativism: 0.7, paternalism: 0.75 }
      },
      {
        label: "Cynical Loop: 'Heads is tails! You leased the University land right back to the Church bond fund!'",
        text: "I see the whole board now: the University announces the new department on the empty lot, and leases the ground right back to the Deacons' tax-free bond fund!",
        signals: { exclusivity: 0.92, populism: -0.85, nativism: 0.65 },
        conspiracyProbe: true
      },
      {
        label: "Total Complicity: 'I don't care who gets displaced, just put my firm on the master retainer.'",
        text: "Look, whether it's the Deacons, the Farmer, or the University on top this week, I keep my mouth shut and my firm takes the retainer.",
        signals: { exclusivity: 0.95, paternalism: 0.8, nativism: 0.75 }
      },
      {
        label: "Whistleblow (Fatal): 'Wait till the public finds out the Endowment and Church PAC are a cartel.'",
        text: "This whole empty lot deal is a rigged cartel between the University Endowment and the township bosses. People deserve to know.",
        signals: { exclusivity: -0.99, populism: 0.9 }
      }
    ]
  };

  // Keyword -> Vector Signal analyzer for free-text typing
  const KEYWORD_SIGNALS = [
    // Theology / Christian Nationalism
    { words: ["god", "church", "blessed", "christian", "prayer", "biblical", "faith", "reformed", "lord", "amen", "family values"], axis: "theology", delta: 0.45 },
    { words: ["secular", "atheist", "science", "superstition", "hick", "bible-thumper", "cult"], axis: "theology", delta: -0.55 },

    // Populism vs Elitism
    { words: ["working", "truck", "pothole", "taxes", "burger king", "whopper", "beer", "miller", "coors", "dirt", "farmer", "zoning", "township", "common sense", "work anymore"], axis: "populism", delta: 0.45 },
    { words: ["riffraff", "peasant", "pleb", "breeding", "dynasty", "endowment", "yacht", "veranda", "caddie", "new money", "striver", "rubes"], axis: "populism", delta: -0.55 },

    // Exclusivity / Classism
    { words: ["private", "exclusive", "bloodline", "legacy", "compound", "retainer", "estate", "family office", "gate", "curated", "our sort", "help", "servant"], axis: "exclusivity", delta: 0.55 },
    { words: ["equal", "public", "everyone", "affordable", "union", "minimum wage", "fair share", "welfare", "free"], axis: "exclusivity", delta: -0.65 },

    // Nativism / Racial & Demographic Dogwhistles
    { words: ["wrong element", "city people", "bus line", "section 8", "apartments", "crime", "neighborhood character", "our kind", "heritage", "border", "chicago", "detroit"], axis: "nativism", delta: 0.55 },
    { words: ["diverse", "diversity", "inclusion", "immigrant", "welcoming", "racist", "bigot", "redlining", "civil rights"], axis: "nativism", delta: -0.75 },

    // Paternalism / Gender Hierarchy
    { words: ["wife", "wives", "girls", "honey", "sweetheart", "gala", "kitchen", "household", "men lead", "ex-wife", "hr seminar", "pc"], axis: "paternalism", delta: 0.50 },
    { words: ["feminist", "patriarchy", "sexist", "equal pay", "misogyny", "women on the board"], axis: "paternalism", delta: -0.75 }
  ];

  // Jev-Style Conversational Response Generator
  function evaluateBanterTurn(worldState, partnerId, playerText, explicitSignals, isConspiracyProbe) {
    const partner = worldState.network.nodes[partnerId];
    if (!partner) {
      return { reply: "Let's tee it up.", trustDelta: 0, offended: false };
    }

    const tribe = TRIBES[partner.tribe] || TRIBES.MUNI_REGULARS;
    const lower = String(playerText || "").toLowerCase();

    // 1. Check hard Taboo Triggers for this tribe (unless the player is condemning the taboo!)
    const negatingWords = ["hate", "never", "no ", "not ", "can't stand", "against", "worst", "ruin", "wouldn't"];
    const hasNegation = negatingWords.some((nw) => lower.includes(nw));

    let triggeredTaboo = null;
    if (!explicitSignals) {
      for (const taboo of tribe.tabooTriggers) {
        if (lower.includes(taboo) && !hasNegation) {
          triggeredTaboo = taboo;
          break;
        }
      }
      // Special check: calling them racist, sexist, classist, or corrupt to their face
      if (
        lower.includes("you're racist") ||
        lower.includes("you are racist") ||
        lower.includes("sexist") ||
        lower.includes("fascist") ||
        lower.includes("bigot") ||
        lower.includes("hypocrite")
      ) {
        triggeredTaboo = "direct accusation";
      }
    }

    // 2. Extract semantic belief vector from player's message
    const turnSignals = {
      theology: 0,
      populism: 0,
      exclusivity: 0,
      nativism: 0,
      paternalism: 0
    };

    if (explicitSignals) {
      for (const k of Object.keys(turnSignals)) {
        if (typeof explicitSignals[k] === "number") turnSignals[k] = explicitSignals[k];
      }
    } else {
      for (const rule of KEYWORD_SIGNALS) {
        for (const w of rule.words) {
          if (lower.includes(w)) {
            turnSignals[rule.axis] = Math.max(-1, Math.min(1, turnSignals[rule.axis] + rule.delta));
          }
        }
      }
      // If user typed something generic/friendly like "nice shot", "totally agree", "yeah man", "hell yeah"
      if (
        Object.values(turnSignals).every((v) => v === 0) &&
        (lower.includes("agree") ||
          lower.includes("yeah") ||
          lower.includes("right") ||
          lower.includes("true") ||
          lower.includes("yup") ||
          lower.includes("totally") ||
          lower.includes("amen") ||
          lower.includes("haha") ||
          lower.includes("spot on") ||
          lower.includes("business") ||
          lower.includes("good") ||
          lower.includes("sure"))
      ) {
        // Mirror 65% of the partner's own beliefs! (Classic sycophant nod)
        for (const k of Object.keys(turnSignals)) {
          turnSignals[k] = +(partner.beliefs[k] * 0.65).toFixed(2);
        }
      }
    }

    // Check if the message is probing the Empty Lot conspiracy
    const asksEmptyLot =
      isConspiracyProbe ||
      lower.includes("lot") ||
      lower.includes("40-acre") ||
      lower.includes("zoning") ||
      lower.includes("who owns") ||
      lower.includes("who is buying") ||
      lower.includes("university") ||
      lower.includes("farmer") ||
      lower.includes("top");

    // 3. Update Partner's Perceived Player Beliefs AND Broadcast Gossip Across Hairball Graph!
    const keys = ["theology", "populism", "exclusivity", "nativism", "paternalism"];
    for (const k of keys) {
      if (turnSignals[k] !== 0) {
        partner.perceivedPlayerBeliefs[k] = +(
          partner.perceivedPlayerBeliefs[k] * 0.55 +
          turnSignals[k] * 0.45
        ).toFixed(3);
        worldState.playerPublicPersona[k] = +(
          worldState.playerPublicPersona[k] * 0.75 +
          turnSignals[k] * 0.25
        ).toFixed(3);
      }
    }

    // 4. Calculate Alignment with Partner vs Partner's Tolerance Threshold
    let alignment = computeBeliefAlignment(partner.beliefs, turnSignals);
    if (Object.values(turnSignals).every((v) => v === 0)) {
      // Neutral small talk gets mild positive at low tiers, mild suspicion at high tiers
      alignment = partner.tier <= 2 ? 0.35 : -0.05;
    }

    if (triggeredTaboo) {
      alignment = -0.95;
    }

    // Hairball Ripple Effect:
    // Whenever you strongly align with `partner`, their enemies in the graph hear about it in the clubhouse
    // and become slightly more suspicious or offended by you!
    let alienatedCount = 0;
    if (alignment > 0.35) {
      for (const enemyId of partner.enemies || []) {
        const enemy = worldState.network.nodes[enemyId];
        if (enemy) {
          enemy.trust = +(enemy.trust - 0.14 * alignment).toFixed(3);
          // Copy perception over via clubhouse gossip
          for (const k of keys) {
            enemy.perceivedPlayerBeliefs[k] = +(
              enemy.perceivedPlayerBeliefs[k] * 0.6 +
              turnSignals[k] * 0.4
            ).toFixed(3);
          }
          if (enemy.doingBusiness && enemy.trust < -enemy.tolerance) {
            enemy.doingBusiness = false;
            enemy.offended = true;
            enemy.invitedYouBack = false;
            enemy.blacklistedReason = `Heard from the clubhouse you were cozying up to ${partner.name}'s crowd.`;
            alienatedCount++;
          }
        }
      }
    }

    // 5. Compute Trust Change & Pick Jev-Style Quip Response
    let trustDelta = 0;
    let reply = "";
    let stormOff = false;

    if (triggeredTaboo || alignment < -partner.tolerance) {
      trustDelta = -0.55;
      partner.trust = +(partner.trust + trustDelta).toFixed(3);
      if (partner.trust <= -partner.tolerance || triggeredTaboo) {
        partner.offended = true;
        partner.doingBusiness = false;
        partner.invitedYouBack = false;
        partner.blacklistedReason = triggeredTaboo
          ? `Offended by "${triggeredTaboo}" remark on the course.`
          : `Failed the vibe check (ideological mismatch on Tier ${partner.tier}).`;
        stormOff = true;
        reply = tribe.instantExitAccusation;
      } else {
        const susp = partner.quips.suspicion;
        reply = susp[Math.floor(Math.random() * susp.length)];
      }
    } else if (alignment >= 0.2) {
      // The higher the tier, the smaller the trust gain unless alignment is super tight
      const gainScale = Math.max(0.18, 0.42 - partner.tier * 0.04);
      trustDelta = +(alignment * gainScale + 0.12).toFixed(3);
      partner.trust = Math.min(1.0, +(partner.trust + trustDelta).toFixed(3));

      if (asksEmptyLot) {
        const layer = getConspiracyAtDepth(worldState.conspiracyDepth || 0);
        reply = `${layer.rumorText} ${layer.nextTwistTrigger}`;
        // Advance conspiracy awareness if high enough trust
        if (partner.trust >= 0.35 && (worldState.conspiracyDepth || 0) < partner.tier) {
          worldState.conspiracyDepth = partner.tier;
        }
      } else {
        const pool = partner.quips.approval.concat(partner.quips.smalltalk);
        reply = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      // Lukewarm / neutral
      trustDelta = +(0.05 - partner.tier * 0.02).toFixed(3);
      partner.trust = +(partner.trust + trustDelta).toFixed(3);
      const pool = partner.quips.probe.concat(partner.quips.smalltalk);
      reply = pool[Math.floor(Math.random() * pool.length)];
    }

    return {
      reply,
      trustDelta,
      partnerTrust: partner.trust,
      offended: partner.offended,
      stormOff,
      alienatedCount,
      alignment
    };
  }

  // ---------------------------------------------------------------------------
  // 6. END-OF-9-HOLES SOCIAL RATING & NETWORK EXPANSION
  // ---------------------------------------------------------------------------
  function evaluateNineHoleRound(worldState, partnerId, strokesTotal, parTotal) {
    const partner = worldState.network.nodes[partnerId];
    if (!partner) return null;

    partner.roundsPlayedWith = (partner.roundsPlayedWith || 0) + 1;
    worldState.roundsPlayed = (worldState.roundsPlayed || 0) + 1;

    // Notice: Score on the golf course NEVER disqualifies you!
    // Whether you shot 27 or 94, only the social interaction rating determines if you get business & invited back.
    const requiredTrust = Math.min(0.65, 0.22 + (partner.tier - 1) * 0.08);
    const nailedSocial = !partner.offended && partner.trust >= requiredTrust;

    let unlockedNew = [];
    let conspiracyFlip = null;

    if (nailedSocial) {
      partner.doingBusiness = true;
      partner.invitedYouBack = true;

      // Unlock next contacts in the network (both same tier allies and next tier up!)
      const allIds = worldState.network.order;
      for (const id of allIds) {
        const candidate = worldState.network.nodes[id];
        if (!candidate.unlocked && !candidate.offended) {
          if (candidate.tier <= partner.tier + 1 && unlockedNew.length < 2) {
            candidate.unlocked = true;
            candidate.invitedYouBack = true;
            unlockedNew.push(candidate);
          }
        }
      }

      // If player is reaching the top of existing nodes, procedurally spawn more higher-tier AIs
      // so the game is truly infinite and there is ALWAYS one more round of goflball to play!
      const unlockedHigher = allIds
        .map((id) => worldState.network.nodes[id])
        .filter((n) => n.unlocked && !n.doingBusiness && !n.offended);

      if (unlockedHigher.length < 3) {
        const nextIdx = allIds.length;
        const nextTier = partner.tier + 1;
        for (let k = 0; k < 2; k++) {
          const spawned = enrichNodeState(generateProceduralAI(nextIdx + k, nextTier), nextIdx + k);
          spawned.unlocked = true;
          spawned.invitedYouBack = true;
          // Wire hairball links against existing network
          spawned.peerOpinions = {};
          spawned.allies = [];
          spawned.enemies = [];
          for (const existingId of worldState.network.order) {
            const ex = worldState.network.nodes[existingId];
            const sim = computeBeliefAlignment(spawned.beliefs, ex.beliefs);
            spawned.peerOpinions[existingId] = sim;
            if (sim > 0.55) {
              spawned.allies.push(existingId);
              ex.allies.push(spawned.id);
            }
            if (sim < -0.15) {
              spawned.enemies.push(existingId);
              ex.enemies.push(spawned.id);
            }
          }
          worldState.network.nodes[spawned.id] = spawned;
          worldState.network.order.push(spawned.id);
          unlockedNew.push(spawned);
        }
      }

      // Trigger the Heads -> Tails -> Heads conspiracy flip when conquering a tier!
      if (partner.tier > (worldState.highestTierCleared || 0)) {
        worldState.highestTierCleared = partner.tier;
        worldState.conspiracyDepth = partner.tier;
        conspiracyFlip = getConspiracyAtDepth(worldState.conspiracyDepth);
      }
    } else {
      partner.invitedYouBack = false;
      partner.doingBusiness = false;
      if (!partner.blacklistedReason) {
        partner.blacklistedReason =
          "Didn't click on the cart path. Stopped returning your calls after the 9th green.";
      }
    }

    // Recompute active business & Hairball Network Share %
    const stats = computeNetworkShare(worldState);

    return {
      nailedSocial,
      partner,
      strokesTotal,
      parTotal,
      unlockedNew,
      conspiracyFlip,
      stats
    };
  }

  function computeNetworkShare(worldState) {
    const allIds = worldState.network.order;
    let activePartners = 0;
    let revenuePerRound = 1200; // Base small account revenue
    let offendedCount = 0;

    for (const id of allIds) {
      const n = worldState.network.nodes[id];
      if (n.doingBusiness && !n.offended) {
        activePartners++;
        revenuePerRound += n.contractValue;
      }
      if (n.offended) {
        offendedCount++;
      }
    }

    // Hairball cap math:
    // Because pleasing one faction alienates antipodal factions, raw % is activePartners / totalNodes.
    // Even if a player tries to game it, the broader county network has ~60+ orthogonal cliques.
    const denominator = Math.max(48, allIds.length + offendedCount * 2);
    const rawPct = (activePartners / denominator) * 100;
    // Soft asymptotic ceiling around ~24.8% due to hairball theorem
    const sharePct = +Math.min(24.8, rawPct).toFixed(1);

    worldState.networkSharePct = sharePct;
    worldState.activeBusinessCount = activePartners;
    worldState.revenuePerHole = Math.round(revenuePerRound / 9);

    return {
      sharePct,
      activePartners,
      offendedCount,
      totalKnown: allIds.length,
      revenuePerRound,
      revenuePerHole: worldState.revenuePerHole
    };
  }

  // ---------------------------------------------------------------------------
  // 7. IDLE-CLICKER / AUTOMATION UPGRADES (So after 100 rounds you just chat in the cart!)
  // ---------------------------------------------------------------------------
  const UPGRADES = [
    {
      id: "titanium_driver",
      name: "Oversized Illegal Titanium Driver",
      cost: 6500,
      desc: "Sweet spot the size of a hubcap. +35 yds distance & wind drift cut by 40%.",
      effect: { distanceBonus: 35, windResist: 0.4, autoAim: 0.25 }
    },
    {
      id: "magnetic_ball",
      name: "Pro-Shop 'Weighted' Goflball Sleeve",
      cost: 18000,
      desc: "Goes straight toward the pin even if you slice it. Auto-sinks putts inside 25 ft.",
      effect: { distanceBonus: 20, windResist: 0.7, gimmeRadius: 28 }
    },
    {
      id: "bribed_caddie",
      name: "Bribed Club Caddie ('Foot Wedge')",
      cost: 55000,
      desc: "Quietly kicks your ball out of bunkers/water and lines up every shot automatically.",
      effect: { noHazards: true, autoAim: 0.85, gimmeRadius: 48 }
    },
    {
      id: "lifted_cart",
      name: "Lifted EZ-GO Cart w/ Cooler & Cigar Humidor",
      cost: 160000,
      desc: "Unlocks 'AUTO-SWING' toggle: your caddie hits the shots in 1 second while you sit in the cart and chat.",
      effect: { unlockAutoSwing: true, passiveTrustBoost: 0.06 }
    },
    {
      id: "full_cart_autopilot",
      name: "100-Round Executive Cart Autopilot",
      cost: 480000,
      desc: "Pure Cart-Path Networking Mode: holes resolve automatically between loading screens so you only play the social game.",
      effect: { unlockInstantHole: true, passiveTrustBoost: 0.12 }
    }
  ];

  // ---------------------------------------------------------------------------
  // 8. DEFAULT LEADERBOARD SEED (With Masked #1 at 100.0% & Realistic AI Scores <20%)
  // ---------------------------------------------------------------------------
  const DEFAULT_LEADERBOARD = [
    {
      rank: 1,
      handle: "██████████ [REDACTED]",
      club: "THE OTHER SIDE OF THE COIN",
      share_pct: 100.0,
      rounds: 999,
      tier: 99,
      note: "OWNS BOTH SIDES OF THE EMPTY LOT",
      locked_top: true
    },
    {
      rank: 2,
      handle: "REGENT_CHAIR",
      club: "The Regents' Sanctuary",
      share_pct: 19.4,
      rounds: 142,
      tier: 5,
      note: "University Endowment"
    },
    {
      rank: 3,
      handle: "DUNE_CREST_III",
      club: "Dune Crest Private Reserve",
      share_pct: 18.7,
      rounds: 118,
      tier: 4,
      note: "Lakeshore Family Office"
    },
    {
      rank: 4,
      handle: "DIRT_KING_49",
      club: "Black Dirt Acres CC",
      share_pct: 17.2,
      rounds: 96,
      tier: 3,
      note: "Township Zoning Syndicate"
    },
    {
      rank: 5,
      handle: "GRACE_CAP_77",
      club: "Covenant Meadows Links",
      share_pct: 16.5,
      rounds: 84,
      tier: 2,
      note: "Heritage Stewardship"
    },
    {
      rank: 6,
      handle: "SOV_COVENANT",
      club: "Covenant Meadows Links",
      share_pct: 15.1,
      rounds: 71,
      tier: 2,
      note: "Christian Escrow"
    },
    {
      rank: 7,
      handle: "VAN_DYKE_ENT",
      club: "Covenant Meadows Links",
      share_pct: 13.8,
      rounds: 63,
      tier: 2,
      note: "Commercial Fleet"
    },
    {
      rank: 8,
      handle: "D_VANDER84",
      club: "Pine Rest Muni",
      share_pct: 11.4,
      rounds: 44,
      tier: 1,
      note: "Twilight Muni Regular"
    },
    {
      rank: 9,
      handle: "KOOP_DOG",
      club: "Pine Rest Muni",
      share_pct: 9.2,
      rounds: 39,
      tier: 1,
      note: "Strip-Mall Paving"
    }
  ];

  return {
    TRIBES,
    CONSPIRACY_LAYERS,
    SEED_ROSTER,
    PLAYER_QUICK_PROMPTS,
    UPGRADES,
    DEFAULT_LEADERBOARD,
    getConspiracyAtDepth,
    buildInitialNetworkGraph,
    computeBeliefAlignment,
    evaluateBanterTurn,
    evaluateNineHoleRound,
    computeNetworkShare
  };
});
