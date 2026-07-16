const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const helperLogic = `function applyIntrinsicRatio(video) {
  if (!video) return;
  const container = document.getElementById('videoModalContainer');
  if (!container) return;
  
  if (video.readyState >= 1 && video.videoWidth && video.videoHeight) {
    const ratio = video.videoWidth / video.videoHeight;
    container.style.setProperty('--dynamic-ratio', ratio);
  } else {
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        const ratio = video.videoWidth / video.videoHeight;
        container.style.setProperty('--dynamic-ratio', ratio);
      }
    }, { once: true });
  }
}

let currentPlaylist = [];`;

scriptJs = scriptJs.replace('let currentPlaylist = [];', helperLogic);

const openModalReplacement = `  // Apply intrinsic ratio on metadata load
  applyIntrinsicRatio(mv);
  
  mv.addEventListener('error', () => {`;

scriptJs = scriptJs.replace(/\/\/ Apply intrinsic ratio on metadata load[\s\S]*?mv\.addEventListener\('error', \(\) => \{/, openModalReplacement);

// Now update playNext
const playNextReplacement = `        if (oldNext) {
          oldNext.className = 'carousel-video-item active';
          const newActiveVid = oldNext.querySelector('video');
          if (newActiveVid) applyIntrinsicRatio(newActiveVid);
        }`;
scriptJs = scriptJs.replace(/if \(oldNext\) oldNext\.className = 'carousel-video-item active';/, playNextReplacement);

// Now update playPrev
const playPrevReplacement = `        if (oldPrev) {
          oldPrev.className = 'carousel-video-item active';
          const newActiveVid = oldPrev.querySelector('video');
          if (newActiveVid) applyIntrinsicRatio(newActiveVid);
        }`;
scriptJs = scriptJs.replace(/if \(oldPrev\) oldPrev\.className = 'carousel-video-item active';/, playPrevReplacement);

fs.writeFileSync('script.js', scriptJs);
console.log('Injected intrinsic ratio logic');
