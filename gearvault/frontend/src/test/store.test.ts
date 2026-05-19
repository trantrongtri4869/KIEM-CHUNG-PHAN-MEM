/**
 * @file Cart store unit tests
 * Covers: add item, remove item, update quantity, coupon, totals
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '../store'
import { MOCK_PRODUCTS } from '../utils/mockData'

// Reset store before each test
beforeEach(() => {
  useCartStore.setState({
    items: [],
    isOpen: false,
    couponCode: '',
    couponDiscount: 0,
  })
})

describe('CartStore', () => {
  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCartStore())
    expect(result.current.items).toHaveLength(0)
    expect(result.current.getTotalItems()).toBe(0)
  })

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => { result.current.addItem(product, 1) })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product._id).toBe(product._id)
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('should increase quantity when adding duplicate item', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product, 1)
      result.current.addItem(product, 2)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product)
      result.current.removeItem(product._id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should update quantity', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product, 1)
      result.current.updateQuantity(product._id, 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
  })

  it('should remove item when quantity set to 0', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product, 2)
      result.current.updateQuantity(product._id, 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should calculate subtotal correctly', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0] // price: 149.99

    act(() => { result.current.addItem(product, 2) })

    expect(result.current.getSubtotal()).toBeCloseTo(299.98, 2)
  })

  it('should apply coupon discount', () => {
    const { result } = renderHook(() => useCartStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product, 1)
      result.current.applyCoupon('GEAR10', 10)
    })

    expect(result.current.couponCode).toBe('GEAR10')
    expect(result.current.couponDiscount).toBe(10)
  })

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(MOCK_PRODUCTS[0])
      result.current.addItem(MOCK_PRODUCTS[1])
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.couponCode).toBe('')
  })

  it('should count total items across multiple products', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(MOCK_PRODUCTS[0], 2)
      result.current.addItem(MOCK_PRODUCTS[1], 3)
    })

    expect(result.current.getTotalItems()).toBe(5)
  })

  it('should toggle cart open/closed', () => {
    const { result } = renderHook(() => useCartStore())

    expect(result.current.isOpen).toBe(false)
    act(() => { result.current.toggleCart() })
    expect(result.current.isOpen).toBe(true)
    act(() => { result.current.toggleCart() })
    expect(result.current.isOpen).toBe(false)
  })
})

// ==================== WISHLIST TESTS ====================
import { useWishlistStore } from '../store'

beforeEach(() => {
  useWishlistStore.setState({ items: [] })
})

describe('WishlistStore', () => {
  it('should add product to wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())
    const product = MOCK_PRODUCTS[0]

    act(() => { result.current.addItem(product) })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.isInWishlist(product._id)).toBe(true)
  })

  it('should not add duplicate to wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())
    const product = MOCK_PRODUCTS[0]

    act(() => {
      result.current.addItem(product)
      result.current.addItem(product)
    })

    expect(result.current.items).toHaveLength(1)
  })

  it('should toggle item in wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())
    const product = MOCK_PRODUCTS[0]

    act(() => { result.current.toggleItem(product) })
    expect(result.current.isInWishlist(product._id)).toBe(true)

    act(() => { result.current.toggleItem(product) })
    expect(result.current.isInWishlist(product._id)).toBe(false)
  })
})
