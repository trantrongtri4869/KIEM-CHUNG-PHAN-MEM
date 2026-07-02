const express = require('express')
const { Category, Product } = require('../models')

const router = express.Router()

// Escape các ký tự đặc biệt của regex (. * + ? ^ $ { } ( ) | [ ] \) trước khi đưa vào $regex
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
    // Attach product count
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: { $regex: escapeRegex(cat.name), $options: 'i' } })
        return { ...cat.toObject(), productCount: count }
      })
    )
    res.json({ success: true, data: withCount })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
