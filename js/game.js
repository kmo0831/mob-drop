const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const TOTAL_VILLAGERS = 5;
let gameState    = 'intro'; // 'intro' | 'playing' | 'levelComplete' | 'gameOver' | 'youWin'
let introTimer   = 0;
let currentLevel = 1;

let player, enemies, bullets, arrows, villagers, chests, currentConfig;

function generateEnemies(config) {
  const { enemies: counts, speedMult, hpMult } = config;
  const list = [];

  function add(EnemyClass, count) {
    for (let i = 0; i < (count || 0); i++) {
      const e = new EnemyClass(canvas.width, canvas.height);
      if (e.speed !== undefined) e.speed = parseFloat((e.speed * speedMult).toFixed(2));
      if (e.hp    !== undefined) { e.hp = Math.round(e.hp * hpMult); e.maxHp = e.hp; }
      list.push(e);
    }
  }

  add(Zombie,   counts.zombie);
  add(Spider,   counts.spider);
  add(Skeleton, counts.skeleton);
  add(Creeper,  counts.creeper);
  add(Dinosaur, counts.dinosaur);
  return list;
}

function initLevel(levelNum, prevPlayer) {
  currentLevel  = levelNum;
  gameState     = 'intro';
  introTimer    = 150;
  startBgMusic();
  currentConfig = LEVEL_CONFIGS[levelNum - 1];

  obstacles = generateObstacles(currentConfig, canvas.width, canvas.height);

  // new player at full HP, preserving weapons and ammo from prev level
  player = new Player(canvas.width, canvas.height);
  if (prevPlayer) {
    player.unlockedWeapons  = prevPlayer.unlockedWeapons.slice();
    player.currentWeaponIdx = prevPlayer.currentWeaponIdx;
    player.ammo             = prevPlayer.ammo;
  }

  enemies   = generateEnemies(currentConfig);
  bullets   = [];
  arrows    = [];
  villagers = [];
  for (let i = 0; i < TOTAL_VILLAGERS; i++) {
    villagers.push(new Villager(canvas.width, canvas.height, obstacles));
  }

  chests = [];
  if (currentConfig.weaponUnlock) {
    chests.push(new Chest('weapon', canvas.width, canvas.height, obstacles, chests));
  }
  for (let i = 0; i < currentConfig.ammoChests; i++) {
    chests.push(new Chest('ammo', canvas.width, canvas.height, obstacles, chests));
  }

  // weapon chest needs to know which weapon to unlock
  for (const c of chests) {
    if (c.type === 'weapon') c.weaponName = currentConfig.weaponUnlock;
  }
}

initLevel(1);

function savedCount() {
  return villagers.filter(v => v.rescued).length;
}

function hitButton(btn) {
  return mouse.justClicked &&
    mouse.x >= btn.x && mouse.x <= btn.x + btn.width &&
    mouse.y >= btn.y && mouse.y <= btn.y + btn.height;
}

function update() {
  if (gameState === 'intro') {
    introTimer--;
    if (introTimer <= 0) gameState = 'playing';
    return;
  }
  if (gameState !== 'playing') return;

  player.update(canvas.width, canvas.height, obstacles);

  const newBullets = player.tryShoot(mouse.x, mouse.y);
  if (newBullets.length > 0) playShoot();
  bullets.push(...newBullets);

  for (const b of bullets) b.update(obstacles, enemies, canvas.width, canvas.height);
  bullets = bullets.filter(b => b.active);

  for (const enemy of enemies) {
    const result = enemy.update(player, obstacles);
    if (result instanceof Arrow) arrows.push(result);
  }
  enemies = enemies.filter(e => !e.dead);

  for (const a of arrows) a.update(obstacles, player, canvas.width, canvas.height);
  arrows = arrows.filter(a => a.active);

  const prevSaved = savedCount();
  for (const v of villagers) v.update(player);
  if (savedCount() > prevSaved) playRescue();

  for (const c of chests) c.collect(player);

  if (player.tookDamageThisFrame) playDamage();

  if (player.hp <= 0) {
    gameState = 'gameOver';
  } else if (savedCount() === TOTAL_VILLAGERS) {
    gameState = currentLevel < 10 ? 'levelComplete' : 'youWin';
    playLevelComplete();
  }
}

function draw() {
  // themed background
  ctx.fillStyle = currentConfig ? currentConfig.bg : '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const obs of obstacles) drawObstacle(ctx, obs);

  for (const c of chests)    c.draw(ctx);
  for (const v of villagers) v.draw(ctx);
  player.draw(ctx);
  for (const e of enemies)   e.draw(ctx);
  for (const b of bullets)   b.draw(ctx);
  for (const a of arrows)    a.draw(ctx);

  drawHUD(ctx, player, savedCount(), TOTAL_VILLAGERS, currentLevel, currentConfig);

  if (gameState === 'intro') {
    drawLevelIntro(ctx, currentLevel, currentConfig.theme, introTimer, canvas.width, canvas.height);
  }

  let btn;
  if (gameState === 'levelComplete') {
    btn = drawLevelComplete(ctx, player.hp, currentLevel, canvas.width, canvas.height);
    if (hitButton(btn)) initLevel(currentLevel + 1, player);
  } else if (gameState === 'gameOver') {
    btn = drawGameOver(ctx, canvas.width, canvas.height);
    if (hitButton(btn)) initLevel(currentLevel, player);
  } else if (gameState === 'youWin') {
    btn = drawYouWin(ctx, canvas.width, canvas.height);
    if (hitButton(btn)) initLevel(1);
  }
}

function loop() {
  update();
  draw();
  mouse.justClicked = false;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
