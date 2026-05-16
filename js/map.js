const LEVEL_CONFIGS = [
  {
    level: 1,  themeKey: 'village',  theme: 'Bright Village',     bg: '#4a5e30', obsColor: '#a06028',
    obsCount: 8,  speedMult: 1.00, hpMult: 1.00,
    enemies: { zombie: 3 },
    weaponUnlock: null, ammoChests: 3,
  },
  {
    level: 2,  themeKey: 'village',  theme: 'Bright Village',     bg: '#4a5e30', obsColor: '#9a5a24',
    obsCount: 10, speedMult: 1.05, hpMult: 1.10,
    enemies: { zombie: 4 },
    weaponUnlock: null, ammoChests: 3,
  },
  {
    level: 3,  themeKey: 'fields',   theme: 'Overgrown Fields',   bg: '#3a5220', obsColor: '#8a7a30',
    obsCount: 10, speedMult: 1.10, hpMult: 1.20,
    enemies: { zombie: 3, spider: 2 },
    weaponUnlock: 'shotgun', ammoChests: 2,
  },
  {
    level: 4,  themeKey: 'fields',   theme: 'Overgrown Fields',   bg: '#3a5220', obsColor: '#7a6a20',
    obsCount: 12, speedMult: 1.15, hpMult: 1.30,
    enemies: { zombie: 4, spider: 3 },
    weaponUnlock: 'shotgun', ammoChests: 2,
  },
  {
    level: 5,  themeKey: 'forest',   theme: 'Dark Forest',        bg: '#182810', obsColor: '#0e1e0a',
    obsCount: 12, speedMult: 1.20, hpMult: 1.40,
    enemies: { zombie: 3, spider: 2, skeleton: 2 },
    weaponUnlock: 'rifle', ammoChests: 2,
  },
  {
    level: 6,  themeKey: 'forest',   theme: 'Dark Forest',        bg: '#182810', obsColor: '#0a1808',
    obsCount: 14, speedMult: 1.25, hpMult: 1.50,
    enemies: { zombie: 4, spider: 3, skeleton: 2 },
    weaponUnlock: 'rifle', ammoChests: 2,
  },
  {
    level: 7,  themeKey: 'swamp',    theme: 'Swamp / Ruins',      bg: '#28200e', obsColor: '#4a3818',
    obsCount: 12, speedMult: 1.30, hpMult: 1.60,
    enemies: { zombie: 3, spider: 2, skeleton: 2, creeper: 2 },
    weaponUnlock: 'grenadeLauncher', ammoChests: 2,
  },
  {
    level: 8,  themeKey: 'swamp',    theme: 'Swamp / Ruins',      bg: '#28200e', obsColor: '#3e3010',
    obsCount: 14, speedMult: 1.35, hpMult: 1.70,
    enemies: { zombie: 4, spider: 3, skeleton: 3, creeper: 2 },
    weaponUnlock: 'grenadeLauncher', ammoChests: 2,
  },
  {
    level: 9,  themeKey: 'dungeon',  theme: 'Dungeon / Volcanic', bg: '#141414', obsColor: '#2e1e1e',
    obsCount: 14, speedMult: 1.40, hpMult: 1.80,
    enemies: { zombie: 4, spider: 3, skeleton: 2, creeper: 2, dinosaur: 1 },
    weaponUnlock: 'minigun', ammoChests: 2,
  },
  {
    level: 10, themeKey: 'dungeon',  theme: 'Dungeon / Volcanic', bg: '#141414', obsColor: '#361818',
    obsCount: 15, speedMult: 1.50, hpMult: 2.00,
    enemies: { zombie: 5, spider: 4, skeleton: 3, creeper: 3, dinosaur: 2 },
    weaponUnlock: 'minigun', ammoChests: 2,
  },
];

let obstacles = [];

function generateObstacles(config, canvasWidth, canvasHeight) {
  const obs      = [];
  const centerX  = canvasWidth  / 2;
  const centerY  = canvasHeight / 2;
  const clearR   = 90; // keep center open for player spawn

  for (let i = 0; i < config.obsCount; i++) {
    let attempts = 0;
    while (attempts < 300) {
      attempts++;
      const w = 48 + Math.floor(Math.random() * 64);
      const h = 40 + Math.floor(Math.random() * 56);
      const x = 20 + Math.random() * (canvasWidth  - w - 40);
      const y = 20 + Math.random() * (canvasHeight - h - 40);

      // keep player start area clear
      const clampX = Math.max(x, Math.min(x + w, centerX));
      const clampY = Math.max(y, Math.min(y + h, centerY));
      if (Math.sqrt((clampX - centerX) ** 2 + (clampY - centerY) ** 2) < clearR) continue;

      // no overlap with existing obstacles
      const padded = { x: x - 12, y: y - 12, width: w + 24, height: h + 24 };
      if (obs.some(o => rectsOverlap(padded, o))) continue;

      obs.push({ x, y, width: w, height: h, color: config.obsColor, themeKey: config.themeKey });
      break;
    }
  }
  return obs;
}
