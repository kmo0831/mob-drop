function spawnAtEdge(canvasWidth, canvasHeight, w, h) {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: Math.random() * canvasWidth, y: -h };
  if (edge === 1) return { x: canvasWidth,                 y: Math.random() * canvasHeight };
  if (edge === 2) return { x: Math.random() * canvasWidth, y: canvasHeight };
               return { x: -w,                            y: Math.random() * canvasHeight };
}

class Zombie {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 32;
    this.height = 32;
    this.speed  = 0.8;
    this.hp     = 60;
    this.maxHp  = 60;
    this.color  = '#3a7a3a';
    this.dead   = false;
    const pos = spawnAtEdge(canvasWidth, canvasHeight, this.width, this.height);
    this.x = pos.x; this.y = pos.y;
  }

  update(player, obstacles) {
    // move directly toward player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    // obstacle collision
    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) {
        resolveCollision(this, obs);
      }
    }

    // deal damage on contact
    if (rectsOverlap(this, player)) {
      player.takeDamage(10);
    }
  }

  draw(ctx) { drawZombie(ctx, this); }
}

class Spider {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 24;
    this.height = 24;
    this.speed  = 2.2;
    this.hp     = 25;
    this.maxHp  = 25;
    this.color  = '#7a2d8c';
    this.dead   = false;

    // zigzag state
    this.zigzagTimer = 0;
    this.zigzagDir   = Math.random() < 0.5 ? 1 : -1;
    this.zigzagRate  = 22; // frames between direction flips

    const pos = spawnAtEdge(canvasWidth, canvasHeight, this.width, this.height);
    this.x = pos.x; this.y = pos.y;
  }

  update(player, obstacles) {
    // flip zigzag direction on a timer
    this.zigzagTimer++;
    if (this.zigzagTimer >= this.zigzagRate) {
      this.zigzagTimer = 0;
      this.zigzagDir  *= -1;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // unit vector toward player
      const nx = dx / dist;
      const ny = dy / dist;
      // perpendicular vector
      const px = -ny;
      const py =  nx;

      this.x += (nx + px * this.zigzagDir * 0.8) * this.speed;
      this.y += (ny + py * this.zigzagDir * 0.8) * this.speed;
    }

    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) resolveCollision(this, obs);
    }

    if (rectsOverlap(this, player)) player.takeDamage(10);
  }

  draw(ctx) { drawSpider(ctx, this); }
}

// Projectile fired by skeletons — damages the player
class Arrow {
  constructor(x, y, targetX, targetY) {
    this.width  = 10;
    this.height = 5;
    this.x = x;
    this.y = y;
    this.speed  = 4;
    this.damage = 15;
    this.active = true;
    const angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(obstacles, player, canvasWidth, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.active = false; return;
    }
    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) { this.active = false; return; }
    }
    if (rectsOverlap(this, player)) {
      player.takeDamage(this.damage);
      this.active = false;
    }
  }

  draw(ctx) { drawArrow(ctx, this); }
}

class Creeper {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 28;
    this.height = 28;
    this.speed  = 1.0;
    this.hp     = 50;
    this.maxHp  = 50;
    this.color  = '#2d7a2d';
    this.dead   = false;

    this.state        = 'walking'; // 'walking' | 'fused'
    this.fuseTimer    = 0;
    this.blastRadius  = 120;
    this.exploding    = false;
    this.explodeTimer = 0;

    const pos = spawnAtEdge(canvasWidth, canvasHeight, this.width, this.height);
    this.x = pos.x; this.y = pos.y;
  }

  update(player, obstacles) {
    if (this.exploding) {
      this.explodeTimer--;
      if (this.explodeTimer <= 0) this.dead = true;
      return;
    }

    const cx  = this.x + this.width  / 2;
    const cy  = this.y + this.height / 2;
    const pcx = player.x + player.width  / 2;
    const pcy = player.y + player.height / 2;
    const dx  = pcx - cx;
    const dy  = pcy - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx  = dist > 0 ? dx / dist : 0;
    const ny  = dist > 0 ? dy / dist : 0;

    if (this.state === 'walking') {
      this.x += nx * this.speed;
      this.y += ny * this.speed;
      if (dist < 100) { this.state = 'fused'; this.fuseTimer = 0; }
    } else if (this.state === 'fused') {
      // creep slowly forward even while fused
      this.x += nx * this.speed * 0.4;
      this.y += ny * this.speed * 0.4;
      this.fuseTimer++;
      if (this.fuseTimer >= 180) {
        this.exploding    = true;
        this.explodeTimer = 25;
        if (dist < this.blastRadius) player.takeDamage(40);
      }
    }

    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) resolveCollision(this, obs);
    }
  }

  draw(ctx) { drawCreeper(ctx, this); }
}

class Dinosaur {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 48;
    this.height = 48;
    this.hp     = 150;
    this.maxHp  = 150;
    this.dead   = false;

    this.state        = 'tracking'; // 'tracking' | 'charging' | 'recovering'
    this.trackTimer   = 0;
    this.recoverTimer = 0;
    this.chargeVx     = 0;
    this.chargeVy     = 0;
    this.chargeSpeed  = 7;
    this.trackSpeed   = 0.6;
    this.prevDist     = Infinity;

