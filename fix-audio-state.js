const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Inject ReelAudioManager class at the top, just below ReelControlsManager
const managerRegex = /(class ReelControlsManager \{[\s\S]*?\n\}\n)/;

const audioManagerClass = `
class ReelAudioManager {
  constructor(volumeBtnElement, volumeBarElement) {
    this.volumeBtn = volumeBtnElement;
    this.volumeBar = volumeBarElement;
    
    this.muted = sessionStorage.getItem('reelMuted') === 'false' ? false : true;
    this.volume = parseFloat(sessionStorage.getItem('reelVolume'));
    if (isNaN(this.volume)) this.volume = 1.0;
    
    this.lastVolume = parseFloat(sessionStorage.getItem('reelLastVolume'));
    if (isNaN(this.lastVolume)) this.lastVolume = 1.0;
    
    this.activeVideo = null;
  }

  savePreference() {
    sessionStorage.setItem('reelMuted', this.muted);
    sessionStorage.setItem('reelVolume', this.volume);
    sessionStorage.setItem('reelLastVolume', this.lastVolume);
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (this.muted && this.volume > 0) {
      this.lastVolume = this.volume;
      this.volume = 0;
    } else if (!this.muted && this.volume === 0) {
      this.volume = this.lastVolume || 1.0;
    }
    this.savePreference();
    if (this.activeVideo) {
      this.activeVideo.muted = this.muted;
      this.activeVideo.volume = this.volume;
    }
    this.updateUI();
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  setVolume(value) {
    let val = Math.max(0, Math.min(1, value));
    this.volume = val;
    this.muted = (val === 0);
    if (!this.muted) {
      this.lastVolume = val;
    }
    this.savePreference();
    if (this.activeVideo) {
      this.activeVideo.muted = this.muted;
      this.activeVideo.volume = this.volume;
    }
    this.updateUI();
  }

  syncAudioState(videoElement) {
    this.activeVideo = videoElement;
    if (this.activeVideo) {
      this.activeVideo.muted = this.muted;
      this.activeVideo.volume = this.volume;
    }
    this.updateUI();
  }

  updateUI() {
    if (!this.volumeBtn) return;
    const vHigh = this.volumeBtn.querySelector('.volume-high');
    const vMuted = this.volumeBtn.querySelector('.volume-muted');
    
    if (this.muted || this.volume === 0) {
      if (vHigh) vHigh.style.display = 'none';
      if (vMuted) vMuted.style.display = 'block';
      if (this.volumeBar) this.volumeBar.style.width = '0%';
    } else {
      if (vHigh) vHigh.style.display = 'block';
      if (vMuted) vMuted.style.display = 'none';
      if (this.volumeBar) this.volumeBar.style.width = (this.volume * 100) + '%';
    }
  }
}
`;

scriptJs = scriptJs.replace(managerRegex, '$1' + audioManagerClass);

// 2. Remove old volume logic in initVideoModal
const oldVolumeLogic = /  \/\/ Volume Controls Logic[\s\S]*?if \(volumeBar\) volumeBar\.style\.width = \(pos \* 100\) \+ '%';\n    \}\);\n  \}\n/g;
scriptJs = scriptJs.replace(oldVolumeLogic, '');

// 3. Instantiate ReelAudioManager alongside ReelControlsManager
const controlsManagerRegex = /  window\.currentReelControlsManager\.transitionTo\('Opening'\);\n/g;
const instantiation = `  window.currentReelControlsManager.transitionTo('Opening');
  
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeBar = document.getElementById('volumeBar');
  const volumeTrack = document.querySelector('.volume-track');
  
  window.currentReelAudioManager = new ReelAudioManager(volumeBtn, volumeBar);
  
  if (volumeBtn) {
    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.currentReelAudioManager.toggleMute();
    });
  }
  
  if (volumeTrack) {
    volumeTrack.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = volumeTrack.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      window.currentReelAudioManager.setVolume(pos);
    });
  }
`;
scriptJs = scriptJs.replace(controlsManagerRegex, instantiation);


// 4. Hook syncAudioState into playNext
const playNextHook = /        if \(oldNext\) \{\n          oldNext\.className = 'carousel-video-item active';\n          const newActiveVid = oldNext\.querySelector\('video'\);\n          if \(newActiveVid\) applyIntrinsicRatio\(newActiveVid\);\n        \}/g;
const newPlayNextHook = `        if (oldNext) {
          oldNext.className = 'carousel-video-item active';
          const newActiveVid = oldNext.querySelector('video');
          if (newActiveVid) {
            window.currentReelAudioManager?.syncAudioState(newActiveVid);
            applyIntrinsicRatio(newActiveVid);
          }
        }`;
scriptJs = scriptJs.replace(playNextHook, newPlayNextHook);

// 5. Hook syncAudioState into playPrev
const playPrevHook = /        if \(oldPrev\) \{\n          oldPrev\.className = 'carousel-video-item active';\n          const newActiveVid = oldPrev\.querySelector\('video'\);\n          if \(newActiveVid\) applyIntrinsicRatio\(newActiveVid\);\n        \}/g;
const newPlayPrevHook = `        if (oldPrev) {
          oldPrev.className = 'carousel-video-item active';
          const newActiveVid = oldPrev.querySelector('video');
          if (newActiveVid) {
            window.currentReelAudioManager?.syncAudioState(newActiveVid);
            applyIntrinsicRatio(newActiveVid);
          }
        }`;
scriptJs = scriptJs.replace(playPrevHook, newPlayPrevHook);

// 6. Hook syncAudioState into window.openModal
const openModalHook = /  const appendHash = \(url\) => url\.includes\('#t='\) \? url : url \+ '#t=0\.5';\n  mv\.src = appendHash\(src\);\n/g;
const newOpenModalHook = `  const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
  mv.src = appendHash(src);
  if (window.currentReelAudioManager) {
    window.currentReelAudioManager.syncAudioState(mv);
  }
`;
scriptJs = scriptJs.replace(openModalHook, newOpenModalHook);

// 7. Cleanup in closeModal
const closeModalHook = /    window\.currentReelControlsManager = null;\n  \}/g;
const newCloseModalHook = `    window.currentReelControlsManager = null;
  }
  window.currentReelAudioManager = null;`;
scriptJs = scriptJs.replace(closeModalHook, newCloseModalHook);


fs.writeFileSync('script.js', scriptJs);
console.log("Audio state manager injected");
