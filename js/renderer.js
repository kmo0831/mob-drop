// All canvas pixel art draw calls live here.

function drawPixelSprite(ctx, x, y, pixels, scale) {
  for (let r = 0; r < pixels.length; r++) {
    for (let c = 0; c < pixels[r].length; c++) {
      const col = pixels[r][c];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

function drawHPBar(ctx, x, y, w, hp, maxHp) {
  ctx.fillStyle = '#500';
  ctx.fillRect(x, y - 8, w, 5);
  ctx.fillStyle = '#f44';
  ctx.fillRect(x, y - 8, w * (hp / maxHp), 5);
}

// ── Sprite data ───────────────────────────────────────────────────────────────
// Each sprite is a 2-D array of CSS colour strings (null = transparent).
// Scale 4 means each logical pixel → 4×4 canvas pixels.

// Player  8×8  scale 4  → 32×32
const SP_PLAYER = [
  [null,   '#09d', '#09d', '#09d', '#09d', '#09d', '#09d', null  ],
  ['#09d', '#fdc', '#fdc', '#fdc', '#fdc', '#fdc', '#fdc', '#09d'],
  ['#09d', '#fdc', '#222', '#fdc', '#fdc', '#222', '#fdc', '#09d'],
  ['#09d', '#fdc', '#fdc', '#a85', '#a85', '#fdc', '#fdc', '#09d'],
  [null,   '#07b', '#07b', '#07b', '#07b', '#07b', '#07b', null  ],
  ['#07b', '#07b', '#07b', '#07b', '#07b', '#07b', '#07b', '#07b'],
  [null,   '#07b', null,   '#07b', '#07b', null,   '#07b', null  ],
  [null,   '#543', null,   '#543', '#543', null,   '#543', null  ],
];

// Zombie  8×8  scale 4  → 32×32
const SP_ZOMBIE = [
  [null,   '#2a2', '#2a2', '#2a2', '#2a2', '#2a2', '#2a2', null  ],
  ['#2a2', '#3c3', '#3c3', '#3c3', '#3c3', '#3c3', '#3c3', '#2a2'],
  ['#2a2', '#3c3', '#f22', '#3c3', '#3c3', '#f22', '#3c3', '#2a2'],
  ['#2a2', '#3c3', '#3c3', '#3c3', '#3c3', '#3c3', '#3c3', '#2a2'],
  ['#1a1', null,   '#1a1', '#1a1', '#1a1', '#1a1', null,   '#1a1'],
  [null,   null,   '#1a1', '#1a1', '#1a1', '#1a1', null,   null  ],
  [null,   null,   '#111', null,   null,   '#111', null,   null  ],
  [null,   null,   null,   null,   null,   null,   null,   null  ],
];

// Spider  6×6  scale 4  → 24×24
const SP_SPIDER = [
  ['#80a', null,   '#80a', '#80a', null,   '#80a'],
  ['#80a', '#60a', '#60a', '#60a', '#60a', '#80a'],
  [null,   '#60a', '#f22', '#f22', '#60a', null  ],
  [null,   '#60a', '#60a', '#60a', '#60a', null  ],
  ['#80a', '#60a', '#60a', '#60a', '#60a', '#80a'],
  ['#80a', null,   '#80a', '#80a', null,   '#80a'],
];

// Skeleton  7×7  scale 4  → 28×28
const SP_SKELETON = [
  [null,   '#ccc', '#ccc', '#ccc', '#ccc', '#ccc', null  ],
  ['#ccc', '#ddd', '#222', '#ddd', '#222', '#ddd', '#ccc'],
  ['#ccc', '#ddd', '#ddd', '#ddd', '#ddd', '#ddd', '#ccc'],
  [null,   '#aaa', '#aaa', '#aaa', '#aaa', '#aaa', null  ],
  ['#aaa', null,   '#aaa', null,   '#aaa', null,   '#aaa'],
  [null,   null,   '#999', null,   '#999', null,   null  ],
  [null,   null,   '#888', null,   '#888', null,   null  ],
];

// Creeper  7×7  scale 4  → 28×28  (Minecraft-inspired face)
const SP_CREEPER = [
  [null,   '#2d2', '#2d2', '#2d2', '#2d2', '#2d2', null  ],
  ['#2d2', '#2d2', '#111', '#111', '#2d2', '#2d2', '#2d2'],
  ['#2d2', '#2d2', '#111', '#2d2', '#111', '#2d2', '#2d2'],
  ['#2d2', '#2d2', '#111', '#111', '#111', '#2d2', '#2d2'],
  ['#2d2', '#111', '#2d2', '#2d2', '#2d2', '#111', '#2d2'],
  ['#2d2', '#2d2', '#111', '#111', '#111', '#2d2', '#2d2'],
  [null,   '#1b1', '#1b1', '#1b1', '#1b1', '#1b1', null  ],
];

// Dinosaur  8×8  scale 6  → 48×48
const SP_DINOSAUR = [
  [null,   '#6a3', '#6a3', '#6a3', '#6a3', '#6a3', null,   null  ],
  ['#6a3', '#4a2', '#4a2', '#e33', '#e33', '#4a2', '#4a2', '#6a3'],
  ['#6a3', '#4a2', '#5b3', '#4a2', '#4a2', '#5b3', '#4a2', '#6a3'],
  ['#6a3', '#6a3', '#4a2', '#4a2', '#4a2', '#4a2', '#6a3', '#6a3'],
  [null,   '#6a3', '#6a3', '#4a2', '#4a2', '#6a3', '#6a3', null  ],
  ['#6a3', null,   '#6a3', '#6a3', '#6a3', '#6a3', null,   '#6a3'],
  ['#6a3', null,   null,   null,   null,   null,   null,   '#6a3'],
  [null,   null,   null,   null,   null,   null,   null,   null  ],
];

// Villager  6×6  scale 4  → 24×24
const SP_VILLAGER = [
  [null,   '#f90', '#f90', '#f90', '#f90', null  ],
  ['#f90', '#fdb', '#fdb', '#fdb', '#fdb', '#f90'],
  ['#f90', '#fdb', '#442', '#442', '#fdb', '#f90'],
  [null,   '#f90', '#fdb', '#fdb', '#f90', null  ],
  [null,   '#f90', '#f90', '#f90', '#f90', null  ],
  [null,   '#963', null,   null,   '#963', null  ],
];

// Ammo chest  6×6  scale 4  → 24×24  (silver)
const SP_CHEST_AMMO = [
  ['#777', '#999', '#999', '#999', '#999', '#777'],
  ['#999', '#bbb', '#bbb', '#bbb', '#bbb', '#999'],
  ['#999', '#bbb', '#fd0', '#fd0', '#bbb', '#999'],
  ['#999', '#bbb', '#fd0', '#fd0', '#bbb', '#999'],
  ['#777', '#999', '#999', '#999', '#999', '#777'],
  ['#555', '#777', '#777', '#777', '#777', '#555'],
];

// Weapon chest  6×6  scale 4  → 24×24  (gold)
const SP_CHEST_WEAPON = [
  ['#960', '#b80', '#b80', '#b80', '#b80', '#960'],
  ['#b80', '#fd0', '#fd0', '#fd0', '#fd0', '#b80'],
  ['#b80', '#fd0', '#fff', '#fd0', '#fd0', '#b80'],
  ['#b80', '#fd0', '#fd0', '#fff', '#fd0', '#b80'],
  ['#960', '#b80', '#b80', '#b80', '#b80', '#960'],
  ['#740', '#960', '#960', '#960', '#960', '#740'],
];

// ── Entity drawing functions ──────────────────────────────────────────────────

function drawPlayer(ctx, e) {
  if (e.invincibleTimer > 0 && Math.floor(e.invincibleTimer / 5) % 2 === 0) {
    ctx.globalAlpha = 0.3;
  }
  drawPixelSprite(ctx, e.x, e.y, SP_PLAYER, 4);
  ctx.globalAlpha = 1;
}

function drawZombie(ctx, e) {
  drawPixelSprite(ctx, e.x, e.y, SP_ZOMBIE, 4);
  drawHPBar(ctx, e.x, e.y, e.width, e.hp, e.maxHp);
}

function drawSpider(ctx, e) {
  drawPixelSprite(ctx, e.x, e.y, SP_SPIDER, 4);
  drawHPBar(ctx, e.x, e.y, e.width, e.hp, e.maxHp);
}

function drawSkeleton(ctx, e) {
  drawPixelSprite(ctx, e.x, e.y, SP_SKELETON, 4);
  if (e.state === 'aiming') {
    // yellow warning tint
    ctx.fillStyle = `rgba(255,220,0,${0.15 + 0.25 * (e.aimTimer / 180)})`;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  }
  drawHPBar(ctx, e.x, e.y, e.width, e.hp, e.maxHp);
}

function drawCreeper(ctx, e) {
  if (e.exploding) {
    const p = 1 - e.explodeTimer / 25;
    ctx.beginPath();
    ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.blastRadius * p, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,120,0,${(1 - p) * 0.75})`;
    ctx.fill();
    return;
  }
  drawPixelSprite(ctx, e.x, e.y, SP_CREEPER, 4);
  if (e.state === 'fused') {
    const interval = e.fuseTimer < 90 ? 15 : e.fuseTimer < 150 ? 8 : 4;
    if (Math.floor(e.fuseTimer / interval) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,40,40,0.55)';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  }
  drawHPBar(ctx, e.x, e.y, e.width, e.hp, e.maxHp);
}

function drawDinosaur(ctx, e) {
  if (e.state === 'charging') {
    ctx.fillStyle = 'rgba(200,60,0,0.3)';
    ctx.fillRect(e.x - 4, e.y - 4, e.width + 8, e.height + 8);
  }
  drawPixelSprite(ctx, e.x, e.y, SP_DINOSAUR, 6);
  if (e.state === 'recovering') {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(e.x, e.y, e.width, e.height);
  }
  if (e.state === 'tracking' && e.trackTimer > 60) {
    const flash = Math.floor(e.trackTimer / 5) % 2 === 0;
    ctx.fillStyle = `rgba(255,100,0,${flash ? 0.35 : 0})`;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  }
  drawHPBar(ctx, e.x, e.y, e.width, e.hp, e.maxHp);
}

function drawVillager(ctx, e) {
  drawPixelSprite(ctx, e.x, e.y, SP_VILLAGER, 4);
}

function drawChest(ctx, e) {
  if (e.collected) return;
  drawPixelSprite(ctx, e.x, e.y, e.type === 'weapon' ? SP_CHEST_WEAPON : SP_CHEST_AMMO, 4);
}

function drawBullet(ctx, b) {
  const cx    = b.x + 3;
  const cy    = b.y + 3;
  const angle = Math.atan2(b.vy, b.vx);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#ffe040';
  ctx.fillRect(-5, -2, 10, 4);
  ctx.fillStyle = '#ffa000';
  ctx.fillRect(5, -1, 3, 2);
  ctx.restore();
}

function drawArrow(ctx, a) {
  const cx    = a.x + a.width  / 2;
  const cy    = a.y + a.height / 2;
  const angle = Math.atan2(a.vy, a.vx);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(-10, -2, 20, 4);
  ctx.fillStyle = '#888';
  ctx.fillRect(10, -3, 6, 6);
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(-12, -3, 4, 6);
  ctx.restore();
}

function drawGrenade(ctx, g) {
  if (g.exploding) {
    const p = 1 - g.explodeTimer / 22;
    ctx.beginPath();
    ctx.arc(g.x + 5, g.y + 5, g.blastRadius * p, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,140,0,${(1 - p) * 0.7})`;
    ctx.fill();
    return;
  }
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(g.x + 5, g.y + 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f80';
  ctx.fillRect(g.x + 3, g.y - 4, 4, 5);
}

// ── Obstacle rendering ────────────────────────────────────────────────────────

function drawObstacle(ctx, obs) {
  const { x, y, width: w, height: h, themeKey } = obs;

  if (themeKey === 'village') {
    ctx.fillStyle = '#9a5a28';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#c04030';
    ctx.fillRect(x, y, w, Math.max(8, Math.floor(h * 0.32)));
    if (w >= 48) {
      ctx.fillStyle = '#ffe8a0';
      ctx.fillRect(x + 8, y + Math.floor(h * 0.44), 9, 9);
      if (w >= 72) ctx.fillRect(x + w - 18, y + Math.floor(h * 0.44), 9, 9);
    }
    ctx.strokeStyle = '#6a3810';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

  } else if (themeKey === 'fields') {
    ctx.fillStyle = '#8a7848';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6a5a30';
    ctx.fillRect(x + 6, y + Math.floor(h * 0.35), Math.floor(w * 0.35), 3);
    ctx.fillRect(x + Math.floor(w * 0.55), y + Math.floor(h * 0.6), Math.floor(w * 0.3), 3);
    ctx.strokeStyle = '#a09060';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

  } else if (themeKey === 'forest') {
    ctx.fillStyle = '#0d1e08';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#1a3a0e';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.fillStyle = '#2a5010';
    ctx.fillRect(x + 5, y + 5, 5, 5);
    ctx.fillRect(x + w - 10, y + h - 10, 5, 5);
    ctx.strokeStyle = '#0a1406';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

  } else if (themeKey === 'swamp') {
    ctx.fillStyle = '#3e2e14';
    ctx.fillRect(x, y, w, h);
    const bw = Math.floor(w / 3);
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(x,          y,                      bw - 2, Math.floor(h * 0.45));
    ctx.fillRect(x + bw + 2, y + Math.floor(h * 0.15), bw - 2, Math.floor(h * 0.55));
    ctx.fillRect(x + bw * 2 + 2, y,                 bw - 4, Math.floor(h * 0.38));
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

  } else if (themeKey === 'dungeon') {
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#181010';
    ctx.fillRect(x, y + Math.floor(h / 3), w, 3);
    ctx.fillRect(x, y + Math.floor(h * 2 / 3), w, 3);
    ctx.fillRect(x + Math.floor(w / 2), y, 3, h);
    ctx.fillStyle = '#b02000';
    ctx.fillRect(x + 4, y + h - 7, Math.floor(w * 0.3), 3);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

  } else {
    ctx.fillStyle = obs.color || '#666';
    ctx.fillRect(x, y, w, h);
  }
}
