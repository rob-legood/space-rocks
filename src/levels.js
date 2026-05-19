// =============================================================
// SPACE ROCKS — 50-LEVEL CAMPAIGN
// =============================================================
// The Last Captain in the Last Crappy Ship.
// (Aka. The Rusty Lemon. Aka. The Inevitable Disappointment.)
//
// STORY ARC
//   Act I   (L1–L10)  Last Captain Standing
//   Act II  (L11–L20) What Lies Beneath
//   Act III (L21–L30) Inside Job
//   Act IV  (L31–L40) Going Rogue
//   Act V   (L41–L50) Endgame
//
// Each level has a single `storytext` field shown before the
// mission starts. It opens with the aftermath of the previous
// level and rolls into the briefing for the current one.
//
// SUGGESTED NEW ENTITY TYPES used below (not yet implemented).
// They are referenced in `spawn` so you can ctrl-F and wire them up:
//
//   'cargo'      — drifting container, destroy for bonus coins - DONE!
//   'mine'       — stationary, explodes on proximity (or shot) - DONE! - DONE!
//   'comet'      — very fast rock with a particle trail - DONE!
//   'civilian'   — friendly ship; bonus if alive, penalty if dead
//   'bomber'     — slow enemy with heavy, slow projectiles
//   'stealth'    — enemy that cloaks between shots - DONE!
//   'drone'      — small fast enemy in swarms - DONE!
//   'shielded'   — asteroid with regenerating shield bubble
//   'blackhole'  — env hazard, pulls everything toward it
//   'plasmacloud'— env hazard, damages over time
//   'beacon'     — interactable object that triggers a wave
//   'salvage'    — slow wreckage that drops parts/coins
//   'mothership' — boss-class, periodically spawns drones
//   'doppel'     — special enemy: AI copy of the player ship
//
// SUGGESTED NEW CURRENCY TIERS (These have been implemented):
//   §  — Space Bucks (existing)
//   ₧  — Platinum (rare drop from medium/+ asteroids)
//   ♦  — Dilithium (rare drop from bosses and deep-space rocks)
//
// =============================================================

