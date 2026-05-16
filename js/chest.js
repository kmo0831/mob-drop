class Chest {
  constructor(type, canvasWidth, canvasHeight, obstacles, existing) {
    this.type      = type; // 'ammo' | 'weapon'
    this.width     = 24;
    this.height    = 24;
    this.collected = false;

    // place randomly, avoiding obstacles and other chests
    let placed = false;
    while (!placed) {
      this.x = 40 + Math.random() * (canvasWidth  - 80);
      this.y = 40 + Math.random() * (canvasHeight - 80);
      placed = true;
      for (const obs of obstacles) {
        if (rectsOverlap(
          { x: this.x - 8, y: this.y - 8, width: this.width + 16, height: this.height + 16 },
          obs
        )) { placed = false; break; }
      }
      if (placed) {
        for (const other of existing) {
          if (rectsOverlap(
            { x: this.x - 16, y: this.y - 16, width: this.width + 32, height: this.height + 32 },
            other
          )) { placed = false; break; }
        }
      }
    }
  }

  collect(player) {
    if (this.collected || !rectsOverlap(this, player)) return;
    this.collected = true;
    if (this.type === 'ammo') {
      player.ammo += 30;
    } else if (this.type === 'weapon') {
      player.ammo += 20;
      if (this.weaponName) player.unlockWeapon(this.weaponName);
    }
  }

  draw(ctx) {
    if (this.collected) return;
    drawChest(ctx, this);
  }
}
