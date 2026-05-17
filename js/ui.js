// ── Level intro overlay ───────────────────────────────────────────────────────

function drawLevelIntro(ctx, levelNum, themeName, timer, canvasWidth, canvasHeight) {
  const alpha   = Math.min(1, timer / 20);
  const fadeOut = timer < 30 ? timer / 30 : 1;
  ctx.fillStyle = `rgba(0,0,0,${0.65 * alpha * fadeOut})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.globalAlpha = alpha * fadeOut;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffe040';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`LEVEL ${levelNum}`, canvasWidth / 2, canvasHeight / 2 - 36);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px monospace';
  ctx.fillText(themeName, canvasWidth / 2, canvasHeight / 2 + 18);

  ctx.fillStyle = '#aaa';
  ctx.font = '18px monospace';
  ctx.fillText('Save all 5 villagers to advance.', canvasWidth / 2, canvasHeight / 2 + 62);

  // Skip hint fades in after the first second
  if (timer < 90) {
    const hintAlpha = Math.min(1, (90 - timer) / 20);
    ctx.globalAlpha = hintAlpha * fadeOut;
    ctx.fillStyle = '#555';
    ctx.font = '13px monospace';
    ctx.fillText(isMobile ? 'tap to skip' : 'click to skip', canvasWidth / 2, canvasHeight / 2 + 100);
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ── Shared button helper ──────────────────────────────────────────────────────

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

// ── Gameplay overlays ─────────────────────────────────────────────────────────

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

// ── HUD ───────────────────────────────────────────────────────────────────────

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
  const y = ch - btnH - margin - 38;

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

// ── Title screen ──────────────────────────────────────────────────────────────

function drawTitleScreen(ctx, cw, ch) {
  ctx.textAlign = 'center';

  // Decorative enemy-color pixel blocks — hint at who's waiting inside
  const blocks = [
    { c: '#4af'    }, // player
    { c: '#3a7a3a' }, // zombie
    { c: '#7a2d8c' }, // spider
    { c: '#d8d8d8' }, // skeleton
    { c: '#2d7a2d' }, // creeper
    { c: '#7a6030' }, // dinosaur
  ];
  const bS = 20, bGap = 10;
  const rowW = blocks.length * bS + (blocks.length - 1) * bGap;
  let bx = cw / 2 - rowW / 2;
  const by = 42;
  for (const b of blocks) {
    ctx.fillStyle = '#111';
    ctx.fillRect(bx + 2, by + 2, bS, bS); // shadow
    ctx.fillStyle = b.c;
    ctx.fillRect(bx, by, bS, bS);
    bx += bS + bGap;
  }

  // Title — triple-layer pixel-art shadow effect
  ctx.font = 'bold 76px monospace';
  ctx.fillStyle = '#5a3000';
  ctx.fillText('MOB DROP', cw / 2 + 5, 118 + 5);
  ctx.fillStyle = '#a05010';
  ctx.fillText('MOB DROP', cw / 2 + 2, 118 + 2);
  ctx.fillStyle = '#ffe040';
  ctx.fillText('MOB DROP', cw / 2, 118);

  // Star decoration
  ctx.fillStyle = '#e33';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('★  ★  ★  ★  ★', cw / 2, 144);

  // Credits
  ctx.fillStyle = '#7df';
  ctx.font = '17px monospace';
  ctx.fillText('Created by Jonathan Moore & Mama Moore', cw / 2, 174);

  // Separator
  ctx.fillStyle = '#333';
  ctx.fillRect(cw / 2 - 220, 188, 440, 2);

  // How to play header
  ctx.fillStyle = '#ffe040';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('— HOW TO PLAY —', cw / 2, 214);

  // Controls — mobile or desktop, never both
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';
  if (isMobile) {
    ctx.fillText('Tap & drag anywhere to move',          cw / 2, 242);
    ctx.fillText('Tap an enemy to shoot',                cw / 2, 265);
    ctx.fillText('Tap & hold a villager to rescue',      cw / 2, 288);
    ctx.fillText('Tap the weapon button to switch',      cw / 2, 311);
  } else {
    ctx.fillText('WASD or Arrow keys to move',           cw / 2, 242);
    ctx.fillText('Mouse to aim  •  Click to shoot',      cw / 2, 265);
    ctx.fillText('Hold E near a villager to rescue',     cw / 2, 288);
    ctx.fillText('1 – 5 keys to switch weapons',         cw / 2, 311);
  }

  // Separator
  ctx.fillStyle = '#333';
  ctx.fillRect(cw / 2 - 220, 328, 440, 2);

  // Mission statement
  ctx.fillStyle = '#aaa';
  ctx.font = '16px monospace';
  ctx.fillText('Save all 5 villagers to advance to the next level', cw / 2, 352);

  // Play button — green, oversized for visibility
  const btnW = 240, btnH = 56;
  const btnX = cw / 2 - btnW / 2;
  const btnY = 430;
  ctx.fillStyle = '#1a5c1a';
  ctx.fillRect(btnX + 4, btnY + 4, btnW, btnH); // shadow
  ctx.fillStyle = '#4f4';
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('▶  PLAY', cw / 2, btnY + 37);

  ctx.textAlign = 'left';
  return { x: btnX, y: btnY, width: btnW, height: btnH };
}

// ── Credits screen ────────────────────────────────────────────────────────────

const _CREDIT_LINES = [
  { t: '— GAME DESIGN —',                       c: '#ffe040', f: 'bold 20px monospace', g: 44 },
  { t: 'Chief Villain Designer',                 c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Jonathan Moore',                         c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Director of Impossible Ideas',           c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Jonathan Moore',                         c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Head of "Add More Zombies"',             c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Jonathan Moore',                         c: '#7df',   f: 'bold 18px monospace', g: 68 },
  { t: '— PROGRAMMING —',                       c: '#ffe040', f: 'bold 20px monospace', g: 44 },
  { t: 'Lead Code Witch',                        c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Mama Moore',                             c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Chief Bug Introducer',                   c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Mama Moore',                             c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Director of "Why Isn\'t This Working"',  c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Mama Moore',                             c: '#7df',   f: 'bold 18px monospace', g: 68 },
  { t: '— SPECIAL THANKS —',                    c: '#ffe040', f: 'bold 20px monospace', g: 44 },
  { t: 'Head of Snack Provision',                c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Jonathan Moore',                         c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Executive Coffee Consumer',              c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Mama Moore',                             c: '#7df',   f: 'bold 18px monospace', g: 52 },
  { t: 'Professional Ctrl+Z Operator',           c: '#aaa',   f: '15px monospace',      g: 24 },
  { t: 'Mama Moore',                             c: '#7df',   f: 'bold 18px monospace', g: 72 },
  { t: '★  Thanks for playing!  ★',             c: '#4f4',   f: 'bold 22px monospace', g: 28 },
  { t: 'Made with love in 2026',                 c: '#444',   f: '14px monospace',      g: 120},
];

// Total advance of all credit lines (used to detect when they've scrolled past)
const _CREDITS_TOTAL_H = _CREDIT_LINES.reduce((s, l) => s + l.g, 0);

const _CREDITS_SCROLL_SPEED = 2; // canvas pixels per frame

function drawCreditsScreen(ctx, cw, ch, timer) {
  ctx.textAlign = 'center';

  // Static congratulations header
  ctx.fillStyle = '#ff0';
  ctx.font = 'bold 58px monospace';
  // Shadow
  ctx.fillStyle = '#6a6000';
  ctx.fillText('★  YOU WIN!  ★', cw / 2 + 3, 72 + 3);
  ctx.fillStyle = '#ff0';
  ctx.fillText('★  YOU WIN!  ★', cw / 2, 72);

  ctx.fillStyle = '#4f4';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('Congratulations! All 10 levels cleared!', cw / 2, 108);

  ctx.fillStyle = '#fff';
  ctx.font = '17px monospace';
  ctx.fillText('You rescued every single villager.', cw / 2, 132);

  // Separator
  ctx.fillStyle = '#333';
  ctx.fillRect(cw / 2 - 240, 148, 480, 2);

  // Scrolling credits — clipped below separator
  const clipTop = 156;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, clipTop, cw, ch - clipTop);
  ctx.clip();

  const scrollOffset = timer * _CREDITS_SCROLL_SPEED;
  let y = ch - scrollOffset; // first line starts at bottom of canvas and scrolls up

  for (const line of _CREDIT_LINES) {
    if (y > clipTop - 30 && y < ch + 30) { // only draw if near visible range
      ctx.fillStyle = line.c;
      ctx.font = line.f;
      ctx.fillText(line.t, cw / 2, y);
    }
    y += line.g;
  }

  ctx.restore();
  ctx.textAlign = 'left';

  // Play Again button appears once all credits have scrolled off the top
  // Last line bottom = ch - scrollOffset + _CREDITS_TOTAL_H
  // Done when last line < clipTop: ch - scrollOffset + _CREDITS_TOTAL_H < clipTop
  // → scrollOffset > ch + _CREDITS_TOTAL_H - clipTop
  const donePx = ch + _CREDITS_TOTAL_H - clipTop;
  if (scrollOffset > donePx) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe040';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('Thanks for playing, Jonathan!', cw / 2, ch / 2 - 30);
    ctx.textAlign = 'left';
    return drawButton(ctx, 'Play Again', cw / 2, ch / 2 + 40, 220, 52);
  }

  return null;
}
