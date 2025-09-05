import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error here</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error during tests to keep output clean
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument()
    expect(screen.getByText(/Maaf, ada masalah yang tidak terduga/)).toBeInTheDocument()
  })

  it('has reload and try again buttons when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Muat Ulang Halaman')).toBeInTheDocument()
    expect(screen.getByText('Coba Lagi')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Terjadi Kesalahan')).not.toBeInTheDocument()
  })

  it('logs error to console', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    )
  })
})