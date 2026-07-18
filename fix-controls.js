const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Add volume logic below playBtn logic (around line 1148)
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

if (!scriptJs.includes('Volume Controls Logic')) {
  scriptJs = scriptJs.replace(/if \(wrapper\) \{/, `${volumeLogic}\n  if (wrapper) {`);
}

// 2. Fix timestamp logic
const oldTimeUpdate = `      vid.addEventListener('timeupdate', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        
        const currentTimeEl = document.getElementById('currentTime');
        const durationTimeEl = document.getElementById('durationTime');
        
        if (e.target.duration) {
          if (progress) {
            const p = (e.target.currentTime / e.target.duration) * 100;
            progress.style.width = p + '%';
          }
          
          if (currentTimeEl && durationTimeEl) {
            const formatTime = (time) => {
              const mins = Math.floor(time / 60);
              const secs = Math.floor(time % 60);
              return \`\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
            };
            currentTimeEl.textContent = formatTime(e.target.currentTime);
            durationTimeEl.textContent = formatTime(e.target.duration);
          }
        }
      });`;

const newTimeUpdate = `      const updateTimeUI = (video) => {
        const currentTimeEl = document.getElementById('currentTime');
        const durationTimeEl = document.getElementById('durationTime');
        const d = video.duration;
        const c = video.currentTime;
        
        if (!isNaN(d) && d > 0) {
          if (progress) {
            const p = (c / d) * 100;
            progress.style.width = p + '%';
          }
          if (currentTimeEl && durationTimeEl) {
            const formatTime = (time) => {
              if (isNaN(time)) return '0:00';
              const mins = Math.floor(time / 60);
              const secs = Math.floor(time % 60);
              return \`\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
            };
            currentTimeEl.textContent = formatTime(c);
            durationTimeEl.textContent = formatTime(d);
          }
        }
      };

      vid.addEventListener('loadedmetadata', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        updateTimeUI(e.target);
      });

      vid.addEventListener('timeupdate', (e) => {
        if (e.target.parentElement && e.target.parentElement.classList.contains('carousel-video-item') && !e.target.parentElement.classList.contains('active')) return;
        updateTimeUI(e.target);
      });`;

scriptJs = scriptJs.replace(oldTimeUpdate, newTimeUpdate);

fs.writeFileSync('script.js', scriptJs);
console.log("Fixes applied successfully");
