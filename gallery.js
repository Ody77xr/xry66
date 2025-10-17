// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const videoPlayer = document.getElementById('videoPlayer');
    const imageViewer = document.getElementById('imageViewer');
    const modalVideo = document.getElementById('modalVideo');
    const modalImage = document.getElementById('modalImage');
    const closeBtn = document.getElementById('closeBtn');
    const closeImageBtn = document.getElementById('closeImageBtn');

    // Get URL parameters for initial filtering
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    
    if (initialCategory) {
        // Set active filter button
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === initialCategory) {
                btn.classList.add('active');
            }
        });
        
        // Filter items
        filterGallery(initialCategory);
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterGallery(category);
        });
    });

    function filterGallery(category) {
        galleryItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                item.style.animation = 'slideInUp 0.5s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Gallery item click functionality
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const src = item.dataset.src;
            const title = item.querySelector('h3').textContent;
            const description = item.querySelector('p').textContent;

            if (type === 'video') {
                // Show video player
                modalVideo.src = src;
                document.getElementById('videoTitle').textContent = title;
                document.getElementById('videoDescription').textContent = description;
                videoPlayer.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else if (type === 'image') {
                // Show image viewer
                modalImage.src = src;
                document.getElementById('imageTitle').textContent = title;
                document.getElementById('imageDescription').textContent = description;
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close video player
    closeBtn.addEventListener('click', closeVideoPlayer);
    closeImageBtn.addEventListener('click', closeImageViewer);

    // Close on background click
    videoPlayer.addEventListener('click', (e) => {
        if (e.target === videoPlayer) {
            closeVideoPlayer();
        }
    });

    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            closeImageViewer();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoPlayer();
            closeImageViewer();
        }
    });

    function closeVideoPlayer() {
        videoPlayer.classList.remove('active');
        modalVideo.pause();
        modalVideo.src = '';
        document.body.style.overflow = 'auto';
    }

    function closeImageViewer() {
        imageViewer.classList.remove('active');
        modalImage.src = '';
        document.body.style.overflow = 'auto';
    }

    // Hover effects for gallery items
    galleryItems.forEach(item => {
        const video = item.querySelector('video');
        if (video) {
            item.addEventListener('mouseenter', () => {
                video.play().catch(e => console.log('Video play failed:', e));
            });
            
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
        }
    });

    // Simulate loading more content (for demo purposes)
    function loadMoreContent() {
        // This would typically make an API call to load more content
        console.log('Loading more content...');
    }

    // Infinite scroll (basic implementation)
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            loadMoreContent();
        }
    });

    // Search functionality (if search input exists)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            galleryItems.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const description = item.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
