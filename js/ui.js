function drawLevelIntro(ctx, levelNum, themeName, timer, canvasWidth, canvasHeight) {
  const alpha = Math.min(1, timer / 20);
  const fadeOut = timer < 30 ? timer / 30 : 1;
  ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha * fadeOut})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.globalAlpha = alpha * fadeOut;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffe040';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`LEVEL ${levelNum}`, canvasWidth / 2, canvasHeight / 2 - 30);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px monospace';
  ctx.fillText(themeName, canvasWidth / 2, canvasHeight / 2 + 20);

  ctx.fillStyle = '#aaa';
  ctx.font = '20px monospace';
  ctx.fillText('Rescue all 5 villagers!', canvasWidth / 2, canvasHeight / 2 + 65);

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawButton(ctx, label, cx, cy, w, h) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + 7);
  ctx.textAlign = 'left';
  return { x, y, width: w, height: h };
}

function drawLevelComplete(ctx, playerHp, levelNum, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#4f4';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Level Complete!', canvasWidth / 2, canvasHeight / 2 - 70);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`Score: ${playerHp} HP remaining`, canvasWidth / 2, canvasHeight / 2 - 15);

  ctx.font = '20px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`Level ${levelNum} of 10`, canvasWidth / 2, canvasHeight / 2 + 20);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Next Level ▶', canvasWidth / 2, canvasHeight / 2 + 85, 240, 52);
}

function drawGameOver(ctx, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.70)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#e33';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('You Died.', canvasWidth / 2, canvasHeight / 2 - 50);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Restart Level', canvasWidth / 2, canvasHeight / 2 + 28, 260, 52);
}

function drawYouWin(ctx, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#ff0';
  ctx.font = 'bold 56px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('You Win!', canvasWidth / 2, canvasHeight / 2 - 70);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('All 10 levels cleared!', canvasWidth / 2, canvasHeight / 2 - 10);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Play Again', canvasWidth / 2, canvasHeight / 2 + 68, 220, 52);
}

function drawHUD(ctx, player, savedCount, totalVillagers, levelNum, config) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;

  // HP bar (top left)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(8, 8, 248, 36);

  const barX = 16, barY = 14, barW = 196, barH = 22;
  const hpFrac = player.hp / player.maxHp;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('HP', barX, barY + barH - 3);

  ctx.fillStyle = '#500';
  ctx.fillRect(barX + 28, barY, barW, barH);
  ctx.fillStyle = hpFrac > 0.4 ? '#e33' : '#f80';
  ctx.fillRect(barX + 28, barY, barW * hpFrac, barH);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX + 28, barY, barW, barH);

  // Ammo + weapon name (top right)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(cw - 188, 8, 180, 58);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Ammo: ${player.ammo}`, cw - 16, 32);
  ctx.fillText(player.currentWeapon.name, cw - 16, 54);
  ctx.textAlign = 'left';

  // Level indicator (top center)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  const lvlLabel = `Level ${levelNum} — ${config.theme}`;
  ctx.font = '16px monospace';
  const lvlW = ctx.measureText(lvlLabel).width + 20;
  ctx.fillRect(cw / 2 - lvlW / 2, 8, lvlW, 28);
  ctx.fillStyle = '#ddd';
  ctx.textAlign = 'center';
  ctx.fillText(lvlLabel, cw / 2, 27);
  ctx.textAlign = 'left';

  // Villager counter (bottom center)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(cw / 2 - 124, ch - 38, 248, 30);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 19px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Villagers: ${savedCount} / ${totalVillagers}`, cw / 2, ch - 16);
  ctx.textAlign = 'left';
}

// Returns the button rect so game.js can hit-test it
function drawWeaponSwitcher(ctx, player) {
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const margin = 12;
  const btnW = 140, btnH = 52;
  const x = cw - btnW - margin;
  const y = ch - btnH - margin - 38; // above villager counter

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x, y, btnW, btnH);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, btnW, btnH);

  ctx.fillStyle = '#aaa';
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WEAPON ▶', x + btnW / 2, y + 17);

  ctx.fillStyle = '#ffe040';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(player.currentWeapon.name, x + btnW / 2, y + 37);
  ctx.textAlign = 'left';

  return { x, y, width: btnW, height: btnH };
}
