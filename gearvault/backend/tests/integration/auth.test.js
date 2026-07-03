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
    expect(res.body.message).toMatch(/already exists/i)
  })

  it('thiếu name → 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('email không hợp lệ → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(
        userPayload({
          email: 'not-an-email'
        })
      )

    expect(res.statusCode).toBe(400)
  })

  // Boundary Value Analysis (Min = 6)
  it('password đúng 6 ký tự → 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(
        userPayload({
          password: '123456'
        })
      )

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
  })

  // Boundary Value Analysis (Min - 1 = 5)
  it('password dưới 6 ký tự → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(
        userPayload({
          password: '12345'
        })
      )

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
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
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.role).toBe('user')
  })

  it('sai password → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/Invalid email or password/i)
  })

  it('email không tồn tại → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toMatch(/Invalid email or password/i)
  })

  it('thiếu password → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com'
      })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('thiếu email → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      })

    expect(res.statusCode).toBe(400)
    expect(res.body.errors).toBeDefined()
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
      .send({
        name: 'Updated Name',
        email: 'test@example.com'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.name).toBe('Updated Name')
  })

  it('email đã tồn tại → 409 Conflict', async () => {
    await User.create({
      name: 'User 1',
      email: 'user1@example.com',
      password: 'password123'
    })

    const user2 = await User.create({
      name: 'User 2',
      email: 'user2@example.com',
      password: 'password123'
    })

    const token = makeToken(user2._id)

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        email: 'user1@example.com'
      })

    expect(res.statusCode).toBe(409)
    expect(res.body.success).toBe(false)
   expect(res.body.message)
    .toBe("Email already registered")
  })

  it('không có token → 401', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .send({
        name: 'New Name'
      })

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

// ==================== Regression Test — AUTC_4.2 ====================
// Kiểm tra sau khi sửa lỗi, API update profile không được trả về password hash.
describe('PUT /api/auth/profile — AUTC_4.2', () => {
  it('AUTC_4.2 — response không chứa field password', async () => {
    const user = await User.create(userPayload())
    const token = makeToken(user._id)

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
        email: 'test@example.com'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.password).toBeUndefined()
  })
})

// ==================== Regression Test — AUTC_7.3 ====================
// Kiểm tra sau khi sửa lỗi, password phải được hash trước khi lưu vào database.
describe('PUT /api/users/:id — AUTC_7.3', () => {
  it('AUTC_7.3 — password được hash khi cập nhật', async () => {
    const target = await User.create(userPayload())

    const admin = await User.create({
      name: 'Admin',
      email: 'admin2@example.com',
      password: 'admin123',
      role: 'admin',
    })

    const adminTok = makeToken(admin._id)

    await request(app)
      .put(`/api/users/${target._id}`)
      .set('Authorization', `Bearer ${adminTok}`)
      .send({
        password: 'newplaintext'
      })

    const updated = await User.findById(target._id).select('+password')

    expect(updated.password).toMatch(/^\$2[aby]\$/)
  })
})

// ==================== Regression Test — AUTC_8.2 ====================
// Kiểm tra sau khi sửa lỗi, xóa user không tồn tại phải trả về 404.
describe('DELETE /api/users/:id — AUTC_8.2', () => {
  it('AUTC_8.2 — id không tồn tại trả về HTTP 404', async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin3@example.com',
      password: 'admin123',
      role: 'admin',
    })

    const adminTok = makeToken(admin._id)
    const fakeId = new (require('mongoose')).Types.ObjectId()

    const res = await request(app)
      .delete(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminTok}`)

    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toMatch(/User not found/i)
  })
})