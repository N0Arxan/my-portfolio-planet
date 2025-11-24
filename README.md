# 🌍 Arshan's Portfolio Planet

> **Live at**: [arshan.me](http://arxan.me)

An immersive, interactive 3D portfolio showcasing my journey from Bandar Abbas, Iran to Barcelona, Spain. Built with cutting-edge web technologies to create a unique, planet-based navigation experience.

---

## 🎯 Project Overview

This portfolio transforms the traditional CV into an explorable 3D Earth visualization, where key locations in my professional journey are marked as interactive pins. The project demonstrates advanced frontend capabilities, 3D graphics integration, and modern web development practices.

### Key Features

- **🌐 Interactive 3D Globe**: Real-time WebGL rendering using Three.js and Globe.gl
- **📍 Location Markers**: Visual representation of home (Bandar Abbas), current location (Barcelona), and visited cities
- **🛰️ Orbital Satellite**: Animated 3D satellite with pulsing lights
- **✨ Realistic Starfield**: 10,000+ procedurally generated stars with natural color variations
- **💬 Contact System**: Secure form with rate limiting, spam detection, and SQLite persistence
- **🎨 Apple-Inspired Design**: Minimalist UI with glassmorphism and smooth animations
- **📱 Mobile-First**: Fully responsive with touch-optimized controls
- **🔒 Security-Hardened**: Rate limiting, input sanitization, honeypot protection

---

## 🏗️ Technical Architecture

### Frontend Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 with SSR/SSG capabilities)
- **3D Graphics**: [Three.js](https://threejs.org/) + [Globe.gl](https://globe.gl/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Apple-inspired design system
- **Icons**: [Lucide Vue](https://lucide.dev/)
- **Language**: TypeScript

### Backend Stack

- **Runtime**: Node.js (Nuxt Server)
- **Database**: SQLite with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **API**: Nitro server endpoints (built into Nuxt)
- **Security**: Custom rate limiting, input validation, spam detection

### 3D Rendering Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  Globe.gl (High-level wrapper)                          │
│  ├─ Manages globe texture loading                       │
│  ├─ Handles HTML marker positioning                     │
│  └─ Provides camera controls                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Three.js (Core 3D engine)                              │
│  ├─ Scene management                                    │
│  ├─ Material system (PBR with roughness/metalness)      │
│  ├─ 3-point lighting setup                              │
│  └─ OrbitControls with polar angle constraints          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Post-Processing (EffectComposer)                       │
│  ├─ RenderPass (base render)                            │
│  ├─ UnrealBloomPass (atmospheric glow)                  │
│  └─ ACES Filmic Tone Mapping                            │
└─────────────────────────────────────────────────────────┘
                            ↓
                       WebGL Renderer
```

### Contact System Security Architecture

```typescript
Request → Rate Limiter (5/hour/IP)
       → Honeypot Check
       → Input Validation (regex + length)
       → Spam Detection (keywords + URLs)
       → Duplicate Check (1 hour window)
       → Sanitization (XSS prevention)
       → SQLite Storage
```

**Security Features**:
- **Rate Limiting**: 5 submissions per hour per IP address
- **Honeypot**: Hidden field to catch bots
- **Input Validation**: Regex patterns, min/max length enforcement
- **Spam Detection**: Keyword filtering, excessive link detection
- **Duplicate Prevention**: Email-based deduplication (1-hour window)
- **XSS Protection**: HTML tag stripping
- **SQL Injection Prevention**: Parameterized queries

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm/pnpm/yarn
- Docker & Docker Compose (for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/my-portfolio-planet.git
cd my-portfolio-planet

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file (optional - all defaults work out of the box):

```env
# Server
PORT=3000
NODE_ENV=development

# Database (auto-created if not exists)
DB_PATH=./server/database/contacts.sqlite
```

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

**Data Persistence**: The SQLite database is mounted to `./data/database/` on your host system, ensuring data survives container restarts.

### Using Docker Directly

```bash
# Build the image
docker build -t arshan-portfolio .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data/database:/app/server/database \
  --name arshan-portfolio \
  arshan-portfolio
```

### Production Deployment

For production with a reverse proxy (nginx/Caddy):

```yaml
# docker-compose.prod.yml
services:
  portfolio:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
    volumes:
      - ./data/database:/app/server/database
    networks:
      - web

networks:
  web:
    external: true
```

---

## 📁 Project Structure

```
my-portfolio-planet/
├── assets/
│   └── css/
│       └── main.css              # Global styles & Tailwind imports
├── components/
│   ├── ContactModal.vue          # Secure contact form with validation
│   ├── TheDock.vue              # macOS-style navigation dock
│   ├── TheGlobe.vue             # Main 3D Earth component
│   ├── TheHeader.vue            # Site header
│   └── locations.ts             # Geographic coordinates data
├── pages/
│   └── index.vue                # Homepage
├── server/
│   ├── api/
│   │   └── contact.post.ts      # Contact form API endpoint
│   ├── database/
│   │   └── contacts.sqlite      # SQLite database (auto-created)
│   └── utils/
│       └── db.ts                # Database initialization
├── public/
│   └── robots.txt               # SEO configuration
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Multi-stage Docker build
├── nuxt.config.ts              # Nuxt configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## 🎨 Design System

### Color Palette (Apple HIG Inspired)

```css
/* Primary Colors */
--apple-blue: #007aff        /* Current location marker */
--apple-red: #ff3b30         /* Home location marker */
--apple-purple: #5856d6      /* Visited locations */
--gold: #ffd700              /* Star markers */

/* Backgrounds */
--deep-space: #000000        /* Starfield background */
--gray-900: #1c1c1e          /* UI surfaces */

/* Effects */
--glassmorphism: backdrop-blur(20px) + rgba(white, 0.1)
```

### Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Weights**: 300 (thin), 500 (medium), 600 (semibold)

---

## 🌟 Key Components

### TheGlobe.vue

The core 3D visualization component featuring:

- **Enhanced Materials**: PBR rendering with roughness (0.6) and metalness (0.1)
- **Professional Lighting**: 3-point setup (key, fill, ambient)
- **Post-Processing**: Bloom effects for atmospheric glow
- **Performance**: Full device pixel ratio with optimized rendering
- **Controls**: Damped rotation, polar angle constraints (54°-126°)
- **Initial View**: Centered on Middle East (Bandar Abbas: 27.18°N, 56.27°E)

### ContactModal.vue

Secure contact form with:

- Real-time character counters
- Visual validation feedback
- Mobile-optimized inputs
- Success/error state management
- Automatic form clearing on success

---

## 📊 Database Schema

```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_created ON contacts(email, created_at);
```

---

## 🔧 Configuration

### Nuxt Config Highlights

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  typescript: { strict: true },
  ssr: true, // Server-side rendering enabled
})
```

### Performance Optimizations

- **Code Splitting**: Automatic chunk splitting via Nuxt
- **Lazy Loading**: Dynamic imports for 3D libraries
- **Image Optimization**: WebGL textures from CDN
- **Database Indexing**: Composite index on (email, created_at)
- **Rate Limiting Cleanup**: Automatic memory cleanup every 10 minutes

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
npm run preview
```

---

## 📈 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: ~400KB (gzipped)
- **3D Rendering**: 60 FPS on modern devices

---

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run generate     # Generate static site (SSG)
npm run type-check   # TypeScript validation
```

---

## 🌐 Deployment

### Recommended Platforms

- **Vercel**: Zero-config deployment with `vercel deploy`
- **Netlify**: Drag-and-drop or Git integration
- **Docker**: Self-hosted with docker-compose
- **VPS**: nginx reverse proxy + PM2 process manager

### Build Output

```bash
npm run build
# Output: .output/ directory
# Contains: server/ (Nitro) + public/ (static assets)
```

---

## 📝 License

This project is personal portfolio code. Feel free to use it as inspiration, but please don't copy it verbatim.

---

## 👨‍💻 About the Developer

**Arshan** - Full-stack developer passionate about creating immersive web experiences.


- 🌐 [arshan.me](http://arxan.me)

---

## 🙏 Acknowledgments

- **Globe.gl**: Incredible 3D globe library
- **Three.js**: The backbone of WebGL rendering
- **Nuxt.js**: Powerful Vue.js framework
- **Tailwind CSS**: Utility-first CSS framework
- **Apple HIG**: Design inspiration

---

**Built with ❤️ using Vue, Nuxt, Three.js, and a passion for great UX**

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
