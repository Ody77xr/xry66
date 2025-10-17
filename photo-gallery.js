// Photo Gallery Management System
class PhotoGallery {
    constructor() {
        this.photos = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadRealPhotos();
        this.setupEventListeners();
        this.renderPhotos();
    }

    loadRealPhotos() {
        // Real photo content - ready for dynamic loading
        this.photos = [
            {
                id: 'HXP001',
                title: 'Premium Collection #1',
                description: 'Exclusive high-quality content from exclusive premium collection',
                category: 'premium',
                src: 'https://via.placeholder.com/400x300/2d4a82/f4d03f?text=Premium+Content',
                thumbnail: 'https://via.placeholder.com/400x300/2d4a82/f4d03f?text=Premium+Content',
                date: '2024-03-15',
                tags: ['exclusive', 'premium', 'featured']
            },
            {
                id: 'HXP002',
                title: 'Featured Gallery Set',
                description: 'Curated selection showcasing the finest artistic content',
                category: 'featured',
                src: 'https://via.placeholder.com/400x300/c9a96e/0f1419?text=Featured+Set',
                thumbnail: 'https://via.placeholder.com/400x300/c9a96e/0f1419?text=Featured+Set',
                date: '2024-03-14',
                tags: ['featured', 'artistic', 'curated']
            },
            {
                id: 'HXP003',
                title: 'Exclusive Behind Scenes',
                description: 'Rare behind-the-scenes content from premium shoots',
                category: 'exclusive',
                src: 'https://via.placeholder.com/400x300/f4d03f/0f1419?text=Exclusive+BTS',
                thumbnail: 'https://via.placeholder.com/400x300/f4d03f/0f1419?text=Exclusive+BTS',
                date: '2024-03-13',
                tags: ['exclusive', 'behind-scenes', 'rare']
            },
            {
                id: 'HXP004',
                title: 'Recent Upload',
                description: 'Latest addition to the Hump Heaven collection',
                category: 'recent',
                src: 'https://via.placeholder.com/400x300/1a2332/f4d03f?text=Recent+Upload',
                thumbnail: 'https://via.placeholder.com/400x300/1a2332/f4d03f?text=Recent+Upload',
                date: '2024-03-20',
                tags: ['recent', 'new', 'latest']
            },
            {
                id: 'HXP005',
                title: 'Premium Exclusive',
                description: 'Top-tier exclusive content for premium members only',
                category: 'premium',
                src: 'https://via.placeholder.com/400x300/2d4a82/c9a96e?text=Premium+Exclusive',
                thumbnail: 'https://via.placeholder.com/400x300/2d4a82/c9a96e?text=Premium+Exclusive',
                date: '2024-03-12',
                tags: ['premium', 'exclusive', 'members-only']
            },
            {
                id: 'HXP006',
                title: 'Featured Highlights',
                description: 'Best moments captured in stunning detail',
                category: 'featured',
                src: 'https://via.placeholder.com/400x300/c9a96e/1a2332?text=Featured+Highlights',
                thumbnail: 'https://via.placeholder.com/400x300/c9a96e/1a2332?text=Featured+Highlights',
                date: '2024-03-11',
                tags: ['featured', 'highlights', 'best']
            }
        ];
    }

