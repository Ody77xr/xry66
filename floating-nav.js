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
                    <img src="assets/xr1.png" alt="Navigation" />
                </div>
                <div class="nav-menu" id="navMenu">
                    <div class="nav-grid">
                        <a href="xrhome.html" class="nav-item">
                            <div class="nav-item-icon">🏠</div>
                            <div class="nav-item-text">HOME</div>
                        </a>
                        <a href="xrgallery-entrance.html" class="nav-item">
                            <div class="nav-item-icon">🖼️</div>
                            <div class="nav-item-text">HXMP<br>GALLERY</div>
                        </a>
                        <a href="xrmyhxmps.html" class="nav-item">
                            <div class="nav-item-icon">💎</div>
                            <div class="nav-item-text">HXMP<br>STASH</div>
                        </a>
                        <a href="xrmembership.html" class="nav-item">
                            <div class="nav-item-icon">🌟</div>
                            <div class="nav-item-text">HXMPA'<br>PORTAL</div>
                        </a>
                        <a href="xrmessaging.html" class="nav-item">
                            <div class="nav-item-icon">💬</div>
                            <div class="nav-item-text">MESSAGING</div>
                        </a>
                        <a href="xrabout.html" class="nav-item">
                            <div class="nav-item-icon">ℹ️</div>
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
        `;

        // Insert navigation into body
        document.body.insertAdjacentHTML('beforeend', navHTML);
    }

    bindEvents() {
        const navIcon = document.getElementById('navIcon');
        const navMenu = document.getElementById('navMenu');

        // Toggle menu on icon click
        navIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-nav')) {
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

        // Prevent menu clicks from closing the menu
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

        this.isMenuOpen = true;
        navIcon.classList.add('active');
        navMenu.classList.add('active');

        // Add subtle vibration effect if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    closeMenu() {
        const navIcon = document.getElementById('navIcon');
        const navMenu = document.getElementById('navMenu');

        this.isMenuOpen = false;
        navIcon.classList.remove('active');
        navMenu.classList.remove('active');
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
