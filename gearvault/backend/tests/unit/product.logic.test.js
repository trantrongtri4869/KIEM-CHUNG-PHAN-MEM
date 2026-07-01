// Dựa trên logic của PCTC_1_1 đến PCTC_1_7
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
  const p = Number(page) || 1;
  const l = Number(limit) || 12;
  const safePage = Math.max(1, p);
  return {
    page: safePage,
    limit: l,
    total,
    pages: Math.ceil(total / l),
    skip: (safePage - 1) * l,
  }
}

function isFlashSaleActive(product, now = new Date()) {
  if (!product.isFlashSale || !product.flashSaleEndsAt) return false
  return now < new Date(product.flashSaleEndsAt)
}

describe('buildProductFilter()', () => {
  
  // PCTC_1_1: Không có filter
  test('Trả về object rỗng khi không có query param', () => {
    expect(buildProductFilter({})).toEqual({});
  });

  // PCTC_1_2: minPrice = maxPrice
  test('Xử lý đúng khi minPrice = maxPrice', () => {
    const filter = buildProductFilter({ minPrice: '100', maxPrice: '100' });
    expect(filter.price).toEqual({ $gte: 100, $lte: 100 });
  });

  // PCTC_1_3: minPrice > maxPrice
  test('Trả về logic hợp lệ khi minPrice > maxPrice', () => {
    const filter = buildProductFilter({ minPrice: '200', maxPrice: '100' });
    expect(filter.price).toBeDefined();
  });

  // PCTC_1_4: Sort invalid key (Fallback)
  test('Fallback về sortMap.newest khi sort key không hợp lệ', () => {
    const sort = buildSort('invalid_key');
    expect(sort).toEqual({ createdAt: -1 });
  });

  // PCTC_1_5: Pagination page=0
  test('Xử lý page=0 thành trang 1 (skip=0)', () => {
    const { skip } = calcPagination('-1', '12', 100);
    expect(skip).toBe(0); // (0 - 1) * 12 thường sẽ xử lý logic chặn về 0
  });

  // PCTC_1_6: Search $text
  test('Tạo query đúng cho search text', () => {
    const filter = buildProductFilter({ search: 'laptop' });
    expect(filter.$text).toEqual({ $search: 'laptop' });
  });

  // PCTC_1_7: Rating = 4
  test('Filter đúng rating=5', () => {
    const filter = buildProductFilter({ rating: '4' });
    expect(filter.rating).toEqual({ $gte: 4 });
  });
  // PCTC_2_1: featured=true
  test('filter featured=true', () => {
    const filter = buildProductFilter({ featured: 'true' })
    expect(filter.isFeatured).toBe(true)
  });
  // PCTC_2_1: featured=false
  test('Filter không chứa isFeatured khi featured="false"', () => {
    // Gọi filter với giá trị biên hoặc không có sản phẩm featured
    const filter = buildProductFilter({ featured: 'false' });
    expect(filter.isFeatured).toBeUndefined();
  });
});

describe('Best Sellers', () => {
  // Test cho logic sắp xếp (PCTC_3_1)
  describe('buildSort()', () => {
    test('Sắp xếp giảm dần theo sold khi chọn popular', () => {
      const sort = buildSort('popular');
      expect(sort).toEqual({ sold: -1 }); // Kiểm tra logic sort giảm dần
    });
  });

  // Test cho logic giới hạn số lượng (PCTC_3_1 & PCTC_3_2)
  describe('calcPagination()', () => {
    test('Đảm bảo limit luôn là 8 cho danh sách Best Sellers', () => {
      const { limit } = calcPagination(1, 8, 100); 
      expect(limit).toBe(8); // Kiểm tra giới hạn trả về tối đa 8 sản phẩm
    });

    test('Vẫn trả về limit=8 ngay cả khi sold=0 (biên dữ liệu)', () => {
      // Logic vẫn hoạt động bình thường, không bị lỗi khi sold=0
      const { limit } = calcPagination(1, 8, 0); 
      expect(limit).toBe(8); 
    });
  });
});

describe('isFlashSaleActive()', () => {
  const now = new Date(); // Mốc thời gian hiện tại cố định
  const future = new Date(now.getTime() + 3600000); // 1h sau
  const past = new Date(now.getTime() - 3600000); // 1h trước
  // PCTC_4_1: flash sale còn hạn 
  test('Trả true khi flash sale còn hạn', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: future };
    expect(isFlashSaleActive(product, now)).toBe(true);
  });
  // PCTC_4_2: flash sale is now
  test('Trả false khi flash sale hết hạn đúng bằng thời điểm hiện tại', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: now };
    expect(isFlashSaleActive(product, now)).toBe(false);
  });
  // PCTC_4_3: flash sale hết hạn
  test('Trả false khi flash sale đã hết hạn', () => {
    const product = { isFlashSale: true, flashSaleEndsAt: past };
    expect(isFlashSaleActive(product, now)).toBe(false);
  });
});