const fs = require('fs');
let modalHtml = fs.readFileSync('modal.tmp.html', 'utf8');
let scriptJs = fs.readFileSync('script.js', 'utf8');

modalHtml = modalHtml.replace('<div class="carousel-video-item active" id="carouselActive">', '<div class="carousel-video-item active" id="carouselActive">\n            <div id="videoErrorPlaceholder" class="video-error-placeholder" style="display:none;">Unable to load video.</div>');

const injectionLogic = `function initVideoModal() {
  if (!document.getElementById('videoModal')) {
    document.body.insertAdjacentHTML('beforeend', \`\n${modalHtml}\n\`);
  }`;

scriptJs = scriptJs.replace('function initVideoModal() {', injectionLogic);
fs.writeFileSync('script.js', scriptJs);
console.log('Injected modal logic to script.js');
