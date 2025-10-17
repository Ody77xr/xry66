// Video Gallery Management System
class VideoGallery {
    constructor() {
        this.videos = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadRealVideos();
        this.setupEventListeners();
        this.renderVideos();
    }

    loadRealVideos() {
        // Video content collection
        this.videos = [
            // Tits Category Videos
            {
                id: 'TITS001',
                title: 'Giant BBW TittyFuck',
                description: 'Premium BBW content featuring massive natural assets',
                category: 'tits',
                subcategory: 'thot-mommies',
                thumbnail: 'Tits.png',
                duration: '12:30',
                embedCode: '<iframe src="https://xhamster.com/videos/giant-bbw-tittyfuck-xhyfeMv" title="Giant BBW TittyFuck" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-10-05',
                tags: ['tits', 'thot-mommies', 'bbw', 'natural', 'massive'],
                views: 4250,
                isPremium: false
            },
            {
                id: 'TITS002',
                title: 'My Big Titty Step Sister Tittyfuck Me',
                description: 'Step sister with incredible assets provides premium experience',
                category: 'tits',
                subcategory: 'thot-mommies',
                thumbnail: 'Tits.png',
                duration: '15:45',
                embedCode: '<iframe src="https://xhamster.com/videos/my-big-titty-step-sister-tittyfuck-me-xhzZgm6" title="My Big Titty Step Sister Tittyfuck Me" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-10-04',
                tags: ['tits', 'thot-mommies', 'step-sister', 'big-titty', 'family'],
                views: 3890,
                isPremium: false
            },
            {
                id: 'TITS003',
                title: 'Ebony Titty Fucking Me',
                description: 'Premium ebony content with incredible natural assets',
                category: 'tits',
                subcategory: 'thot-mommies',
                thumbnail: 'Tits.png',
                duration: '18:20',
                embedCode: '<iframe src="https://xhamster.com/videos/ebony-titty-fucking-me-xhGMTUF" title="Ebony Titty Fucking Me" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-10-03',
                tags: ['tits', 'thot-mommies', 'ebony', 'natural', 'premium'],
                views: 5120,
                isPremium: false
            },
            // Thot-Mommies Category Videos
            {
                id: 'THOT001',
                title: 'Big Black Ass JOI',
                description: 'Premium JOI content featuring incredible curves',
                category: 'thot-mommies',
                thumbnail: 'Thot.png',
                duration: '10:15',
                embedCode: '<iframe src="https://xhamster.com/videos/big-black-ass-joi-11761328" title="Big Black Ass JOI" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-10-02',
                tags: ['thot-mommies', 'big-black-ass', 'joi', 'curves', 'premium'],
                views: 6780,
                isPremium: false
            },
            {
                id: 'THOT002',
                title: 'Frannie Huge Ass Riding Dat Young BBC She Met Next Door',
                description: 'Incredible ass-clappin action with the neighbor',
                category: 'thot-mommies',
                subcategory: 'ass-clappin-on-dick',
                thumbnail: 'Thot.png',
                duration: '22:30',
                embedCode: '<iframe src="https://xhamster.com/videos/frannie-huge-ass-riding-dat-young-bbc-she-met-next-door-xhRd50c" title="Frannie Huge Ass Riding Dat Young BBC She Met Next Door" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-10-01',
                tags: ['thot-mommies', 'ass-clappin-on-dick', 'huge-ass', 'bbc', 'neighbor'],
                views: 8950,
                isPremium: false
            },
            {
                id: 'THOT003',
                title: 'She Loves It In Her Huge Soft Juicy Ass',
                description: 'Premium ass-clappin content with incredible action',
                category: 'thot-mommies',
                subcategory: 'ass-clappin-on-dick',
                thumbnail: 'Thot.png',
                duration: '19:45',
                embedCode: '<iframe src="https://xhamster.com/videos/she-loves-it-in-her-huge-soft-juicy-ass-xhxxtZR" title="She Loves It In Her Huge Soft Juicy Ass" width="560" height="315" frameborder="0" allowfullscreen></iframe>',
                date: '2024-09-30',
                tags: ['thot-mommies', 'ass-clappin-on-dick', 'huge-ass', 'soft', 'juicy'],
                views: 7340,
                isPremium: false
            }
        ];
    }

