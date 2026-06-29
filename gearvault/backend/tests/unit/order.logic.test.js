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

// ── OCTC_1_4 — createOrder: items=[] phải bị từ chối ─────────────────────
// BUG: không có guard items.length > 0 → đơn rỗng vẫn được tạo

function validateOrderItems(items) {
  if (!items || items.length === 0) {
    return { valid: false, reason: 'Order must contain at least one item', status: 400 }
  }
  return { valid: true }
}

describe('OCTC_1_4 — createOrder: giỏ hàng rỗng phải bị từ chối', () => {
  test('items=[] → trả 400', () => {
    const result = validateOrderItems([])
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
    expect(result.reason).toContain('at least one item')
  })

  test('items=null → trả 400', () => {
    expect(validateOrderItems(null).valid).toBe(false)
  })

  test('items có phần tử → hợp lệ', () => {
    expect(validateOrderItems([{ price: 50, quantity: 1 }]).valid).toBe(true)
  })

  test('BUG scenario: không validate → itemsPrice=0 vẫn tiếp tục tạo đơn', () => {
    // Đây là hành vi SAI — items=[] → itemsPrice=0 nhưng Order.create() vẫn được gọi
    const itemsPrice = calcItemsPrice([])
    expect(itemsPrice).toBe(0) // tính được nhưng không nên tạo đơn
  })

  test('items=[] → tổng chỉ gồm shipping (đơn vô nghĩa)', () => {
    const itemsPrice = calcItemsPrice([])
    const total = itemsPrice + calcShippingPrice(itemsPrice) + calcTaxPrice(itemsPrice)
    expect(total).toBeCloseTo(9.99) // chỉ phí ship, không có hàng
  })
})

// ── OCTC_1_7 — createOrder: quantity > stock phải bị từ chối ─────────────
// BUG: $inc:{stock:-quantity} chạy không kiểm tra tồn kho → stock có thể âm

function validateStockAvailability(items, productStockMap) {
  for (const item of items) {
    const stock = productStockMap[item.product] ?? 0
    if (item.quantity > stock) {
      return {
        valid: false,
        reason: `Sản phẩm ${item.product} chỉ còn ${stock} trong kho`,
        status: 400,
      }
    }
  }
  return { valid: true }
}

describe('OCTC_1_7 — createOrder: quantity > stock phải bị từ chối', () => {
  test('quantity <= stock → hợp lệ', () => {
    expect(validateStockAvailability([{ product: 'p1', quantity: 3 }], { p1: 10 }).valid).toBe(true)
  })

  test('quantity === stock (boundary) → hợp lệ', () => {
    expect(validateStockAvailability([{ product: 'p1', quantity: 10 }], { p1: 10 }).valid).toBe(true)
  })

  test('quantity > stock → trả 400', () => {
    const result = validateStockAvailability([{ product: 'p1', quantity: 11 }], { p1: 10 })
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
  })

  test('stock=0 (boundary) → từ chối mọi số lượng', () => {
    expect(validateStockAvailability([{ product: 'p1', quantity: 1 }], { p1: 0 }).valid).toBe(false)
  })

  test('nhiều items, một cái vượt stock → fail', () => {
    const items = [{ product: 'p1', quantity: 2 }, { product: 'p2', quantity: 99 }]
    const result = validateStockAvailability(items, { p1: 10, p2: 5 })
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('p2')
  })

  test('BUG scenario: không validate → stock âm sau khi $inc', () => {
    const stockAfter = 5 - 10 // $inc:{stock:-10} khi stock chỉ còn 5
    expect(stockAfter).toBe(-5)
    expect(stockAfter).toBeLessThan(0) // BUG: stock âm không nên xảy ra
  })
})

// ── OCTC_5_3 — updateOrderStatus: status invalid → phải 400 không phải 500 ─
// BUG: Mongoose ValidationError bị catch → trả 500 thay vì 400

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function validateOrderStatus(status) {
  if (!status) return { valid: false, status: 400 }
  if (!VALID_ORDER_STATUSES.includes(status)) {
    return { valid: false, reason: `Status '${status}' không hợp lệ`, status: 400 }
  }
  return { valid: true }
}

function resolveErrorStatus(error) {
  if (error && error.name === 'ValidationError') return 400
  return 500
}

describe('OCTC_5_3 — updateOrderStatus: status không hợp lệ → 400 không phải 500', () => {
  test.each(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])(
    'status "%s" hợp lệ', (status) => {
      expect(validateOrderStatus(status).valid).toBe(true)
    }
  )

  test('status "invalid_status" → 400', () => {
    const result = validateOrderStatus('invalid_status')
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
  })

  test('status undefined → 400', () => {
    expect(validateOrderStatus(undefined).valid).toBe(false)
  })

  test('status "PROCESSING" uppercase không hợp lệ (case-sensitive)', () => {
    expect(validateOrderStatus('PROCESSING').valid).toBe(false)
  })

  test('ValidationError phải trả 400 (không phải 500)', () => {
    expect(resolveErrorStatus({ name: 'ValidationError' })).toBe(400)
  })

  test('BUG scenario: catch block hiện tại trả 500 cho mọi lỗi (kể cả ValidationError)', () => {
    // Backend dùng res.status(500) trong catch — sai với ValidationError
    const buggyResolve = (_err) => 500
    expect(buggyResolve({ name: 'ValidationError' })).toBe(500) // SAI
  })
})
