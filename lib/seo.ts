import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  locale?: string
}

export function generateMetadata({
  title = 'Tabungan Qurban Peduli | Qurban Berdampak',
  description = 'Platform tabungan qurban untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur',
  keywords = ['qurban', 'tabungan qurban', 'tabungan islami', 'idul adha', 'qurban berdampak'],
  image = '/og-image.jpg',
  url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  type = 'website',
  locale = 'id_ID'
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Qurban Berdampak Team' }],
    openGraph: {
      title,
      description,
      type,
      locale,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Qurban Berdampak',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    generator: 'Next.js',
    applicationName: 'Qurban Berdampak',
    referrer: 'origin-when-cross-origin',
    category: 'Finance',
  }
}

// Structured data untuk rich snippets
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Qurban Berdampak',
    description: 'Platform tabungan qurban untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Indonesian'
    },
    sameAs: [
      // Add social media URLs here
    ]
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Qurban Berdampak',
    description: 'Platform tabungan qurban untuk memudahkan persiapan ibadah qurban dengan dampak sosial yang terukur',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}