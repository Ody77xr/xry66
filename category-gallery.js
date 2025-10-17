// Category Gallery System - Banner Selection with Dynamic Category Switching
(function(){
  const CATEGORIES = [
    { 
      id: 'thot-mommies', 
      label: "Thot-Mommies", 
      description: "Premium content featuring curated thot-mommy collections",
  icon: "Thot.png",
      iconType: "image",
      sub: [ 'ass-clappin-on-dick', 'mommy-caked-up-try-on', 'wedgied-up-cake' ],
      color: "holo-purple"
    },
    { 
      id: 'bubble-butts', 
      label: "Bubble Butts", 
      description: "Exclusive booty content with premium curvy selections",
  icon: "Cakedup.png",
      iconType: "image",
      sub: [ 'ass-clappin-on-dick', 'wedgied-up-cake' ],
      color: "holo-blue"
    },
    { 
      id: 'tits', 
      label: "Tits", 
      description: "High-quality breast-focused content collection",
  icon: "Tits.png",
      iconType: "image",
      sub: [],
      color: "holo-gold"
    },
    { 
      id: 'premium-vault', 
      label: "Premium Vault", 
      description: "Premium vault with exclusive content and curated selections",
  icon: "HxmpV.png",
      iconType: "image",
      sub: [ 'couples', 'women', 'premium-channel', 'premium' ],
      color: "holo-gold",
      isPremium: true
    },
    { 
      id: 'onevault', 
      label: "Elite Gallery", 
      description: "Exclusive Elite Gallery with locked premium content and password system",
      icon: "🔐",
      iconType: "emoji",
      sub: [ 'premium', 'couples', 'women', 'locked', 'trial' ],
      color: "holo-purple",
      isPremium: true,
      isLocked: true
    },
    { 
      id: 'xrcakey-vault', 
      label: "XrCakey Vault", 
      description: "🔒 Restricted access vault with special content collection",
      icon: 'assets/xrcakey.svg',
      iconType: "image",
      sub: [],
      color: "holo-blue",
      isPremium: true,
      isLocked: true,
      directLink: "xrgxy.html"
    }
  ];

  let state = {
    view: 'banners', // 'banners' or 'category'
    activeCategory: null,
    activeSub: null,
    tagQuery: ''
  };

  // ensure we have videos dataset
  function ensureVideoDataset() {
    if (window.videoGallery && window.videoGallery.videos && window.videoGallery.videos.length) {
      return window.videoGallery;
    }
    // initialize a VideoGallery instance just to access sample videos
    try {
      window.videoGallery = new VideoGallery();
      return window.videoGallery;
    } catch (e) {
      console.error('VideoGallery not available', e);
      return { videos: [] };
    }
  }

  // Create category banner cards
  function createCategoryBanners() {
    const grid = document.getElementById('categoryBannersGrid');
    if (!grid) {
      console.error('categoryBannersGrid element not found');
      return;
    }
    
    console.log('Creating category banners for', CATEGORIES.length, 'categories');
    
    // Remove loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    grid.innerHTML = '';

    CATEGORIES.forEach((category, index) => {
      const banner = document.createElement('div');
      // Use a clean card layout and consistent sizing for a professional appearance
      banner.className = 'relative flex flex-col items-center justify-start gap-3 cursor-pointer group category-banner w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-3';
      banner.style.animationDelay = `${index * 0.08}s`;

      const premiumBadge = category.isPremium ?
        `<div class="absolute -top-1 -right-1 badge holographic-gradient text-cyber-dark font-bold text-[10px]">PREMIUM</div>` : '';

      const lockedBadge = category.isLocked ?
        `<div class="absolute -top-1 -left-1 badge badge-outline border-red-500 text-red-400 text-[10px]">LOCKED</div>` : '';

      banner.innerHTML = `
        <div class="relative">
          ${premiumBadge}
          ${lockedBadge}
          <div class="cat-bubble glass-morphism cyber-glow rounded-lg w-full flex items-center justify-center transition-transform duration-300 group-hover:scale-102 category-icon" style="min-height:110px;">
            ${category.iconType === 'image' ? 
              `<img src="${category.icon}" alt="${category.label}" class="max-w-24 max-h-24 sm:max-w-28 sm:max-h-28 lg:max-w-32 lg:max-h-32 rounded-md object-contain" style="filter: drop-shadow(0 0 20px rgba(244, 208, 99, 0.5));">` :
              category.iconType === 'svg' ?
              `<div class="text-holo-gold" style="filter: drop-shadow(0 0 20px rgba(244, 208, 99, 0.5));">${category.icon}</div>` :
              `<div class="text-3xl sm:text-4xl lg:text-5xl" style="filter: drop-shadow(0 0 20px rgba(244, 208, 99, 0.5));">${category.icon || '🔵'}</div>`
            }
          </div>
        </div>
        <div class="text-center">
          <div class="font-cyber text-sm sm:text-base lg:text-lg holographic-text">${category.label.toUpperCase()}</div>
          <div class="mt-1 flex flex-wrap gap-1 justify-center">
            ${category.sub.slice(0, 3).map(sub =>
              `<div class="badge badge-xs sm:badge-sm badge-outline border-${category.color} text-${category.color}">${prettyLabel(sub)}</div>`
            ).join('')}
            ${category.sub.length > 3 ? `<div class="badge badge-xs badge-outline border-gray-400 text-gray-400">+${category.sub.length - 3}</div>` : ''}
          </div>
        </div>
      `;

      banner.addEventListener('click', () => {
        // If category has a direct link, navigate to it
        if (category.directLink) {
          window.location.href = category.directLink;
        } else {
          selectCategory(category.id);
        }
      });

      // Wrap banners in a card container for grid usage
      const wrapper = document.createElement('div');
      wrapper.className = 'p-2';
      wrapper.appendChild(banner);
      grid.appendChild(wrapper);
    });
  }

  // Select a category and switch to category view
  function selectCategory(categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    state.view = 'category';
    state.activeCategory = categoryId;
    state.activeSub = null;
    state.tagQuery = '';

    // Clear search input
    const searchInput = document.getElementById('tagSearch');
    if (searchInput) searchInput.value = '';

    renderUI();
  }

  // Go back to category banners
  function backToCategoryBanners() {
    state.view = 'banners';
    state.activeCategory = null;
    state.activeSub = null;
    state.tagQuery = '';

    renderUI();
  }

  // Update category info display
  function updateCategoryInfo() {
    const category = CATEGORIES.find(c => c.id === state.activeCategory);
    if (!category) return;

    const titleEl = document.getElementById('categoryTitle');
    const descEl = document.getElementById('categoryDescription');
    const statsEl = document.getElementById('categoryStats');
    const activeEl = document.getElementById('activeCategory');

    if (titleEl) titleEl.textContent = category.label.toUpperCase();
    if (descEl) descEl.textContent = category.description;
    if (activeEl) activeEl.textContent = category.label.toUpperCase();

    if (statsEl) {
      const vg = ensureVideoDataset();
      const categoryVideos = filterVideos(vg.videos || []);
      statsEl.innerHTML = `
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-gray-400">VIDEOS:</span>
          <span class="text-holo-blue">${categoryVideos.length}</span>
        </div>
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-gray-400">TYPE:</span>
          <span class="text-${category.color}">${category.isPremium ? 'PREMIUM' : 'FREE'}</span>
        </div>
        ${category.isLocked ? `
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-gray-400">ACCESS:</span>
          <span class="text-red-400">LOCKED</span>
        </div>
        ` : ''}
      `;
    }
  }

  function buildSubcategories() {
    const wrap = document.getElementById('subcategoryChips');
    const active = CATEGORIES.find(c => c.id === state.activeCategory);
    wrap.innerHTML = '';

    if (!active || !active.sub || active.sub.length === 0) {
      const badge = document.createElement('div');
      badge.className = 'badge badge-outline border-holo-blue text-holo-blue';
      badge.textContent = 'No subcategories';
      wrap.appendChild(badge);
      return;
    }

    active.sub.forEach(id => {
      const label = prettyLabel(id);
      const chip = document.createElement('div');
      chip.className = `badge ${state.activeSub===id ? 'holographic-gradient text-cyber-dark font-bold' : 'badge-outline border-holo-purple text-holo-purple'}`;
      chip.textContent = label;
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', () => {
        state.activeSub = (state.activeSub === id) ? null : id;
        renderUI();
      });
      wrap.appendChild(chip);
    });
  }

  function prettyLabel(slug) {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace('Hxmps', "Hxmpa'");
  }

  function filterVideos(videos) {
    const q = (state.tagQuery || '').trim().toLowerCase();

    return videos.filter(v => {
      // category match: all or tag includes the category id
      const tags = (v.tags || []).map(t => (t+'').toLowerCase());
      const catOk = state.activeCategory === 'all' || tags.includes(state.activeCategory);
      if (!catOk) return false;

      // subcategory match
      if (state.activeSub) {
        if (!tags.includes(state.activeSub)) return false;
      }

      // tag query match across title/desc/tags
      if (q) {
        const hay = [v.title, v.description, ...(v.tags||[])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  function renderCards(videos) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';

    if (!videos.length) {
      const empty = document.createElement('div');
      empty.className = 'col-span-full text-center font-mono text-gray-400';
      empty.textContent = 'No results. Try different tags or categories.';
      grid.appendChild(empty);
      return;
    }

    videos.forEach(video => {
      const premiumBadge = video.isPremium ? `<div class="badge holographic-gradient text-cyber-dark font-bold text-xs">PREMIUM</div>` : '';
      const card = document.createElement('div');
      card.className = 'card glass-morphism hover:cyber-glow transition-all duration-500 cursor-pointer group animate-float';
      card.innerHTML = `
        <figure class="relative overflow-hidden">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full glass-morphism holographic-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-holo-blue ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="absolute bottom-2 right-2 badge glass-morphism text-holo-gold font-mono text-xs">${video.duration}</div>
          <div class="absolute top-2 left-2">${premiumBadge}</div>
        </figure>
        <div class="card-body p-4">
          <h3 class="card-title font-cyber text-lg holographic-text mb-2">${video.title}</h3>
          <p class="font-mono text-gray-300 text-sm mb-4 leading-relaxed">${video.description}</p>
          <div class="flex flex-wrap gap-2 justify-between items-center">
            <div class="badge holographic-gradient text-cyber-dark font-bold text-xs">${video.id}</div>
            <div class="flex gap-2 items-center">
              ${(video.tags||[]).slice(0,3).map(t => `<div class="badge badge-outline border-holo-blue text-holo-blue text-xs">${prettyLabel(t)}</div>`).join('')}
            </div>
          </div>
        </div>`;
      card.addEventListener('click', () => {
        const locked = (video.tags||[]).includes('sirhump-vault') || (video.tags||[]).includes('onevault');
        if (locked && window.accessControl) {
          window.accessControl.checkAndPlay(video);
          return;
        }
        if (window.hxmpVideoPlayer) {
          window.hxmpVideoPlayer.playVideo(video);
        }
      });
      grid.appendChild(card);
    });
  }

  // Main render function
  function renderUI() {
    console.log('renderUI called, current state:', state);
    const bannerView = document.getElementById('categoryBannerView');
    const contentView = document.getElementById('categoryContentView');
    
    if (!bannerView || !contentView) {
      console.error('Required DOM elements not found:', { bannerView, contentView });
      return;
    }
    
    if (state.view === 'banners') {
      console.log('Showing banner view');
      // Show banner selection
      bannerView.classList.remove('hidden');
      contentView.classList.add('hidden');
      createCategoryBanners();
    } else if (state.view === 'category') {
      console.log('Showing category view for:', state.activeCategory);
      // Show category content
      bannerView.classList.add('hidden');
      contentView.classList.remove('hidden');
      updateCategoryInfo();
      buildSubcategories();
      
      const vg = ensureVideoDataset();
      const vids = filterVideos(vg.videos || []);
      renderCards(vids);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, initializing category gallery');
    
    // Back button
    const backBtn = document.getElementById('backToCategoriesBtn');
    if (backBtn) {
      backBtn.addEventListener('click', backToCategoryBanners);
      console.log('Back button event listener added');
    }

    // Search inputs
    const search = document.getElementById('tagSearch');
    const clear = document.getElementById('clearFilters');
    if (search) {
      search.addEventListener('input', (e) => { 
        state.tagQuery = e.target.value; 
        if (state.view === 'category') renderUI(); 
      });
    }
    if (clear) {
      clear.addEventListener('click', () => { 
        state.tagQuery = ''; 
        if (search) search.value = ''; 
        state.activeSub = null; 
        if (state.view === 'category') renderUI(); 
      });
    }

    // Initial render - show banners
    console.log('Starting initial render');
    // Check for deep-link hash like #category=thot-mommies&sub=ass-clappin-on-dick
    function applyHashRoute() {
      const hash = window.location.hash || '';
      if (!hash.startsWith('#')) return false;
      const q = new URLSearchParams(hash.substring(1));
      const cat = q.get('category');
      const sub = q.get('sub');
      if (cat) {
        if (CATEGORIES.find(c => c.id === cat)) {
          selectCategory(cat);
          if (sub) {
            state.activeSub = sub;
            renderUI();
          }
          return true;
        }
      }
      return false;
    }

    if (!applyHashRoute()) {
      renderUI();
    }

    window.addEventListener('hashchange', () => {
      applyHashRoute();
    });
  });

  // Also try immediate execution if DOM is already loaded
  if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
  } else {
    console.log('Document already loaded, executing immediately');
    setTimeout(() => {
      renderUI();
    }, 100);
  }

  // Test function for debugging
  function testRender() {
    console.log('Manual test render triggered');
    console.log('Current state:', state);
    console.log('Categories:', CATEGORIES);
    state.view = 'banners';
    renderUI();
  }

  // Export for external access
  window.categoryGallery = {
    selectCategory,
    backToCategoryBanners,
    getState: () => state,
    getCategories: () => CATEGORIES,
    testRender,
    renderUI
  };

  // Fallback initialization after a short delay
  setTimeout(() => {
    if (document.getElementById('categoryBannersGrid') && !document.querySelector('.category-banner')) {
      console.log('Fallback initialization - no categories found, trying again');
      renderUI();
    }
  }, 500);
})();
