const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Insert the ReelControlsManager class at the top of the file
const managerClass = `class ReelControlsManager {
  constructor(containerElement, interactiveElements = []) {
    this.container = containerElement;
    this.interactiveElements = interactiveElements;
    this.timer = null;
    this.state = 'Closed';
    this.IDLE_TIMEOUT = 500;
    
    this.handleInteraction = this.handleInteraction.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.container) {
      this.container.addEventListener('mousemove', this.handleInteraction);
      this.container.addEventListener('mouseenter', this.handleInteraction);
      this.container.addEventListener('mouseleave', this.handleInteraction);
      this.container.addEventListener('click', this.handleInteraction);
      this.container.addEventListener('touchstart', this.handleInteraction, { passive: true });
      this.container.addEventListener('touchmove', this.handleInteraction, { passive: true });
      this.container.addEventListener('keydown', this.handleKeydown);
      this.container.addEventListener('focusin', this.handleInteraction);
    }
  }

  transitionTo(newState) {
    if (this.state === 'Closed' && newState !== 'Opening') return;
    this.state = newState;
    this.evaluate();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.clearTimer();
      this.showControls();
    } else {
      this.evaluate();
    }
  }

  handleInteraction(e) {
    if (this.state === 'Closed') return;
    this.showControls();
    this.startTimerIfApplicable();
  }

  handleKeydown(e) {
    if (this.state === 'Closed') return;
    const wakeKeys = ['Tab', 'Escape', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'Enter'];
    if (wakeKeys.includes(e.key) || e.shiftKey) {
      this.showControls();
      this.startTimerIfApplicable();
    }
  }

  evaluate() {
    switch (this.state) {
      case 'Opening':
      case 'Paused':
      case 'Buffering':
      case 'Seeking':
      case 'Ended':
      case 'Error':
        this.clearTimer();
        this.showControls();
        break;
      case 'Playing':
        this.showControls();
        this.startTimerIfApplicable();
        break;
      case 'Closed':
        this.clearTimer();
        break;
    }
  }

  startTimerIfApplicable() {
    this.clearTimer();
    if (this.state === 'Playing' && !document.hidden) {
      this.timer = setTimeout(() => {
        this.hideControls();
      }, this.IDLE_TIMEOUT);
    }
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  showControls() {
    if (this.container) {
      this.container.classList.remove('idle');
    }
    this.interactiveElements.forEach(el => {
      if (el) el.removeAttribute('tabindex');
    });
  }

  hideControls() {
    if (this.container) {
      this.container.classList.add('idle');
    }
    this.interactiveElements.forEach(el => {
      if (el) el.setAttribute('tabindex', '-1');
    });
  }

  destroy() {
    this.transitionTo('Closed');
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handleInteraction);
      this.container.removeEventListener('mouseenter', this.handleInteraction);
      this.container.removeEventListener('mouseleave', this.handleInteraction);
      this.container.removeEventListener('click', this.handleInteraction);
      this.container.removeEventListener('touchstart', this.handleInteraction);
      this.container.removeEventListener('touchmove', this.handleInteraction);
      this.container.removeEventListener('keydown', this.handleKeydown);
      this.container.removeEventListener('focusin', this.handleInteraction);
    }
  }
}

`;

scriptJs = managerClass + scriptJs;

// 2. Remove the old resetIdleTimer logic
const oldIdleLogic = /  \/\/ Idle Timer Logic for Player Controls[\s\S]*?  const modalContainer = document\.getElementById\('videoModalContainer'\);\n  if \(modalContainer\) \{[\s\S]*?  \}\n/g;
scriptJs = scriptJs.replace(oldIdleLogic, '');

// 3. Update the modal initialization to hook the manager up
const hookPointRegex = /  const nextBtn = document\.getElementById\('playlistNextBtn'\);\n/g;

const initManagerLogic = `  const nextBtn = document.getElementById('playlistNextBtn');

  const interactives = [
    prevBtn, nextBtn, closeBtn,
    document.getElementById('minimalPlayBtn') || document.getElementById('playBtn'),
    document.getElementById('volumeBtn'),
    document.querySelector('.volume-track')
  ].filter(Boolean);

  if (window.currentReelControlsManager) {
    window.currentReelControlsManager.destroy();
  }
  const modalContainer = document.getElementById('videoModalContainer');
  window.currentReelControlsManager = new ReelControlsManager(modalContainer, interactives);
  window.currentReelControlsManager.transitionTo('Opening');
`;

scriptJs = scriptJs.replace(hookPointRegex, initManagerLogic);

// 4. Update the video event hooks
const oldPauseHook = /  \/\/ Hook into video play\/pause[\s\S]*?      const container = document\.getElementById\('videoModalContainer'\);\n      if \(container\) container\.classList\.remove\('idle'\);\n    \}\);\n  \}\);/g;

const newVideoHooks = `  // Hook into video play/pause
  const allModalVids = document.querySelectorAll('.carousel-video-item video');
  allModalVids.forEach(v => {
    v.addEventListener('play', () => window.currentReelControlsManager?.transitionTo('Playing'));
    v.addEventListener('playing', () => window.currentReelControlsManager?.transitionTo('Playing'));
    v.addEventListener('pause', () => window.currentReelControlsManager?.transitionTo('Paused'));
    v.addEventListener('waiting', () => window.currentReelControlsManager?.transitionTo('Buffering'));
    v.addEventListener('seeking', () => window.currentReelControlsManager?.transitionTo('Seeking'));
    v.addEventListener('seeked', () => window.currentReelControlsManager?.transitionTo(v.paused ? 'Paused' : 'Playing'));
    v.addEventListener('ended', () => window.currentReelControlsManager?.transitionTo('Ended'));
    v.addEventListener('error', () => window.currentReelControlsManager?.transitionTo('Error'));
  });`;

scriptJs = scriptJs.replace(oldPauseHook, newVideoHooks);

// 5. Update closeModal to destroy the manager
scriptJs = scriptJs.replace(/function closeModal\(\) \{/, `function closeModal() {\n  if (window.currentReelControlsManager) {\n    window.currentReelControlsManager.destroy();\n    window.currentReelControlsManager = null;\n  }`);

fs.writeFileSync('script.js', scriptJs);
console.log("Refactored ReelControlsManager");
