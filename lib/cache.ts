// Cache management utility untuk optimasi performa
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  // Set cache dengan TTL (time to live) dalam milidetik
  static set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // Default 5 menit
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  // Get cache dengan pengecekan expiry
  static get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  // Clear specific cache
  static clear(key: string) {
    this.cache.delete(key)
  }
  
  // Clear all cache
  static clearAll() {
    this.cache.clear()
  }
  
  // Clear expired cache entries
  static cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
  
  // Get cache stats
  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// API wrapper dengan caching
export class ApiClient {
  private static baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  static async get(endpoint: string, options: {
    cache?: boolean
    ttl?: number
    revalidate?: boolean
  } = {}) {
    const { cache = true, ttl = 5 * 60 * 1000, revalidate = false } = options
    const cacheKey = `api_${endpoint}`
    
    // Check cache first
    if (cache && !revalidate) {
      const cached = CacheManager.get(cacheKey)
      if (cached) {
        console.log(`Cache hit for ${endpoint}`)
        return cached
      }
    }
    
    try {
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache successful responses
      if (cache) {
        CacheManager.set(cacheKey, data, ttl)
      }
      
      return data
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      throw error
    }
  }
  
  static async post(endpoint: string, body: any, options: {
    cache?: boolean
    invalidateKeys?: string[]
  } = {}) {
    const { cache = false, invalidateKeys = [] } = options
    
    try {
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Invalidate related cache keys
      invalidateKeys.forEach(key => {
        CacheManager.clear(`api_${key}`)
      })
      
      // Cache if requested
      if (cache) {
        CacheManager.set(`api_${endpoint}`, data)
      }
      
      return data
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      throw error
    }
  }
}

// React hook untuk cached API calls
import { useState, useEffect, useCallback } from 'react'

interface UseCachedApiOptions {
  enabled?: boolean
  ttl?: number
  revalidateOnFocus?: boolean
  revalidateInterval?: number
}

export function useCachedApi<T>(
  endpoint: string,
  options: UseCachedApiOptions = {}
) {
  const {
    enabled = true,
    ttl = 5 * 60 * 1000,
    revalidateOnFocus = true,
    revalidateInterval
  } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async (revalidate = false) => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await ApiClient.get(endpoint, { ttl, revalidate })
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [endpoint, enabled, ttl])
  
  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return
    
    const handleFocus = () => fetchData(true)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, revalidateOnFocus])
  
  // Interval revalidation
  useEffect(() => {
    if (!revalidateInterval) return
    
    const interval = setInterval(() => fetchData(true), revalidateInterval)
    return () => clearInterval(interval)
  }, [fetchData, revalidateInterval])
  
  const mutate = useCallback((newData?: T) => {
    if (newData) {
      setData(newData)
      CacheManager.set(`api_${endpoint}`, newData, ttl)
    } else {
      fetchData(true)
    }
  }, [endpoint, fetchData, ttl])
  
  return {
    data,
    loading,
    error,
    mutate,
    revalidate: () => fetchData(true)
  }
}

// Preload API untuk route transitions
export function preloadApi(endpoint: string) {
  if (typeof window !== 'undefined') {
    // Use setTimeout to avoid blocking
    setTimeout(() => {
      ApiClient.get(endpoint).catch(() => {
        // Ignore preload errors
      })
    }, 0)
  }
}

// Cache warming untuk data penting
export function warmupCache() {
  if (typeof window !== 'undefined') {
    // Warm up critical endpoints
    const criticalEndpoints = [
      '/get-app-config',
      '/get-news',
      '/get-milestones'
    ]
    
    criticalEndpoints.forEach(endpoint => {
      setTimeout(() => {
        preloadApi(endpoint)
      }, Math.random() * 1000) // Stagger requests
    })
  }
}

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    CacheManager.cleanup()
  }, 10 * 60 * 1000) // Cleanup every 10 minutes
}