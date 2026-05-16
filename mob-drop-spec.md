# Mob Drop — Game Spec for Claude Code

## Overview
A top-down real-time action game built in vanilla HTML, CSS, and JavaScript (no frameworks). Inspired by the tone and creature culture of Minecraft and Fortnite. The player is a character trying to save villagers scattered across 10 levels while avoiding or fighting increasingly dangerous enemies.

---

## Tech Stack
- Vanilla HTML5, CSS3, JavaScript
- HTML5 Canvas for rendering
- No frameworks, no build tools
- Single HTML file or lightweight multi-file structure (index.html, game.js, style.css)

---

## Core Game Loop
1. Player spawns on a single-screen map with obstacles, 5 villagers, and scattered chests
2. Enemies roam the map and attack the player on contact or from range
3. Player must reach each villager and hold **[E]** for 3 seconds to save them
4. Save all 5 villagers = level complete
5. HP reaches zero = level failed, player can restart the level
6. Score at end of level is based solely on remaining HP

---

## Win / Lose Conditions
- ✅ **Win:** Save all 5 villagers in the level
- ❌ **Lose:** Player HP reaches zero
- Enemies do **not** need to be killed to advance — but they make saving villagers much harder
- Player can restart a failed level from the beginning (HP resets to full)

---

## Player

### Stats
- Full HP restored at the start of every level
- Max HP stays constant across all levels (suggested: 100 HP)
- No leveling system — challenge comes from enemy and level design

### Movement
- WASD or arrow keys to move
- Top-down, 8-directional movement
- Player and enemies navigate around obstacles (basic pathfinding or steering)

### Saving Villagers
- Walk up to a villager and hold **[E]**
- A visible progress bar fills over 3 seconds
- If the player takes damage or moves away, the progress bar resets
- On success, the villager disappears and a counter increments (e.g. "Villagers Saved: 3/5")

### Weapons
- Press **[1–5]** or scroll wheel to switch between collected weapons
- All weapons share a **single ammo pool**
- Player starts with only the Pistol

| # | Weapon | Unlocks | Behavior |
|---|--------|---------|----------|
| 1 | Pistol | Start (50 ammo) | Single shot, moderate speed and damage |
| 2 | Shotgun | Level 3–4 chest | Spread of 5 bullets, high close-range damage, weak at range |
| 3 | Rifle | Level 5–6 chest | Single shot, long range, high damage, slow fire rate |
| 4 | Grenade Launcher | Level 7–8 chest | Explosive projectile with blast radius |
| 5 | Minigun | Level 9–10 chest | Rapid fire, large ammo capacity, short spin-up delay |

### Ammo
- Single shared ammo pool across all weapons
- Starting ammo: 50 (pistol)
- Ammo chests and weapon chests are scattered randomly on the map
- Weapon chests give: the weapon + a starting ammo bundle
- Ammo chests give: a flat ammo refill (suggested: +30 ammo)
- If ammo hits zero, all weapons are unusable until ammo is found

---

## Enemies

### Introduction Order
| Levels | Enemy | First Appearance |
|--------|-------|-----------------|
| 1–2 | Zombie | Level 1 |
| 3–4 | Spider | Level 3 |
| 5–6 | Skeleton | Level 5 |
| 7–8 | Creeper | Level 7 |
| 9–10 | Dinosaur | Level 9 |

All previous enemy types persist in later levels. Difficulty scales via higher enemy count, increased speed, and increased HP.

### Enemy Behaviors

#### Zombie
- Slow movement speed
- High HP (tankiest basic enemy)
- Walks directly toward the player in a straight line
- Deals damage on contact
- Strategy: Kite and shoot from a distance

#### Spider
- Fast movement speed, low HP
- Moves in erratic zigzag patterns toward the player
- Difficult to hit, deals damage on contact
- Strategy: Use shotgun at close range or lead shots

#### Skeleton
- Medium speed, medium HP
- Has a line-of-sight detection radius
- On detecting the player: waits 3 seconds, then starts shooting projectile arrows
- Actively backs away from the player to maintain distance while shooting
- If the player moves out of range or breaks line of sight, skeleton stops shooting and tries to reposition closer before shooting again
- Deals damage via projectile (arrow), not contact
- Strategy: Close the gap fast, use rifle to out-range them

