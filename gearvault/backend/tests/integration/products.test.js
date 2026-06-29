/**
 * INTEGRATION TEST — routes/products.js
 * Endpoints: GET /, GET /featured, GET /best-sellers, GET /flash-sale,
 *            GET /:slug, GET /:slug/related, POST /, PUT /:id, DELETE /:id
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../src/app')
const db = require('../helpers/db')
const { productPayload, makeToken } = require('../helpers/factories')
const { Product, User } = require('../../src/models')

let adminToken, userToken, adminUser, regularUser

beforeAll(async () => await db.connect())

beforeEach(async () => {
  await db.clearDatabase()
  // Tạo admin và user thường
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' })
  regularUser = await User.create({ name: 'User', email: 'user@test.com', password: 'user123', role: 'user' })
  adminToken = makeToken(adminUser._id)
  userToken = makeToken(regularUser._id)
})

afterAll(async () => await db.disconnect())

// ==================== GET /api/products ====================
describe('GET /api/products', () => {
  it('trả danh sách sản phẩm + pagination', async () => {
    await Product.create([
      productPayload({ slug: 'prod-1', name: 'Keyboard 1' }),
      productPayload({ slug: 'prod-2', name: 'Keyboard 2' }),
    ])

    const res = await request(app).get('/api/products')

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.pagination).toBeDefined()
    expect(res.body.pagination.total).toBe(2)
  })

  it('filter theo category', async () => {
    await Product.create([
      productPayload({ slug: 'kb-1', category: 'Keyboards' }),
      productPayload({ slug: 'ms-1', category: 'Mice', name: 'Gaming Mouse' }),
    ])

    const res = await request(app).get('/api/products?category=Keyboards')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].category).toBe('Keyboards')
  })

  it('filter theo minPrice và maxPrice', async () => {
    await Product.create([
      productPayload({ slug: 'cheap', price: 20 }),
      productPayload({ slug: 'expensive', price: 200, name: 'Expensive Keyboard' }),
    ])

    const res = await request(app).get('/api/products?minPrice=50&maxPrice=150')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })

  it('filter featured=true', async () => {
    await Product.create([
      productPayload({ slug: 'normal', isFeatured: false }),
      productPayload({ slug: 'featured', isFeatured: true, name: 'Featured Keyboard' }),
    ])

    const res = await request(app).get('/api/products?featured=true')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].isFeatured).toBe(true)
  })

  it('pagination — page 2', async () => {
    const products = Array.from({ length: 15 }, (_, i) =>
      productPayload({ slug: `prod-${i}`, name: `Product ${i}` })
    )
    await Product.create(products)

    const res = await request(app).get('/api/products?page=2&limit=12')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(3) // 15 - 12 = 3 còn lại
    expect(res.body.pagination.page).toBe(2)
  })
})

// ==================== GET /api/products/featured ====================
describe('GET /api/products/featured', () => {
  it('trả tối đa 8 sản phẩm featured', async () => {
    await Product.create(
      Array.from({ length: 10 }, (_, i) =>
        productPayload({ slug: `feat-${i}`, isFeatured: true, name: `Featured ${i}` })
      )
    )

    const res = await request(app).get('/api/products/featured')

    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(8)
    expect(res.body.data.every(p => p.isFeatured)).toBe(true)
  })

  it('trả mảng rỗng nếu không có featured', async () => {
    const res = await request(app).get('/api/products/featured')
    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })
})

// ==================== GET /api/products/best-sellers ====================
describe('GET /api/products/best-sellers', () => {
  it('sắp xếp theo sold giảm dần, tối đa 8', async () => {
    await Product.create([
      productPayload({ slug: 'low-sold', sold: 5 }),
      productPayload({ slug: 'high-sold', sold: 100, name: 'Popular Keyboard' }),
    ])

    const res = await request(app).get('/api/products/best-sellers')

    expect(res.statusCode).toBe(200)
    expect(res.body.data[0].sold).toBeGreaterThanOrEqual(res.body.data[1]?.sold ?? 0)
  })
})

// ==================== GET /api/products/flash-sale ====================
describe('GET /api/products/flash-sale', () => {
  it('chỉ trả sản phẩm flash sale còn hạn', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)

    await Product.create([
      productPayload({ slug: 'flash-valid', isFlashSale: true, flashSaleEndsAt: futureDate }),
      productPayload({ slug: 'flash-expired', isFlashSale: true, flashSaleEndsAt: pastDate, name: 'Expired Flash' }),
      productPayload({ slug: 'no-flash', isFlashSale: false, name: 'Normal Product' }),
    ])

    const res = await request(app).get('/api/products/flash-sale')

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].slug).toBe('flash-valid')
  })
})

// ==================== GET /api/products/:slug ====================
describe('GET /api/products/:slug', () => {
  it('tìm thấy product theo slug → 200', async () => {
    await Product.create(productPayload({ slug: 'my-keyboard' }))

    const res = await request(app).get('/api/products/my-keyboard')

    expect(res.statusCode).toBe(200)
    expect(res.body.data.slug).toBe('my-keyboard')
  })

  it('slug không tồn tại → 404', async () => {
    const res = await request(app).get('/api/products/nonexistent-slug')

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })
})

// ==================== GET /api/products/:slug/related ====================
describe('GET /api/products/:slug/related', () => {
  it('trả sản phẩm cùng category, không gồm chính nó', async () => {
    await Product.create([
      productPayload({ slug: 'main-kb', category: 'Keyboards' }),
      productPayload({ slug: 'related-kb', category: 'Keyboards', name: 'Related Keyboard' }),
      productPayload({ slug: 'mouse-1', category: 'Mice', name: 'Gaming Mouse' }),
    ])

    const res = await request(app).get('/api/products/main-kb/related')

    expect(res.statusCode).toBe(200)
    expect(res.body.data.every(p => p.slug !== 'main-kb')).toBe(true)
    expect(res.body.data.some(p => p.slug === 'related-kb')).toBe(true)
  })

  it('slug không tồn tại → 404', async () => {
    const res = await request(app).get('/api/products/fake-slug/related')
    expect(res.statusCode).toBe(404)
  })
})

// ==================== POST /api/products (admin) ====================
describe('POST /api/products', () => {
  it('admin tạo product thành công → 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productPayload())

    expect(res.statusCode).toBe(201)
    expect(res.body.data.name).toBe('Test Keyboard')
  })

  it('user thường không được tạo → 403', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(productPayload())

    expect(res.statusCode).toBe(403)
  })

  it('không có token → 401', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(productPayload())

    expect(res.statusCode).toBe(401)
  })
})

// ==================== PUT /api/products/:id (admin) ====================
describe('PUT /api/products/:id', () => {
  it('admin cập nhật product → 200', async () => {
    const product = await Product.create(productPayload())

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Keyboard', price: 149.99 })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.name).toBe('Updated Keyboard')
    expect(res.body.data.price).toBe(149.99)
  })

  it('id không tồn tại → 404', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .put(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test' })

    expect(res.statusCode).toBe(404)
  })
})

// ==================== DELETE /api/products/:id (admin) ====================
describe('DELETE /api/products/:id', () => {
  it('admin xóa product → 200', async () => {
    const product = await Product.create(productPayload())

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)

    // Verify thực sự đã xóa
    const deleted = await Product.findById(product._id)
    expect(deleted).toBeNull()
  })

  it('user thường không được xóa → 403', async () => {
    const product = await Product.create(productPayload())

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(403)
  })

  it('id không tồn tại → 404', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .delete(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })
})

// ==================== PCTC_1.5 — page=0 → skip âm gây lỗi ====================
// BUG: không chuẩn hoá page < 1 → .skip() nhận giá trị âm
describe('GET /api/products — PCTC_1.5', () => {
  it('PCTC_1.5 (BUG) — page=0 → phải tự về trang 1, không lỗi server', async () => {
    await Product.create([
      productPayload({ slug: 'p1', name: 'P1' }),
      productPayload({ slug: 'p2', name: 'P2' }),
    ])

    const res = await request(app).get('/api/products?page=0')

    // BUG: skip = (0-1)*12 = -12 → MongoDB lỗi hoặc kết quả sai
    // Đúng: phải trả 200 và tự fallback về trang 1
    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('PCTC_1.5 — page âm cũng phải không gây lỗi server', async () => {
    const res = await request(app).get('/api/products?page=-1')
    expect(res.statusCode).not.toBe(500)
  })
})

// ==================== PCTC_10.2 — category tên có ký tự regex đặc biệt ====================
// BUG: cat.name đưa thẳng vào $regex không escape → lỗi hoặc sai kết quả
describe('GET /api/categories — PCTC_10.2', () => {
  it('PCTC_10.2 (BUG) — tên category có ký tự regex đặc biệt → không lỗi server', async () => {
    const { Category: CategoryModel } = require('../../src/models')

    // Tạo category với tên chứa ký tự đặc biệt regex
    await CategoryModel.create({ name: 'Audio/Video (HD)', slug: 'audio-video-hd', description: 'AV gear' })
    await Product.create(productPayload({ slug: 'av-prod', category: 'Audio/Video (HD)' }))

    const res = await request(app).get('/api/categories')

    // BUG: $regex với ký tự đặc biệt không escape → Invalid regular expression
    // Đúng: không lỗi server, trả productCount đúng
    expect(res.statusCode).toBe(200)
    expect(res.statusCode).not.toBe(500)

    const avCategory = res.body.data.find(c => c.name === 'Audio/Video (HD)')
    if (avCategory) {
      expect(avCategory.productCount).toBeGreaterThanOrEqual(1)
    }
  })
})
