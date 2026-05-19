const express = require('express')
const { Order, Product, User } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueData] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ])

    const totalRevenue = revenueData[0]?.total || 0

    res.json({
      success: true,
      data: { totalOrders, totalUsers, totalProducts, totalRevenue },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/revenue', protect, adminOnly, async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/top-products', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ sold: -1 }).limit(5)
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
