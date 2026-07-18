const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Remove the incorrectly placed Volume Controls Logic
const wrongLogicMatch = /\/\/ Volume Controls Logic[\s\S]*?if \(volumeBar\) volumeBar\.style\.width = \(pos \* 100\) \+ '%';\n    \}\);\n  \}\n/g;
scriptJs = scriptJs.replace(wrongLogicMatch, '');

// 2. Insert it correctly in initVideoModal(), right after playBtn logic
const volumeLogic = `
  // Volume Controls Logic
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeTrack = document.querySelector('.volume-track');
  const volumeBar = document.getElementById('volumeBar');
  
  if (volumeBtn) {
    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
      if (!activeVideo) return;
      activeVideo.muted = !activeVideo.muted;
      
      const vHigh = volumeBtn.querySelector('.volume-high');
      const vMuted = volumeBtn.querySelector('.volume-muted');
      
      if (activeVideo.muted || activeVideo.volume === 0) {
        if (vHigh) vHigh.style.display = 'none';
        if (vMuted) vMuted.style.display = 'block';
        if (volumeBar) volumeBar.style.width = '0%';
      } else {
        if (vHigh) vHigh.style.display = 'block';
        if (vMuted) vMuted.style.display = 'none';
        if (volumeBar) volumeBar.style.width = (activeVideo.volume * 100) + '%';
      }
    });
  }

  if (volumeTrack) {
    volumeTrack.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeVideo = modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo');
      if (!activeVideo) return;
      
      const rect = volumeTrack.getBoundingClientRect();
      let pos = (e.clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      
      activeVideo.volume = pos;
      activeVideo.muted = pos === 0;
      
      const vHigh = volumeBtn.querySelector('.volume-high');
      const vMuted = volumeBtn.querySelector('.volume-muted');
      if (activeVideo.muted) {
        if (vHigh) vHigh.style.display = 'none';
        if (vMuted) vMuted.style.display = 'block';
      } else {
        if (vHigh) vHigh.style.display = 'block';
        if (vMuted) vMuted.style.display = 'none';
      }
      
      if (volumeBar) volumeBar.style.width = (pos * 100) + '%';
    });
  }
`;

// Find `if (wrapper) {` that is inside initVideoModal
// It's right after `if (playBtn) { playBtn.addEventListener(...) }`
const insertionPointStr = `
  if (wrapper) {
    const allModalVideos = modal.querySelectorAll('.carousel-video-item video');`;
scriptJs = scriptJs.replace(insertionPointStr, `\n${volumeLogic}\n${insertionPointStr}`);

fs.writeFileSync('script.js', scriptJs);
console.log("Fixed volume script placement");
