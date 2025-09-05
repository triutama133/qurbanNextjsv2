import { render, screen } from '@testing-library/react'
import LoadingSpinner, { LoadingSkeleton, LoadingCard } from '../../../components/ui/LoadingComponents'

describe('LoadingComponents', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('renders with custom size', () => {
      const { container } = render(<LoadingSpinner size="lg" />)
      const spinnerDiv = container.querySelector('.animate-spin')
      expect(spinnerDiv).toHaveClass('h-12 w-12')
    })

    it('renders with custom color', () => {
      const { container } = render(<LoadingSpinner color="blue" />)
      const spinnerDiv = container.querySelector('.animate-spin')
      expect(spinnerDiv).toHaveClass('border-blue-600')
    })

    it('has sr-only text for accessibility', () => {
      render(<LoadingSpinner />)
      expect(screen.getByText('Loading...')).toHaveClass('sr-only')
    })
  })

  describe('LoadingSkeleton', () => {
    it('renders with default number of lines', () => {
      const { container } = render(<LoadingSkeleton />)
      const skeletonContainer = container.querySelector('.animate-pulse')
      expect(skeletonContainer).toBeInTheDocument()
    })

    it('renders with custom number of lines', () => {
      const { container } = render(<LoadingSkeleton lines={5} />)
      const lines = container.querySelectorAll('.h-4.bg-gray-200')
      expect(lines).toHaveLength(5)
    })

    it('has animate-pulse class', () => {
      const { container } = render(<LoadingSkeleton />)
      const skeleton = container.firstChild
      expect(skeleton).toHaveClass('animate-pulse')
    })
  })

  describe('LoadingCard', () => {
    it('renders with default styling', () => {
      const { container } = render(<LoadingCard />)
      const card = container.firstChild
      expect(card).toHaveClass('animate-pulse', 'border', 'border-gray-200', 'rounded-lg', 'p-4')
    })

    it('applies custom className', () => {
      const { container } = render(<LoadingCard className="custom-class" />)
      const card = container.firstChild
      expect(card).toHaveClass('custom-class')
    })

    it('has correct skeleton structure', () => {
      const { container } = render(<LoadingCard />)
      const skeletonBars = container.querySelectorAll('.bg-gray-200')
      expect(skeletonBars).toHaveLength(3) // title, value, description
    })
  })
})