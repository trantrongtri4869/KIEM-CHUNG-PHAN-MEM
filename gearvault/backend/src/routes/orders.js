const express = require('express')
const { Order, Product, Coupon } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body
    for (const item of items) {
      if (item.quantity < 1) {
        return res.status(400).json({ success: false, message: `Số lượng sản phẩm ${item.name} không hợp lệ` })
      }
    }
    let couponDiscount = 0

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true })
      if (coupon && coupon.usedCount < coupon.maxUses && new Date() < coupon.expiresAt) {
        couponDiscount = coupon.discount
        coupon.usedCount++
        await coupon.save()
      }
    }

    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingPrice = itemsPrice > 100 ? 0 : 9.99
    const taxPrice = itemsPrice * 0.08
    const totalPrice = Math.max(0, itemsPrice + shippingPrice + taxPrice - couponDiscount)

    const order = await Order.create({
      user: req.user._id, items, shippingAddress, paymentMethod,
      couponCode, couponDiscount, itemsPrice, shippingPrice, taxPrice, totalPrice,
    })

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity, stock: -item.quantity } })
    }

    res.status(201).json({ success: true, data: order })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name images price')
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email')
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product')
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" })
    }
    const update = { status }
    if (status === 'delivered') { update.isDelivered = true; update.deliveredAt = new Date() }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router