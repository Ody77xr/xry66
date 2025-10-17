# Hxmp Space

A premium digital content platform built with modern web technologies, featuring a dynamic gallery, real-time messaging, and user-generated content management.

## 🚀 Features

- **Interactive Gallery**: Dynamic content filtering with video preview on hover
- **Real-time Messaging**: Instant communication between users
- **Content Upload**: Drag-and-drop file upload with progress tracking
- **User Profiles**: Personal dashboards with analytics and content management
- **Membership Tiers**: Free, Premium, and VIP subscription plans
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Gradient designs with smooth animations

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (Database, Authentication, Storage)
- **Deployment**: Netlify
- **Styling**: Custom CSS with modern gradients and animations
- **Fonts**: Inter from Google Fonts

## 📁 Project Structure

```
xr7/
├── index.html              # Landing page with fade-in animation
├── xrhome.html            # Homepage with hero section and categories
├── xrhxmpgallery.html     # Main gallery with filtering
├── xrabout.html           # About page
├── xruploader.html        # Content upload interface
├── xrmessaging.html       # Real-time messaging system
├── xrmyhxmps.html         # User dashboard and profile
├── xrdocs.html            # Documentation center
├── xrmembership.html      # Membership and pricing plans
├── styles.css             # Main stylesheet
├── app.js                 # General JavaScript functionality
├── gallery.js             # Gallery-specific JavaScript
├── supabase-config.js     # Supabase configuration and services
├── netlify.toml           # Netlify deployment configuration
├── _redirects             # URL redirects and routing
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase account
- A Netlify account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hxmp-space.git
   cd hxmp-space
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Configure Supabase**
   - Open `supabase-config.js`
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual values

3. **Create database tables**
   - Run the SQL commands provided in `supabase-config.js` in your Supabase SQL editor

4. **Set up storage buckets**
   - Create buckets: `content-files`, `user-avatars`, `thumbnails`

### Deployment

#### Netlify Deployment

1. **Connect to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy to Netlify**
   ```bash
   npm run deploy
   ```

3. **Set up custom domain** (optional)
   - Configure your custom domain in Netlify dashboard
   - Update DNS settings

## 🎨 Customization

### Colors and Styling

The app uses a modern gradient color scheme defined in `styles.css`:

- Primary: `#4ecdc4` (Teal)
- Secondary: `#ff6b6b` (Coral)
- Accent: `#9b59b6` (Purple)
- Gold: `#ffd700` (Gold)

### Categories

The gallery supports four main categories:
- **Thot-Mommies**: Premium exclusive content
- **Bubble Butts**: Amazing curves and bootylicious content
- **Premium Vault**: Curated creator collection
- **Tits**: Classic aesthetic content

### Membership Tiers

- **Free**: Basic access with upload limits
- **Premium ($9.99/month)**: Full access with unlimited uploads
- **VIP ($24.99/month)**: Exclusive content and features

## 🔧 Configuration

### Environment Variables

Add these to your Netlify environment variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Netlify Configuration

The `netlify.toml` file includes:
- Build settings
- Redirect rules
- Security headers
- Caching policies

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security Features

- Content Security Policy (CSP) headers
- XSS protection
- CSRF protection via Supabase
- Row Level Security (RLS) on database

## 🎯 Performance

- Optimized images and videos
- CSS and JS minification ready
- CDN delivery via Netlify
- Lazy loading for gallery content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [Documentation Center](xrdocs.html)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-username/hxmp-space/issues)
- **Email**: support@hxmpspace.com

## 🔄 Updates

### Version 1.0.0
- Initial release with core features
- Gallery with dynamic filtering
- Real-time messaging system
- User profiles and analytics
- Membership system
- Supabase integration
- Netlify deployment ready

---

**Built with ❤️ by the Hxmp Space Team**
