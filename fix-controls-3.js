const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const newUpdateTimeUI = `      const updateTimeUI = (video) => {
        const currentTimeEl = document.getElementById('currentTime');
        const durationTimeEl = document.getElementById('durationTime');
        const d = video.duration;
        const c = video.currentTime;
        
        if (progress && !isNaN(d) && d > 0 && d !== Infinity) {
          const p = (c / d) * 100;
          progress.style.width = p + '%';
        }
        
        if (currentTimeEl && durationTimeEl) {
          const formatTime = (time) => {
            if (isNaN(time) || time === Infinity) return '0:00';
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60);
            return \`\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
          };
          currentTimeEl.textContent = formatTime(c);
          durationTimeEl.textContent = formatTime(d);
        }
      };`;

// replace old one
const oldUpdateTimeUI = /const updateTimeUI = \(video\) => \{[\s\S]*?if \(!isNaN\(d\) && d > 0\) \{[\s\S]*?\}\n      \};/g;
scriptJs = scriptJs.replace(oldUpdateTimeUI, newUpdateTimeUI.trim());

fs.writeFileSync('script.js', scriptJs);
console.log("updateTimeUI patched");
