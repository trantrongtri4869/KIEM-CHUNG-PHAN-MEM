/**
 * INTEGRATION TEST — routes/orders.js
 * Endpoints: POST /, GET /my, GET / (admin), GET /:id, PUT /:id/status
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../src/app')
const db = require('../helpers/db')
const { productPayload, orderPayload, couponPayload, makeToken } = require('../helpers/factories')
const { User, Product, Order, Coupon } = require('../../src/models')

let adminToken, userToken, adminUser, regularUser, testProduct

beforeAll(async () => await db.connect())

beforeEach(async () => {
  await db.clearDatabase()
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' })
  regularUser = await User.create({ name: 'User', email: 'user@test.com', password: 'user123', role: 'user' })
  adminToken = makeToken(adminUser._id)
  userToken = makeToken(regularUser._id)
  testProduct = await Product.create(productPayload({ stock: 100 }))
})

afterAll(async () => await db.disconnect())

// Helper tạo order body với productId thật
const makeOrderBody = (overrides = {}) =>
  orderPayload(testProduct._id, overrides)

// ==================== POST /api/orders ====================
describe('POST /api/orders', () => {
  it('tạo order thành công → 201', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody())

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('pending')
    expect(res.body.data.totalPrice).toBeGreaterThan(0)
  })

  it('tính giá đúng: itemsPrice + shipping + tax', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody())

    const { itemsPrice, shippingPrice, taxPrice, totalPrice } = res.body.data
    // 2 items * 99.99 = 199.98 > 100 → free shipping
    expect(itemsPrice).toBeCloseTo(199.98, 1)
    expect(shippingPrice).toBe(0)
    expect(taxPrice).toBeCloseTo(199.98 * 0.08, 1)
    expect(totalPrice).toBeCloseTo(itemsPrice + shippingPrice + taxPrice, 1)
  })

  it('shipping $9.99 khi itemsPrice <= 100', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody({
        items: [{ product: testProduct._id, name: 'Test', image: '', price: 30, quantity: 1 }],
      }))

    expect(res.body.data.shippingPrice).toBe(9.99)
  })

  it('áp coupon hợp lệ → giảm giá', async () => {
    await Coupon.create(couponPayload({ code: 'SAVE10', discount: 10 }))

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody({ couponCode: 'SAVE10' }))

    expect(res.statusCode).toBe(201)
    expect(res.body.data.couponDiscount).toBe(10)
  })

  it('coupon không tồn tại → order vẫn tạo được (không áp discount)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody({ couponCode: 'FAKECODE' }))

    expect(res.statusCode).toBe(201)
    expect(res.body.data.couponDiscount).toBe(0)
  })

  it('không có token → 401', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send(makeOrderBody())

    expect(res.statusCode).toBe(401)
  })

  it('tạo order → stock sản phẩm giảm', async () => {
    const stockBefore = testProduct.stock

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send(makeOrderBody()) // quantity: 2

    const updatedProduct = await Product.findById(testProduct._id)
    expect(updatedProduct.stock).toBe(stockBefore - 2)
    expect(updatedProduct.sold).toBe(2)
  })
})

// ==================== GET /api/orders/my ====================
describe('GET /api/orders/my', () => {
  it('trả danh sách order của user đang login', async () => {
    await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .get('/api/orders/my')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].user.toString()).toBe(regularUser._id.toString())
  })

  it('không có token → 401', async () => {
    const res = await request(app).get('/api/orders/my')
    expect(res.statusCode).toBe(401)
  })
})

// ==================== GET /api/orders (admin) ====================
describe('GET /api/orders (admin)', () => {
  it('admin xem tất cả orders → 200', async () => {
    await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('user thường không được xem all orders → 403', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(403)
  })
})

// ==================== GET /api/orders/:id ====================
describe('GET /api/orders/:id', () => {
  it('user xem đúng order của mình → 200', async () => {
    const order = await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data._id.toString()).toBe(order._id.toString())
  })

  it('user không được xem order của người khác → 403', async () => {
    const otherUser = await User.create({ name: 'Other', email: 'other@test.com', password: '123456' })
    const order = await Order.create({
      user: otherUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(403)
  })

  it('admin xem được order của bất kỳ ai → 200', async () => {
    const order = await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
  })

  it('order không tồn tại → 404', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/orders/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })
})

// ==================== PUT /api/orders/:id/status (admin) ====================
describe('PUT /api/orders/:id/status', () => {
  it('admin cập nhật status → 200', async () => {
    const order = await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.status).toBe('processing')
  })

  it('status = delivered → isDelivered = true và deliveredAt được set', async () => {
    const order = await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'delivered' })

    expect(res.body.data.isDelivered).toBe(true)
    expect(res.body.data.deliveredAt).toBeDefined()
  })

  it('user thường không được cập nhật status → 403', async () => {
    const order = await Order.create({
      user: regularUser._id,
      ...makeOrderBody(),
      itemsPrice: 199.98,
      totalPrice: 225.97,
    })

    const res = await request(app)
      .put(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'shipped' })

    expect(res.statusCode).toBe(403)
  })
})
