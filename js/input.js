const keys = {};
const mouse = { x: 0, y: 0, down: false, justClicked: false };

window.addEventListener('keydown', e => { keys[e.key] = true;  resumeAudio(); });
window.addEventListener('keyup',   e => { keys[e.key] = false; });

window.addEventListener('mousemove', e => {
  const canvas = document.getElementById('gameCanvas');
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

window.addEventListener('mousedown', e => { if (e.button === 0) { mouse.down = true; mouse.justClicked = true; } resumeAudio(); });
window.addEventListener('mouseup',   e => { if (e.button === 0) mouse.down = false; });
