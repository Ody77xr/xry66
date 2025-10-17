// Admin Dashboard JavaScript
// Handles all admin panel functionality

class AdminDashboard {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.mistralApiKey = '8k34GYRHjyOLMcI11OCSQtESLvO9tvPl';
        this.init();
    }

    async init() {
        // Initialize Supabase
        const { createClient } = supabase;
        this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.options);
        
        // Check authentication
        await this.checkAuth();
        
        // Load dashboard data
        await this.loadDashboardStats();
    }

    async checkAuth() {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
            return;
        }

        // Verify admin role
        const { data: userData, error: userError } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userData || userData.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = userData;
        document.getElementById('adminUsername').textContent = userData.username;
    }

    async loadDashboardStats() {
        try {
            // Load user count
            const { count: userCount } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });
            document.getElementById('totalUsers').textContent = userCount || 0;

            // Load video count
            const { count: videoCount } = await this.supabase
                .from('videos')
                .select('*', { count: 'exact', head: true });
            document.getElementById('totalVideos').textContent = videoCount || 0;

            // Load pending uploads
            const { count: pendingCount } = await this.supabase
                .from('user_uploads')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            document.getElementById('pendingUploads').textContent = pendingCount || 0;

            // Load total views
            const { data: viewsData } = await this.supabase
                .from('videos')
                .select('views');
            const totalViews = viewsData?.reduce((sum, video) => sum + (video.views || 0), 0) || 0;
            document.getElementById('totalViews').textContent = totalViews.toLocaleString();

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    async loadVideos() {
        const container = document.getElementById('videosList');
        container.innerHTML = '<div class="loading">Loading videos...</div>';

        try {
            const { data: videos, error } = await this.supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!videos || videos.length === 0) {
                container.innerHTML = '<p>No videos found.</p>';
                return;
            }

            const tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Views</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${videos.map(video => `
                            <tr>
                                <td>${video.id}</td>
                                <td>${video.title}</td>
                                <td>${video.category}</td>
                                <td>${video.views || 0}</td>
                                <td>
                                    <span class="status-badge ${video.is_published ? 'status-active' : 'status-pending'}">
                                        ${video.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-primary" onclick="adminDashboard.editVideo('${video.id}')">Edit</button>
                                    <button class="btn-danger" onclick="adminDashboard.deleteVideo('${video.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading videos:', error);
            container.innerHTML = '<p>Error loading videos.</p>';
        }
    }

    async loadUsers() {
        const container = document.getElementById('usersList');
        container.innerHTML = '<div class="loading">Loading users...</div>';

        try {
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Member Tier</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${user.member_tier}</td>
                                <td>
                                    <span class="status-badge ${user.is_banned ? 'status-banned' : 'status-active'}">
                                        ${user.is_banned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    ${user.role !== 'admin' ? `
                                        <button class="btn-primary" onclick="adminDashboard.promoteUser('${user.id}')">Promote</button>
                                        <button class="btn-danger" onclick="adminDashboard.banUser('${user.id}', ${!user.is_banned})">${user.is_banned ? 'Unban' : 'Ban'}</button>
                                    ` : '<span>Admin</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading users:', error);
            container.innerHTML = '<p>Error loading users.</p>';
        }
    }

    async loadUploads() {
        const container = document.getElementById('uploadsList');
        container.innerHTML = '<div class="loading">Loading uploads...</div>';

        try {
            const { data: uploads, error } = await this.supabase
                .from('user_uploads')
                .select(`
                    *,
                    users(username, email)
                `)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>User</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${uploads.map(upload => `
                            <tr>
                                <td>${upload.title}</td>
                                <td>${upload.users?.username || 'Unknown'}</td>
                                <td>${upload.type}</td>
                                <td>
                                    <span class="status-badge status-${upload.status}">
                                        ${upload.status}
                                    </span>
                                </td>
                                <td>${new Date(upload.uploaded_at).toLocaleDateString()}</td>
                                <td>
                                    ${upload.status === 'pending' ? `
                                        <button class="btn-primary" onclick="adminDashboard.approveUpload('${upload.id}')">Approve</button>
                                        <button class="btn-danger" onclick="adminDashboard.rejectUpload('${upload.id}')">Reject</button>
                                    ` : `<span>${upload.status}</span>`}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading uploads:', error);
            container.innerHTML = '<p>Error loading uploads.</p>';
        }
    }

    async loadAnalytics() {
        const container = document.getElementById('analyticsData');
        container.innerHTML = '<div class="loading">Loading analytics...</div>';

        try {
            // Get analytics data
            const { data: analytics, error } = await this.supabase
                .from('video_analytics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            // Process analytics with Mistral AI
            const analyticsHTML = await this.processAnalyticsWithMistral(analytics);
            container.innerHTML = analyticsHTML;

        } catch (error) {
            console.error('Error loading analytics:', error);
            container.innerHTML = '<p>Error loading analytics.</p>';
        }
    }

    async processAnalyticsWithMistral(analytics) {
        try {
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.mistralApiKey}`
                },
                body: JSON.stringify({
                    model: 'mistral-small',
                    messages: [{
                        role: 'user',
                        content: `Analyze this video analytics data and provide insights: ${JSON.stringify(analytics.slice(0, 20))}`
                    }],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const insights = data.choices?.[0]?.message?.content || 'No insights available';

            return `
                <div style="background: rgba(0,255,136,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3>🤖 AI Insights</h3>
                    <p>${insights}</p>
                </div>
                <div>
                    <h3>Recent Activity</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Video ID</th>
                                <th>User</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analytics.slice(0, 10).map(event => `
                                <tr>
                                    <td>${event.event_type}</td>
                                    <td>${event.video_id}</td>
                                    <td>${event.user_id}</td>
                                    <td>${new Date(event.created_at).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        } catch (error) {
            console.error('Error processing analytics with Mistral:', error);
            return '<p>Error processing analytics.</p>';
        }
    }

    async addVideo(videoData) {
        try {
            const { data, error } = await this.supabase
                .from('videos')
                .insert([{
                    ...videoData,
                    created_by: this.currentUser.id
                }]);

            if (error) throw error;

            // Log admin action
            await this.logAdminAction('video_added', 'video', videoData.id, { title: videoData.title });

            alert('Video added successfully!');
            this.closeVideoWizard();
            this.loadVideos();

        } catch (error) {
            console.error('Error adding video:', error);
            alert('Error adding video: ' + error.message);
        }
    }

    async banUser(userId, ban = true) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ 
                    is_banned: ban,
                    ban_reason: ban ? 'Banned by admin' : null
                })
                .eq('id', userId);

            if (error) throw error;

            await this.logAdminAction(ban ? 'user_banned' : 'user_unbanned', 'user', userId);
            alert(`User ${ban ? 'banned' : 'unbanned'} successfully!`);
            this.loadUsers();

        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user: ' + error.message);
        }
    }

    async promoteUser(userId) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ member_tier: 'vip' })
                .eq('id', userId);

            if (error) throw error;

            await this.logAdminAction('user_promoted', 'user', userId);
            alert('User promoted to VIP successfully!');
            this.loadUsers();

        } catch (error) {
            console.error('Error promoting user:', error);
            alert('Error promoting user: ' + error.message);
        }
    }

    async approveUpload(uploadId) {
        try {
            const { error } = await this.supabase
                .from('user_uploads')
                .update({ 
                    status: 'approved',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: this.currentUser.id
                })
                .eq('id', uploadId);

            if (error) throw error;

            await this.logAdminAction('upload_approved', 'upload', uploadId);
            alert('Upload approved successfully!');
            this.loadUploads();

        } catch (error) {
            console.error('Error approving upload:', error);
            alert('Error approving upload: ' + error.message);
        }
    }

    async rejectUpload(uploadId) {
        const reason = prompt('Rejection reason:');
        if (!reason) return;

        try {
            const { error } = await this.supabase
                .from('user_uploads')
                .update({ 
                    status: 'rejected',
                    rejection_reason: reason,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: this.currentUser.id
                })
                .eq('id', uploadId);

            if (error) throw error;

            await this.logAdminAction('upload_rejected', 'upload', uploadId, { reason });
            alert('Upload rejected successfully!');
            this.loadUploads();

        } catch (error) {
            console.error('Error rejecting upload:', error);
            alert('Error rejecting upload: ' + error.message);
        }
    }

    async logAdminAction(action, targetType, targetId, details = null) {
        try {
            await this.supabase
                .from('admin_audit_log')
                .insert([{
                    admin_id: this.currentUser.id,
                    action,
                    target_type: targetType,
                    target_id: targetId,
                    details
                }]);
        } catch (error) {
            console.error('Error logging admin action:', error);
        }
    }

    showVideoWizard() {
        document.getElementById('videoWizard').style.display = 'block';
    }

    closeVideoWizard() {
        document.getElementById('videoWizard').style.display = 'none';
        document.getElementById('videoForm').reset();
    }
}

// Global functions for UI interaction
function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.management-panel').forEach(panel => {
        panel.classList.add('panel-hidden');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
    document.getElementById(panelName + '-panel').classList.remove('panel-hidden');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load panel data
    switch(panelName) {
        case 'videos':
            adminDashboard.loadVideos();
            break;
        case 'users':
            adminDashboard.loadUsers();
            break;
        case 'uploads':
            adminDashboard.loadUploads();
            break;
        case 'analytics':
            adminDashboard.loadAnalytics();
            break;
    }
}

function showVideoWizard() {
    adminDashboard.showVideoWizard();
}

function closeVideoWizard() {
    adminDashboard.closeVideoWizard();
}

// Handle video form submission
document.addEventListener('DOMContentLoaded', function() {
    const videoForm = document.getElementById('videoForm');
    if (videoForm) {
        videoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const videoData = {
                id: document.getElementById('videoId').value,
                title: document.getElementById('videoTitle').value,
                description: document.getElementById('videoDescription').value,
                embed_code: document.getElementById('videoEmbed').value,
                category: document.getElementById('videoCategory').value,
                duration: document.getElementById('videoDuration').value,
                thumbnail_url: document.getElementById('videoThumbnail').value,
                is_premium: document.getElementById('videoPremium').checked,
                is_published: true
            };
            
            await adminDashboard.addVideo(videoData);
        });
    }
});

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();
