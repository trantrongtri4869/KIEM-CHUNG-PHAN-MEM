const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

// Set JWT_SECRET cho test
process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

/**
 * Tạo JWT token giả cho test (không cần DB)
 */
const makeToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

/**
 * Dữ liệu mẫu cho User
 */
const userPayload = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
  ...overrides,
})

const adminPayload = (overrides = {}) => ({
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  ...overrides,
})

/**
 * Dữ liệu mẫu cho Product
 */
const productPayload = (overrides = {}) => ({
  name: 'Test Keyboard',
  slug: 'test-keyboard',
  description: 'A great mechanical keyboard for gaming',
  price: 99.99,
  category: 'Keyboards',
  brand: 'TestBrand',
  stock: 50,
  ...overrides,
})

/**
 * Dữ liệu mẫu cho Order
 */
const orderPayload = (productId, overrides = {}) => ({
  items: [
    {
      product: productId || new mongoose.Types.ObjectId(),
      name: 'Test Keyboard',
      image: 'https://example.com/image.jpg',
      price: 99.99,
      quantity: 2,
    },
  ],
  shippingAddress: {
    fullName: 'Test User',
    phone: '0901234567',
    address: '123 Test Street',
    city: 'Ho Chi Minh City',
    state: 'HCM',
    zipCode: '70000',
    country: 'Vietnam',
  },
  paymentMethod: 'credit_card',
  ...overrides,
})

/**
 * Dữ liệu mẫu cho Review
 */
const reviewPayload = (productId, overrides = {}) => ({
  product: productId || new mongoose.Types.ObjectId(),
  rating: 4,
  title: 'Great product!',
  comment: 'Really enjoyed using this product. Highly recommend.',
  ...overrides,
})

/**
 * Dữ liệu mẫu cho Coupon
 */
const couponPayload = (overrides = {}) => ({
  code: 'SAVE10',
  discount: 10,
  type: 'fixed',
  minOrder: 0,
  maxUses: 100,
  usedCount: 0,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày từ hôm nay
  isActive: true,
  ...overrides,
})

/**
 * Dữ liệu mẫu cho Category
 */
const categoryPayload = (overrides = {}) => ({
  name: 'Keyboards',
  slug: 'keyboards',
  description: 'Mechanical and membrane keyboards',
  image: 'https://example.com/keyboards.jpg',
  ...overrides,
})

module.exports = {
  makeToken,
  userPayload,
  adminPayload,
  productPayload,
  orderPayload,
  reviewPayload,
  couponPayload,
  categoryPayload,
}