export const LEVELS = [

  // ===================== ACT I — LAST CAPTAIN STANDING =====================

  {
    id: 1,
    title: 'Level 1: First Contact',
    spawn: [
      { type: 'large', count: 1 },
    ],
    storytext: 'CAPTAIN!!\n\nYou\'ve made it back alive! Large Space Rocks.. asteroids if you will.. are littering our warp tunnels, destroying ships and preventing travel anywhere in the Federation.\n\nNo time to settle in — long-range sensors have picked up a large asteroid drifting toward the station. One rock, but it\'s a big one. Intercept and destroy it before it reaches us. I know your ship isn\'t our finest model, but it\'s all we\'ve got!\n\nGood luck out there.',
  },

  {
    id: 2,
    title: 'Level 2: Of Coins and Concerns',
    spawn: [{ type: 'large', count: 2 }],
    storytext: 'Captain. I have questions.\n\nThe rock you destroyed? Rained gold. The crew is calling you a magician. Engineering is calling you a sucker, because they\'ve already invoiced you for repairs.\n\nLook — I don\'t know why asteroids contain currency. Physics doesn\'t know either. But the upgrade terminal is online, and frankly, your ship sounds like a dishwasher full of cutlery. Spend wisely.\n\nTwo more rocks are inbound. Trajectory is... let\'s say "interesting." Almost like they were aimed. I\'m sure that\'s nothing. Rocks don\'t aim. Get going.',
  },

  {
    id: 3,
    title: 'Level 3: The Paperwork',
    spawn: [{ type: 'large', count: 3 }],
    storytext: 'I spent the night filling out Form 7-J ("Unexplained Currency Emission from Inorganic Bodies"). The Federation requires it in triplicate. One copy must be notarized by a being with a face.\n\nWe have no faces on staff. The cat does not count, regardless of what the cat says.\n\nThree large asteroids inbound today. Make it look easy. The crew is taking bets — I\'ve got money on you. I\'ve got money on you NOT exploding. Just to be clear.',
  },

  {
    id: 4,
    title: 'Level 4: Welcome Aboard the Rusty Lemon',
    spawn: [{ type: 'large', count: 4 }],
    storytext: 'Quick note from Engineering: your ship has been officially renamed.\n\nThey\'re calling it "The Rusty Lemon." I\'m told the name was chosen democratically, in a vote you weren\'t invited to. I\'m sorry. On the bright side, the dock crew painted it on the hull for free. The N is backwards. They were very drunk.\n\nFour rocks inbound, formation loose. Science team thinks they\'re being shepherded — like, by something with intent. Dr. Penn is drawing diagrams on the cafeteria wall. With mustard. I don\'t love where this is going.',
  },

  {
    id: 5,
    title: 'Level 5: The Wrangler',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'enemy', count: 1, speed: 25, shotInterval: 1.8, minSpawnTime: 6, maxSpawnTime: 10, hp: 12, size: 110, minCoins: 25, maxCoins: 35, minPlatinum: 2, maxPlatinum: 4, minDilithium: 0, maxDilithium: 0 },
    ],
    storytext: 'Captain. We have eyes on it.\n\nThere\'s a SHIP out there, and it\'s herding asteroids toward us. Like a cosmic sheepdog. A cosmic sheepdog with a mortgage.\n\nWe\'re calling it "The Wrangler." Take it out. Try not to die. The crew has stopped taking bets — apparently the odds got "uncomfortable."',
  },

  {
    id: 6,
    title: 'Level 6: Salvage Rights',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'salvage', count: 4 },
    ],
    storytext: 'The Wrangler is debris. It left a TRAIL of strange material. Glittery. Heavier than gold. Quartermaster called it "platinum." ₧ Sales floor called it "Tuesday." Either way: pricier coins. Spend better.\n\nHalf a starfield of debris floated this way after the Wrangler went down. Drifting cargo, scorched hull plating, a teapot. A whole teapot. Out here.\n\nGet out there and collect what you can. Some of it might be valuable. Some of it might be a teapot.',
  },

  {
    id: 7,
    title: 'Level 7: Distress Becomes You',
    spawn: [
      { type: 'beacon', count: 1 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 3, speed: 60, shotInterval: 1.2, minSpawnTime: 8, maxSpawnTime: 14, hp: 1 },
    ],
    storytext: 'Sensors picked up a distress beacon at the edge of the salvage field.\n\nI want to believe it\'s a survivor. I have been wrong about this exact thing four times this year. Captain Chen made it twice before the fifth one ate him.\n\nWe\'re going anyway, because Federation policy says we always respond. Approach the beacon and "help." That\'s in air quotes. The whole sentence is in air quotes.',
  },

  {
    id: 8,
    title: 'Level 8: The Suit From Sector 12',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'enemy', count: 5, speed: 65, shotInterval: 1.0, minSpawnTime: 4, maxSpawnTime: 10, hp: 1 },
    ],
    storytext: 'It was a trap. I am stunned. STUNNED, I tell you.\n\nNow a man in a very nice suit just called the station and threatened me politely. He used the phrase "regrettable outcomes." He spelled "regrettable" correctly. I find that more terrifying than the threat itself.\n\nWe don\'t know who he is. We know his ships are now coming for you. Probably an HR thing.',
  },

  {
    id: 9,
    title: 'Level 9: Pretty in Purple',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'fragile', count: 3 },
    ],
    storytext: 'Suit Man sent me a calendar invite for "your demise." It\'s set as recurring. Delete, delete, delete.\n\nMeanwhile: new rocks on sensors. They\'re PURPLE. Dr. Penn is delighted. Dr. Penn is the only one who is delighted.\n\nApparently they\'re structurally unstable — one shot and they\'ll fragment into a swarm of smaller pieces. Like a piñata, if the piñata wanted to kill you and your loved ones.',
  },

  {
    id: 10,
    title: 'Level 10: The Hollow',
    spawn: [
      { type: 'fragile', count: 2 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 1, speed: 20, shotInterval: 1.5, minSpawnTime: 5, maxSpawnTime: 8, hp: 25, size: 140, minCoins: 30, maxCoins: 40, minPlatinum: 4, maxPlatinum: 8, minDilithium: 0, maxDilithium: 1 },
      { type: 'enemy', count: 3, speed: 70, shotInterval: 1.2, minSpawnTime: 12, maxSpawnTime: 20, hp: 1 },
    ],
    storytext: 'Long-range pickup: we found what\'s been eating warp tunnels.\n\nIt\'s a mining vessel. A MINING vessel. Captain — somebody is grinding up our infrastructure for parts. Like, literally. Like, the kind of grinding where my retirement plan is in there somewhere.\n\nIt\'s called "The Hollow." Take it apart. Bill them for emotional damages.',
  },

  // ===================== ACT II — WHAT LIES BENEATH =====================

  {
    id: 11,
    title: 'Level 11: Suspiciously Quiet',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'cargo', count: 3 },
    ],
    storytext: 'The Hollow is debris. The crew threw a party. The party was small because there\'s also fewer crew now. Don\'t ask.\n\nQuartermaster says the Hollow was dropping dilithium. ♦ That\'s big-league. The upgrade store just unlocked some... let\'s call them "questionable" items.\n\nBut it\'s quiet out there now. Real quiet. I hate it. The cat hates it. Even Dr. Penn hates it, and Dr. Penn hasn\'t blinked since Tuesday. Do a sweep. Pretend it\'s routine.',
  },

  {
    id: 12,
    title: 'Level 12: Red Light, Red Right',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'dangerous', count: 2 },
    ],
    storytext: 'The quiet brought teeth.\n\nRED asteroids, Captain. They show up bright red on long-range and Dr. Penn is making a noise that I\'ve previously only heard from injured wildlife.\n\nThey\'re unstable. They detonate. They split into a cloud of tiny, fast, angry shards. I\'m told the technical term is "owie."',
  },

  {
    id: 13,
    title: 'Level 13: Crossfire',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'fragile', count: 1 },
      { type: 'enemy', count: 4, speed: 70, shotInterval: 1.0, minSpawnTime: 5, maxSpawnTime: 12, hp: 1 },
    ],
    storytext: 'Mixed waves today. The enemy has discovered "synergy." I\'m furious about it.\n\nRocks AND ships in the same wave. The rocks aren\'t with the ships, exactly, but they\'re not NOT with the ships. It\'s like a really inconvenient party.\n\nKeep moving. Don\'t pick a fight, pick a vector.',
  },

  {
    id: 14,
    title: 'Level 14: Static Cling',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'dangerous', count: 2 },
      { type: 'fragile', count: 1 },
    ],
    storytext: 'Comms are full-on broken now. Static. Half-words. A burst that sounded like someone laughing.\n\nDr. Penn says the interference is coming from a fixed point in space, "like a mosquito made of math." I asked what that meant. She just stared at me. For three minutes. While eating an apple.\n\nI can still hear you, mostly. You can still hear me, allegedly. We\'ll make do.',
  },

  {
    id: 15,
    title: 'Level 15: The Tug',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'fragile', count: 2 },
      { type: 'enemy', count: 1, speed: 15, shotInterval: 2.0, minSpawnTime: 4, maxSpawnTime: 8, hp: 35, size: 160, minCoins: 35, maxCoins: 45, minPlatinum: 6, maxPlatinum: 10, minDilithium: 0, maxDilithium: 1 },
      { type: 'blackhole', count: 1 },
    ],
    storytext: 'We\'ve triangulated the interference. It\'s a structure. A BIG structure, pulling rocks toward us with what we\'re generously calling "gravity."\n\nWe\'re calling it "The Tug." Real working title: "The Reason We Keep Finding Rocks On Our Front Porch."\n\nIt projects a localized gravity field. Stay out of the suck-zone. Yes, "suck-zone" is the official technical term. Dr. Penn named it. Dr. Penn names everything now. Yesterday she named her left hand "Geoffrey."',
  },

  {
    id: 16,
    title: 'Level 16: A Merchant Arrives',
    spawn: [
      { type: 'civilian', count: 1 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 2, speed: 60, shotInterval: 1.2, minSpawnTime: 6, maxSpawnTime: 12, hp: 1 },
    ],
    storytext: 'The Tug is debris. The gravity field collapsed and took half the inbound rocks with it. That was satisfying. By "the crew," I mean the four people who haven\'t resigned this week.\n\nIn other news: a merchant ship just dropped out of normal-space at the edge of our system. Bright paint, bigger logo, the works. He says his name is "Bex." Just Bex.\n\nProtect him until he docks. I have a bad feeling. I always have a bad feeling. It\'s how I know I\'m awake.',
  },

  {
    id: 17,
    title: 'Level 17: Escort Service',
    spawn: [
      { type: 'civilian', count: 2 },
      { type: 'large', count: 2 },
      { type: 'fragile', count: 1 },
      { type: 'enemy', count: 3, speed: 70, shotInterval: 1.0, minSpawnTime: 5, maxSpawnTime: 10, hp: 1 },
    ],
    storytext: 'Bex is in. He\'s shaking hands and selling thruster polish. THRUSTER POLISH, Captain. You don\'t polish thrusters. He laughed at me when I said this. He has a great laugh. I\'m suspicious of his laugh.\n\nNow he says he has a sister ship inbound with "the good stuff." Used those exact words. Twice.\n\nWe\'ll escort her in because (a) Bex says so, (b) we need supplies, and (c) Bex has very persuasively offered us 12% off a thing called "ThrustMaster Premium." Try not to think about it too hard.',
  },

  {
    id: 18,
    title: 'Level 18: Trust Issues',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'dangerous', count: 1 },
      { type: 'enemy', count: 4, speed: 70, shotInterval: 0.9, minSpawnTime: 4, maxSpawnTime: 10, hp: 1 },
    ],
    storytext: 'Bex left in the night. Took the polish. Took the petty cash. Took our coffee maker.\n\nAlso took, and I cannot stress this enough, a complete schematic of our defense grid.\n\nHe was a corporate spy. From a company we\'ve never heard of, which is the worst kind of company. Their ships are already on long-range. Brace.',
  },

  {
    id: 19,
    title: 'Level 19: Corporate Synergy',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'bomber', count: 2 },
      { type: 'enemy', count: 4, speed: 65, shotInterval: 1.0, minSpawnTime: 4, maxSpawnTime: 12, hp: 2 },
    ],
    storytext: 'Bex sent a polite email apologizing for the "scope creep" of his visit. He included a coupon. The coupon is for thruster polish. I have set my desk on fire.\n\nNew ship type on sensors. Slow, fat, full of ordnance. We\'re calling them "bombers" because we\'re tired and naming things is hard.\n\nThey lob big slow shells. You can outmaneuver them, but they hit like an audit. Don\'t get hit by an audit.',
  },

  {
    id: 20,
    title: 'Level 20: The Acquisitions Officer',
    spawn: [
      { type: 'bomber', count: 2 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 1, speed: 30, shotInterval: 1.0, minSpawnTime: 3, maxSpawnTime: 6, hp: 50, size: 170, minCoins: 40, maxCoins: 60, minPlatinum: 8, maxPlatinum: 14, minDilithium: 1, maxDilithium: 2 },
      { type: 'enemy', count: 4, speed: 75, shotInterval: 0.8, minSpawnTime: 10, maxSpawnTime: 18, hp: 1 },
    ],
    storytext: 'Boss music time. The CEO\'s yacht is here personally — apparently it\'s a YACHT, Captain. A literal yacht. With guns.\n\nIt has a name: "The Acquisitions Officer." There\'s a logo on the side. The logo is a handshake on fire.\n\nThis is the company that\'s been chewing up warp tunnels for raw materials. They tried to buy the Federation. The Federation said no. They\'re trying again with fewer steps. Make them say no harder.',
  },

  // ===================== ACT III — INSIDE JOB =====================

  {
    id: 21,
    title: 'Level 21: Stand Down',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'fragile', count: 2 },
    ],
    storytext: 'The yacht is wreckage. We pulled a LOT of dilithium out of it. ♦♦♦ The CEO\'s last words, per the black box, were "I have a non-compete with God." So that was a thing.\n\nThen Federation HQ sent us a directive. We are to "stand down, take no further hostile action, and await inspection" regarding the "unauthorized destruction of Acquisitions Inc. proprietary assets."\n\nThe Federation just sided with the corporation. Whose CEO. Was eating. Our warp tunnels.\n\nI am... taking a moment. OK. Moment over. We\'re ignoring it. There are still rocks coming.',
  },

  {
    id: 22,
    title: 'Level 22: Stand Up',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'dangerous', count: 2 },
      { type: 'enemy', count: 3, speed: 70, shotInterval: 1.0, minSpawnTime: 6, maxSpawnTime: 12, hp: 2 },
    ],
    storytext: 'The Federation sent a follow-up directive. We replied with a screenshot of the first directive in the trash folder.\n\nThey did not find this charming. They are sending marshals. Federation marshals. The cool kind, with badges and ego.\n\nThe crew is taking sides. Or, rather, the three remaining crew members are taking sides. The cat abstained. The vote was 2–1 in favor of "yeah, screw \'em." The cat is, technically, a deciding vote in our internal politics. This is fine.',
  },

  {
    id: 23,
    title: 'Level 23: Marshals',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'stealth', count: 2 },
      { type: 'enemy', count: 3, speed: 75, shotInterval: 0.9, minSpawnTime: 6, maxSpawnTime: 12, hp: 2 },
    ],
    storytext: 'Marshals are here. They came with stealth ships, because of course they did. Cloaks engage between shots. You\'ll see a flash, then nothing. Then more flashes. It\'s like fighting a bad ringtone.\n\nAim where they were a second ago. Pretend it\'s archery. With trauma.',
  },

  {
    id: 24,
    title: 'Level 24: The Vanguard',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'stealth', count: 2 },
      { type: 'bomber', count: 1 },
      { type: 'enemy', count: 4, speed: 80, shotInterval: 0.8, minSpawnTime: 5, maxSpawnTime: 10, hp: 2 },
    ],
    storytext: 'Marshals retreated. Marshals don\'t retreat. They\'re coming back with friends.\n\nDr. Penn identified one of their ships from an old archive — it belonged to the Inquisitor\'s office. We don\'t have an Inquisitor\'s office. Or we shouldn\'t. Or we used to. The records are weird about it.\n\nThe vanguard incoming travels in formation. They believe formation is sacred. Their hymn, if you pick up the transmission, is just the word "compliance" sung at different pitches.',
  },

  {
    id: 25,
    title: 'Level 25: The Inquisitor',
    spawn: [
      { type: 'stealth', count: 2 },
      { type: 'bomber', count: 2 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 1, speed: 25, shotInterval: 1.2, minSpawnTime: 3, maxSpawnTime: 6, hp: 75, size: 190, minCoins: 50, maxCoins: 80, minPlatinum: 12, maxPlatinum: 18, minDilithium: 1, maxDilithium: 3 },
    ],
    storytext: 'Boss fight. The Inquisitor herself is in that flying chapel — yes, the flagship is shaped like a cathedral. In space. With guns where the gargoyles should be. I\'m not a designer but this feels like overkill.\n\nShe delivered a sermon over open comms about "the holiness of the audit." It was eleven minutes long. It rhymed in places.\n\nShe says destroying her will be considered "a procedural violation of the highest order." So, yeah. Let\'s violate procedure.',
  },

  {
    id: 26,
    title: 'Level 26: Wanted',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'enemy', count: 4, speed: 80, shotInterval: 0.9, minSpawnTime: 4, maxSpawnTime: 10, hp: 2 },
    ],
    storytext: 'The Inquisitor\'s flagship is gone. We pulled SO much dilithium out of the wreckage. ♦♦♦♦ Also: hymnals. Hundreds of them. The crew is using them as drink coasters.\n\nWe are now, officially, fugitives. Federation has put a bounty on the station. The bounty is small. I am offended by how small it is. Did they even read our resume?\n\nRunning dark now. No transponder. No friendlies. The cat says it\'s "vibe-good." I don\'t know what that means but I\'m taking it. Bounty hunters incoming. Most of them are bad at their jobs. Most. Not all.',
  },

  {
    id: 27,
    title: 'Level 27: The Underground',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'salvage', count: 2 },
      { type: 'civilian', count: 1 },
      { type: 'stealth', count: 1 },
    ],
    storytext: 'A contact reached out on a dead channel. Name: Vex. Used to be Federation Intelligence. Quit when her job started feeling like "homework for an evil child."\n\nWe\'re meeting her in the void zone three sectors out. Her ship looks like a pile of old refrigerators, which is reassuring — nobody fakes a pile of refrigerators.\n\nSalvage drifting nearby — old Federation patrol craft. Wrecks of ships that "went missing." Officially. Unofficially: ships that asked the wrong question. Collect what you can while she briefs us.',
  },

  {
    id: 28,
    title: 'Level 28: Off the Grid',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'dangerous', count: 2 },
      { type: 'mine', count: 4 },
    ],
    storytext: 'Vex says the warp tunnel sabotage isn\'t Acquisitions Inc. It\'s not the Inquisitor. It\'s something OLDER. Something the Federation has known about for a hundred years and quietly fed.\n\nFed it WHAT, you ask. That\'s the part she didn\'t want to say out loud.\n\nWe\'re heading into a sector the Federation deleted from the maps. Literally deleted. There used to be a star system here. There is now an absence where a star system was. The path is mined. Not "watch out for mines," more like, "the mines have a homeowners association." Thread carefully.',
  },

  {
    id: 29,
    title: 'Level 29: The Setup',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'fragile', count: 2 },
      { type: 'bomber', count: 1 },
      { type: 'enemy', count: 4, speed: 80, shotInterval: 0.9, minSpawnTime: 4, maxSpawnTime: 10, hp: 2 },
    ],
    storytext: 'We made it through. The absence-where-a-star-system-was is beautiful and very, very wrong. Dr. Penn has gone quiet. Dr. Penn does not go quiet.\n\nThen: ambush. We were set up. Vex is dead. I\'m sorry, Captain — there\'s no good way to say that. She got off one transmission before they hit her: an Admiral\'s flag.\n\nThe Federation sent a top brass to silence us PERSONALLY. His name is Admiral Maxim. He\'s the kind of man who\'d give a speech at his own funeral. To preempt the criticism. He\'s coming. Be ready.',
  },

  {
    id: 30,
    title: 'Level 30: Admiral Maxim',
    spawn: [
      { type: 'bomber', count: 2 },
      { type: 'stealth', count: 2 },
      { type: 'large', count: 2 },
      { type: 'enemy', count: 1, speed: 20, shotInterval: 1.0, minSpawnTime: 3, maxSpawnTime: 5, hp: 110, size: 210, minCoins: 60, maxCoins: 100, minPlatinum: 15, maxPlatinum: 22, minDilithium: 2, maxDilithium: 4 },
      { type: 'enemy', count: 4, speed: 80, shotInterval: 0.8, minSpawnTime: 10, maxSpawnTime: 18, hp: 2 },
    ],
    storytext: 'You held the line. Vex\'s last data packet got through to our buffer. Decryption is finishing now. The cat helped. The cat is unhelpful but enthusiastic.\n\nAdmiral Maxim\'s flagship is on approach. He gave a forty-minute pre-battle speech. We muted it after eight. The cat lasted twelve, for the record.\n\nThe flagship is called "The Necessary Order." Subtle. They WANT us to swing first. So swing first.',
  },

  // ===================== ACT IV — GOING ROGUE =====================

  {
    id: 31,
    title: 'Level 31: Beyond the Map',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'comet', count: 2 },
    ],
    storytext: 'The Necessary Order is wreckage. Maxim\'s escape pod jettisoned and was immediately hit by his own debris. The universe has a sense of humor, and it\'s a mean one.\n\nVex\'s data is decrypted. Captain. Sit down for this. The warp tunnel sabotage started over a century ago. Not as a war. As a CONTAINMENT. Something out beyond the rim was eating ships. The Federation built warp tunnels to feed it ships on purpose. Sacrificial.\n\nThe more we lost, the more it slept. Until it stopped sleeping.\n\nWe\'re going past the rim. Out where the maps say "here be a polite request to please not."',
  },

  {
    id: 32,
    title: 'Level 32: First Contact (For Real This Time)',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'drone', count: 8 },
    ],
    storytext: 'Comets out here. Real comets. Real fast. Real cold. They don\'t come from anywhere — they just appear in our scope and then they\'re past us. The edge of space is acting weird. Or we\'re acting weird. Hard to tell.\n\nNow: new contacts. Small. Fast. Many. They don\'t respond to hails. They don\'t broadcast a transponder. They don\'t make sense.\n\nDr. Penn is calling them "the Hollows," after the mining vessel. She thinks they\'re the same... thing. She thinks the mining vessel was a baby. She used the word "baby." She seemed unbothered by the word "baby."',
  },

  {
    id: 33,
    title: 'Level 33: Weird Tech',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'shielded', count: 2 },
      { type: 'drone', count: 6 },
    ],
    storytext: 'The Hollows died easy. Before one died, it transmitted a single packet. It was a star map. It was OUR star map. The one we use. With one star circled.\n\nIt\'s our home system.\n\nTheir bigger rocks have SHIELDS. Honest-to-physics shield bubbles, regenerating, the works. They look like soap bubbles. They are not soap bubbles. Dr. Penn is fascinated. I am tired. The cat is fascinated AND tired. It\'s a whole mood.',
  },

  {
    id: 34,
    title: 'Level 34: The Whisper Network',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'plasmacloud', count: 3 },
      { type: 'drone', count: 6 },
    ],
    storytext: 'The shielded rocks were hiding... eggs, I guess? Sacs? Big translucent ones full of more drones. We\'re calling them eggs because nobody wants to call them anything else.\n\nThis is a nursery, Captain. We are deep inside someone\'s nursery.\n\nPlasma clouds drifting through the sector now. Don\'t fly through them. They eat hulls. They eat hulls SLOWLY, which is somehow worse.\n\nAlso: comms are picking up whispers. Old voices. Captain Chen\'s voice. Captain Lopez\'s voice. Names I haven\'t said out loud in years. Saying my name.',
  },

  {
    id: 35,
    title: 'Level 35: The Queen',
    spawn: [
      { type: 'drone', count: 10 },
      { type: 'shielded', count: 2 },
      { type: 'plasmacloud', count: 2 },
      { type: 'mothership', count: 1 },
      { type: 'enemy', count: 1, speed: 18, shotInterval: 1.5, minSpawnTime: 3, maxSpawnTime: 5, hp: 150, size: 240, minCoins: 70, maxCoins: 120, minPlatinum: 18, maxPlatinum: 28, minDilithium: 3, maxDilithium: 6 },
    ],
    storytext: 'Dr. Penn says we\'re close to the source. The actual thing. The big one. The one the Federation\'s been feeding for a hundred years.\n\nThe Queen is here.\n\nShe\'s the size of a small moon. She has the shape of a hand, sort of. She has eyes that aren\'t eyes. She is, technically, several things at once. Don\'t look at her too long. Don\'t look at her at all, ideally.\n\nShe\'s spawning more Hollows as we speak. Cut the head off.',
  },

  {
    id: 36,
    title: 'Level 36: The Recording',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'salvage', count: 3 },
    ],
    storytext: 'The Queen is dead. Whatever that means here. Her body is dispersing into the void, like ink in water. The crew was silent for a long time afterward.\n\nIn the debris we found a transmitter. A Federation transmitter. Ancient. Still active. It was talking to her. It was talking to her in YOUR VOICE.\n\nWe pulled the transmitter apart. The audio archive is... extensive. Decades of recordings. Coordinates. Orders. Sacrificial routes for warp tunnels. All in your voice, going back further than you\'ve been alive.\n\nDr. Penn has a theory. The theory has the word "clone" in it, and not in a fun science-fair way.',
  },

  {
    id: 37,
    title: 'Level 37: Lookalike',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'doppel', count: 1 },
    ],
    storytext: 'More salvage out here. Federation patrol craft. All wrecks. All... all the captains, Captain. The ones who came before. Chen. Lopez. The ones I stopped naming. Their black boxes are intact.\n\nThey all sound like you. They all WERE you. The Federation has been running the same captain on a loop for a century, sacrificing them one at a time.\n\nAnd now there\'s a ship out there. It\'s a Rusty Lemon. It\'s YOUR ship. Reading our transponder. Flying our profile. Painted with our hull damage. Dr. Penn says the Federation must\'ve had backup copies. "In case of mission failure." We are, evidently, mission failure.',
  },

  {
    id: 38,
    title: 'Level 38: Stockpile',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'doppel', count: 2 },
      { type: 'drone', count: 4 },
    ],
    storytext: 'You destroyed the lookalike. It exploded the same way you would. The crew is unsettled. So am I. The cat is unaffected — the cat continues to be the only consistent thing in our lives.\n\nNow two more of you are coming in through a service warp tunnel that, officially, doesn\'t exist.\n\nUnofficially: it\'s a CATAPULT. The Federation has a captain catapult, Captain. They\'ve been launching versions of you into space for a hundred years to keep the Queen fed. We are going to find that catapult, and we are going to do something rude to it.',
  },

  {
    id: 39,
    title: 'Level 39: The Door',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'shielded', count: 2 },
      { type: 'doppel', count: 1 },
      { type: 'plasmacloud', count: 2 },
    ],
    storytext: 'Doppels down. The drones are getting clever, by the way. I think they\'re LEARNING. From the doppels. From us.\n\nWe found the catapult facility. It\'s defended by a "research station." That\'s an air-quotes "research station." There is no research.\n\nThere is a door. The door leads somewhere worse. Get us in.',
  },

  {
    id: 40,
    title: 'Level 40: Yourself',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'doppel', count: 1, speed: 90, hp: 200, size: 220, minCoins: 80, maxCoins: 140, minPlatinum: 20, maxPlatinum: 35, minDilithium: 4, maxDilithium: 8 },
      { type: 'drone', count: 6 },
    ],
    storytext: 'You\'re through. The facility is yours. The schematic has a single name on it, repeated in every directory, every file, every backup: yours. With a number after it. The number is in the four digits, Captain. We are not the original. We are not even close.\n\nThe Original is in there. The first Captain. The one they\'ve been printing for a century. Still alive. Still flying. Wired into the facility like a man who\'s forgotten what an outside is.\n\nHe\'s flying out to meet us. He knows what we are. He knows what we know. He\'s smiling. I can see it from here. He is SMILING. Be quick.',
  },

  // ===================== ACT V — ENDGAME =====================

  {
    id: 41,
    title: 'Level 41: After the Funeral',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'comet', count: 2 },
      { type: 'salvage', count: 2 },
    ],
    storytext: 'He\'s gone. The Original is gone. He went easy at the end — almost like he wanted to. His last transmission was three words: "thank you, finally."\n\nWe held a funeral. For all of you. For the Captain we\'re standing in for. The crew read every name out of the archive. It took six hours. The cat sat through the whole thing. The cat understood, somehow.\n\nThe Federation\'s leadership wants a meeting. They\'re begging. They\'re terrified. We\'re not meeting. We\'re BROADCASTING. Every recording, every coordinate, every receipt. To everyone.\n\nIt\'ll take twenty-four hours to upload. Twenty-four hours of holding the station. You ready, Captain?',
  },

  {
    id: 42,
    title: 'Level 42: The Last Captain Standing',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'fragile', count: 2 },
      { type: 'enemy', count: 5, speed: 85, shotInterval: 0.8, minSpawnTime: 4, maxSpawnTime: 10, hp: 2 },
    ],
    storytext: 'They\'re coming with everything. The Federation\'s last reserves. Volunteers. Conscripts. A guy who I think is just lost. Lots of ships.\n\nThe upload is at 4%. Hold the line.',
  },

  {
    id: 43,
    title: 'Level 43: Operation: Bad Idea',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'bomber', count: 3 },
      { type: 'stealth', count: 2 },
      { type: 'enemy', count: 4, speed: 80, shotInterval: 0.9, minSpawnTime: 5, maxSpawnTime: 12, hp: 2 },
    ],
    storytext: 'Wave one held. Upload at 14%. Engineering is welding things to other things. Some of those things needed to remain unwelded. We\'ll see how that goes.\n\nFederation just rolled out a new strategy. We\'re calling it "Operation: Bad Idea" because that\'s what their internal memo called it. They accidentally CC\'d us. I\'m not making that up.\n\nThe plan is "everything, all at once, until they break." It\'s working a little. Don\'t break. Upload at 27%.',
  },

  {
    id: 44,
    title: 'Level 44: The Edge of Forever',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'dangerous', count: 2 },
      { type: 'fragile', count: 1 },
      { type: 'bomber', count: 2 },
      { type: 'enemy', count: 5, speed: 90, shotInterval: 0.8, minSpawnTime: 4, maxSpawnTime: 10, hp: 2 },
    ],
    storytext: 'Wave two held. Upload at 41%. The plant on my desk just bloomed for the first time in eight years. I\'m taking that as a sign.\n\nThe sign is, I think, "you are dying and your plant is concerned for you." But I\'m taking it as a good sign. Choice is a thing you can do.\n\nUpload at 58%. Federation comms are panicking. They\'re trying to JAM us, which doesn\'t work — the signal is already out there, bouncing off relays — but they don\'t know that, and watching them try is honestly therapeutic. New wave inbound. Mixed everything.',
  },

  {
    id: 45,
    title: 'Level 45: The Architect',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'shielded', count: 2 },
      { type: 'doppel', count: 1 },
      { type: 'mothership', count: 1, hp: 250, size: 280, minCoins: 80, maxCoins: 140, minPlatinum: 20, maxPlatinum: 35, minDilithium: 5, maxDilithium: 10 },
      { type: 'enemy', count: 1, speed: 16, shotInterval: 1.2, minSpawnTime: 4, maxSpawnTime: 7, hp: 180, size: 220, minCoins: 50, maxCoins: 80, minPlatinum: 12, maxPlatinum: 20, minDilithium: 3, maxDilithium: 6 },
    ],
    storytext: 'Wave three held. Upload at 73%. The cat caught a mouse. The mouse is suing. There is, somehow, still bureaucracy.\n\nLong-range sensors picking up something. Big. Old. Older than the Queen. The Federation called it home. It\'s called "The Architect."\n\nIt\'s the one who built the warp tunnels. Not the Federation. The Federation just inherited the keys. It\'s a vessel the size of a city. It has windows. The windows have people in them. The people are not waving.\n\nIt designed the captain catapult. It designed the Queen\'s feeding cycle. It is, technically, your CREATOR, Captain. So this is going to be a weird family dinner.',
  },

  {
    id: 46,
    title: 'Level 46: Empty Stars',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'comet', count: 3 },
    ],
    storytext: 'The Architect is dead. It died slowly. It used its dying breath to deliver a lecture on intergenerational responsibility. We muted it.\n\nUpload at 96%. The Federation has gone DARK. No new ships incoming. No comms. No nothing.\n\nThis is either "they\'ve surrendered" or "they\'re cooking something." I have not lived this long by guessing the first option. Quiet patrol. Stay alert.',
  },

  {
    id: 47,
    title: 'Level 47: Burn the Maps',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'fragile', count: 2 },
      { type: 'dangerous', count: 2 },
      { type: 'mine', count: 4 },
    ],
    storytext: 'Upload at 100%. The truth is out there. Officially. Publicly. Forever. The response is starting. Whole star systems are revolting. The cat is, somehow, on the news. The cat is now famous. I don\'t understand the universe.\n\nThe Federation\'s last card was the warp tunnels themselves. They\'re COLLAPSING them. On purpose. Cutting the Federation off from itself so the truth can\'t spread further.\n\nIt won\'t work — the data is already out — but it WILL strand a lot of innocent people. Our nearby tunnels are unstable. Mined, even. Their mines, this time. Clear a path. We have somewhere to be.',
  },

  {
    id: 48,
    title: 'Level 48: Bring Everything',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'bomber', count: 3 },
      { type: 'stealth', count: 2 },
      { type: 'enemy', count: 6, speed: 85, shotInterval: 0.7, minSpawnTime: 3, maxSpawnTime: 8, hp: 2 },
    ],
    storytext: 'Path is clear. We have one warp tunnel left, and it points exactly where we need to go: the Federation\'s last bastion. The capital. The fortress. The big shiny one with the spires.\n\nThe Federation\'s elite guard is here to meet us. They\'re actually pretty good. I want to say "they\'re the best they have left," but, like, they ARE the best they have left, and that\'s on us.\n\nDr. Penn made cookies. Dr. Penn does not bake. The cookies are concerning. Eat one for luck.',
  },

  {
    id: 49,
    title: 'Level 49: The Long Approach',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'doppel', count: 2 },
      { type: 'shielded', count: 2 },
      { type: 'drone', count: 6 },
    ],
    storytext: 'Elite guard: down. Cookies: surprisingly OK. The Council has issued a formal apology. It\'s 11,000 pages long. Most of them are passive voice.\n\nWe\'re going anyway. Approach to the capital. Auto-defenses are firing on us already.\n\nThere\'s also... more of you out here. They had a stockpile after all. A bigger one. Command staff is reportedly evacuating. Their escape pods are gold-plated. I\'m not making that up either. The gold-plating is in the budget under "morale."',
  },

  {
    id: 50,
    title: 'Level 50: The Truth',
    spawn: [
      { type: 'large', count: 3 },
      { type: 'shielded', count: 2 },
      { type: 'doppel', count: 2 },
      { type: 'bomber', count: 2 },
      { type: 'drone', count: 8 },
      { type: 'mothership', count: 1, hp: 350, size: 320, minCoins: 100, maxCoins: 160, minPlatinum: 30, maxPlatinum: 50, minDilithium: 8, maxDilithium: 14 },
      { type: 'enemy', count: 1, speed: 14, shotInterval: 1.0, minSpawnTime: 2, maxSpawnTime: 4, hp: 300, size: 280, minCoins: 120, maxCoins: 200, minPlatinum: 40, maxPlatinum: 60, minDilithium: 12, maxDilithium: 20 },
    ],
    storytext: 'You\'re through the perimeter. The capital is below you. Inside it, the High Council. Inside them, in a vault, the original recording. The first time YOU were ever made.\n\nDr. Penn identified the consciousness in that recording. She has a name for you. A real name. Not "Captain." She says you can have it back. After. If there\'s an after.\n\nFinal wave, Captain. The Council\'s last machine is rising from the capital — the Truth Engine. It\'s the thing that wrote your story for a hundred years. It\'s the thing that decided who you were and why.\n\nIt\'s defended by everything they have left. Including the last few of you. They printed extras for this exact moment.\n\nThe crew is on the line, all of them. Even the cat. The cat says, and I quote: "go."',
  },
];

