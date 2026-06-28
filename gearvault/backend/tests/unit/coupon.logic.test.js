/**
 * Unit Test: Coupon Validation Logic
 * Module: src/routes/coupons.js — validate logic (pure functions, không cần DB)
 */

// ── Trích xuất validation logic thành pure functions ─────────────────────────

function isCouponExpired(coupon, now = new Date()) {
  return now > new Date(coupon.expiresAt)
}

function isCouponUsageLimitReached(coupon) {
  return coupon.usedCount >= coupon.maxUses
}

function isBelowMinOrder(coupon, total) {
  return total < coupon.minOrder
}

function validateCoupon(coupon, total, now = new Date()) {
  if (!coupon) return { valid: false, reason: 'Coupon not found', status: 404 }
  if (!coupon.isActive) return { valid: false, reason: 'Coupon not found', status: 404 }
  if (isCouponExpired(coupon, now)) return { valid: false, reason: 'Coupon has expired', status: 400 }
  if (isCouponUsageLimitReached(coupon)) return { valid: false, reason: 'Coupon usage limit reached', status: 400 }
  if (isBelowMinOrder(coupon, total)) return { valid: false, reason: `Minimum order $${coupon.minOrder} required`, status: 400 }
  return { valid: true, discount: coupon.discount, type: coupon.type }
}

function calcDiscountAmount(coupon, total) {
  if (coupon.type === 'percentage') {
    return total * (coupon.discount / 100)
  }
  return coupon.discount // fixed
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('isCouponExpired()', () => {
  test('trả false khi coupon chưa hết hạn', () => {
    const coupon = { expiresAt: new Date(Date.now() + 86400000) }
    expect(isCouponExpired(coupon)).toBe(false)
  })

  test('trả true khi coupon đã hết hạn', () => {
    const coupon = { expiresAt: new Date(Date.now() - 1000) }
    expect(isCouponExpired(coupon)).toBe(true)
  })

  test('trả true ngay khi now === expiresAt (boundary)', () => {
    const t = new Date()
    const coupon = { expiresAt: t }
    // now = t + 1ms → expired
    expect(isCouponExpired(coupon, new Date(t.getTime() + 1))).toBe(true)
  })

  test('trả false khi now === expiresAt - 1ms (chưa hết)', () => {
    const t = new Date(Date.now() + 1000)
    const coupon = { expiresAt: t }
    expect(isCouponExpired(coupon, new Date(t.getTime() - 1))).toBe(false)
  })
})

describe('isCouponUsageLimitReached()', () => {
  test('trả false khi usedCount < maxUses', () => {
    expect(isCouponUsageLimitReached({ usedCount: 5, maxUses: 100 })).toBe(false)
  })

  test('trả true khi usedCount === maxUses (boundary)', () => {
    expect(isCouponUsageLimitReached({ usedCount: 100, maxUses: 100 })).toBe(true)
  })

  test('trả true khi usedCount > maxUses', () => {
    expect(isCouponUsageLimitReached({ usedCount: 101, maxUses: 100 })).toBe(true)
  })

  test('trả false khi usedCount = 0 và maxUses = 1', () => {
    expect(isCouponUsageLimitReached({ usedCount: 0, maxUses: 1 })).toBe(false)
  })

  test('trả true khi usedCount = 1 và maxUses = 1 (boundary)', () => {
    expect(isCouponUsageLimitReached({ usedCount: 1, maxUses: 1 })).toBe(true)
  })
})

describe('isBelowMinOrder()', () => {
  test('trả false khi total >= minOrder', () => {
    expect(isBelowMinOrder({ minOrder: 50 }, 100)).toBe(false)
  })

  test('trả false khi total === minOrder (boundary)', () => {
    expect(isBelowMinOrder({ minOrder: 50 }, 50)).toBe(false)
  })

  test('trả true khi total < minOrder', () => {
    expect(isBelowMinOrder({ minOrder: 50 }, 49)).toBe(true)
  })

  test('trả false khi minOrder = 0 (luôn hợp lệ)', () => {
    expect(isBelowMinOrder({ minOrder: 0 }, 0)).toBe(false)
  })
})

describe('validateCoupon()', () => {
  const now = new Date()
  const validCoupon = {
    isActive: true,
    discount: 20,
    type: 'fixed',
    maxUses: 100,
    usedCount: 5,
    minOrder: 50,
    expiresAt: new Date(now.getTime() + 86400000),
  }

  test('trả valid=true với coupon và total hợp lệ', () => {
    const result = validateCoupon(validCoupon, 100)
    expect(result.valid).toBe(true)
    expect(result.discount).toBe(20)
    expect(result.type).toBe('fixed')
  })

  test('trả 404 khi coupon = null', () => {
    const result = validateCoupon(null, 100)
    expect(result.valid).toBe(false)
    expect(result.status).toBe(404)
  })

  test('trả 404 khi coupon.isActive = false', () => {
    const result = validateCoupon({ ...validCoupon, isActive: false }, 100)
    expect(result.valid).toBe(false)
    expect(result.status).toBe(404)
  })

  test('trả 400 khi coupon hết hạn', () => {
    const expired = { ...validCoupon, expiresAt: new Date(now.getTime() - 1000) }
    const result = validateCoupon(expired, 100)
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
    expect(result.reason).toBe('Coupon has expired')
  })

  test('trả 400 khi coupon hết lượt dùng', () => {
    const full = { ...validCoupon, usedCount: 100, maxUses: 100 }
    const result = validateCoupon(full, 100)
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
    expect(result.reason).toBe('Coupon usage limit reached')
  })

  test('trả 400 khi total < minOrder', () => {
    const result = validateCoupon(validCoupon, 30) // minOrder=50
    expect(result.valid).toBe(false)
    expect(result.status).toBe(400)
    expect(result.reason).toContain('Minimum order')
  })

  test('thứ tự kiểm tra: expired trước usage limit', () => {
    // Cả hai đều lỗi — phải trả expired
    const both = {
      ...validCoupon,
      expiresAt: new Date(now.getTime() - 1000),
      usedCount: 100,
      maxUses: 100,
    }
    const result = validateCoupon(both, 100)
    expect(result.reason).toBe('Coupon has expired')
  })
})

describe('calcDiscountAmount()', () => {
  test('tính đúng với type = fixed', () => {
    const coupon = { type: 'fixed', discount: 20 }
    expect(calcDiscountAmount(coupon, 100)).toBe(20)
  })

  test('tính đúng với type = percentage', () => {
    const coupon = { type: 'percentage', discount: 10 }
    expect(calcDiscountAmount(coupon, 200)).toBe(20)
  })

  test('percentage 50% của $80 = $40', () => {
    const coupon = { type: 'percentage', discount: 50 }
    expect(calcDiscountAmount(coupon, 80)).toBe(40)
  })

  test('fixed discount không phụ thuộc vào total', () => {
    const coupon = { type: 'fixed', discount: 15 }
    expect(calcDiscountAmount(coupon, 1000)).toBe(15)
    expect(calcDiscountAmount(coupon, 20)).toBe(15)
  })

  test('percentage 0% = discount $0', () => {
    const coupon = { type: 'percentage', discount: 0 }
    expect(calcDiscountAmount(coupon, 100)).toBe(0)
  })

  test('percentage 100% = bằng total', () => {
    const coupon = { type: 'percentage', discount: 100 }
    expect(calcDiscountAmount(coupon, 150)).toBe(150)
  })
})
