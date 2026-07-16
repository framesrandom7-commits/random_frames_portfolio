const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

const closeModalReplacement = `  function closeModal() {
    modal.classList.remove('active');
    
    modal.querySelectorAll('.carousel-video-item video').forEach(v => {
      v.pause();
      v.removeAttribute('src');
      v.load();
    });
    
    if (document.getElementById('modalVideo')) {
      const mv = document.getElementById('modalVideo');
      mv.pause();
      mv.removeAttribute('src');
      mv.load();
    }
    
    document.body.style.overflow = '';
    const container = document.getElementById('videoModalContainer');
    if (container) {
      container.style.removeProperty('--dynamic-ratio');
    }
    
    const errorPlaceholder = document.getElementById('videoErrorPlaceholder');
    if (errorPlaceholder) errorPlaceholder.style.display = 'none';
  }`;

scriptJs = scriptJs.replace(/function closeModal\(\) \{[\s\S]*?document\.body\.style\.overflow = '';\n  \}/, closeModalReplacement);

const openModalReplacement = `// Global openModal function
window.openModal = function(src, isAnimating = false) {
  const modal = document.getElementById('videoModal');
  const mv = modal ? modal.querySelector('.carousel-video-item.active video') || document.getElementById('modalVideo') : null;
  const mvPrev = modal ? modal.querySelector('.carousel-video-item.prev video') : null;
  const mvNext = modal ? modal.querySelector('.carousel-video-item.next video') : null;
  if (!modal || !mv) return;

  const errorPlaceholder = document.getElementById('videoErrorPlaceholder');
  if (errorPlaceholder) errorPlaceholder.style.display = 'none';

  // Apply intrinsic ratio on metadata load
  const handleMetadata = () => {
    const container = document.getElementById('videoModalContainer');
    if (container && mv.videoWidth && mv.videoHeight) {
      const ratio = mv.videoWidth / mv.videoHeight;
      container.style.setProperty('--dynamic-ratio', ratio);
    }
  };
  mv.addEventListener('loadedmetadata', handleMetadata, { once: true });
  
  mv.addEventListener('error', () => {
    if (errorPlaceholder) errorPlaceholder.style.display = 'flex';
  }, { once: true });

  // Update current index in playlist
  if (currentPlaylist.length > 0) {
    const idx = currentPlaylist.indexOf(src);
    if (idx !== -1) {
      currentVideoIndex = idx;
      
      const prevIdx = (currentVideoIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      const nextIdx = (currentVideoIndex + 1) % currentPlaylist.length;
      
      const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
      
      if (mvPrev) {
        mvPrev.src = appendHash(currentPlaylist[prevIdx]);
        mvPrev.load();
      }
      if (mvNext) {
        mvNext.src = appendHash(currentPlaylist[nextIdx]);
        mvNext.load();
      }
    }
  }

  const appendHash = (url) => url.includes('#t=') ? url : url + '#t=0.5';
  mv.src = appendHash(src);
  
  if (!isAnimating) {
    mv.load();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  mv.play().catch(() => { });
};`;

scriptJs = scriptJs.replace(/\/\/ Global openModal function[\s\S]*?mv\.play\(\)\.catch\(\(\) => \{ \}\);\n\};/, openModalReplacement);

fs.writeFileSync('script.js', scriptJs);
console.log('Injected modal methods');
