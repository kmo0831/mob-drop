class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 32;
    this.height = 32;
    this.x = canvasWidth  / 2 - this.width  / 2;
    this.y = canvasHeight / 2 - this.height / 2;
    this.speed  = 3;
    this.color  = '#4af';
    this.maxHp  = 100;
    this.hp     = 100;
    this.invincibleTimer = 0;
    this.tookDamageThisFrame = false;

    this.ammo             = 50;
    this.fireTimer        = 0;
    this.unlockedWeapons  = ['pistol'];
    this.currentWeaponIdx = 0;
  }

  get currentWeapon() {
    return WEAPON_DEFS[this.unlockedWeapons[this.currentWeaponIdx]];
  }

  unlockWeapon(name) {
    if (!this.unlockedWeapons.includes(name)) {
      this.unlockedWeapons.push(name);
    }
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = 60;
    this.tookDamageThisFrame = true;
  }

  tryShoot(targetX, targetY) {
    if (this.fireTimer > 0 || this.ammo <= 0 || !mouse.down) return [];
    this.ammo--;
    this.fireTimer = this.currentWeapon.fireRate;
    const cx = this.x + this.width  / 2;
    const cy = this.y + this.height / 2;
    return this.currentWeapon.shoot(cx, cy, targetX, targetY);
  }

  update(canvasWidth, canvasHeight, obstacles) {
    this.tookDamageThisFrame = false;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (this.fireTimer > 0) this.fireTimer--;

    // weapon switching [1] [2] etc.
    for (let i = 0; i < this.unlockedWeapons.length; i++) {
      if (keys[String(i + 1)]) this.currentWeaponIdx = i;
    }

    let dx = 0;
    let dy = 0;
    if (keys['w'] || keys['W'] || keys['ArrowUp'])    dy -= 1;
    if (keys['s'] || keys['S'] || keys['ArrowDown'])  dy += 1;
    if (keys['a'] || keys['A'] || keys['ArrowLeft'])  dx -= 1;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    this.x += dx * this.speed;
    this.y += dy * this.speed;

    this.x = Math.max(0, Math.min(canvasWidth  - this.width,  this.x));
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));

    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) resolveCollision(this, obs);
    }
  }

  draw(ctx) {
    drawPlayer(ctx, this);
  }
}
