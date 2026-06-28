/**
 * INTEGRATION TEST — routes/users.js + categories.js + reviews.js + coupons.js + admin.js
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../src/app')
const db = require('../helpers/db')
const { productPayload, reviewPayload, couponPayload, categoryPayload, makeToken } = require('../helpers/factories')
const { User, Product, Order, Review, Coupon, Category } = require('../../src/models')

let adminToken, userToken, adminUser, regularUser

beforeAll(async () => await db.connect())

beforeEach(async () => {
  await db.clearDatabase()
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' })
  regularUser = await User.create({ name: 'User', email: 'user@test.com', password: 'user123', role: 'user' })
  adminToken = makeToken(adminUser._id)
  userToken = makeToken(regularUser._id)
})

afterAll(async () => await db.disconnect())

// ================================================================
// USERS ROUTES
// ================================================================
describe('Users Routes', () => {
  describe('GET /api/users (admin)', () => {
    it('admin lấy danh sách users → 200 + pagination', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.pagination).toBeDefined()
    })

    it('user thường không được xem → 403', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })

    it('không có token → 401', async () => {
      const res = await request(app).get('/api/users')
      expect(res.statusCode).toBe(401)
    })
  })

  describe('PUT /api/users/:id (admin)', () => {
    it('admin cập nhật user → 200', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })

      expect(res.statusCode).toBe(200)
      expect(res.body.data.name).toBe('Updated Name')
    })

    it('id không tồn tại → 404', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' })

      expect(res.statusCode).toBe(404)
    })

    it('user thường không được cập nhật → 403', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hack' })

      expect(res.statusCode).toBe(403)
    })
  })

  describe('DELETE /api/users/:id (admin)', () => {
    it('admin xóa user → 200', async () => {
      const target = await User.create({ name: 'Delete Me', email: 'delete@test.com', password: '123456' })

      const res = await request(app)
        .delete(`/api/users/${target._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      const deleted = await User.findById(target._id)
      expect(deleted).toBeNull()
    })

    it('user thường không được xóa → 403', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })
  })
})

// ================================================================
// CATEGORIES ROUTES
// ================================================================
describe('Categories Routes', () => {
  describe('GET /api/categories', () => {
    it('trả danh sách categories kèm productCount', async () => {
      await Category.create(categoryPayload())
      await Product.create(productPayload({ category: 'Keyboards' }))

      const res = await request(app).get('/api/categories')

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data[0]).toHaveProperty('productCount')
      expect(res.body.data[0].productCount).toBeGreaterThanOrEqual(1)
    })

    it('trả mảng rỗng nếu chưa có category', async () => {
      const res = await request(app).get('/api/categories')
      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveLength(0)
    })
  })
})

// ================================================================
// REVIEWS ROUTES
// ================================================================
describe('Reviews Routes', () => {
  let testProduct

  beforeEach(async () => {
    testProduct = await Product.create(productPayload())
  })

  describe('GET /api/reviews/:productId', () => {
    it('trả danh sách reviews của product', async () => {
      await Review.create({
        user: regularUser._id,
        product: testProduct._id,
        rating: 5,
        title: 'Excellent!',
        comment: 'This product is amazing and very well built.',
      })

      const res = await request(app).get(`/api/reviews/${testProduct._id}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].rating).toBe(5)
    })

    it('trả mảng rỗng nếu chưa có review', async () => {
      const res = await request(app).get(`/api/reviews/${testProduct._id}`)
      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveLength(0)
    })
  })

  describe('POST /api/reviews', () => {
    it('user tạo review thành công → 201', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewPayload(testProduct._id))

      expect(res.statusCode).toBe(201)
      expect(res.body.data.rating).toBe(4)
      expect(res.body.data.user).toBeDefined()
    })

    it('tạo review → cập nhật rating của product', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewPayload(testProduct._id, { rating: 4 }))

      const updatedProduct = await Product.findById(testProduct._id)
      expect(Number(updatedProduct.rating)).toBe(4)
      expect(updatedProduct.numReviews).toBe(1)
    })

    it('review 2 lần cùng product → 409', async () => {
      await Review.create({
        user: regularUser._id,
        product: testProduct._id,
        rating: 5,
        title: 'First review',
        comment: 'Already reviewed this product before.',
      })

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviewPayload(testProduct._id))

      expect(res.statusCode).toBe(409)
      expect(res.body.message).toMatch(/already reviewed/i)
    })

    it('không có token → 401', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send(reviewPayload(testProduct._id))

      expect(res.statusCode).toBe(401)
    })
  })

  describe('DELETE /api/reviews/:id', () => {
    it('user xóa review của mình → 200', async () => {
      const review = await Review.create({
        user: regularUser._id,
        product: testProduct._id,
        rating: 3,
        title: 'OK product',
        comment: 'It works but nothing special about it.',
      })

      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(200)
      const deleted = await Review.findById(review._id)
      expect(deleted).toBeNull()
    })

    it('user không được xóa review của người khác → 403', async () => {
      const other = await User.create({ name: 'Other', email: 'other@test.com', password: '123456' })
      const review = await Review.create({
        user: other._id,
        product: testProduct._id,
        rating: 5,
        title: 'Their review',
        comment: 'This was written by someone else entirely.',
      })

      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })

    it('admin xóa được review của bất kỳ ai → 200', async () => {
      const review = await Review.create({
        user: regularUser._id,
        product: testProduct._id,
        rating: 1,
        title: 'Bad product',
        comment: 'This product broke after one day of use.',
      })

      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
    })

    it('review không tồn tại → 404', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .delete(`/api/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(404)
    })
  })
})

// ================================================================
// COUPONS ROUTES
// ================================================================
describe('Coupons Routes', () => {
  describe('POST /api/coupons/validate', () => {
    it('coupon hợp lệ → 200 + thông tin discount', async () => {
      await Coupon.create(couponPayload({ code: 'VALID10', minOrder: 0 }))

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: 'VALID10', total: 100 })

      expect(res.statusCode).toBe(200)
      expect(res.body.data.code).toBe('VALID10')
      expect(res.body.data.discount).toBe(10)
    })

    it('coupon không tồn tại → 404', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: 'NOTEXIST', total: 100 })

      expect(res.statusCode).toBe(404)
    })

    it('coupon đã hết hạn → 400', async () => {
      await Coupon.create(couponPayload({
        code: 'EXPIRED',
        expiresAt: new Date(Date.now() - 1000), // quá khứ
      }))

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: 'EXPIRED', total: 100 })

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toMatch(/expired/i)
    })

    it('coupon hết lượt dùng → 400', async () => {
      await Coupon.create(couponPayload({
        code: 'MAXED',
        maxUses: 5,
        usedCount: 5,
      }))

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: 'MAXED', total: 100 })

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toMatch(/limit reached/i)
    })

    it('total nhỏ hơn minOrder → 400', async () => {
      await Coupon.create(couponPayload({ code: 'MINORDER', minOrder: 500 }))

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ code: 'MINORDER', total: 50 })

      expect(res.statusCode).toBe(400)
      expect(res.body.message).toMatch(/Minimum order/i)
    })

    it('không có token → 401', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'VALID10', total: 100 })

      expect(res.statusCode).toBe(401)
    })
  })
})

// ================================================================
// ADMIN ROUTES
// ================================================================
describe('Admin Routes', () => {
  describe('GET /api/admin/dashboard', () => {
    it('admin xem dashboard → 200 + 4 metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.data).toHaveProperty('totalOrders')
      expect(res.body.data).toHaveProperty('totalUsers')
      expect(res.body.data).toHaveProperty('totalProducts')
      expect(res.body.data).toHaveProperty('totalRevenue')
    })

    it('user thường không được xem → 403', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })

    it('không có token → 401', async () => {
      const res = await request(app).get('/api/admin/dashboard')
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/admin/revenue', () => {
    it('admin xem revenue chart → 200', async () => {
      const res = await request(app)
        .get('/api/admin/revenue')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('user thường không được xem → 403', async () => {
      const res = await request(app)
        .get('/api/admin/revenue')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })
  })

  describe('GET /api/admin/top-products', () => {
    it('trả top 5 sản phẩm bán chạy nhất', async () => {
      await Product.create([
        productPayload({ slug: 'p1', sold: 100 }),
        productPayload({ slug: 'p2', sold: 50, name: 'P2' }),
        productPayload({ slug: 'p3', sold: 200, name: 'P3' }),
      ])

      const res = await request(app)
        .get('/api/admin/top-products')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.data.length).toBeLessThanOrEqual(5)
      // Sản phẩm đầu tiên phải có sold cao nhất
      expect(res.body.data[0].sold).toBeGreaterThanOrEqual(res.body.data[1]?.sold ?? 0)
    })

    it('user thường không được xem → 403', async () => {
      const res = await request(app)
        .get('/api/admin/top-products')
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).toBe(403)
    })
  })
})

// ================================================================
// HEALTH CHECK
// ================================================================
describe('GET /api/health', () => {
  it('trả 200 + message running', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

// ================================================================
// 404 NOT FOUND
// ================================================================
describe('404 handler', () => {
  it('route không tồn tại → 404', async () => {
    const res = await request(app).get('/api/nonexistent-route')
    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
