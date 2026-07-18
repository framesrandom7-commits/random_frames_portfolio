const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const oldIdleLogic = /  let idleTimer;[\s\S]*?    modalContainer\.addEventListener\('click', resetIdleTimer\);\n  \}/g;

const newIdleLogic = `  let idleTimer;
  
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    const container = document.getElementById('videoModalContainer');
    if (container) container.classList.remove('idle');
    
    const activeVideo = document.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
    if (activeVideo && !activeVideo.paused) {
      idleTimer = setTimeout(() => {
        if (container) container.classList.add('idle');
      }, 2500);
    }
  }

  const modalContainer = document.getElementById('videoModalContainer');
  if (modalContainer) {
    modalContainer.addEventListener('mousemove', resetIdleTimer);
    modalContainer.addEventListener('touchstart', resetIdleTimer, {passive: true});
    modalContainer.addEventListener('click', resetIdleTimer);
  }`;

scriptJs = scriptJs.replace(oldIdleLogic, newIdleLogic);

// also fix the pause hook
const oldPauseHook = /    v\.addEventListener\('pause', \(\) => \{\n      clearTimeout\(idleTimer\);\n      if \(controlsOverlay\).*?\n      if \(prevBtn\).*?\n      if \(nextBtn\).*?\n      if \(closeBtn\).*?\n    \}\);/g;

const newPauseHook = `    v.addEventListener('pause', () => {
      clearTimeout(idleTimer);
      const container = document.getElementById('videoModalContainer');
      if (container) container.classList.remove('idle');
    });`;

scriptJs = scriptJs.replace(oldPauseHook, newPauseHook);

fs.writeFileSync('script.js', scriptJs);
console.log("Updated script.js to use parent .idle class");
