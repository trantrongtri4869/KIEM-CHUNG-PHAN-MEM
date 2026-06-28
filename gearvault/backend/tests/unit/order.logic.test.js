/**
 * Unit Test: Order Price Calculation Logic
 * Module: src/routes/orders.js — logic tính giá (không cần DB, không cần HTTP)
 */

// ── Trích xuất logic tính giá thành pure functions để test ──────────────────
function calcItemsPrice(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

function calcShippingPrice(itemsPrice) {
  return itemsPrice > 100 ? 0 : 9.99
}

function calcTaxPrice(itemsPrice) {
  return itemsPrice * 0.08
}

function calcTotalPrice(itemsPrice, shippingPrice, taxPrice, couponDiscount = 0) {
  return Math.max(0, itemsPrice + shippingPrice + taxPrice - couponDiscount)
}

function applyCoupon(coupon, now = new Date()) {
  if (!coupon) return 0
  if (!coupon.isActive) return 0
  if (now > coupon.expiresAt) return 0
  if (coupon.usedCount >= coupon.maxUses) return 0
  return coupon.discount
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('calcItemsPrice()', () => {
  test('tính tổng đúng với 1 item', () => {
    const items = [{ price: 50, quantity: 2 }]
    expect(calcItemsPrice(items)).toBe(100)
  })

  test('tính tổng đúng với nhiều items', () => {
    const items = [
      { price: 30, quantity: 1 },
      { price: 20, quantity: 3 },
      { price: 10, quantity: 2 },
    ]
    expect(calcItemsPrice(items)).toBe(110)
  })

  test('trả 0 khi items rỗng', () => {
    expect(calcItemsPrice([])).toBe(0)
  })

  test('tính đúng với giá thập phân', () => {
    const items = [{ price: 9.99, quantity: 3 }]
    expect(calcItemsPrice(items)).toBeCloseTo(29.97)
  })
})

describe('calcShippingPrice()', () => {
  test('miễn phí ship khi itemsPrice > 100', () => {
    expect(calcShippingPrice(101)).toBe(0)
  })

  test('miễn phí ship khi itemsPrice = 200', () => {
    expect(calcShippingPrice(200)).toBe(0)
  })

  test('phí ship $9.99 khi itemsPrice = 100 (boundary)', () => {
    expect(calcShippingPrice(100)).toBe(9.99)
  })

  test('phí ship $9.99 khi itemsPrice = 50', () => {
    expect(calcShippingPrice(50)).toBe(9.99)
  })

  test('phí ship $9.99 khi itemsPrice = 0', () => {
    expect(calcShippingPrice(0)).toBe(9.99)
  })

  test('phí ship $9.99 khi itemsPrice = 99.99 (boundary dưới)', () => {
    expect(calcShippingPrice(99.99)).toBe(9.99)
  })

  test('miễn phí ship khi itemsPrice = 100.01 (boundary trên)', () => {
    expect(calcShippingPrice(100.01)).toBe(0)
  })
})

describe('calcTaxPrice()', () => {
  test('thuế 8% của $100 = $8', () => {
    expect(calcTaxPrice(100)).toBe(8)
  })

  test('thuế 8% của $0 = $0', () => {
    expect(calcTaxPrice(0)).toBe(0)
  })

  test('thuế 8% của $250 = $20', () => {
    expect(calcTaxPrice(250)).toBe(20)
  })

  test('thuế tính đúng với số thập phân', () => {
    expect(calcTaxPrice(99.99)).toBeCloseTo(7.9992)
  })
})

describe('calcTotalPrice()', () => {
  test('tổng = items + ship + tax khi không có coupon', () => {
    // items=100, ship=9.99, tax=8 → total=117.99
    expect(calcTotalPrice(100, 9.99, 8, 0)).toBeCloseTo(117.99)
  })

  test('tổng trừ coupon discount', () => {
    // items=200, ship=0, tax=16, coupon=20 → total=196
    expect(calcTotalPrice(200, 0, 16, 20)).toBe(196)
  })

  test('tổng không bao giờ âm (Math.max(0, ...))', () => {
    // coupon lớn hơn tổng
    expect(calcTotalPrice(10, 9.99, 0.8, 999)).toBe(0)
  })

  test('tổng = 0 khi tất cả là 0', () => {
    expect(calcTotalPrice(0, 0, 0, 0)).toBe(0)
  })

  test('coupon mặc định = 0 nếu không truyền', () => {
    expect(calcTotalPrice(100, 0, 8)).toBe(108)
  })
})

describe('applyCoupon()', () => {
  const futureDate = new Date(Date.now() + 86400000) // ngày mai
  const pastDate = new Date(Date.now() - 86400000)   // hôm qua

  const validCoupon = {
    isActive: true,
    discount: 20,
    maxUses: 100,
    usedCount: 5,
    expiresAt: futureDate,
  }

  test('trả đúng discount khi coupon hợp lệ', () => {
    expect(applyCoupon(validCoupon)).toBe(20)
  })

  test('trả 0 khi coupon = null', () => {
    expect(applyCoupon(null)).toBe(0)
  })

  test('trả 0 khi coupon không active', () => {
    expect(applyCoupon({ ...validCoupon, isActive: false })).toBe(0)
  })

  test('trả 0 khi coupon đã hết hạn', () => {
    expect(applyCoupon({ ...validCoupon, expiresAt: pastDate })).toBe(0)
  })

  test('trả 0 khi coupon đã hết lượt dùng (usedCount >= maxUses)', () => {
    expect(applyCoupon({ ...validCoupon, usedCount: 100, maxUses: 100 })).toBe(0)
  })

  test('trả 0 khi usedCount vượt quá maxUses', () => {
    expect(applyCoupon({ ...validCoupon, usedCount: 101, maxUses: 100 })).toBe(0)
  })

  test('vẫn trả discount khi usedCount = maxUses - 1 (còn đúng 1 lượt)', () => {
    expect(applyCoupon({ ...validCoupon, usedCount: 99, maxUses: 100 })).toBe(20)
  })
})
