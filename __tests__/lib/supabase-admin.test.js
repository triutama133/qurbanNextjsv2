import { createSupabaseAdmin, isSupabaseAvailable } from '../../lib/supabase-admin'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}))

describe('Supabase Admin Utility', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isSupabaseAvailable', () => {
    it('returns true when both URL and key are provided', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
      
      // Re-import to get fresh environment
      const { isSupabaseAvailable } = require('../../lib/supabase-admin')
      
      expect(isSupabaseAvailable()).toBe(true)
    })

    it('returns false when URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
      
      const { isSupabaseAvailable } = require('../../lib/supabase-admin')
      
      expect(isSupabaseAvailable()).toBe(false)
    })

    it('returns false when key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      
      const { isSupabaseAvailable } = require('../../lib/supabase-admin')
      
      expect(isSupabaseAvailable()).toBe(false)
    })

    it('returns false when both are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      
      const { isSupabaseAvailable } = require('../../lib/supabase-admin')
      
      expect(isSupabaseAvailable()).toBe(false)
    })
  })

  describe('createSupabaseAdmin', () => {
    it('returns null when environment variables are not available', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      
      const { createSupabaseAdmin } = require('../../lib/supabase-admin')
      
      expect(createSupabaseAdmin()).toBeNull()
    })

    it('creates client when environment variables are available', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
      
      const { createClient } = require('@supabase/supabase-js')
      const { createSupabaseAdmin } = require('../../lib/supabase-admin')
      
      const client = createSupabaseAdmin()
      
      expect(createClient).toHaveBeenCalledWith('https://test.supabase.co', 'test-key')
      expect(client).toBeTruthy()
    })
  })

  describe('console warnings', () => {
    it('logs warning when environment variables are missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      
      require('../../lib/supabase-admin')
      
      expect(consoleSpy).toHaveBeenCalledWith('Supabase environment variables not configured properly')
      
      consoleSpy.mockRestore()
    })
  })
})