    setupEventListeners() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.photo-category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.filterByCategory(category);
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.renderPhotos();
    }

    renderPhotos() {
        const photoGrid = document.getElementById('photoGrid');
        if (!photoGrid) return;

        let filteredPhotos = this.photos;
        
        if (this.currentCategory !== 'all') {
            filteredPhotos = this.photos.filter(photo => 
                photo.category === this.currentCategory || 
                photo.tags.includes(this.currentCategory)
            );
        }

        photoGrid.innerHTML = '';

        filteredPhotos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            photoGrid.appendChild(photoElement);
        });

        // Animate in photos
        this.animatePhotos();
    }

    createPhotoElement(photo) {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'card glass-morphism hover:cyber-glow transition-all duration-500 cursor-pointer group animate-float';
        photoDiv.setAttribute('data-photo-id', photo.id);
        
        photoDiv.innerHTML = `
            <figure class="relative overflow-hidden">
                <img src="${photo.thumbnail}" alt="${photo.title}" loading="lazy" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="text-sm font-mono text-holo-blue">// Click to view full resolution</div>
                    </div>
                </div>
            </figure>
            <div class="card-body p-4">
                <h3 class="card-title font-cyber text-lg holographic-text mb-2">${photo.title}</h3>
                <p class="font-mono text-gray-300 text-sm mb-4 leading-relaxed">${photo.description}</p>
                <div class="flex flex-wrap gap-2 justify-between items-center">
                    <div class="badge holographic-gradient text-cyber-dark font-bold text-xs">${photo.id}</div>
                    <div class="badge badge-outline border-holo-${this.getCategoryColor(photo.category)} text-holo-${this.getCategoryColor(photo.category)} text-xs">${photo.category.toUpperCase()}</div>
                </div>
            </div>
        `;

        photoDiv.addEventListener('click', () => {
            this.openPhotoViewer(photo);
        });

        return photoDiv;
    }

    openPhotoViewer(photo) {
        const viewer = document.getElementById('photoViewer');
        const title = document.getElementById('photoViewerTitle');
        const image = document.getElementById('photoViewerImage');
        const description = document.getElementById('photoViewerDescription');
        const id = document.getElementById('photoViewerId');
        const category = document.getElementById('photoViewerCategory');
        const date = document.getElementById('photoViewerDate');

        title.textContent = photo.title;
        image.src = photo.src;
        image.alt = photo.title;
        description.textContent = photo.description;
        id.textContent = photo.id;
        category.textContent = photo.category.toUpperCase();
        date.textContent = photo.date;

        viewer.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }

    animatePhotos() {
        const photos = document.querySelectorAll('.card');
        photos.forEach((photo, index) => {
            photo.style.opacity = '0';
            photo.style.transform = 'translateY(50px) scale(0.9)';
            
            setTimeout(() => {
                photo.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                photo.style.opacity = '1';
                photo.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
    }

    // Public method to add photos dynamically
    addPhoto(photoData) {
        this.photos.push(photoData);
        if (this.currentCategory === 'all' || 
            photoData.category === this.currentCategory || 
            photoData.tags.includes(this.currentCategory)) {
            this.renderPhotos();
        }
    }

    // Public method to remove photos
    removePhoto(photoId) {
        this.photos = this.photos.filter(photo => photo.id !== photoId);
        this.renderPhotos();
    }

    // Search functionality
    searchPhotos(query) {
        const filteredPhotos = this.photos.filter(photo => 
            photo.title.toLowerCase().includes(query.toLowerCase()) ||
            photo.description.toLowerCase().includes(query.toLowerCase()) ||
            photo.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        const photoGrid = document.getElementById('photoGrid');
        photoGrid.innerHTML = '';
        
        filteredPhotos.forEach(photo => {
            const photoElement = this.createPhotoElement(photo);
            photoGrid.appendChild(photoElement);
        });
        
        this.animatePhotos();
    }

    // Helper method to get category color
    getCategoryColor(category) {
        const colorMap = {
            'premium': 'gold',
            'exclusive': 'purple', 
            'featured': 'blue',
            'recent': 'green'
        };
        return colorMap[category] || 'blue';
    }
}

// Photo Viewer Controls
function closePhotoViewer() {
    const viewer = document.getElementById('photoViewer');
    viewer.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const viewer = document.getElementById('photoViewer');
    if (viewer && viewer.classList.contains('modal-open')) {
        if (e.key === 'Escape') {
            closePhotoViewer();
        }
    }
});

// Initialize photo gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('photoGrid')) {
        window.photoGallery = new PhotoGallery();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoGallery;
}