    const pos = spawnAtEdge(canvasWidth, canvasHeight, this.width, this.height);
    this.x = pos.x; this.y = pos.y;
  }

  update(player, obstacles) {
    const cx  = this.x + this.width  / 2;
    const cy  = this.y + this.height / 2;
    const pcx = player.x + player.width  / 2;
    const pcy = player.y + player.height / 2;
    const toDx  = pcx - cx;
    const toDy  = pcy - cy;
    const toDist = Math.sqrt(toDx * toDx + toDy * toDy);

    if (this.state === 'tracking') {
      // slowly close in while telegraphing
      if (toDist > 0) {
        this.x += (toDx / toDist) * this.trackSpeed;
        this.y += (toDy / toDist) * this.trackSpeed;
      }
      this.trackTimer++;
      // flash warning in the last 30 frames before charging
      if (this.trackTimer >= 90) {
        // lock direction and charge
        const len = toDist > 0 ? toDist : 1;
        this.chargeVx   = (toDx / len) * this.chargeSpeed;
        this.chargeVy   = (toDy / len) * this.chargeSpeed;
        this.prevDist   = toDist;
        this.state      = 'charging';
        this.trackTimer = 0;
      }
    } else if (this.state === 'charging') {
      this.x += this.chargeVx;
      this.y += this.chargeVy;

      // detect miss: distance to original target is now increasing
      const chargedCx = this.x + this.width  / 2;
      const chargedCy = this.y + this.height / 2;
      const dx = pcx - chargedCx; // re-measure to player (not locked target)
      const dy = pcy - chargedCy;
      const nowDist = Math.sqrt(dx * dx + dy * dy);

      // also recover if we hit a wall (handled below) or traveled past target
      if (nowDist > this.prevDist + 10) {
        this.state        = 'recovering';
        this.recoverTimer = 0;
      }
      this.prevDist = nowDist;
    } else if (this.state === 'recovering') {
      this.recoverTimer++;
      if (this.recoverTimer >= 70) {
        this.state      = 'tracking';
        this.trackTimer = 0;
        this.prevDist   = Infinity;
      }
    }

    // obstacle collision — interrupt charge
    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) {
        resolveCollision(this, obs);
        if (this.state === 'charging') {
          this.state        = 'recovering';
          this.recoverTimer = 0;
        }
      }
    }

    if (rectsOverlap(this, player)) player.takeDamage(35);
  }

  draw(ctx) { drawDinosaur(ctx, this); }
}

class Skeleton {
  constructor(canvasWidth, canvasHeight) {
    this.width  = 28;
    this.height = 28;
    this.speed  = 1.2;
    this.hp     = 40;
    this.maxHp  = 40;
    this.color  = '#d8d8d8';
    this.dead   = false;

    this.state          = 'seeking'; // 'seeking' | 'aiming' | 'shooting'
    this.aimTimer       = 0;
    this.fireTimer      = 0;
    this.detectionRange = 300;
    this.preferredDist  = 190;

    const pos = spawnAtEdge(canvasWidth, canvasHeight, this.width, this.height);
    this.x = pos.x; this.y = pos.y;
  }

  update(player, obstacles) {
    const cx   = this.x + this.width  / 2;
    const cy   = this.y + this.height / 2;
    const pcx  = player.x + player.width  / 2;
    const pcy  = player.y + player.height / 2;
    const dx   = pcx - cx;
    const dy   = pcy - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx   = dist > 0 ? dx / dist : 0;
    const ny   = dist > 0 ? dy / dist : 0;

    let arrow = null;

    if (this.state === 'seeking') {
      if (dist < this.detectionRange) {
        this.state    = 'aiming';
        this.aimTimer = 0;
      } else {
        this.x += nx * this.speed;
        this.y += ny * this.speed;
      }
    } else if (this.state === 'aiming') {
      // back away to maintain preferred distance
      if (dist < this.preferredDist) {
        this.x -= nx * this.speed;
        this.y -= ny * this.speed;
      }
      this.aimTimer++;
      if (dist > this.detectionRange) {
        this.state = 'seeking'; this.aimTimer = 0;
      } else if (this.aimTimer >= 180) {
        this.state = 'shooting'; this.fireTimer = 0;
      }
    } else if (this.state === 'shooting') {
      // keep backing away
      if (dist < this.preferredDist) {
        this.x -= nx * this.speed;
        this.y -= ny * this.speed;
      }
      if (dist > this.detectionRange) {
        this.state = 'seeking'; this.aimTimer = 0;
      } else {
        this.fireTimer++;
        if (this.fireTimer >= 60) {
          this.fireTimer = 0;
          arrow = new Arrow(cx, cy, pcx, pcy);
        }
      }
    }

    for (const obs of obstacles) {
      if (rectsOverlap(this, obs)) resolveCollision(this, obs);
    }

    return arrow;
  }

  draw(ctx) { drawSkeleton(ctx, this); }
}
