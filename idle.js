const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const idleCode = `
  // Idle Timer Logic for Player Controls
  let idleTimer;
  const controlsOverlay = document.getElementById('playerControls');
  
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (controlsOverlay) controlsOverlay.classList.remove('idle-hidden');
    
    const activeVideo = document.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
    if (activeVideo && !activeVideo.paused) {
      idleTimer = setTimeout(() => {
        if (controlsOverlay) controlsOverlay.classList.add('idle-hidden');
      }, 2500);
    }
  }

  const modalContainer = document.getElementById('videoModalContainer');
  if (modalContainer) {
    modalContainer.addEventListener('mousemove', resetIdleTimer);
    modalContainer.addEventListener('touchstart', resetIdleTimer, {passive: true});
    modalContainer.addEventListener('click', resetIdleTimer);
  }

  // Hook into video play/pause
  const allModalVids = document.querySelectorAll('.carousel-video-item video');
  allModalVids.forEach(v => {
    v.addEventListener('play', resetIdleTimer);
    v.addEventListener('pause', () => {
      clearTimeout(idleTimer);
      if (controlsOverlay) controlsOverlay.classList.remove('idle-hidden');
    });
  });
`;

if (!scriptJs.includes('idleTimer')) {
  scriptJs = scriptJs.replace(/const nextBtn = document.getElementById\('playlistNextBtn'\);/, "const nextBtn = document.getElementById('playlistNextBtn');\n" + idleCode);
  fs.writeFileSync('script.js', scriptJs);
  console.log("Injected idle timer successfully");
} else {
  console.log("Already injected");
}