    setupEventListeners() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.video-category-btn');
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
        this.renderVideos();
    }

    renderVideos() {
        const videoGrid = document.getElementById('videoGrid');
        if (!videoGrid) return;

        let filteredVideos = this.videos;
        
        if (this.currentCategory !== 'all') {
            filteredVideos = this.videos.filter(video => 
                video.category === this.currentCategory || 
                video.tags.includes(this.currentCategory)
            );
        }

        videoGrid.innerHTML = '';

        filteredVideos.forEach(video => {
            const videoElement = this.createVideoElement(video);
            videoGrid.appendChild(videoElement);
        });

        // Animate in videos
        this.animateVideos();
    }

    createVideoElement(video) {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'card glass-morphism hover:cyber-glow transition-all duration-500 cursor-pointer group animate-float';
        videoDiv.setAttribute('data-video-id', video.id);
        
        const premiumBadge = video.isPremium ? `<div class="badge holographic-gradient text-cyber-dark font-bold text-xs">PREMIUM</div>` : '';
        
        videoDiv.innerHTML = `
            <figure class="relative overflow-hidden">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="w-16 h-16 rounded-full glass-morphism holographic-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg class="w-8 h-8 text-holo-blue ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="absolute bottom-2 right-2 badge glass-morphism text-holo-gold font-mono text-xs">${video.duration}</div>
                <div class="absolute top-2 left-2">
                    ${premiumBadge}
                </div>
            </figure>
            <div class="card-body p-4">
                <h3 class="card-title font-cyber text-lg holographic-text mb-2">${video.title}</h3>
                <p class="font-mono text-gray-300 text-sm mb-4 leading-relaxed">${video.description}</p>
                <div class="flex flex-wrap gap-2 justify-between items-center">
                    <div class="badge holographic-gradient text-cyber-dark font-bold text-xs">${video.id}</div>
                    <div class="flex gap-2 items-center">
                        <div class="badge badge-outline border-holo-${this.getCategoryColor(video.category)} text-holo-${this.getCategoryColor(video.category)} text-xs">${video.category.toUpperCase()}</div>
                        <div class="text-xs font-mono text-gray-500">${video.views} views</div>
                    </div>
                </div>
            </div>
        `;

        videoDiv.addEventListener('click', () => {
            this.openVideoPlayer(video);
        });

        return videoDiv;
    }

    openVideoPlayer(video) {
        const locked = (video.tags||[]).includes('premium-vault') || (video.tags||[]).includes('onevault');
        if (locked && window.accessControl) {
            window.accessControl.checkAndPlay(video);
            return;
        }
        
        // Redirect to new cinematic video player
        window.location.href = `xrvideoplayer.html?id=${video.id}`;
    }

    animateVideos() {
        const videos = document.querySelectorAll('.card');
        videos.forEach((video, index) => {
            video.style.opacity = '0';
            video.style.transform = 'translateY(50px) scale(0.9)';
            
            setTimeout(() => {
                video.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                video.style.opacity = '1';
                video.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
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

    // Public method to add videos dynamically
    addVideo(videoData) {
        this.videos.push(videoData);
        if (this.currentCategory === 'all' || 
            videoData.category === this.currentCategory || 
            videoData.tags.includes(this.currentCategory)) {
            this.renderVideos();
        }
    }

    // Public method to remove videos
    removeVideo(videoId) {
        this.videos = this.videos.filter(video => video.id !== videoId);
        this.renderVideos();
    }

    // Search functionality
    searchVideos(query) {
        const filteredVideos = this.videos.filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.description.toLowerCase().includes(query.toLowerCase()) ||
            video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        const videoGrid = document.getElementById('videoGrid');
        videoGrid.innerHTML = '';
        
        filteredVideos.forEach(video => {
            const videoElement = this.createVideoElement(video);
            videoGrid.appendChild(videoElement);
        });
        
        this.animateVideos();
    }

    // Get video by ID
    getVideoById(videoId) {
        return this.videos.find(video => video.id === videoId);
    }

    // Update video views
    incrementViews(videoId) {
        const video = this.getVideoById(videoId);
        if (video) {
            video.views++;
            this.renderVideos();
        }
    }
}

// Initialize video gallery when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('videoGrid')) {
        window.videoGallery = new VideoGallery();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoGallery;
}
