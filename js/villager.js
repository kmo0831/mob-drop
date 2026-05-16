const RESCUE_FRAMES = 180; // 3 seconds at 60fps
const RESCUE_RANGE  = 60;  // pixels from center to center

class Villager {
  constructor(canvasWidth, canvasHeight, obstacles) {
    this.width  = 24;
    this.height = 24;
    this.color  = '#f5a623';
    this.rescued = false;
    this.rescueProgress = 0;

    // place randomly, retrying until clear of obstacles
    let placed = false;
    while (!placed) {
      this.x = 40 + Math.random() * (canvasWidth  - 80);
      this.y = 40 + Math.random() * (canvasHeight - 80);
      placed = true;
      for (const obs of obstacles) {
        if (rectsOverlap(
          { x: this.x - 10, y: this.y - 10, width: this.width + 20, height: this.height + 20 },
          obs
        )) {
          placed = false;
          break;
        }
      }
    }
  }

  update(player) {
    if (this.rescued) return;

    const cx = this.x + this.width  / 2;
    const cy = this.y + this.height / 2;
    const px = player.x + player.width  / 2;
    const py = player.y + player.height / 2;
    const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);

    const inRange      = dist < RESCUE_RANGE;
    const holdingE     = keys['e'] || keys['E'];
    const touchHolding = touch.villagerTarget === this;

    if (inRange && (holdingE || touchHolding) && !player.tookDamageThisFrame) {
      this.rescueProgress++;
      if (this.rescueProgress >= RESCUE_FRAMES) {
        this.rescued = true;
      }
    } else {
      this.rescueProgress = 0;
    }
  }

  draw(ctx) {
    if (this.rescued) return;

    drawVillager(ctx, this);

    // rescue progress bar
    if (this.rescueProgress > 0) {
      const barW = 40;
      const barX = this.x + this.width / 2 - barW / 2;
      const barY = this.y - 12;
      const frac = this.rescueProgress / RESCUE_FRAMES;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, 6);
      ctx.fillStyle = '#4f4';
      ctx.fillRect(barX, barY, barW * frac, 6);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, 6);
    } else {
      // small "E" hint when player is close
      ctx.fillStyle = '#fff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E]', this.x + this.width / 2, this.y - 4);
      ctx.textAlign = 'left';
    }
  }
}
