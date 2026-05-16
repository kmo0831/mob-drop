function drawLevelIntro(ctx, levelNum, themeName, timer, canvasWidth, canvasHeight) {
  const alpha = Math.min(1, timer / 20);          // fade in over 20 frames
  const fadeOut = timer < 30 ? timer / 30 : 1;   // fade out in last 30 frames
  ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha * fadeOut})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.globalAlpha = alpha * fadeOut;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffe040';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`LEVEL ${levelNum}`, canvasWidth / 2, canvasHeight / 2 - 30);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 42px monospace';
  ctx.fillText(themeName, canvasWidth / 2, canvasHeight / 2 + 20);

  ctx.fillStyle = '#aaa';
  ctx.font = '16px monospace';
  ctx.fillText('Rescue all 5 villagers!', canvasWidth / 2, canvasHeight / 2 + 60);

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawButton(ctx, label, cx, cy, w, h) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + 7);
  ctx.textAlign = 'left';
  return { x, y, width: w, height: h };
}

function drawLevelComplete(ctx, playerHp, levelNum, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#4f4';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Level Complete!', canvasWidth / 2, canvasHeight / 2 - 70);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`Score: ${playerHp} HP remaining`, canvasWidth / 2, canvasHeight / 2 - 20);

  ctx.font = '18px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText(`Level ${levelNum} of 10`, canvasWidth / 2, canvasHeight / 2 + 15);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Next Level ▶', canvasWidth / 2, canvasHeight / 2 + 75, 220, 44);
}

function drawGameOver(ctx, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.70)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#e33';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('You Died.', canvasWidth / 2, canvasHeight / 2 - 50);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Restart Level', canvasWidth / 2, canvasHeight / 2 + 20, 240, 44);
}

function drawYouWin(ctx, canvasWidth, canvasHeight) {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#ff0';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('You Win!', canvasWidth / 2, canvasHeight / 2 - 70);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('All 10 levels cleared!', canvasWidth / 2, canvasHeight / 2 - 15);
  ctx.textAlign = 'left';

  return drawButton(ctx, 'Play Again', canvasWidth / 2, canvasHeight / 2 + 60, 200, 44);
}

function drawHUD(ctx, player, savedCount, totalVillagers, levelNum, config) {
  // semi-transparent backing so HUD is readable on any theme
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(8, 8, 224, 28);

  // HP bar (top left)
  const barX = 16, barY = 16, barW = 180, barH = 18;
  const hpFrac = player.hp / player.maxHp;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('HP', barX, barY + barH - 3);

  ctx.fillStyle = '#500';
  ctx.fillRect(barX + 24, barY, barW, barH);
  ctx.fillStyle = hpFrac > 0.4 ? '#e33' : '#f80';
  ctx.fillRect(barX + 24, barY, barW * hpFrac, barH);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX + 24, barY, barW, barH);

  // Ammo + weapon (top right)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(ctx.canvas.width - 170, 8, 162, 50);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Ammo: ${player.ammo}`, ctx.canvas.width - 16, 30);
  ctx.fillText(player.currentWeapon.name, ctx.canvas.width - 16, 50);
  ctx.textAlign = 'left';

  // Level indicator (top center)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  const lvlLabel = `Level ${levelNum} — ${config.theme}`;
  ctx.font = '13px monospace';
  const lvlW = ctx.measureText(lvlLabel).width + 16;
  ctx.fillRect(ctx.canvas.width / 2 - lvlW / 2, 8, lvlW, 22);
  ctx.fillStyle = '#ddd';
  ctx.textAlign = 'center';
  ctx.fillText(lvlLabel, ctx.canvas.width / 2, 23);
  ctx.textAlign = 'left';

  // Villager counter (bottom center)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(ctx.canvas.width / 2 - 110, ctx.canvas.height - 34, 220, 26);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Villagers: ${savedCount} / ${totalVillagers}`, ctx.canvas.width / 2, ctx.canvas.height - 15);
  ctx.textAlign = 'left';
}
