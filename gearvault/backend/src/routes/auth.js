const express = require('express')
const { body, validationResult } = require('express-validator')
const { User } = require('../models')
const { signToken, protect } = require('../middleware/auth')

const router = express.Router()

const handleValidation = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const validation = handleValidation(req, res)
    if (validation) return

    try {
      const { name, email, password } = req.body

      const existing = await User.findOne({ email })
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' })
      }

      const user = await User.create({ name, email, password })
      const token = signToken(user._id)

      res.status(201).json({
        success: true,
        data: {
          user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
          token,
        },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const validation = handleValidation(req, res)
    if (validation) return

    try {
      const { email, password } = req.body

      const user = await User.findOne({ email }).select('+password')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' })
      }

      const token = signToken(user._id)

      res.json({
        success: true,
        data: {
          user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
          token,
        },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

// GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, data: req.user })
})

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    )
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/auth/forgot-password (mock)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  // In a real app, send reset email
  res.json({ success: true, message: `Password reset email sent to ${email}` })
})

module.exports = router
