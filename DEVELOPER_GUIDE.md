# 🚀 Qurban Berdampak - Developer Guide

## 📋 Daftar Isi
- [Setup Development](#setup-development)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Utilities & Tools](#utilities--tools)
- [Testing](#testing)
- [Performance](#performance)
- [Deployment](#deployment)

## 🔧 Setup Development

### Prerequisites
- Node.js 18+
- npm atau yarn
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/triutama133/qurbanNextjsv2.git
cd qurbanNextjsv2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi yang sesuai

# Run development server
npm run dev
```

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional Services
RESEND_API_KEY=your_resend_key (untuk email)
GOOGLE_CLOUD_PROJECT_ID=your_project_id (untuk file upload)
```

## 🏗️ Arsitektur Aplikasi

### Struktur Folder
```
qurbanNextjsv2/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── qurban/           # Main application pages
│   ├── layout.js         # Root layout
│   └── page.js           # Root redirect
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── admin/            # Admin components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities & helpers
│   ├── supabase-admin.js # Database client
│   ├── performance.js    # Performance monitoring
│   ├── analytics.tsx     # Analytics utilities
│   ├── cache.ts         # Caching system
│   ├── seo.ts           # SEO utilities
│   └── lazy-loading.tsx # Lazy loading utilities
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── styles/               # Global styles
└── __tests__/           # Test files
```

### Tech Stack
- **Frontend**: Next.js 15, React 18, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 🛠️ Utilities & Tools

### 1. Database Client (Supabase)
```javascript
import { createSupabaseAdmin, isSupabaseAvailable } from '../lib/supabase-admin'

// Penggunaan di API routes
const supabase = createSupabaseAdmin()
if (!isSupabaseAvailable()) {
  return NextResponse.json({ error: 'Database tidak tersedia' }, { status: 503 })
}
```

### 2. Performance Monitoring
```javascript
import { PerformanceMonitor, usePerformanceLog } from '../lib/performance'

// Monitor page load
PerformanceMonitor.measurePageLoad()

// Monitor API calls
const startTime = performance.now()
const response = await fetch('/api/data')
PerformanceMonitor.measureApiCall('getData', startTime, performance.now())

// Hook untuk component performance
function MyComponent() {
  usePerformanceLog('MyComponent')
  return <div>Content</div>
}
```

### 3. Analytics Tracking
```javascript
import { Analytics, useAnalytics } from '../lib/analytics'

// Track events
Analytics.trackEvent('button_click', { button_name: 'register' })
Analytics.trackFormSubmission('registration', true)
Analytics.trackUserAction('click', 'navigation', 'dashboard')

// Hook untuk component tracking
function Dashboard() {
  const { trackEvent } = useAnalytics('Dashboard')
  
  const handleClick = () => {
    trackEvent('dashboard_action', { action: 'view_savings' })
  }
  
  return <button onClick={handleClick}>View Savings</button>
}
```

### 4. Caching System
```javascript
import { CacheManager, ApiClient, useCachedApi } from '../lib/cache'

// Manual cache management
CacheManager.set('user_data', userData, 10 * 60 * 1000) // 10 menit
const cached = CacheManager.get('user_data')

// API client dengan caching
const data = await ApiClient.get('/user-profile', { 
  cache: true, 
  ttl: 5 * 60 * 1000 
})

// React hook dengan caching
function UserProfile() {
  const { data, loading, error } = useCachedApi('/user-profile', {
    ttl: 5 * 60 * 1000,
    revalidateOnFocus: true
  })
  
  return loading ? <Loading /> : <Profile data={data} />
}
```

### 5. Lazy Loading
```javascript
import { lazyLoad, LazyContent, useIntersectionObserver } from '../lib/lazy-loading'

// Lazy load components
const LazyDashboard = lazyLoad(() => import('./Dashboard'))

// Lazy load content berdasarkan scroll
function App() {
  return (
    <div>
      <HeroSection />
      <LazyContent>
        <HeavyComponent />
      </LazyContent>
    </div>
  )
}

// Custom intersection observer
function AnimatedSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver()
  
  return (
    <div 
      ref={elementRef}
      className={`transition-opacity ${isIntersecting ? 'opacity-100' : 'opacity-0'}`}
    >
      Content
    </div>
  )
}
```

### 6. Optimized Images
```javascript
import { OptimizedImage, Avatar, HeroImage } from '../components/ui/OptimizedImage'

// Basic optimized image
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={true}
/>

// Avatar dengan fallback
<Avatar
  src="/user-avatar.jpg"
  alt="John Doe"
  size="lg"
  fallbackText="JD"
/>

// Hero image responsive
<HeroImage
  src="/hero-desktop.jpg"
  mobileSrc="/hero-mobile.jpg"
  alt="Hero"
  className="h-screen"
/>
```

### 7. SEO Utilities
```javascript
import { generateMetadata, generateOrganizationSchema } from '../lib/seo'

// Generate metadata untuk pages
export const metadata = generateMetadata({
  title: 'Dashboard - Qurban Berdampak',
  description: 'Kelola tabungan qurban Anda',
  keywords: ['dashboard', 'qurban', 'tabungan']
})

// Add structured data
export default function Page() {
  const schema = generateOrganizationSchema()
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Content />
    </>
  )
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Tests
```javascript
// Component test example
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})

// API test example
import { createSupabaseAdmin } from '../lib/supabase-admin'

jest.mock('../lib/supabase-admin')

describe('API Tests', () => {
  it('handles database errors', async () => {
    const mockSupabase = { from: jest.fn() }
    createSupabaseAdmin.mockReturnValue(mockSupabase)
    
    // Test implementation
  })
})
```

## ⚡ Performance

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check build output untuk ukuran bundle

# Monitor performance
# Lihat console log untuk performance metrics
# Gunakan Chrome DevTools untuk analysis
```

### Performance Best Practices

1. **Lazy Loading**: Gunakan `lazyLoad()` untuk komponen besar
2. **Image Optimization**: Selalu gunakan `OptimizedImage` 
3. **Caching**: Implementasi `useCachedApi` untuk data fetching
4. **Code Splitting**: Gunakan dynamic imports
5. **Performance Monitoring**: Track metrics dengan `PerformanceMonitor`

### Performance Checklist
- [ ] Images menggunakan `OptimizedImage`
- [ ] Heavy components di-lazy load
- [ ] API calls menggunakan caching
- [ ] Performance metrics di-track
- [ ] Bundle size < 250kB per page

## 🚀 Deployment

### Build untuk Production
```bash
# Build aplikasi
npm run build

# Test production build
npm start
```

### Environment Variables Production
```bash
# Set environment variables untuk production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] CDN configured untuk static assets
- [ ] SSL certificate installed

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.