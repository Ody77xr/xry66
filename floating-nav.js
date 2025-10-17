// Floating Navigation JavaScript
class FloatingNav {
    constructor() {
        this.isMenuOpen = false;
        this.isAdmin = false;
        this.init();
    }

    async init() {
        await this.checkAdminStatus();
        this.createNavigation();
        this.bindEvents();
    }

    async checkAdminStatus() {
        try {
            // Check if Supabase is available
            if (typeof supabase !== 'undefined' && supabaseConfig) {
                const { createClient } = supabase;
                const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.options);
                
                const { data: { user }, error } = await supabaseClient.auth.getUser();
                
                if (user) {
                    const { data: userData, error: userError } = await supabaseClient
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    
                    if (!userError && userData && userData.role === 'admin') {
                        this.isAdmin = true;
                    }
                }
            }
        } catch (error) {
            console.log('Admin check failed:', error);
        }
    }

    createNavigation() {
        // Create floating navigation HTML
        const navHTML = `
            <div class="floating-nav" id="floatingNav">
                <div class="nav-icon" id="navIcon">
                    <img src="xr1.png" alt="Navigation" />
                </div>
                <div class="nav-overlay" id="navOverlay">
                    <div class="nav-menu" id="navMenu">
                    <div class="nav-grid">
                        <a href="xrhome.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Home -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M3 11.5L12 4l9 7.5"></path>
                                    <path d="M5 22V12h14v10"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">HOME</div>
                        </a>
                        <a href="xrgallery-entrance.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Photo -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                                    <circle cx="8.5" cy="11.5" r="1.5"></circle>
                                    <path d="M21 15l-5-5-4 4-3-3-5 5"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">HXMP<br>GALLERY</div>
                        </a>
                        <a href="xrmyhxmps.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Gift / Stash -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="7" width="18" height="4" rx="1"></rect>
                                    <path d="M12 3v4"></path>
                                    <path d="M7 3c1.2 1.2 2.5 2 4 2s2.8-.8 4-2"></path>
                                    <path d="M3 11v8a2 2 0 002 2h14a2 2 0 002-2v-8"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">HXMP<br>STASH</div>
                        </a>
                        <a href="xrmembership.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Star -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 17.25l-6.16 3.24 1.18-6.88L2 9.5l6.92-1L12 2.5l3.08 6 6.92 1-5.02 3.11 1.18 6.88z"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">HXMPA'<br>PORTAL</div>
                        </a>
                        <a href="xrmessaging.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Message -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">MESSAGING</div>
                        </a>
                        <a href="xrabout.html" class="nav-item">
                            <div class="nav-item-icon">
                                <!-- Tabler: Info -->
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="9"></circle>
                                    <path d="M12 8v.01"></path>
                                    <path d="M11 12h1v4h1"></path>
                                </svg>
                            </div>
                            <div class="nav-item-text">ABOUT</div>
                        </a>
                        ${this.isAdmin ? `
                        <a href="xradmin-dashboard.html" class="nav-item admin-portal">
                            <div class="nav-item-icon">⚡</div>
                            <div class="nav-item-text">ADMIN<br>PORTAL</div>
                        </a>
                        ` : ''}
                    </div>
                    </div>
                </div>
            </div>
        `;

        // Insert navigation into body
        document.body.insertAdjacentHTML('beforeend', navHTML);
    }

    bindEvents() {
        const navIcon = document.getElementById('navIcon');
        const navMenu = document.getElementById('navMenu');
        const navOverlay = document.getElementById('navOverlay');

        // Toggle menu on icon click
        navIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking overlay background
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });

        // Add hover effects
        navIcon.addEventListener('mouseenter', () => {
            if (!this.isMenuOpen) {
                navIcon.style.transform = 'scale(1.1)';
            }
        });

        navIcon.addEventListener('mouseleave', () => {
            if (!this.isMenuOpen) {
                navIcon.style.transform = 'scale(1)';
            }
        });

        // Prevent menu clicks from closing the menu (stop propagation)
        navMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const navIcon = document.getElementById('navIcon');
        const navMenu = document.getElementById('navMenu');
        const navOverlay = document.getElementById('navOverlay');

        this.isMenuOpen = true;
        navIcon.classList.add('active');
        navMenu.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');

        // Add subtle vibration effect if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    closeMenu() {
        const navIcon = document.getElementById('navIcon');
        const navMenu = document.getElementById('navMenu');
        const navOverlay = document.getElementById('navOverlay');

        this.isMenuOpen = false;
        navIcon.classList.remove('active');
        navMenu.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
    }

    // Method to highlight current page
    highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop();
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.style.background = 'linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(0, 255, 255, 0.3))';
                item.style.border = '1px solid rgba(255, 215, 0, 0.5)';
            }
        });
    }
}

// Initialize floating navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove any duplicate navigation elements first
    document.querySelectorAll('.hx-bottom-nav, .floating-nav').forEach(el => el.remove());
    
    const floatingNav = new FloatingNav();
    
    // Highlight current page after a short delay
    setTimeout(() => {
        floatingNav.highlightCurrentPage();
    }, 100);
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingNav;
}
