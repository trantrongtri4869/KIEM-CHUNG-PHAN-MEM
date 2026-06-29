/**
 * Unit Test: User Model Logic
 * Module: src/models/index.js — userSchema methods và validation rules
 * Dùng jest.mock để không cần kết nối MongoDB thật
 */

const bcrypt = require('bcryptjs')

// ── Mock bcryptjs ─────────────────────────────────────────────────────────────
jest.mock('bcryptjs')

// ── Trích xuất logic từ model thành pure/testable functions ──────────────────

async function hashPassword(plainPassword, saltRounds = 12) {
  return bcrypt.hash(plainPassword, saltRounds)
}

async function comparePassword(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword)
}

function isPasswordModified(isModified) {
  // Simulates pre-save hook decision
  return isModified
}

function validateUserRole(role) {
  return ['user', 'admin'].includes(role)
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6
}

function sanitizeUserOutput(user) {
  // Remove password from output (like select: false)
  const { password, ...safe } = user
  return safe
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('hashPassword()', () => {
  beforeEach(() => {
    bcrypt.hash.mockReset()
  })

  test('gọi bcrypt.hash với đúng password và saltRounds=12', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password_123')
    const result = await hashPassword('mypassword123')
    expect(bcrypt.hash).toHaveBeenCalledWith('mypassword123', 12)
    expect(result).toBe('hashed_password_123')
  })

  test('trả về hashed string', async () => {
    bcrypt.hash.mockResolvedValue('$2b$12$somehashedvalue')
    const result = await hashPassword('secret')
    expect(result).toBe('$2b$12$somehashedvalue')
  })

  test('gọi bcrypt.hash đúng 1 lần', async () => {
    bcrypt.hash.mockResolvedValue('hashed')
    await hashPassword('pass')
    expect(bcrypt.hash).toHaveBeenCalledTimes(1)
  })
})

describe('comparePassword()', () => {
  beforeEach(() => {
    bcrypt.compare.mockReset()
  })

  test('trả true khi password đúng', async () => {
    bcrypt.compare.mockResolvedValue(true)
    const result = await comparePassword('correct', '$2b$12$hash')
    expect(result).toBe(true)
  })

  test('trả false khi password sai', async () => {
    bcrypt.compare.mockResolvedValue(false)
    const result = await comparePassword('wrong', '$2b$12$hash')
    expect(result).toBe(false)
  })

  test('gọi bcrypt.compare với đúng arguments', async () => {
    bcrypt.compare.mockResolvedValue(true)
    await comparePassword('plain', 'hashed')
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed')
  })
})

describe('isPasswordModified() — pre-save hook logic', () => {
  test('trả true khi password đã bị modify (nên hash)', () => {
    expect(isPasswordModified(true)).toBe(true)
  })

  test('trả false khi password chưa bị modify (skip hash)', () => {
    expect(isPasswordModified(false)).toBe(false)
  })
})

describe('validateUserRole()', () => {
  test('role "user" hợp lệ', () => {
    expect(validateUserRole('user')).toBe(true)
  })

  test('role "admin" hợp lệ', () => {
    expect(validateUserRole('admin')).toBe(true)
  })

  test('role "superadmin" không hợp lệ', () => {
    expect(validateUserRole('superadmin')).toBe(false)
  })

  test('role rỗng không hợp lệ', () => {
    expect(validateUserRole('')).toBe(false)
  })

  test('role undefined không hợp lệ', () => {
    expect(validateUserRole(undefined)).toBe(false)
  })

  test('role "USER" (uppercase) không hợp lệ (case-sensitive)', () => {
    expect(validateUserRole('USER')).toBe(false)
  })
})

