export const LEVELS = [
  {
    id: 1,
    title: 'Level 1: First Contact',
    spawn: [
      { type: 'large', count: 2 },
      { type: 'enemy', count: 5, speed: 55, shotInterval: 1, minSpawnTime: 5, maxSpawnTime: 10, hp: 1 },
    ],
    pretext: 'Welcome to the frontier, pilot. You\'ve been assigned to Waystation Alpha, our last outpost on the edge of explored space.\n\nYour fighter has been fuelled and armed. The station crew is counting on you.',
    posttext: 'Long-range sensors have picked up a large asteroid drifting toward the station. One rock — but it\'s a big one.\n\nIntercept and destroy it before it reaches us. Good luck out there.',
  },
  {
    id: 2,
    title: 'Level 2: Debris Field',
    spawn: [{ type: 'large', count: 2 }],
    pretext: 'Nice work, pilot. The station is secure for now.\n\nCommand has been watching your flight data. They\'re impressed — but the situation out there is getting more complicated.',
    posttext: 'Two large asteroids have broken off from a passing belt and are closing in fast.\n\nThey could fragment into a dozen pieces if you\'re not careful. Stay sharp and clear them out.',
  },
  {
    id: 3,
    title: 'Level 3: The Swarm',
    spawn: [{ type: 'large', count: 3 }],
    pretext: 'Impressive flying out there. Word is spreading through the station — the crew is calling you a legend.\n\nOur science team is studying the asteroid trajectories. Something is pulling them toward us.',
    posttext: 'Three large rocks inbound, all on different vectors. Our sensors show dense cores — expect heavy fragmentation.\n\nThis one\'s going to be messy. Don\'t let anything through.',
  },
  {
    id: 4,
    title: 'Level 4: Storm Front',
    spawn: [{ type: 'large', count: 4 }],
    pretext: 'The science team has confirmed it: a gravitational anomaly is drawing in material from the surrounding belt. This isn\'t random.\n\nSomeone — or something — may be directing this.',
    posttext: 'Four asteroids, moving in a loose formation. Scanners are having trouble getting clean readings.\n\nWhatever is out there, it\'s getting bolder. Hold the line.',
  },
  {
    id: 5,
    title: 'Level 5: The Source',
    spawn: [{ type: 'large', count: 5 }],
    pretext: 'We\'ve triangulated the anomaly. There\'s a massive object at the edge of sensor range — origin unknown.\n\nThe asteroid waves are getting heavier. We\'re running out of time to find answers.',
    posttext: 'Five rocks incoming — biggest wave yet. Our defensive grid is already strained.\n\nBuy us time, pilot. The science team is close to a breakthrough.',
  },
];

export function getLevel(n) {
  if (n <= LEVELS.length) return LEVELS[n - 1];
  // Beyond defined levels: escalate with no story text
  const extra = n - LEVELS.length;
  return {
    id: n,
    title: `Level ${n}: Deep Space`,
    spawn: [{ type: 'large', count: LEVELS[LEVELS.length - 1].spawn[0].count + extra }],
    pretext: null,
    posttext: null,
  };
}
