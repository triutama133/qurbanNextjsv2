import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import LoadingSpinner from '../components/ui/LoadingComponents'

// Utility untuk lazy loading komponen dengan loading fallback
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  const LoadingComponent = fallback || (() => (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="lg" />
    </div>
  ))

  return dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr: true, // Enable SSR by default for better SEO
  })
}

// Lazy load komponen dashboard yang berat
export const LazyAdminDashboard = lazyLoad(
  () => import('../app/qurban/admin-dashboard/page'),
  () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">Memuat dashboard admin...</p>
      </div>
    </div>
  )
)

export const LazyDashboard = lazyLoad(
  () => import('../app/qurban/dashboard/page'),
  () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">Memuat dashboard...</p>
      </div>
    </div>
  )
)

// Lazy load komponen yang tidak kritis
export const LazyFloatingFeedback = lazyLoad(
  () => import('../components/FloatingFeedback'),
  () => null // No loading state for feedback component
)

export const LazyProgramCarousel = lazyLoad(
  () => import('../components/ProgramCarousel')
)

export const LazyTicketDetailModal = lazyLoad(
  () => import('../components/TicketDetailModal')
)

// Utility untuk preload komponen
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  if (typeof window !== 'undefined') {
    // Preload saat mouse hover atau focus
    const preload = () => importFunc()
    
    return {
      onMouseEnter: preload,
      onFocus: preload,
    }
  }
  return {}
}

// Hook untuk intersection observer based lazy loading
import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [hasIntersected, options])

  return { elementRef, isIntersecting, hasIntersected }
}

// Komponen untuk lazy loading content berdasarkan scroll
interface LazyContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LazyContent({ 
  children, 
  fallback = <LoadingSpinner />, 
  className = '' 
}: LazyContentProps) {
  const { elementRef, hasIntersected } = useIntersectionObserver()

  return (
    <div ref={elementRef} className={className}>
      {hasIntersected ? children : fallback}
    </div>
  )
}