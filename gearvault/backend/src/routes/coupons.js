const express = require('express')
const { Coupon } = require('../models')
const { protect } = require('../middleware/auth')

const router = express.Router()

// POST /api/coupons/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, total } = req.body

    if (total === undefined || total === null || isNaN(Number(total))) {
      return res.status(400).json({ success: false, message: 'Thiếu hoặc sai định dạng giá trị đơn hàng (total)' })
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' })
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon has expired' })
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    if (Number(total) < coupon.minOrder) return res.status(400).json({ success: false, message: `Minimum order $${coupon.minOrder} required` })

    res.json({ success: true, data: { code: coupon.code, discount: coupon.discount, type: coupon.type } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