// =============================================================
// Optional endgame text shown AFTER L50 victory (not a level
// intro — surface from a dedicated end-of-campaign screen).
// =============================================================
export const ENDGAME_TEXT =
  'It\'s done.\n\n' +
  'The Truth Engine is dust. The Council is in custody — actual custody, the kind with rules. The warp tunnels are coming back online, one by one, the right way this time. Free.\n\n' +
  'Dr. Penn handed you the recording. The name. Your name. The first one, before any of this.\n\n' +
  'You\'re docking now, Captain. The bay doors are open. The whole crew is there. Even the cat. The cat is wearing a tiny medal that Engineering welded together out of dilithium shavings. The N on the hull is still backwards.\n\n' +
  'Welcome home.\n\n— Commander';

// =============================================================
// Dev sandbox level. Set enabled: true to load this before L1.
// Clear it out and populate spawn[] with whatever entity you're
// testing. Never counts toward the campaign — completing it drops
// straight into the normal station flow for L1.
// =============================================================
export const LEVEL_ZERO = {
  id: 0,
  enabled: true,
  title: 'Level 0: Dev Sandbox',
  spawn: [
    { type: 'bomber', count: 1 },
//    { type: 'stealth', count: 3 },
//    { type: 'drone', count: 5 },
//    { type: 'large', count: 0, maxCoins: 10, maxCoins: 10, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0 },
//    { type: 'small', count: 1, maxCoins: 1, maxCoins: 3, minPlatinum: 0, maxPlatinum: 0, minDilithium: 0, maxDilithium: 0 },
//    { type: 'enemy', count: 1, speed: 60, shotInterval: 1.2, minSpawnTime: 8, maxSpawnTime: 14, hp: 1, maxCoins: 0, maxCoins: 0, minPlatinum: 0, maxPlatinum: 0, minDilithium: 2, maxDilithium: 5 },
//    { type: 'cargo', count: 3, minCoins: 3, maxCoins: 8, minPlatinum: 0, maxPlatinum: 1, minDilithium: 0, maxDilithium: 0 },
//    { type: 'mine', count: 3 },
//    { type: 'comet', count: 2 },
  ],
  storytext: null,
};

export function getLevel(n) {
  if (n === 0) return LEVEL_ZERO;
  if (n <= LEVELS.length) return LEVELS[n - 1];
  // Beyond defined levels: escalate with no story text
  const extra = n - LEVELS.length;
  return {
    id: n,
    title: `Level ${n}: Deep Space`,
    spawn: [{ type: 'large', count: LEVELS[LEVELS.length - 1].spawn[0].count + extra }],
    storytext: null,
  };
}
