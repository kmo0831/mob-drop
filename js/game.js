const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const TOTAL_VILLAGERS = 5;
const TOUCH_HIT_PAD   = 20;

let gameState    = 'title'; // starts on title screen
let introTimer   = 0;
let creditsTimer = 0;
let currentLevel = 1;

// Initialised as empty so draw() is safe before the first initLevel call
let player = null, enemies = [], bullets = [], arrows = [], villagers = [], chests = [], currentConfig = null;

// Weapon switcher button rect — set each draw frame, read at start of next update
let _weaponBtnRect = null;

function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
}

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
  introTimer    = 120; // 2 seconds at 60 fps
  startBgMusic();
  currentConfig = LEVEL_CONFIGS[levelNum - 1];

  obstacles = generateObstacles(currentConfig, canvas.width, canvas.height);

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
  for (const c of chests) {
    if (c.type === 'weapon') c.weaponName = currentConfig.weaponUnlock;
  }
}

// Title screen comes first — initLevel(1) is called when Play is tapped

function savedCount() {
  return villagers.filter(v => v.rescued).length;
}

function hitButton(btn) {
  return mouse.justClicked &&
    mouse.x >= btn.x && mouse.x <= btn.x + btn.width &&
    mouse.y >= btn.y && mouse.y <= btn.y + btn.height;
}

function update() {
  // Title and credits are handled entirely in draw() via hitButton
  if (gameState === 'title') return;

  if (gameState === 'credits') {
    creditsTimer++;
    return;
  }

  if (gameState === 'intro') {
    introTimer--;
    // Dismissable: any tap or click skips the remaining intro time
    if (introTimer <= 0 || mouse.justClicked || touch.justTapped) {
      gameState         = 'playing';
      mouse.justClicked = false;
      touch.justTapped  = false;
    }
    return;
  }

  if (gameState !== 'playing') return;

  // --- Touch intent resolution ---
  let touchMoveTarget = null;

  if (touch.justTapped) {
    // 1. Weapon switcher button (highest priority — consume tap before anything else)
    if (_weaponBtnRect && pointInRect(touch.tapX, touch.tapY, _weaponBtnRect)) {
      player.currentWeaponIdx = (player.currentWeaponIdx + 1) % player.unlockedWeapons.length;
      touch.justTapped  = false;
      mouse.justClicked = false;

    // 2. Tap on enemy → one shot at that enemy
    } else {
      let hitEnemy = null;
      for (const e of enemies) {
        if (!e.dead && pointInRect(touch.tapX, touch.tapY, {
          x: e.x - TOUCH_HIT_PAD,
          y: e.y - TOUCH_HIT_PAD,
          width:  e.width  + TOUCH_HIT_PAD * 2,
          height: e.height + TOUCH_HIT_PAD * 2
        })) { hitEnemy = e; break; }
      }

      if (hitEnemy) {
        if (player.ammo > 0 && player.fireTimer <= 0) {
          player.ammo--;
          player.fireTimer = player.currentWeapon.fireRate;
          const ex = hitEnemy.x + hitEnemy.width  / 2;
          const ey = hitEnemy.y + hitEnemy.height / 2;
          const px = player.x + player.width  / 2;
          const py = player.y + player.height / 2;
          const newBullets = player.currentWeapon.shoot(px, py, ex, ey);
          bullets.push(...newBullets);
          if (newBullets.length > 0) playShoot();
        }
        touch.justTapped = false;

      // 3. Tap on villager → start rescue hold, move toward them
      } else {
        let hitVillager = null;
        for (const v of villagers) {
          if (!v.rescued && pointInRect(touch.tapX, touch.tapY, {
            x: v.x - TOUCH_HIT_PAD,
            y: v.y - TOUCH_HIT_PAD,
            width:  v.width  + TOUCH_HIT_PAD * 2,
            height: v.height + TOUCH_HIT_PAD * 2
          })) { hitVillager = v; break; }
        }

        if (hitVillager) {
          touch.villagerTarget = hitVillager;
          touchMoveTarget = { x: hitVillager.x + hitVillager.width / 2, y: hitVillager.y + hitVillager.height / 2 };
        } else {
          // 4. Tap empty space → move toward that point
          touchMoveTarget = { x: touch.tapX, y: touch.tapY };
        }
      }
    }
  } else if (touch.active) {
    touchMoveTarget = { x: touch.x, y: touch.y };
  }

  player.update(canvas.width, canvas.height, obstacles, touchMoveTarget);

  // Desktop mouse shooting
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
    if (currentLevel < 10) {
      gameState = 'levelComplete';
    } else {
      gameState    = 'credits';
      creditsTimer = 0;
    }
    playLevelComplete();
  }
}

function draw() {
  const cw = canvas.width;
  const ch = canvas.height;

  // Title screen — drawn before initLevel, no game entities exist yet
  if (gameState === 'title') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    const btn = drawTitleScreen(ctx, cw, ch);
    if (hitButton(btn)) {
      initLevel(1);
      mouse.justClicked = false;
      touch.justTapped  = false;
    }
    return;
  }

  // Credits screen
  if (gameState === 'credits') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);
    const btn = drawCreditsScreen(ctx, cw, ch, creditsTimer);
    if (btn && hitButton(btn)) initLevel(1);
    return;
  }

  // In-game rendering
  ctx.fillStyle = currentConfig ? currentConfig.bg : '#000';
  ctx.fillRect(0, 0, cw, ch);

  for (const obs of obstacles) drawObstacle(ctx, obs);

  for (const c of chests)    c.draw(ctx);
  for (const v of villagers) v.draw(ctx);
  player.draw(ctx);
  for (const e of enemies)   e.draw(ctx);
  for (const b of bullets)   b.draw(ctx);
  for (const a of arrows)    a.draw(ctx);

  drawHUD(ctx, player, savedCount(), TOTAL_VILLAGERS, currentLevel, currentConfig);

  // Weapon switcher — always visible during gameplay; store rect for next update()
  if (gameState === 'playing' || gameState === 'intro') {
    _weaponBtnRect = drawWeaponSwitcher(ctx, player);
    if (hitButton(_weaponBtnRect)) {
      player.currentWeaponIdx = (player.currentWeaponIdx + 1) % player.unlockedWeapons.length;
    }
  }

  if (gameState === 'intro') {
    drawLevelIntro(ctx, currentLevel, currentConfig.theme, introTimer, cw, ch);
  }

  let btn;
  if (gameState === 'levelComplete') {
    btn = drawLevelComplete(ctx, player.hp, currentLevel, cw, ch);
    if (hitButton(btn)) initLevel(currentLevel + 1, player);
  } else if (gameState === 'gameOver') {
    btn = drawGameOver(ctx, cw, ch);
    if (hitButton(btn)) initLevel(currentLevel, player);
  } else if (gameState === 'youWin') {
    // kept for safety — this state is no longer reached (level 10 → 'credits')
    btn = drawYouWin(ctx, cw, ch);
    if (hitButton(btn)) initLevel(1);
  }
}

function loop() {
  update();
  draw();
  mouse.justClicked = false;
  touch.justTapped  = false;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
