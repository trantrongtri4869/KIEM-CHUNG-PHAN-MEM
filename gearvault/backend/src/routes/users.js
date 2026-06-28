const express = require('express')
const { User } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const users = await User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    const total = await User.countDocuments()
    res.json({ success: true, data: users, pagination: { page: Number(page), total } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

const bcrypt = require('bcryptjs');

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cập nhật các trường được gửi lên
    Object.assign(user, req.body);

    // Nếu có cập nhật password thì hash trước khi lưu
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