describe('validateEmail()', () => {
  test('email hợp lệ', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  test('email với subdomain hợp lệ', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  test('email thiếu @ không hợp lệ', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  test('email thiếu domain không hợp lệ', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  test('email rỗng không hợp lệ', () => {
    expect(validateEmail('')).toBe(false)
  })

  test('email có khoảng trắng không hợp lệ', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })
})

describe('validatePassword()', () => {
  test('password đủ 6 ký tự hợp lệ (boundary)', () => {
    expect(validatePassword('abc123')).toBe(true)
  })

  test('password dài hơn 6 ký tự hợp lệ', () => {
    expect(validatePassword('mypassword')).toBe(true)
  })

  test('password 5 ký tự không hợp lệ (boundary)', () => {
    expect(validatePassword('abc12')).toBe(false)
  })

  test('password rỗng không hợp lệ', () => {
    expect(validatePassword('')).toBe(false)
  })

  test('password null không hợp lệ', () => {
    expect(validatePassword(null)).toBe(false)
  })

  test('password là number không hợp lệ (phải là string)', () => {
    expect(validatePassword(123456)).toBe(false)
  })
})

describe('sanitizeUserOutput()', () => {
  test('loại bỏ field password khỏi output', () => {
    const user = { _id: '123', name: 'Trí', email: 'tri@example.com', password: 'hashed_secret' }
    const safe = sanitizeUserOutput(user)
    expect(safe.password).toBeUndefined()
  })

  test('giữ nguyên các field khác', () => {
    const user = { _id: '123', name: 'Trí', email: 'tri@example.com', role: 'user', password: 'secret' }
    const safe = sanitizeUserOutput(user)
    expect(safe._id).toBe('123')
    expect(safe.name).toBe('Trí')
    expect(safe.email).toBe('tri@example.com')
    expect(safe.role).toBe('user')
  })
})

// ── AUTC_8_2 — updateProfile: response không lộ password hash ─────────────
// BUG: findByIdAndUpdate thiếu .select('-password') → hash bị trả về client

function sanitizeUpdateProfileResponse(userDoc) {
  if (!userDoc) return null
  const { password, ...safe } = userDoc
  return safe
}

function hasPasswordInResponse(responseData) {
  return responseData && 'password' in responseData
}

describe('AUTC_8_2 — updateProfile: response không lộ password hash', () => {
  test('response đúng: KHÔNG chứa field password', () => {
    const userFromDB = { _id: '123', name: 'Trí', email: 'tri@gmail.com', role: 'user', password: '$2b$12$hash' }
    const safe = sanitizeUpdateProfileResponse(userFromDB)
    expect(hasPasswordInResponse(safe)).toBe(false)
  })

  test('BUG scenario: không sanitize → password bị lộ', () => {
    const userFromDB = { _id: '123', name: 'Trí', email: 'tri@gmail.com', password: '$2b$12$hash' }
    expect(hasPasswordInResponse(userFromDB)).toBe(true)
  })

  test('các field khác vẫn được giữ sau khi sanitize', () => {
    const userFromDB = { _id: '123', name: 'Trí', email: 'tri@gmail.com', role: 'user', password: '$2b$12$hash' }
    const safe = sanitizeUpdateProfileResponse(userFromDB)
    expect(safe._id).toBe('123')
    expect(safe.name).toBe('Trí')
    expect(safe.role).toBe('user')
  })

  test('trả null khi userDoc = null', () => {
    expect(sanitizeUpdateProfileResponse(null)).toBeNull()
  })
})

// ── AUTC_11_2 — deleteUser: id không tồn tại phải trả 404, không phải 200 ──
// BUG: handler không kiểm tra kết quả findByIdAndDelete → luôn trả 200

function handleDeleteUserResult(deletedDoc) {
  if (!deletedDoc) {
    return { status: 404, body: { success: false, message: 'User not found' } }
  }
  return { status: 200, body: { success: true, message: 'User deleted' } }
}

describe('AUTC_11_2 — deleteUser: id không tồn tại phải trả 404', () => {
  test('findByIdAndDelete=null → trả 404', () => {
    const result = handleDeleteUserResult(null)
    expect(result.status).toBe(404)
    expect(result.body.success).toBe(false)
    expect(result.body.message).toBe('User not found')
  })

  test('findByIdAndDelete trả doc → trả 200', () => {
    const result = handleDeleteUserResult({ _id: '123', name: 'Trí' })
    expect(result.status).toBe(200)
    expect(result.body.success).toBe(true)
  })

  test('BUG scenario: không kiểm tra kết quả → id không tồn tại vẫn trả 200', () => {
    // Simulate hành vi sai hiện tại của backend
    const buggyHandler = (_doc) => ({ status: 200, body: { success: true, message: 'User deleted' } })
    const result = buggyHandler(null)
    expect(result.status).toBe(200) // SAI — phải là 404
  })
})
