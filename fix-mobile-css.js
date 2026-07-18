const fs = require('fs');
let styleCss = fs.readFileSync('style.css', 'utf8');

const mobileCSS = `
/* =========================================================================
   MOBILE & TABLET RESPONSIVE OVERRIDES 
   (Strictly scoped to preserve desktop design pixel-identically)
   ========================================================================= */
@media (max-width: 768px) {
  /* Fluid intrinsic sizing constrained by safe areas */
  .video-modal-container {
    --safe-w: calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    --safe-h: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
    width: min(var(--safe-w), calc(var(--safe-h) * var(--dynamic-ratio, 16/9))) !important;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0 !important;
  }

  /* Make navigation controls visible natively on touch/mobile devices.
     The global ReelControlsManager (.idle class) handles auto-hiding. */
  .playlist-nav-btn {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  /* Adjust control overlays for device notches and home bars */
  .player-controls {
    padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px)) !important;
    padding-left: calc(15px + env(safe-area-inset-left, 0px)) !important;
    padding-right: calc(15px + env(safe-area-inset-right, 0px)) !important;
  }
  
  .video-modal-close {
    top: calc(15px + env(safe-area-inset-top, 0px)) !important;
    right: calc(15px + env(safe-area-inset-right, 0px)) !important;
  }
}
`;

// Append to the end of the file if it doesn't already exist
if (!styleCss.includes('MOBILE & TABLET RESPONSIVE OVERRIDES')) {
  fs.writeFileSync('style.css', styleCss + '\n' + mobileCSS);
  console.log("Appended responsive overrides to style.css");
} else {
  console.log("Already appended");
}
