const express = require('express')
const { Product } = require('../models')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

const buildProductFilter = (query) => {
  const { category, brand, minPrice, maxPrice, rating, featured, sale, search } = query;
  const filter = {};
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };
  if (featured === 'true') filter.isFeatured = true;
  if (sale === 'true') filter.$or = [{ isFlashSale: true }, { discount: { $exists: true } }];
  if (search) filter.$text = { $search: search };
  return filter;
};

const buildSort = (sortKey) => {
  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { sold: -1 },
  };
  return sortMap[sortKey] || sortMap.newest;
};

const calcPagination = (page, limit, total) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 12);
  return { page: p, limit: l, total, pages: Math.ceil(total / l), skip: (p - 1) * l };
};

const isFlashSaleActive = (product, now = new Date()) => {
  if (!product.isFlashSale) return false;
  return new Date(product.flashSaleEndsAt) > now;
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// GET /api/products — list with filters
router.get('/', async (req, res) => {
  try {
    const filter = buildProductFilter(req.query);
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(buildSort(req.query.sort))
        .skip(pagination.skip)
        .limit(pagination.limit)
    ]);

    const pagination = calcPagination(req.query.page, req.query.limit, total);
    const now = new Date();
    const productsWithStatus = products.map(product => {
      const p = product.toObject ? product.toObject() : product;
      return {
        ...p,
        isFlashSaleActive: isFlashSaleActive(p, now)
      };
    });

    res.json({ 
      success: true, 
      data: productsWithStatus, 
      pagination 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
router.post('/', protect, adminOnly, createProduct)

// PUT /api/products/:id (admin)
router.put('/:id', protect, adminOnly, updateProduct)

// DELETE /api/products/:id (admin)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = { router, buildProductFilter, 
  buildSort, calcPagination, 
  isFlashSaleActive, createProduct, 
  updateProduct, deleteProduct };
