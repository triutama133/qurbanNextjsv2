# 🕌 Qurban Berdampak - Platform Tabungan Qurban

> Platform digital untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur dan transparan.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.9-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/Tests-22%20passing-green)
![Build](https://img.shields.io/badge/Build-Passing-green)

## ✨ Fitur Utama

### 🎯 **Untuk Pengguna (Pequrban)**
- **Tabungan Digital**: Sistem tabungan qurban dengan tracking progress
- **Dashboard Personal**: Monitor progress, riwayat transaksi, dan milestone
- **Notifikasi Smart**: Pengingat menabung dan update program
- **Dokumentasi Lengkap**: Laporan transparan penyaluran qurban
- **Program Edukasi**: Materi keuangan dan nilai-nilai qurban

### 🏢 **Untuk Admin**
- **Dashboard Admin**: Kelola user, transaksi, dan operasional
- **Verifikasi Transfer**: Sistem verifikasi pembayaran yang aman
- **Manajemen Konten**: Kelola berita, milestone, dan resources
- **Laporan Analitik**: Insight mendalam tentang program
- **Sistem Feedback**: Kelola feedback dan helpdesk

### 🚀 **Technical Excellence**
- **Performance Optimized**: Lazy loading, caching, dan image optimization
- **Mobile Responsive**: Design optimal untuk semua device
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **SEO Optimized**: Meta tags, sitemap, structured data
- **Error Handling**: Comprehensive error boundaries dan logging
- **Testing Coverage**: Unit tests untuk komponen kritis

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/triutama133/qurbanNextjsv2.git
cd qurbanNextjsv2

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dengan konfigurasi Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** atau **yarn**
- **Supabase Account** (untuk database)
- **Git**

## 🏗️ Tech Stack

### **Core Framework**
- **Next.js 15.5.2** - React framework dengan App Router
- **React 18** - UI library dengan hooks modern
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework

### **Backend & Database**
- **Supabase** - PostgreSQL database dengan real-time features
- **Next.js API Routes** - Serverless API endpoints
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### **UI Components**
- **Radix UI** - Headless UI components
- **Lucide React** - Modern icon set
- **Tailwind Animate** - Animation utilities
- **Next Themes** - Dark/light mode support

### **Performance & Optimization**
- **Next.js Image** - Optimized image loading
- **Dynamic Imports** - Code splitting dan lazy loading
- **Custom Caching** - In-memory caching system
- **Performance Monitoring** - Real-time metrics

### **Development Tools**
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks untuk quality assurance

## 📊 Performance Metrics

### **Bundle Size**
- **First Load JS**: 102 kB (optimal)
- **Largest Page**: Admin Dashboard (37.4 kB)
- **Average Page**: 5-15 kB

### **Performance Scores**
- **Lighthouse Performance**: 90+
- **Core Web Vitals**: Excellent
- **SEO Score**: 100
- **Accessibility**: 95+

### **Features**
- ⚡ **Lazy Loading**: Components loaded on demand
- 🖼️ **Image Optimization**: Automatic WebP conversion dan sizing
- 💾 **Smart Caching**: API responses dengan TTL
- 📱 **Mobile First**: Responsive design
- 🔍 **SEO Ready**: Meta tags dan structured data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests dengan coverage
npm run test:coverage

# Run tests dalam watch mode
npm run test:watch
```

**Test Coverage**:
- ✅ Component Tests: LoadingComponents, ErrorBoundary
- ✅ Utility Tests: Supabase client, Performance monitoring
- ✅ API Tests: Authentication, Database operations
- 📊 **22 tests passing**, 3 test suites

## 📁 Project Structure

```
qurbanNextjsv2/
├── 📁 app/                 # Next.js App Router
│   ├── 📁 api/            # API endpoints
│   ├── 📁 qurban/         # Main application routes
│   └── 📄 layout.js       # Root layout
├── 📁 components/         # Reusable components
│   ├── 📁 ui/            # UI primitives
│   ├── 📁 admin/         # Admin components
│   └── 📁 dashboard/     # Dashboard components
├── 📁 lib/               # Utilities & helpers
│   ├── 📄 analytics.tsx  # Analytics tracking
│   ├── 📄 cache.ts       # Caching system
│   ├── 📄 performance.js # Performance monitoring
│   └── 📄 seo.ts         # SEO utilities
├── 📁 hooks/             # Custom React hooks
├── 📁 __tests__/         # Test suites
└── 📄 DEVELOPER_GUIDE.md # Comprehensive dev guide
```

## 🔧 Configuration

### Environment Variables
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional Services
RESEND_API_KEY=your_resend_api_key
GOOGLE_CLOUD_PROJECT_ID=your_gc_project_id
```

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting issues
npm test             # Run tests
npm run test:coverage # Tests dengan coverage
```

## 🌟 Key Features Implemented

### **🔐 Authentication & Security**
- JWT-based authentication dengan Supabase
- Password hashing dengan bcryptjs
- Role-based access control (User/Admin)
- Input validation dengan Zod schemas
- Environment variables security

### **📊 Performance Optimizations**
- **Lazy Loading**: Dynamic imports untuk komponen besar
- **Image Optimization**: OptimizedImage component dengan fallbacks
- **Caching Strategy**: In-memory cache dengan TTL
- **Code Splitting**: Automatic dengan Next.js
- **Performance Monitoring**: Real-time metrics tracking

### **♿ Accessibility**
- ARIA labels dan semantic HTML
- Keyboard navigation support
- Screen reader optimization
- Focus management
- Color contrast compliance

### **🔍 SEO & Analytics**
- Meta tags dengan OpenGraph
- Structured data (JSON-LD)
- XML sitemap generation
- Google Analytics integration
- Performance tracking

### **🧪 Quality Assurance**
- Unit testing dengan Jest
- Component testing dengan RTL
- Pre-commit hooks dengan Husky
- Code formatting dengan Prettier
- Linting dengan ESLint

## 📈 Roadmap

### **Phase 1: Current (Completed) ✅**
- [x] Core application setup
- [x] Authentication system
- [x] Dashboard functionality
- [x] Admin panel
- [x] Performance optimizations
- [x] Testing framework
- [x] SEO optimization

### **Phase 2: Planned**
- [ ] PWA implementation
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### **Phase 3: Future**
- [ ] AI-powered recommendations
- [ ] Blockchain transparency
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API untuk third-party integration

## 🤝 Contributing

Kami menyambut kontribusi dari developer! Lihat [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) untuk panduan lengkap.

### Quick Contribution Steps:
1. Fork repository ini
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

## 📞 Support

- **Documentation**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/triutama133/qurbanNextjsv2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/triutama133/qurbanNextjsv2/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🕌 Qurban Berdampak - Mewujudkan Qurban yang Bermakna dan Berdampak 🕌**

Made with ❤️ for the Indonesian Muslim community

</div>
