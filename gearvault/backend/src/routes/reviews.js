const express = require('express')
const { Review, Product } = require('../models')
const { protect } = require('../middleware/auth')

const router = express.Router()

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body

    const existing = await Review.findOne({ user: req.user._id, product })
    if (existing) return res.status(409).json({ success: false, message: 'You already reviewed this product' })

    const review = await Review.create({ user: req.user._id, product, rating, title, comment })

    // Recalculate product rating
    const reviews = await Review.find({ product })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await Product.findByIdAndUpdate(product, { rating: avgRating.toFixed(1), numReviews: reviews.length })

    await review.populate('user', 'name avatar')
    res.status(201).json({ success: true, data: review })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' })
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const productId = review.product
    await review.deleteOne()

    // Tính lại rating trung bình sau khi xoá (về 0 nếu không còn review nào)
    const remaining = await Review.find({ product: productId })
    const avgRating = remaining.length
      ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
      : 0
    await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: remaining.length })

    res.json({ success: true, message: 'Review deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
