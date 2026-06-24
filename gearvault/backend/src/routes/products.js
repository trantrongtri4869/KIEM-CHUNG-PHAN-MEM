const express = require('express')
const { Product } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// GET /api/products — list with filters
router.get('/', async (req, res) => {
  try {
    const {
      category, brand, minPrice, maxPrice, rating,
      sort = 'newest', search, page = 1, limit = 12,
      featured, sale,
    } = req.query

    const filter = {}
    if (category) filter.category = { $regex: category, $options: 'i' }
    if (brand) filter.brand = brand
    if (minPrice || maxPrice) filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
    if (rating) filter.rating = { $gte: Number(rating) }
    if (featured === 'true') filter.isFeatured = true
    if (sale === 'true') filter.$or = [{ isFlashSale: true }, { discount: { $exists: true } }]
    if (search) filter.$text = { $search: search }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      popular: { sold: -1 },
    }

    const currentPage = Math.max(1, Number(page));
    const currentLimit = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * currentLimit;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(currentLimit),
      Product.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: products,
      pagination: { page: currentPage, limit: currentLimit, total, pages: Math.ceil(total / currentLimit) },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/products/best-sellers
router.get('/best-sellers', async (req, res) => {
  try {
    const products = await Product.find().sort({ sold: -1 }).limit(8)
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/products/flash-sale
router.get('/flash-sale', async (req, res) => {
  try {
    const products = await Product.find({ isFlashSale: true, flashSaleEndsAt: { $gt: new Date() } })
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/products/:slug/related
router.get('/:slug/related', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4)
    res.json({ success: true, data: related })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/products (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

// PUT /api/products/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

// DELETE /api/products/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
