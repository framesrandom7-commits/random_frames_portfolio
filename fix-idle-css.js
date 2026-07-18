const fs = require('fs');
let styleCss = fs.readFileSync('style.css', 'utf8');

// Replace old .idle-hidden rule with new global idle rules
const oldRule = /\.idle-hidden \{[\s\S]*?\}/g;
const newRules = `.video-modal-container.idle .player-controls,
.video-modal-container.idle .playlist-nav-btn,
.video-modal-container.idle .video-modal-close {
  opacity: 0 !important;
  pointer-events: none !important;
}`;

if (styleCss.match(oldRule)) {
  styleCss = styleCss.replace(oldRule, newRules);
} else {
  // If not found, just append it
  styleCss += '\n\n' + newRules + '\n';
}

fs.writeFileSync('style.css', styleCss);
console.log("Updated style.css with .idle parent state CSS rules");
