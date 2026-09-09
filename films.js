const filmsData = {
  CAFE: [
    {
      brand: "11 11 RESERVE",
      videos: [
        "videos/REELS/CAFE/11 11  RESERVE/Video-43.mp4"
      ]
    },
    {
      brand: "CAFE DE VERDE",
      videos: [
        "videos/REELS/CAFE/CAFE DE VERDE/Video-919.mp4",
        "videos/REELS/CAFE/CAFE DE VERDE/Video-689.mp4",
        "videos/REELS/CAFE/CAFE DE VERDE/Video-690.mp4",
        "videos/REELS/CAFE/CAFE DE VERDE/Video-739.mp4"
      ]
    },
    {
      brand: "DIHA CAFE",
      videos: [
        "videos/REELS/CAFE/DIHA CAFE/Video-12546.mp4",
        "videos/REELS/CAFE/DIHA CAFE/Video-2644.mp4",
        "videos/REELS/CAFE/DIHA CAFE/Video-305.mp4",
        "videos/REELS/CAFE/DIHA CAFE/Video-35226.mp4",
        "videos/REELS/CAFE/DIHA CAFE/Video-49048.mp4",
        "videos/REELS/CAFE/DIHA CAFE/Video-64626.mp4"
      ]
    },
    {
      brand: "THE COFFEE BREW HUB",
      videos: [
        "videos/REELS/CAFE/THE COFFEE BREW HUB/Video-707.mp4",
        "videos/REELS/CAFE/THE COFFEE BREW HUB/Video-100.mp4",
        "videos/REELS/CAFE/THE COFFEE BREW HUB/Video-645.mp4",
        "videos/REELS/CAFE/THE COFFEE BREW HUB/Video-788.mp4"
      ]
    },
    {
      brand: "THE DREAMING TREE",
      videos: [
        "videos/REELS/CAFE/THE DREAMING TREE/Video-391.mp4",
        "videos/REELS/CAFE/THE DREAMING TREE/Video-106.mp4",
        "videos/REELS/CAFE/THE DREAMING TREE/Video-254.mp4",
        "videos/REELS/CAFE/THE DREAMING TREE/Video-76.mp4",
        "videos/REELS/CAFE/THE DREAMING TREE/Video-896.mp4"
      ]
    },
    {
      brand: "THE REAL PIZZA COMPANY",
      videos: [
        "videos/REELS/CAFE/THE REAL PIZZA COMPANY/Video-26.mp4",
        "videos/REELS/CAFE/THE REAL PIZZA COMPANY/Video-59.mp4",
        "videos/REELS/CAFE/THE REAL PIZZA COMPANY/Video-606.mp4",
        "videos/REELS/CAFE/THE REAL PIZZA COMPANY/Video-705.mp4",
        "videos/REELS/CAFE/THE REAL PIZZA COMPANY/Video-985.mp4"
      ]
    }
  ],
  EVENTS: [
    {
      brand: "DESI MASALA",
      videos: [
        "videos/REELS/CAFE/DESI MASALA/Video-251.mp4"
      ]
    },
    {
      brand: "Bengaluru Brews",
      videos: [
        "videos/REELS/EVENTS/Bengaluru Brews/Bengaluru Brews.mp4#t=3"
      ]
    },
    {
      brand: "Navkar Sliver Shop",
      videos: [] // Empty
    },
    {
      brand: "Something Brewing",
      videos: [
        "videos/REELS/EVENTS/Something Brewing/IMG_5920.mp4",
        "videos/REELS/EVENTS/Something Brewing/IMG_5921.mp4",
        "videos/REELS/EVENTS/Something Brewing/IMG_6058.mp4",
        "videos/REELS/EVENTS/Something Brewing/IMG_6536.mp4",
        "videos/REELS/EVENTS/Something Brewing/Something Brewing.mov"
      ]
    }
  ],
  PRODUCT: [
    {
      brand: "JAI SHANKAR",
      videos: [
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-244.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-250.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-315.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-348.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-436.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-516.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-551.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-735.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-757.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-793.mp4#t=3",
        "videos/REELS/PRODUCT/JAI SHANKAR /Video-88.mp4#t=3"
      ]
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {

  let savedDirectoryScrollPosition = 0;

  const filmsDirectory = document.getElementById('filmsDirectory');
  const filmsExpandedView = document.getElementById('filmsExpandedView');
  const expandedBrandTitle = document.getElementById('expandedBrandTitle');
  const videoGridContainer = document.getElementById('videoGridContainer');
  const backToDirectoryBtn = document.getElementById('backToDirectoryBtn');

  const fullscreenPlayer = document.getElementById('fullscreenPlayer');
  const fullscreenVideo = document.getElementById('fullscreenVideo');
  const closePlayerBtn = document.getElementById('closePlayerBtn');

  // DOM Elements for Categories
  const gridCafe = document.getElementById('brandGridCafe');
  const gridEvents = document.getElementById('brandGridEvents');
  const gridProduct = document.getElementById('brandGridProduct');

  // Utility to attach hover-to-play listeners
  function attachHoverPlay(cardElement, videoElement) {
    if (!videoElement) return;
    cardElement.addEventListener('mouseenter', () => {
      videoElement.play().catch(e => console.log('Autoplay prevented:', e));
    });
    cardElement.addEventListener('mouseleave', () => {
      videoElement.pause();
      let resetTime = 0.5;
      const hashMatch = videoElement.src.match(/#t=([\d.]+)/);
      if (hashMatch) {
        resetTime = parseFloat(hashMatch[1]);
      }
      videoElement.currentTime = resetTime;
    });
  }

  // Render Initial Directory View
  function renderDirectory() {
    renderCategoryGrid(filmsData.CAFE, gridCafe);
    renderCategoryGrid(filmsData.EVENTS, gridEvents);
    renderCategoryGrid(filmsData.PRODUCT, gridProduct);
  }

  function renderCategoryGrid(brandsArray, containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '';

    brandsArray.forEach((brandObj, index) => {
      const card = document.createElement('div');
      card.className = 'brand-card';

      if (brandObj.videos.length > 0) {
        // Has videos
        const videoSrc = brandObj.videos[0];
        card.innerHTML = `
          <video src="${videoSrc}" muted loop playsinline preload="metadata" class="brand-video-thumb"></video>
          <div class="brand-card-overlay">
            <h3 class="brand-card-title">${brandObj.brand}</h3>
          </div>
        `;
        const videoEl = card.querySelector('video');

        // Skip first frame black screen on load, and use custom time if provided
        videoEl.addEventListener('loadedmetadata', () => {
          let startTime = 0.5;
          const hashMatch = videoEl.src.match(/#t=([\d.]+)/);
          if (hashMatch) {
            startTime = parseFloat(hashMatch[1]);
          }
          videoEl.currentTime = startTime;
        });

        attachHoverPlay(card, videoEl);

        card.addEventListener('click', () => {
          openExpandedView(brandObj.brand, brandObj.videos);
        });
      } else {
        // No videos yet (e.g. Navkar Sliver Shop)
        card.innerHTML = `
          <div class="brand-placeholder">Coming Soon</div>
          <div class="brand-card-overlay">
            <h3 class="brand-card-title">${brandObj.brand}</h3>
          </div>
        `;
      }

      containerElement.appendChild(card);
    });
  }

  // Open Expanded Grid View for a Brand
  function openExpandedView(brandName, videoSrcs) {
    savedDirectoryScrollPosition = window.scrollY || document.documentElement.scrollTop;
    filmsDirectory.style.display = 'none';
    filmsExpandedView.style.display = 'block';
    expandedBrandTitle.textContent = brandName;
    videoGridContainer.innerHTML = '';

    videoSrcs.forEach(src => {
      const card = document.createElement('div');
      card.className = 'video-card';

      card.innerHTML = `
        <video src="${src}" muted loop playsinline preload="metadata" class="video-thumb"></video>
      `;

      const videoEl = card.querySelector('video');

      // Skip first frame black screen on load, and use custom time if provided
      videoEl.addEventListener('loadedmetadata', () => {
        let startTime = 0.5;
        const hashMatch = videoEl.src.match(/#t=([\d.]+)/);
        if (hashMatch) {
          startTime = parseFloat(hashMatch[1]);
        }
        videoEl.currentTime = startTime;
      });

      attachHoverPlay(card, videoEl);

      card.addEventListener('click', () => {
        openFullscreenPlayer(src);
      });

      videoGridContainer.appendChild(card);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Back Button
  if (backToDirectoryBtn) {
    backToDirectoryBtn.addEventListener('click', () => {
      filmsExpandedView.style.display = 'none';
      filmsDirectory.style.display = 'block';
      window.scrollTo({ top: savedDirectoryScrollPosition, behavior: 'instant' });
    });
  }

  // Fullscreen Player Logic
  function openFullscreenPlayer(src) {
    fullscreenVideo.src = src;
    fullscreenPlayer.classList.add('active');
    fullscreenVideo.play().catch(e => console.log('Autoplay prevented:', e));
  }

  function closeFullscreenPlayer() {
    fullscreenPlayer.classList.remove('active');
    fullscreenVideo.pause();
    fullscreenVideo.src = ''; // reset
  }

  if (closePlayerBtn) closePlayerBtn.addEventListener('click', closeFullscreenPlayer);
  if (fullscreenPlayer) {
    fullscreenPlayer.addEventListener('click', (e) => {
      if (e.target === fullscreenPlayer) {
        closeFullscreenPlayer();
      }
    });
  }

  // Initialize
  renderDirectory();
});

// Also attach hover-to-play for the teaser videos on index.html
document.addEventListener('DOMContentLoaded', () => {
  const teasers = document.querySelectorAll('.film-teaser-item');
  teasers.forEach(teaser => {
    const video = teaser.querySelector('video');
    if (video) {
      // Skip first frame black screen on load, and use custom time if provided
      video.addEventListener('loadedmetadata', () => {
        let startTime = 0.5;
        const hashMatch = video.src.match(/#t=([\d.]+)/);
        if (hashMatch) {
          startTime = parseFloat(hashMatch[1]);
        }
        video.currentTime = startTime;
      });

      teaser.addEventListener('mouseenter', () => {
        video.play().catch(e => e);
      });
      teaser.addEventListener('mouseleave', () => {
        video.pause();
        let resetTime = 0.5;
        const hashMatch = video.src.match(/#t=([\d.]+)/);
        if (hashMatch) {
          resetTime = parseFloat(hashMatch[1]);
        }
        video.currentTime = resetTime;
      });
    }
  });
});
