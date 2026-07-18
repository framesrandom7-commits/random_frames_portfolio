const fs = require('fs');
let styleCss = fs.readFileSync('style.css', 'utf8');

// Update player-controls
styleCss = styleCss.replace(
  /(\.player-controls \{[\s\S]*?)transition: opacity 0\.4s ease;/,
  '$1transition: opacity 0.3s ease, visibility 0.3s ease;'
);

// Update playlist-nav-btn
styleCss = styleCss.replace(
  /(\.playlist-nav-btn \{[\s\S]*?)transition: all 0\.3s cubic-bezier\(0\.16, 1, 0\.3, 1\);/,
  '$1transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease;'
);

// Update video-modal-close
styleCss = styleCss.replace(
  /(\.video-modal-close \{[\s\S]*?)transition: all 0\.3s ease;/,
  '$1transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.3s ease;'
);

// Ensure idle class also targets visibility explicitly
styleCss = styleCss.replace(
  /\.video-modal-container\.idle \.player-controls,\n\.video-modal-container\.idle \.playlist-nav-btn,\n\.video-modal-container\.idle \.video-modal-close \{[\s\S]*?\}/,
  `.video-modal-container.idle .player-controls,
.video-modal-container.idle .playlist-nav-btn,
.video-modal-container.idle .video-modal-close {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}`
);

fs.writeFileSync('style.css', styleCss);
console.log("Updated transitions for idle logic");
