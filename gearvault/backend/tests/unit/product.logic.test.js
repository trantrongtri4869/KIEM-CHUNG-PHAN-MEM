/**
 * Unit Test: Product Filter & Pagination Logic
 * Module: src/routes/products.js — buildFilter, buildSort, calcPagination
 */

// ── Pure functions trích từ products route ───────────────────────────────────

function buildProductFilter(query) {
  const { category, brand, minPrice, maxPrice, rating, featured, sale, search } = query
  const filter = {}

  if (category) filter.category = { $regex: category, $options: 'i' }
  if (brand) filter.brand = brand
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }
  if (rating) filter.rating = { $gte: Number(rating) }
  if (featured === 'true') filter.isFeatured = true
  if (sale === 'true') filter.$or = [{ isFlashSale: true }, { discount: { $exists: true } }]
  if (search) filter.$text = { $search: search }

  return filter
}

function buildSort(sortKey) {
  const sortMap = {
    newest:     { createdAt: -1 },
    price_asc:  { price: 1 },
    price_desc: { price: -1 },
    rating:     { rating: -1 },
    popular:    { sold: -1 },
  }
  return sortMap[sortKey] || sortMap.newest
}

function calcPagination(page, limit, total) {
  const p = Number(page)
  const l = Number(limit)
  return {
    page: p,
    limit: l,
    total,
    pages: Math.ceil(total / l),
    skip: (p - 1) * l,
  }
}

function isFlashSaleActive(product, now = new Date()) {
  if (!product.isFlashSale || !product.flashSaleEndsAt) return false
  return now < new Date(product.flashSaleEndsAt)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('buildProductFilter()', () => {
  test('filter rỗng khi không có query param', () => {
    expect(buildProductFilter({})).toEqual({})
  })

  test('filter theo category (case-insensitive regex)', () => {
    const filter = buildProductFilter({ category: 'Mouse' })
    expect(filter.category).toEqual({ $regex: 'Mouse', $options: 'i' })
  })

  test('filter theo brand (exact match)', () => {
    const filter = buildProductFilter({ brand: 'Logitech' })
    expect(filter.brand).toBe('Logitech')
  })

  test('filter theo minPrice', () => {
    const filter = buildProductFilter({ minPrice: '50' })
    expect(filter.price.$gte).toBe(50)
    expect(filter.price.$lte).toBeUndefined()
  })

  test('filter theo maxPrice', () => {
    const filter = buildProductFilter({ maxPrice: '200' })
    expect(filter.price.$lte).toBe(200)
    expect(filter.price.$gte).toBeUndefined()
  })

  test('filter theo cả minPrice và maxPrice', () => {
    const filter = buildProductFilter({ minPrice: '50', maxPrice: '200' })
    expect(filter.price.$gte).toBe(50)
    expect(filter.price.$lte).toBe(200)
  })

  test('filter theo rating', () => {
    const filter = buildProductFilter({ rating: '4' })
    expect(filter.rating).toEqual({ $gte: 4 })
  })

  test('filter featured=true', () => {
    const filter = buildProductFilter({ featured: 'true' })
    expect(filter.isFeatured).toBe(true)
  })

  test('không filter featured khi featured="false"', () => {
    const filter = buildProductFilter({ featured: 'false' })
    expect(filter.isFeatured).toBeUndefined()
  })

  test('filter sale=true dùng $or', () => {
    const filter = buildProductFilter({ sale: 'true' })
    expect(filter.$or).toBeDefined()
    expect(filter.$or).toHaveLength(2)
    expect(filter.$or[0]).toEqual({ isFlashSale: true })
  })

  test('filter theo search text', () => {
    const filter = buildProductFilter({ search: 'gaming mouse' })
    expect(filter.$text).toEqual({ $search: 'gaming mouse' })
  })

  test('kết hợp nhiều filter', () => {
    const filter = buildProductFilter({ category: 'Keyboard', minPrice: '30', featured: 'true' })
    expect(filter.category).toBeDefined()
    expect(filter.price.$gte).toBe(30)
    expect(filter.isFeatured).toBe(true)
  })
})

describe('buildSort()', () => {
  test('sort newest theo mặc định', () => {
    expect(buildSort('newest')).toEqual({ createdAt: -1 })
  })

  test('sort price_asc', () => {
    expect(buildSort('price_asc')).toEqual({ price: 1 })
  })

  test('sort price_desc', () => {
    expect(buildSort('price_desc')).toEqual({ price: -1 })
  })

  test('sort rating cao → thấp', () => {
    expect(buildSort('rating')).toEqual({ rating: -1 })
  })

  test('sort popular (sold nhiều nhất)', () => {
    expect(buildSort('popular')).toEqual({ sold: -1 })
  })

  test('sort key không hợp lệ → fallback newest', () => {
    expect(buildSort('invalid_key')).toEqual({ createdAt: -1 })
  })

  test('sort key undefined → fallback newest', () => {
    expect(buildSort(undefined)).toEqual({ createdAt: -1 })
  })
})

describe('calcPagination()', () => {
  test('page 1, limit 12, total 50', () => {
    const result = calcPagination(1, 12, 50)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(12)
    expect(result.total).toBe(50)
    expect(result.pages).toBe(5)   // ceil(50/12) = 5 (thực ra 4.17 → 5)
    expect(result.skip).toBe(0)
  })

  test('page 2, limit 12 → skip = 12', () => {
    const result = calcPagination(2, 12, 50)
    expect(result.skip).toBe(12)
    expect(result.page).toBe(2)
  })

  test('page 3, limit 10 → skip = 20', () => {
    const result = calcPagination(3, 10, 100)
    expect(result.skip).toBe(20)
    expect(result.pages).toBe(10)
  })

  test('total = 0 → pages = 0', () => {
    const result = calcPagination(1, 12, 0)
    expect(result.pages).toBe(0)
  })

  test('total chia không hết → làm tròn lên', () => {
    // 25 / 12 = 2.08... → 3 pages
    const result = calcPagination(1, 12, 25)
    expect(result.pages).toBe(3)
  })

  test('total = 1, limit = 12 → 1 page', () => {
    const result = calcPagination(1, 12, 1)
    expect(result.pages).toBe(1)
  })

  test('page string được convert sang number', () => {
    const result = calcPagination('2', '10', 100)
    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.skip).toBe(10)
  })
})

describe('isFlashSaleActive()', () => {
  const future = new Date(Date.now() + 3600000) // 1h sau
  const past   = new Date(Date.now() - 3600000) // 1h trước

  test('trả true khi flash sale đang active và chưa hết hạn', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: future }
    expect(isFlashSaleActive(product)).toBe(true)
  })

  test('trả false khi flash sale đã hết hạn', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: past }
    expect(isFlashSaleActive(product)).toBe(false)
  })

  test('trả false khi isFlashSale = false', () => {
    const product = { isFlashSale: false, flashSaleEndsAt: future }
    expect(isFlashSaleActive(product)).toBe(false)
  })

  test('trả false khi không có flashSaleEndsAt', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: null }
    expect(isFlashSaleActive(product)).toBe(false)
  })
})
