const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const interactionLogic = `// Global Interaction Detection
['scroll', 'touchstart', 'click'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (!document.body.classList.contains('user-interacted')) {
      document.body.classList.add('user-interacted');
    }
  }, { passive: true, once: true });
});\n\n`;

if (!scriptJs.includes('user-interacted')) {
  scriptJs = interactionLogic + scriptJs;
  fs.writeFileSync('script.js', scriptJs);
}
