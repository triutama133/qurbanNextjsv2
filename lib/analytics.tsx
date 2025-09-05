// Analytics utility for tracking user events and performance
import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export class Analytics {
  static isEnabled() {
    return process.env.NODE_ENV === 'production' && typeof window !== 'undefined'
  }

  // Track page views
  static trackPageView(url: string, title?: string) {
    if (!this.isEnabled()) return

    // Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title,
        page_location: url,
      })
    }

    // Alternative analytics services can be added here
    this.logEvent('page_view', { url, title })
  }

  // Track custom events
  static trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isEnabled()) return

    // Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: new Date().toISOString(),
      })
    }

    this.logEvent(eventName, parameters)
  }

  // Track user actions
  static trackUserAction(action: string, category: string, label?: string, value?: number) {
    this.trackEvent('user_action', {
      action,
      category,
      label,
      value,
    })
  }

  // Track form submissions
  static trackFormSubmission(formName: string, success: boolean, errorMessage?: string) {
    this.trackEvent('form_submission', {
      form_name: formName,
      success,
      error_message: errorMessage,
    })
  }

  // Track API calls
  static trackApiCall(endpoint: string, method: string, success: boolean, duration: number) {
    this.trackEvent('api_call', {
      endpoint,
      method,
      success,
      duration,
    })
  }

  // Track errors
  static trackError(error: Error, context?: string) {
    if (!this.isEnabled()) return

    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics Error:', error, context)
    }
  }

  // Track user engagement
  static trackEngagement(eventType: string, elementId?: string, elementText?: string) {
    this.trackEvent('engagement', {
      event_type: eventType,
      element_id: elementId,
      element_text: elementText,
    })
  }

  // Track scroll depth
  static trackScrollDepth(percentage: number) {
    // Only track significant scroll milestones
    if ([25, 50, 75, 90, 100].includes(Math.floor(percentage))) {
      this.trackEvent('scroll_depth', {
        percentage: Math.floor(percentage),
      })
    }
  }

  // Private method for development logging
  private static logEvent(eventName: string, parameters: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics Event: ${eventName}`, parameters)
    }
  }
}

// Hook for tracking component mount and interactions
export function useAnalytics(componentName?: string) {
  const pathname = usePathname()
  const hasTrackedMount = useRef(false)

  useEffect(() => {
    // Track page view
    if (pathname) {
      Analytics.trackPageView(pathname)
    }
  }, [pathname])

  useEffect(() => {
    // Track component mount (only once)
    if (componentName && !hasTrackedMount.current) {
      Analytics.trackEvent('component_mount', { component_name: componentName })
      hasTrackedMount.current = true
    }
  }, [componentName])

  return {
    trackEvent: Analytics.trackEvent,
    trackUserAction: Analytics.trackUserAction,
    trackFormSubmission: Analytics.trackFormSubmission,
    trackEngagement: Analytics.trackEngagement,
  }
}

// Wrapper for tracking link clicks
export function trackableLink(href: string, text?: string) {
  return {
    href,
    onClick: () => {
      Analytics.trackUserAction('click', 'link', text || href)
    },
  }
}

// Higher-order component for tracking component interactions
export function withAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function AnalyticsWrappedComponent(props: T) {
    useAnalytics(componentName)
    return <Component {...props} />
  }
}

// Scroll depth tracking hook
export function useScrollTracking() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = (scrollTop / scrollHeight) * 100

      Analytics.trackScrollDepth(scrollPercentage)
    }

    const throttledHandleScroll = throttle(handleScroll, 1000) // Throttle to once per second

    window.addEventListener('scroll', throttledHandleScroll)
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])
}

// Simple throttle function
function throttle(func: Function, limit: number) {
  let inThrottle: boolean
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Global type declarations for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}