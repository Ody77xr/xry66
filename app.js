// Main application JavaScript
function xrInitApp(){
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 15, 15, 0.98)';
            } else {
                navbar.style.background = 'rgba(15, 15, 15, 0.95)';
            }
        });
    }

    // Category card hover effects
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // CTA button animations
    const ctaButtons = document.querySelectorAll('.cta-button, .category-link');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Loading animation for page transitions
    function showLoader() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 15, 15, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #4ecdc4;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
            </div>
        `;
        document.body.appendChild(loader);
        
        setTimeout(() => {
            loader.remove();
        }, 1000);
    }

    // Add loading animation to navigation links
    const externalLinks = document.querySelectorAll('a[href$=".html"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname) {
                showLoader();
            }
        });
    });

    // Intersection Observer for scroll animations
    const animatedElements = document.querySelectorAll('.category-card, .hero-content');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Mobile menu toggle (basic implementation)
    const createMobileMenu = () => {
        const navbar = document.querySelector('.navbar');
        if (window.innerWidth <= 768 && navbar) {
            const mobileToggle = document.createElement('button');
            mobileToggle.innerHTML = '☰';
            mobileToggle.className = 'mobile-toggle';
            mobileToggle.style.cssText = `
                display: block;
                background: transparent;
                border: none;
                color: #fff;
                font-size: 1.5rem;
                cursor: pointer;
                @media (min-width: 769px) { display: none; }
            `;
            
            const navContainer = document.querySelector('.nav-container');
            if (navContainer && !document.querySelector('.mobile-toggle')) {
                navContainer.appendChild(mobileToggle);
                
                mobileToggle.addEventListener('click', () => {
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks) {
                        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                        navLinks.style.flexDirection = 'column';
                        navLinks.style.position = 'absolute';
                        navLinks.style.top = '100%';
                        navLinks.style.left = '0';
                        navLinks.style.width = '100%';
                        navLinks.style.background = 'rgba(15, 15, 15, 0.98)';
                        navLinks.style.padding = '1rem';
                    }
                });
            }
        }
    };

    // Initialize mobile menu
    createMobileMenu();
    window.addEventListener('resize', createMobileMenu);

    // Form validation (for future forms)
    const validateForm = (form) => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff6b6b';
                isValid = false;
            } else {
                input.style.borderColor = '#4ecdc4';
            }
        });
        
        return isValid;
    };

    // Add form validation to any forms on the page
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });

    // Console welcome message
    console.log('%cWelcome to Hxmp Space! 🚀', 'color: #4ecdc4; font-size: 16px; font-weight: bold;');
    console.log('%cBuilt with modern web technologies', 'color: #ff6b6b; font-size: 12px;');

    // Remove any legacy duplicate navigation elements
    document.querySelectorAll('nav.navbar, header .navbar, .mobile-tab-bar, div.fixed.bottom-0, .hx-bottom-nav').forEach(el => el.remove());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', xrInitApp);
} else {
    xrInitApp();
}

