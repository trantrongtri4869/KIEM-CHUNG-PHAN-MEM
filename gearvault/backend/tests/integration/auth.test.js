/**
 * INTEGRATION TEST — routes/auth.js
 * Endpoints: POST /register, POST /login, GET /profile, PUT /profile, POST /forgot-password
 * Dùng MongoDB in-memory — test thật với DB
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../../src/app')
const db = require('../helpers/db')
const { userPayload, makeToken } = require('../helpers/factories')
const { User } = require('../../src/models')

beforeAll(async () => await db.connect())
afterEach(async () => await db.clearDatabase())
afterAll(async () => await db.disconnect())

// ==================== POST /api/auth/register ====================
describe('POST /api/auth/register', () => {
  it('đăng ký thành công → 201 + token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload())

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('test@example.com')
    expect(res.body.data.user.password).toBeUndefined() // không trả password
  })

  it('email đã tồn tại → 409', async () => {
    await User.create(userPayload())

    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload())

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toMatch(/already registered/i)
  })

  it('thiếu name → 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('email không hợp lệ → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload({ email: 'not-an-email' }))

    expect(res.statusCode).toBe(400)
  })

  it('password dưới 6 ký tự → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload({ password: '123' }))

    expect(res.statusCode).toBe(400)
  })
})

// ==================== POST /api/auth/login ====================
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create(userPayload())
  })

  it('login thành công → 200 + token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.role).toBe('user')
  })

  it('sai password → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/Invalid email or password/i)
  })

  it('email không tồn tại → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.statusCode).toBe(401)
  })

  it('thiếu password → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' })

    expect(res.statusCode).toBe(400)
  })
})

// ==================== GET /api/auth/profile ====================
describe('GET /api/auth/profile', () => {
  it('có token hợp lệ → 200 + thông tin user', async () => {
    const user = await User.create(userPayload())
    const token = makeToken(user._id)

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.email).toBe('test@example.com')
    expect(res.body.data.password).toBeUndefined()
  })

  it('không có token → 401', async () => {
    const res = await request(app).get('/api/auth/profile')
    expect(res.statusCode).toBe(401)
  })

  it('token sai → 401', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer fake.token.here')

    expect(res.statusCode).toBe(401)
  })
})

// ==================== PUT /api/auth/profile ====================
describe('PUT /api/auth/profile', () => {
  it('cập nhật name thành công → 200', async () => {
    const user = await User.create(userPayload())
    const token = makeToken(user._id)

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', email: 'test@example.com' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.name).toBe('Updated Name')
  })

  it('không có token → 401', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .send({ name: 'New Name' })

    expect(res.statusCode).toBe(401)
  })
})

// ==================== POST /api/auth/forgot-password ====================
describe('POST /api/auth/forgot-password', () => {
  it('luôn trả 200 (mock endpoint)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'anyone@example.com' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toContain('anyone@example.com')
  })
})
