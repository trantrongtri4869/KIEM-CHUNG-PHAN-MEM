const express = require('express')
const mongoose = require('mongoose')

const { User } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// ==================== GET ALL USERS ====================
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    const total = await User.countDocuments()

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        total
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// ==================== UPDATE USER ====================
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Kiểm tra ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Cập nhật name
    if (req.body.name !== undefined) {
      user.name = req.body.name
    }

    // Kiểm tra email trùng trước khi cập nhật
    if (
      req.body.email !== undefined &&
      req.body.email !== user.email
    ) {
      const existed = await User.findOne({
        email: req.body.email
      })

      if (existed) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        })
      }

      user.email = req.body.email
    }

    // Đổi password (pre-save hook sẽ tự hash)
    if (req.body.password !== undefined) {
      user.password = req.body.password
    }

    // Admin được phép đổi role
    if (req.body.role !== undefined) {
      user.role = req.body.role
    }

    await user.save()

    const result = await User.findById(user._id).select('-password')

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// ==================== DELETE USER ====================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User deleted'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router