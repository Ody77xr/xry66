// HXMP Video Player - Premium Video Player Component for Hump Heaven
class HXMPVideoPlayer {
    constructor() {
        this.currentVideo = null;
        this.isPlaying = false;
        this.isFullscreen = false;
        this.init();
    }

    init() {
        this.createPlayerStyles();
        this.setupEventListeners();
    }

    createPlayerStyles() {
        // Inject custom styles for the video player
        const style = document.createElement('style');
        style.textContent = `
            .hxmp-video-player {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 5000;
                display: none;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .hxmp-video-player.active {
                display: flex;
            }

            .video-player-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 30% 20%, rgba(201, 169, 110, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, rgba(45, 74, 130, 0.15) 0%, transparent 50%);
                z-index: 1;
            }

            .video-player-container {
                position: relative;
                z-index: 2;
                width: 100%;
                max-width: 900px;
                max-height: 95%;
                background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(15, 20, 25, 0.98) 100%);
                border-radius: 25px;
                overflow: hidden;
                border: 3px solid rgba(244, 208, 63, 0.5);
                box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6),
                            0 0 0 1px rgba(201, 169, 110, 0.2),
                            inset 0 2px 0 rgba(244, 208, 63, 0.1);
                animation: playerSlideIn 0.4s ease-out;
            }

            @keyframes playerSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .video-player-header {
                background: linear-gradient(90deg, rgba(45, 74, 130, 0.9), rgba(201, 169, 110, 0.7));
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid rgba(244, 208, 63, 0.3);
            }

            .video-player-title {
                color: #f4d03f;
                font-family: 'Orbitron', monospace;
                font-weight: 700;
                font-size: 1.4rem;
                margin: 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
                letter-spacing: 1px;
            }

            .video-player-close {
                background: linear-gradient(45deg, #c9a96e, #f4d03f);
                color: #0f1419;
                border: 2px solid rgba(244, 208, 63, 0.5);
                border-radius: 50%;
                width: 45px;
                height: 45px;
                cursor: pointer;
                font-size: 1.4rem;
                font-weight: 700;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .video-player-close:hover {
                background: linear-gradient(45deg, #f4d03f, #c9a96e);
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 8px 25px rgba(244, 208, 63, 0.5);
            }

            .video-player-content {
                padding: 2rem;
            }

            .video-player-iframe {
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                background: #000;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
                            inset 0 0 0 2px rgba(244, 208, 63, 0.2);
                margin-bottom: 2rem;
            }

            .video-player-iframe iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 15px;
            }

            .video-player-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #f4d03f;
                font-family: 'Orbitron', monospace;
                font-size: 1.2rem;
                text-align: center;
            }

            .video-player-info {
                background: linear-gradient(135deg, rgba(45, 74, 130, 0.2) 0%, rgba(26, 35, 50, 0.3) 100%);
                border-radius: 15px;
                padding: 2rem;
                border: 1px solid rgba(201, 169, 110, 0.3);
            }

            .video-player-details {
                margin-bottom: 1.5rem;
            }

            .video-description {
                color: #c9a96e;
                font-size: 1.1rem;
                line-height: 1.7;
                margin-bottom: 1.5rem;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }

            .video-meta-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
                font-size: 0.9rem;
                color: rgba(201, 169, 110, 0.7);
            }

            .video-id-display {
                font-family: 'Orbitron', monospace;
                color: #f4d03f;
                background: rgba(244, 208, 63, 0.1);
                padding: 0.3rem 0.8rem;
                border-radius: 8px;
                border: 1px solid rgba(244, 208, 63, 0.3);
            }

            .video-category-display {
                background: linear-gradient(45deg, #2d4a82, #c9a96e);
                color: #f4d03f;
                padding: 0.3rem 0.8rem;
                border-radius: 8px;
                text-transform: uppercase;
                font-weight: 600;
                font-size: 0.8rem;
                letter-spacing: 1px;
            }

            .video-duration-display {
                color: #c9a96e;
                font-family: 'Orbitron', monospace;
            }

            .video-controls {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 2rem;
            }

            .video-control-btn {
                background: linear-gradient(45deg, transparent, rgba(244, 208, 63, 0.1));
                color: #f4d03f;
                border: 2px solid #c9a96e;
                border-radius: 25px;
                padding: 0.8rem 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .video-control-btn:hover {
                background: linear-gradient(45deg, #c9a96e, #f4d03f);
                color: #0f1419;
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(244, 208, 63, 0.4);
            }

            @media (max-width: 768px) {
                .video-player-container {
                    width: 95%;
                    max-height: 90%;
                }

                .video-player-header {
                    padding: 1rem;
                }

                .video-player-title {
                    font-size: 1.1rem;
                }

                .video-player-content {
                    padding: 1rem;
                }

                .video-meta-info {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Close player when clicking outside
        document.addEventListener('click', (e) => {
            const player = document.getElementById('hxmpVideoPlayer');
            if (player && e.target === player) {
                this.closePlayer();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const player = document.getElementById('hxmpVideoPlayer');
            if (player && player.classList.contains('modal-open')) {
                switch(e.key) {
                    case 'Escape':
                        this.closePlayer();
                        break;
                    case 'f':
                    case 'F':
                        this.toggleFullscreen();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                }
            }
        });
    }

    playVideo(videoData) {
        this.currentVideo = videoData;
        this.showPlayer();
        this.loadVideo();
        
        // Increment view count if video gallery is available
        if (window.videoGallery) {
            window.videoGallery.incrementViews(videoData.id);
        }
    }

    showPlayer() {
        const player = document.getElementById('hxmpVideoPlayer');
        if (player) {
            player.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        }
    }

    closePlayer() {
        const player = document.getElementById('hxmpVideoPlayer');
        if (player) {
            player.classList.remove('modal-open');
            document.body.style.overflow = 'auto';
            
            // Clear iframe content to stop video
            const iframeContainer = document.getElementById('videoPlayerIframe');
            if (iframeContainer) {
                iframeContainer.innerHTML = '<div class="flex items-center justify-center h-full text-holo-blue font-mono">Video Stopped</div>';
            }
            
            this.currentVideo = null;
            this.isPlaying = false;
        }
    }

    loadVideo() {
        if (!this.currentVideo) return;

        const title = document.getElementById('videoPlayerTitle');
        const description = document.getElementById('videoPlayerDescription');
        const videoId = document.getElementById('videoIdDisplay');
        const category = document.getElementById('videoCategoryDisplay');
        const duration = document.getElementById('videoDurationDisplay');
        const iframeContainer = document.getElementById('videoPlayerIframe');

        if (title) title.textContent = this.currentVideo.title;
        if (description) description.textContent = this.currentVideo.description;
        if (videoId) videoId.textContent = this.currentVideo.id;
        if (category) category.textContent = this.currentVideo.category.toUpperCase();
        if (duration) duration.textContent = this.currentVideo.duration;

        if (iframeContainer) {
            // Show loading
            iframeContainer.innerHTML = '<div class="flex items-center justify-center h-full text-holo-blue font-mono animate-pulse">Loading Video...</div>';
            
            // Load iframe after a short delay to show loading state
            setTimeout(() => {
                if (this.currentVideo && this.currentVideo.embedCode) {
                    // Create iframe with proper styling
                    const iframe = this.currentVideo.embedCode;
                    const styledIframe = iframe.replace(
                        '<iframe', 
                        '<iframe style="width: 100%; height: 100%; border-radius: 8px;"'
                    );
                    iframeContainer.innerHTML = styledIframe;
                    this.isPlaying = true;
                } else {
                    iframeContainer.innerHTML = '<div class="flex items-center justify-center h-full text-red-400 font-mono">Video Unavailable</div>';
                }
            }, 1000);
        }
    }

    toggleFullscreen() {
        const player = document.getElementById('hxmpVideoPlayer');
        if (!player) return;

        if (!this.isFullscreen) {
            if (player.requestFullscreen) {
                player.requestFullscreen();
            } else if (player.webkitRequestFullscreen) {
                player.webkitRequestFullscreen();
            } else if (player.msRequestFullscreen) {
                player.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        
        this.isFullscreen = !this.isFullscreen;
    }

    togglePlayPause() {
        // This would need to interface with the actual video element
        // For now, we'll just toggle the state
        this.isPlaying = !this.isPlaying;
        console.log(this.isPlaying ? 'Playing' : 'Paused');
    }

    // Method to update video data dynamically
    updateVideoData(videoData) {
        this.currentVideo = { ...this.currentVideo, ...videoData };
        if (document.getElementById('hxmpVideoPlayer').classList.contains('modal-open')) {
            this.loadVideo();
        }
    }

    // Get current video info
    getCurrentVideo() {
        return this.currentVideo;
    }
}

// Global function to close video player
function closeVideoPlayer() {
    if (window.hxmpVideoPlayer) {
        window.hxmpVideoPlayer.closePlayer();
    }
}

// Initialize HXMP Video Player when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hxmpVideoPlayer = new HXMPVideoPlayer();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HXMPVideoPlayer;
}
