const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const TOTAL_VILLAGERS = 5;
const TOUCH_HIT_PAD   = 20; // extra px added to each side for finger tap targets

let gameState    = 'intro';
let introTimer   = 0;
let currentLevel = 1;

let player, enemies, bullets, arrows, villagers, chests, currentConfig;

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
  introTimer    = 150;
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

  // --- Touch intent resolution ---
  let touchMoveTarget = null;

  if (touch.justTapped) {
    // 1. Weapon switcher button (highest priority — consume tap before anything else)
    if (_weaponBtnRect && pointInRect(touch.tapX, touch.tapY, _weaponBtnRect)) {
      player.currentWeaponIdx = (player.currentWeaponIdx + 1) % player.unlockedWeapons.length;
      touch.justTapped  = false;
      mouse.justClicked = false; // prevent hitButton in draw() from double-cycling

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
        // Fire one shot — bypass mouse.down check used by tryShoot
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
    // Sustained drag → keep moving toward current touch position
    touchMoveTarget = { x: touch.x, y: touch.y };
  }

  player.update(canvas.width, canvas.height, obstacles, touchMoveTarget);

  // Desktop mouse shooting (hold to fire — not triggered by touch events)
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

  // Weapon switcher — always visible during gameplay; store rect for next update()
  if (gameState === 'playing' || gameState === 'intro') {
    _weaponBtnRect = drawWeaponSwitcher(ctx, player);
    // Mouse click on weapon button (desktop)
    if (hitButton(_weaponBtnRect)) {
      player.currentWeaponIdx = (player.currentWeaponIdx + 1) % player.unlockedWeapons.length;
    }
  }

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
  touch.justTapped  = false;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
