const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const keys = {};
const justPressedKeys = {};
const mouse = { x: 0, y: 0, down: false, justClicked: false };
const touch = { active: false, x: 0, y: 0, justTapped: false, tapX: 0, tapY: 0, villagerTarget: null };

function canvasCoords(clientX, clientY) {
  const c = document.getElementById('gameCanvas');
  const r = c.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (c.width  / r.width),
    y: (clientY - r.top)  * (c.height / r.height)
  };
}

window.addEventListener('keydown', e => {
  if (!keys[e.key]) justPressedKeys[e.key] = true;
  keys[e.key] = true;
  resumeAudio();
});
window.addEventListener('keyup', e => {
  keys[e.key] = false;
  justPressedKeys[e.key] = false;
});

window.addEventListener('mousemove', e => {
  const p = canvasCoords(e.clientX, e.clientY);
  mouse.x = p.x; mouse.y = p.y;
});
window.addEventListener('mousedown', e => {
  if (e.button === 0) { mouse.down = true; mouse.justClicked = true; }
  resumeAudio();
});
window.addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });

window.addEventListener('touchstart', e => {
  e.preventDefault();
  resumeAudio();
  const t = e.changedTouches[0];
  const p = canvasCoords(t.clientX, t.clientY);
  touch.x = p.x; touch.y = p.y;
  touch.tapX = p.x; touch.tapY = p.y;
  touch.active    = true;
  touch.justTapped = true;
  // mirror into mouse so UI overlay buttons (hitButton) work for touch too
  mouse.x = p.x; mouse.y = p.y;
  mouse.justClicked = true;
}, { passive: false });

window.addEventListener('touchmove', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  const p = canvasCoords(t.clientX, t.clientY);
  touch.x = p.x; touch.y = p.y;
  mouse.x = p.x; mouse.y = p.y;
}, { passive: false });

window.addEventListener('touchend', e => {
  e.preventDefault();
  touch.active        = false;
  touch.villagerTarget = null;
}, { passive: false });
