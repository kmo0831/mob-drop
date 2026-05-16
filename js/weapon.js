class Bullet {
  constructor(x, y, angle, speed, damage) {
    this.width  = 6;
    this.height = 6;
    this.x = x;
    this.y = y;
    this.active = true;
    this.speed  = speed  || 8;
    this.damage = damage || 20;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(obstacles, enemies, canvasWidth, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.active = false; return;
    }
    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) { this.active = false; return; }
    }
    for (const enemy of enemies) {
      if (!enemy.dead && !enemy.exploding && rectsOverlap(this, enemy)) {
        enemy.hp -= this.damage;
        if (enemy.hp <= 0) enemy.dead = true;
        this.active = false; return;
      }
    }
  }

  draw(ctx) { drawBullet(ctx, this); }
}

class Grenade {
  constructor(x, y, angle) {
    this.width  = 10;
    this.height = 10;
    this.x = x - 5;
    this.y = y - 5;
    this.speed       = 4.5;
    this.damage      = 55;
    this.blastRadius = 110;
    this.active      = true;
    this.exploding   = false;
    this.explodeTimer = 0;
    this.distTraveled = 0;
    this.maxDist     = 450;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(obstacles, enemies, canvasWidth, canvasHeight) {
    if (this.exploding) {
      this.explodeTimer--;
      if (this.explodeTimer <= 0) this.active = false;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.distTraveled += this.speed;

    let hit = this.distTraveled >= this.maxDist ||
      this.x < 0 || this.x > canvasWidth ||
      this.y < 0 || this.y > canvasHeight;

    if (!hit) {
      for (const obs of obstacles) {
        if (rectsOverlap(this, obs)) { hit = true; break; }
      }
    }
    if (!hit) {
      for (const e of enemies) {
        if (!e.dead && !e.exploding && rectsOverlap(this, e)) { hit = true; break; }
      }
    }

    if (hit) {
      const cx = this.x + this.width  / 2;
      const cy = this.y + this.height / 2;
      for (const e of enemies) {
        if (e.dead) continue;
        const ex   = e.x + e.width  / 2;
        const ey   = e.y + e.height / 2;
        const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
        if (dist < this.blastRadius) {
          e.hp -= this.damage;
          if (e.hp <= 0) e.dead = true;
        }
      }
      this.exploding    = true;
      this.explodeTimer = 22;
    }
  }

  draw(ctx) { drawGrenade(ctx, this); }
}

const WEAPON_DEFS = {
  pistol: {
    name:     'Pistol',
    fireRate: 15,
    shoot(cx, cy, tx, ty) {
      const a = Math.atan2(ty - cy, tx - cx);
      return [new Bullet(cx, cy, a, 8, 20)];
    }
  },
  shotgun: {
    name:     'Shotgun',
    fireRate: 30,
    shoot(cx, cy, tx, ty) {
      const base = Math.atan2(ty - cy, tx - cx);
      return [-2, -1, 0, 1, 2].map(i => {
        const b = new Bullet(cx, cy, base + i * 0.18, 8, 12);
        return b;
      });
    }
  },
  rifle: {
    name:     'Rifle',
    fireRate: 40,
    shoot(cx, cy, tx, ty) {
      const a = Math.atan2(ty - cy, tx - cx);
      return [new Bullet(cx, cy, a, 14, 45)];
    }
  },
  grenadeLauncher: {
    name:     'Grenade',
    fireRate: 50,
    shoot(cx, cy, tx, ty) {
      const a = Math.atan2(ty - cy, tx - cx);
      return [new Grenade(cx, cy, a)];
    }
  },
  minigun: {
    name:     'Minigun',
    fireRate: 4,
    shoot(cx, cy, tx, ty) {
      const a = Math.atan2(ty - cy, tx - cx) + (Math.random() - 0.5) * 0.12;
      return [new Bullet(cx, cy, a, 10, 10)];
    }
  },
};
