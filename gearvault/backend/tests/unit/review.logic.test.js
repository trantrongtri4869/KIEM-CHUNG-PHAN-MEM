/**
 * Unit Test: Review Logic
 * Module: src/routes/reviews.js — rating calculation, duplicate check, authorization
 */

// ── Pure functions trích từ review route ─────────────────────────────────────

function calcAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return parseFloat((sum / reviews.length).toFixed(1))
}

function isDuplicateReview(existingReview) {
  return !!existingReview
}

function canDeleteReview(review, requestUser) {
  if (!review || !requestUser) return false
  if (review.user.toString() === requestUser._id.toString()) return true
  if (requestUser.role === 'admin') return true
  return false
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calcAverageRating()', () => {
  test('tính đúng average với nhiều reviews', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ]
    expect(calcAverageRating(reviews)).toBe(4.0)
  })

  test('trả 0 khi không có review', () => {
    expect(calcAverageRating([])).toBe(0)
  })

  test('trả 0 khi reviews = null', () => {
    expect(calcAverageRating(null)).toBe(0)
  })

  test('chỉ có 1 review → average = chính rating đó', () => {
    expect(calcAverageRating([{ rating: 4 }])).toBe(4.0)
  })

  test('kết quả làm tròn 1 chữ số thập phân', () => {
    // (5+4+3+2+1) / 5 = 3.0
    const reviews = [1, 2, 3, 4, 5].map(r => ({ rating: r }))
    expect(calcAverageRating(reviews)).toBe(3.0)
  })

  test('làm tròn đúng: (5+4+4) / 3 = 4.3', () => {
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4 }]
    expect(calcAverageRating(reviews)).toBe(4.3)
  })

  test('làm tròn đúng: (1+2) / 2 = 1.5', () => {
    const reviews = [{ rating: 1 }, { rating: 2 }]
    expect(calcAverageRating(reviews)).toBe(1.5)
  })

  test('tất cả rating = 5 → average = 5.0', () => {
    const reviews = Array(10).fill({ rating: 5 })
    expect(calcAverageRating(reviews)).toBe(5.0)
  })
})

describe('isDuplicateReview()', () => {
  test('trả true khi đã có review (object)', () => {
    expect(isDuplicateReview({ _id: '123', rating: 5 })).toBe(true)
  })

  test('trả false khi chưa có review (null)', () => {
    expect(isDuplicateReview(null)).toBe(false)
  })

  test('trả false khi chưa có review (undefined)', () => {
    expect(isDuplicateReview(undefined)).toBe(false)
  })
})

describe('canDeleteReview()', () => {
  const reviewOwnerId = '507f1f77bcf86cd799439011'
  const otherUserId   = '507f1f77bcf86cd799439022'
  const adminId       = '507f1f77bcf86cd799439033'

  const review = { user: { toString: () => reviewOwnerId } }

  test('owner có thể xóa review của mình', () => {
    const user = { _id: { toString: () => reviewOwnerId }, role: 'user' }
    expect(canDeleteReview(review, user)).toBe(true)
  })

  test('user khác không thể xóa review của người khác', () => {
    const user = { _id: { toString: () => otherUserId }, role: 'user' }
    expect(canDeleteReview(review, user)).toBe(false)
  })

  test('admin có thể xóa review của bất kỳ ai', () => {
    const admin = { _id: { toString: () => adminId }, role: 'admin' }
    expect(canDeleteReview(review, admin)).toBe(true)
  })

  test('trả false khi review = null', () => {
    const user = { _id: { toString: () => reviewOwnerId }, role: 'user' }
    expect(canDeleteReview(null, user)).toBe(false)
  })

  test('trả false khi requestUser = null', () => {
    expect(canDeleteReview(review, null)).toBe(false)
  })
})

describe('isValidRating()', () => {
  test('rating = 1 hợp lệ (boundary dưới)', () => {
    expect(isValidRating(1)).toBe(true)
  })

  test('rating = 5 hợp lệ (boundary trên)', () => {
    expect(isValidRating(5)).toBe(true)
  })

  test('rating = 3 hợp lệ', () => {
    expect(isValidRating(3)).toBe(true)
  })

  test('rating = 0 không hợp lệ', () => {
    expect(isValidRating(0)).toBe(false)
  })

  test('rating = 6 không hợp lệ', () => {
    expect(isValidRating(6)).toBe(false)
  })

  test('rating âm không hợp lệ', () => {
    expect(isValidRating(-1)).toBe(false)
  })

  test('rating thập phân không hợp lệ (phải là integer)', () => {
    expect(isValidRating(4.5)).toBe(false)
  })

  test('rating = string không hợp lệ', () => {
    expect(isValidRating('5')).toBe(false)
  })

  test('rating = null không hợp lệ', () => {
    expect(isValidRating(null)).toBe(false)
  })
})