#### Creeper
- Medium-slow speed, medium HP
- Walks silently toward the player
- On getting within proximity (~100px): starts a 3-second fuse timer
- Flashes visually (red/white alternating) as a warning during the fuse
- After 3 seconds it explodes regardless of player distance
- Explosion damages the player if within blast radius
- Creeper dies on explosion
- Does **not** damage villagers
- Strategy: Shoot before they get close, or run away before the explosion

#### Dinosaur
- Slow turn speed, high HP, massive damage
- Charges in a straight line toward the player's last known position
- If charge misses, it slows down and recalculates before charging again
- Deals very high damage on contact
- Strategy: Sidestep the charge, use minigun or grenade launcher

---

## Chests
- Randomly placed on the map each run
- Two types:
  - **Weapon Chest** (golden): Contains the next unlockable weapon + starter ammo. Only appears starting at the level that weapon unlocks.
  - **Ammo Chest** (silver): Contains a flat ammo refill (+30 ammo)
- Player walks over chest to collect it automatically
- Suggested count per level: 2–4 chests total (mix of types)

---

## Maps & Level Themes

Single-screen maps. Camera does not scroll. Each level has obstacles (trees, rocks, buildings) that both the player and enemies must navigate around.

| Levels | Theme | Environment Feel |
|--------|-------|-----------------|
| 1–2 | Bright Village | Warm colors, cottages, fences, daylight |
| 3–4 | Overgrown Fields | Greens and yellows, tall grass, scattered boulders |
| 5–6 | Dark Forest | Deep greens and blacks, dense trees, dim lighting |
| 7–8 | Swamp / Ruins | Muddy browns, broken walls, murky atmosphere |
| 9–10 | Dungeon / Volcanic | Dark grays, red lava accents, crumbling stone |

### Map Contents (Randomly Placed Each Run)
- 5 villagers
- 2–4 chests (weapon and/or ammo)
- 8–15 obstacles (trees, rocks, buildings depending on theme)
- Enemy spawn points (edges of screen or designated zones)

---

## Art Style
- **Pixel art** rendered on HTML5 Canvas
- Minecraft/Fortnite-inspired tone — serious but with personality
- Enemies: dark, moody, high-contrast sprites
- Environment & villagers: brighter, warmer, more colorful
- Use simple colored pixel rectangles/sprites as placeholders during build — swap for final sprites later
- UI is clean and minimal: HP bar, ammo counter, villager save counter, current weapon display

---

## UI & HUD
- **Top left:** HP bar (red fill, labeled "HP")
- **Top right:** Ammo counter (e.g. "Ammo: 34") + current weapon name
- **Bottom center:** Villager save progress (e.g. "Villagers: 2 / 5")
- **Rescue indicator:** Progress bar above villager while [E] is held
- **Level complete screen:** Shows remaining HP as score, "Next Level" button
- **Game over screen:** "You died. Restart Level?" button
- **Level intro:** Brief text overlay showing level number and theme name

---

## Suggested File Structure

```
mob-drop/
  index.html        — Game shell, canvas element, HUD elements
  style.css         — Base styles, HUD styling, screen overlays
  js/
    game.js         — Main game loop (requestAnimationFrame)
    player.js       — Player class (movement, shooting, rescue logic)
    enemy.js        — Base enemy class + subclasses per enemy type
    weapon.js       — Weapon definitions and ammo logic
    chest.js        — Chest class and pickup logic
    villager.js     — Villager class and rescue state
    map.js          — Map/level definitions, obstacle placement, theming
    renderer.js     — All canvas draw calls
    input.js        — Keyboard and mouse input handling
    collision.js    — AABB collision detection
    ui.js           — HUD updates, screen overlays
```

---

## Build Order (Recommended)

Follow these steps **one at a time**. Test in the browser after each step before moving to the next.

### Step 1 — First message to Claude
Paste this message first, followed by the entire contents of this spec:

> "I'm building a web game called Mob Drop. It was designed by my 8-year-old son and is inspired by Minecraft and Fortnite. I have a full spec document here. Read it carefully before we write any code — I'll be building this step by step."

---

### Step 2 — Project structure
> "Create the file and folder structure from the spec. Don't write any game logic yet — just create the empty files with comments describing what each file will contain."

---

### Step 3 — Canvas & game loop
> "Now build Step 1 from the build order: set up the HTML canvas at 960x640 and get a basic requestAnimationFrame game loop running with a black screen. Nothing else yet."

---

### Step 4 — Player movement
> "Build Step 2: add a player character as a colored rectangle that moves with WASD and arrow keys. Keep the player inside the canvas boundaries."

