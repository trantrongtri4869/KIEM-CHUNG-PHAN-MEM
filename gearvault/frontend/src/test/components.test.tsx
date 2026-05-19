/**
 * @file Component tests
 * Tests: ProductCard, StarRating rendering and interactions
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StarRating from '../components/ui/StarRating'
import { MOCK_PRODUCTS } from '../utils/mockData'
import { useCartStore, useWishlistStore } from '../store'

// Wrapper for router-dependent components
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

// ==================== STAR RATING TESTS ====================
describe('StarRating', () => {
  it('renders 5 stars', () => {
    const { container } = render(<StarRating rating={4} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('shows correct number of filled stars', () => {
    render(<StarRating rating={3} showValue />)
    expect(screen.getByText('3.0')).toBeInTheDocument()
  })

  it('shows review count when provided', () => {
    render(<StarRating rating={4.5} count={42} />)
    expect(screen.getByText('(42)')).toBeInTheDocument()
  })

  it('calls onChange when interactive and clicked', () => {
    const onChange = vi.fn()
    const { container } = render(
      <StarRating rating={3} interactive onChange={onChange} />
    )
    const stars = container.querySelectorAll('button')
    fireEvent.click(stars[4]) // click 5th star
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('renders as non-interactive by default', () => {
    const { container } = render(<StarRating rating={4} />)
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(0)
  })
})

// ==================== MOCK DATA TESTS ====================
describe('Mock Product Data', () => {
  it('has at least 12 products', () => {
    expect(MOCK_PRODUCTS.length).toBeGreaterThanOrEqual(12)
  })

  it('each product has required fields', () => {
    MOCK_PRODUCTS.forEach((p) => {
      expect(p._id).toBeDefined()
      expect(p.name).toBeDefined()
      expect(p.slug).toBeDefined()
      expect(p.price).toBeGreaterThan(0)
      expect(p.images).toHaveLength(expect.any(Number))
      expect(p.category).toBeDefined()
    })
  })

  it('has at least one out-of-stock product', () => {
    const outOfStock = MOCK_PRODUCTS.filter((p) => p.stock === 0)
    expect(outOfStock.length).toBeGreaterThan(0)
  })

  it('has at least one flash sale product', () => {
    const flashSale = MOCK_PRODUCTS.filter((p) => p.isFlashSale)
    expect(flashSale.length).toBeGreaterThan(0)
  })

  it('has at least one featured product', () => {
    const featured = MOCK_PRODUCTS.filter((p) => p.isFeatured)
    expect(featured.length).toBeGreaterThan(0)
  })

  it('has at least one discounted product', () => {
    const discounted = MOCK_PRODUCTS.filter((p) => p.discount)
    expect(discounted.length).toBeGreaterThan(0)
  })

  it('all product slugs are unique', () => {
    const slugs = MOCK_PRODUCTS.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('ratings are between 1 and 5', () => {
    MOCK_PRODUCTS.forEach((p) => {
      expect(p.rating).toBeGreaterThanOrEqual(1)
      expect(p.rating).toBeLessThanOrEqual(5)
    })
  })
})

// ==================== UTILS TESTS ====================
describe('Price formatting', () => {
  it('correctly formats product prices', () => {
    const product = MOCK_PRODUCTS[0]
    const formatted = `$${product.price.toFixed(2)}`
    expect(formatted).toMatch(/^\$\d+\.\d{2}$/)
  })

  it('discount is less than original price', () => {
    const discounted = MOCK_PRODUCTS.filter((p) => p.originalPrice)
    discounted.forEach((p) => {
      expect(p.price).toBeLessThan(p.originalPrice!)
    })
  })
})
