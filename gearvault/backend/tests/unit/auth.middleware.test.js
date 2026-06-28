/**
 * UNIT TEST — middleware/auth.js
 * Test: protect, adminOnly, signToken
 * Không cần DB thật — mock User model
 */

process.env.JWT_SECRET = 'test-secret-key-for-jest'
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')

// Mock toàn bộ models trước khi require middleware
jest.mock('../../src/models', () => ({
  User: {
    findById: jest.fn(),
  },
}))

const { protect, adminOnly, signToken } = require('../../src/middleware/auth')
const { User } = require('../../src/models')

// Helper tạo mock req/res/next
const mockReq = (overrides = {}) => ({
  headers: {},
  user: null,
  ...overrides,
})

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const mockNext = jest.fn()

// ==================== signToken ====================
describe('signToken()', () => {
  it('tạo JWT hợp lệ chứa userId', () => {
    const userId = '507f1f77bcf86cd799439011'
    const token = signToken(userId)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    expect(decoded.id).toBe(userId)
  })

  it('token có thời hạn (exp field tồn tại)', () => {
    const token = signToken('someId')
    const decoded = jwt.decode(token)
    expect(decoded.exp).toBeDefined()
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })
})

// ==================== protect ====================
describe('protect middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNext.mockClear()
  })

  it('trả 401 nếu không có Authorization header', async () => {
    const req = mockReq({ headers: {} })
    const res = mockRes()

    await protect(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('no token') })
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('trả 401 nếu token không hợp lệ / sai chữ ký', async () => {
    const req = mockReq({ headers: { authorization: 'Bearer invalid.token.here' } })
    const res = mockRes()

    await protect(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('trả 401 nếu user không còn tồn tại trong DB', async () => {
    const token = signToken('507f1f77bcf86cd799439011')
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) })

    const req = mockReq({ headers: { authorization: `Bearer ${token}` } })
    const res = mockRes()

    await protect(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User no longer exists' })
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('gán req.user và gọi next() nếu token hợp lệ', async () => {
    const fakeUser = { _id: '507f1f77bcf86cd799439011', name: 'Tri', role: 'user' }
    const token = signToken(fakeUser._id)
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) })

    const req = mockReq({ headers: { authorization: `Bearer ${token}` } })
    const res = mockRes()

    await protect(req, res, mockNext)

    expect(req.user).toEqual(fakeUser)
    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })
})

// ==================== adminOnly ====================
describe('adminOnly middleware', () => {
  beforeEach(() => mockNext.mockClear())

  it('trả 403 nếu user có role = "user"', () => {
    const req = mockReq({ user: { role: 'user' } })
    const res = mockRes()

    adminOnly(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('admin only') })
    )
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('trả 403 nếu req.user là null', () => {
    const req = mockReq({ user: null })
    const res = mockRes()

    adminOnly(req, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('gọi next() nếu user có role = "admin"', () => {
    const req = mockReq({ user: { role: 'admin' } })
    const res = mockRes()

    adminOnly(req, res, mockNext)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })
})