---

### Step 5 — Obstacles & collision
> "Build Step 3: add placeholder obstacles as gray rectangles on the map and make the player collide with them using AABB collision detection. Hardcode 6-8 obstacles for now."

---

### Step 6 — First enemy (Zombie)
> "Build Step 4: add the zombie enemy as a dark rectangle. It should spawn at a random edge of the screen, move slowly and directly toward the player, and deal 10 damage on contact. Show the player's HP bar in the top left."

---

### Step 7 — Shooting mechanic
> "Build Step 5: add the pistol. The player shoots with left click in the direction of the mouse cursor. Bullets travel in a straight line, disappear on hitting an obstacle or enemy, and deal damage to enemies. Show ammo count in the top right. Start with 50 ammo."

---

### Step 8 — Villagers & rescue mechanic
> "Build Step 6: place 5 villager rectangles randomly on the map avoiding obstacles. When the player holds E near a villager, show a progress bar above them that fills over 3 seconds. If the player moves away it resets. On success the villager disappears and the counter updates. Show 'Villagers: 0/5' on the HUD."

---

### Step 9 — Level complete & game over screens
> "Build Step 7: when all 5 villagers are saved, show a level complete screen with the player's remaining HP as their score and a 'Next Level' button. When HP hits zero, show a game over screen with a 'Restart Level' button."

---

### Step 10 — Chest system
> "Build Step 8: add chest pickups. Silver chests give +30 ammo. Golden chests give the shotgun weapon plus ammo. Place 2-3 randomly on the map avoiding obstacles. Player collects by walking over them."

---

### Step 11 — Spider enemy
> "Build Step 9a: add the spider enemy. It should be faster than the zombie and move in an erratic zigzag pattern toward the player. Low HP."

---

### Step 12 — Skeleton enemy
> "Build Step 9b: add the skeleton enemy. It detects the player within a certain range, backs away to maintain distance, waits 3 seconds then shoots an arrow projectile. If the player moves out of range it stops shooting and repositions."

---

### Step 13 — Creeper enemy
> "Build Step 9c: add the creeper enemy. It walks toward the player. When within 100px, start a 3-second fuse. Flash the creeper red and white as a warning. After 3 seconds it explodes regardless of distance, damaging the player if they're in the blast radius. Creepers do not damage villagers."

---

### Step 14 — Dinosaur enemy
> "Build Step 9d: add the dinosaur enemy. It charges in a straight line toward the player's last known position. If it misses, it slows and recalculates. High HP, massive contact damage."

---

### Step 15 — All 10 levels
> "Build Step 10: create all 10 levels. Each level should have a different visual theme per the spec — village, fields, forest, swamp, dungeon. Introduce enemies in the correct order: zombies only in levels 1-2, spiders added in 3-4, skeletons in 5-6, creepers in 7-8, dinosaurs in 9-10. Randomly place villagers and chests each run."

---

### Step 16 — Pixel art sprites
> "Replace all rectangle placeholders with pixel art sprites drawn on canvas using pixel-level draw calls. Style should feel Minecraft and Fortnite inspired — serious but with personality. No image files needed, draw everything with canvas."

---

### Step 17 — Level intro overlay
> "Add a level intro overlay that shows the level number and theme name for 2 seconds before gameplay starts."

---

### Step 18 — Sound effects
> "Add basic sound effects using the Web Audio API — a shoot sound, a damage sound, a rescue complete sound, and a level complete sound."

---

## General Tips When Prompting Claude

- **One step at a time.** Never ask it to build two steps at once.
- **Test in the browser after every step.** Catch bugs early before they stack up.
- **When something breaks:** paste the error message directly into Claude and say: *"I got this error — fix it without changing anything else."*
- **If it goes off script:** say *"Stop. Refer back to the spec I gave you at the start. Only do what I asked."*
- **Save your work** after each working step so you can roll back if a later step breaks something.

---

## Setting Up Your Files (One Time Only)

Before you start prompting, open Terminal and run these commands:

```
cd ~/Documents
mkdir mob-drop
cd mob-drop
touch index.html
touch style.css
mkdir js
touch js/game.js js/player.js js/enemy.js js/weapon.js js/chest.js js/villager.js js/map.js js/renderer.js js/input.js js/collision.js js/ui.js
```

Then open the **mob-drop** folder in VS Code, and open **index.html** in your browser to test after each step.
