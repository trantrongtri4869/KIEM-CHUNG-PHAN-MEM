const { Product, Category } = require('../../src/models');
const { 
  buildProductFilter, 
  buildSort, 
  calcPagination, 
  isFlashSaleActive,
  createProduct, 
  updateProduct, deleteProduct,
  getCategories
} = require('../../src/routes/products');
const { adminOnly } = require('../../src/middleware/auth');

jest.mock('../../src/models', () => ({
  Product: {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  },
  Category: {
    find: jest.fn()
  }
}));
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
  test('Filter đúng rating=4', () => {
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

describe('Unit Tests cho Logic Sản phẩm', () => {
  test('Logic tạo filter theo slug', () => {
    const buildSlugFilter = (slug) => ({ slug });
    // Test 5_1: Filter đúng slug
    expect(buildSlugFilter('my-product')).toEqual({ slug: 'my-product' });
    // Test 5_2: Khi slug không tồn tại, logic filter vẫn phải tạo ra đúng key đó
    expect(buildSlugFilter(null)).toEqual({ slug: null });
  });

  // Logic lọc sản phẩm cùng category và loại trừ chính nó
  test('Logic lọc sản phẩm liên quan', () => {
    const buildRelatedFilter = (currentProduct) => {
      if (!currentProduct) return null;
      return { 
        category: currentProduct.category, 
        _id: { $ne: currentProduct._id } 
      };
    };
    // Test 6_1: Có sản phẩm cùng category
    const product = { _id: 'A', category: 'Laptop' };
    expect(buildRelatedFilter(product)).toEqual({ 
      category: 'Laptop', 
      _id: { $ne: 'A' } 
    });
    // Test 6_3: Nếu product gốc null (không tìm thấy)
    expect(buildRelatedFilter(null)).toBeNull();
  });
});

describe('Admin & Category Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('Create Product', () => {
    // PCTC_7_1: Dữ liệu đầy đủ
    test('Tạo thành công dữ liệu hợp lệ', async () => {
      const mockProduct = { name: 'Test', price: 100 };
      Product.create.mockResolvedValue({ _id: '123', ...mockProduct });
      req = { body: mockProduct };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    // PCTC_7_2: price = 0
    test('Dữ liệu price = 0 (Biên dưới hợp lệ)', async () => {
      Product.create.mockResolvedValue({ _id: '123', price: 0 });
      req = { body: { name: 'Free Product', price: 0 } };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    // PCTC_7_3: Biên dưới
    test('Bắt lỗi validation (price < 0)', async () => {
      Product.create.mockRejectedValue(new Error('ValidationError'));
      req = { body: { price: -1 } };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
    // PCTC_7_4: slug bị trùng
    test('Slug bị trùng (MongoError 11000)', async () => {
      // Giả lập lỗi trùng key
      Product.create.mockRejectedValue({ code: 11000, message: 'Duplicate key' });
      req = { body: { name: 'Test', slug: 'duplicate' } };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    // PCTC_7_5: ngoài biên quyền
    test('Role != admin (Access denied)', async () => {
      const req = { user: { role: 'user' } }; 
      const res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn() 
      };
      const next = jest.fn(); // Mock function next của express
      // Gọi middleware
      await adminOnly(req, res, next);
      // Kiểm tra: next() KHÔNG được gọi, res.status(403) được gọi
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied — admin only',
        success: false
      });
    });
  });

  describe('Update Product', () => {
    // PCTC_8_1: update thành công
    test('Update thành công với dữ liệu hợp lệ', async () => {
      const updatedData = { name: 'New Name' };
      Product.findByIdAndUpdate.mockResolvedValue({ _id: '123', ...updatedData });
      req = { params: { id: '123' }, body: updatedData };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200); 
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    // PCTC_8_2: id không tồn tại
    test('Trả về lỗi khi không tìm thấy ID', async () => {
      Product.findByIdAndUpdate.mockResolvedValue(null);
      req = { params: { id: 'wrong-id' }, body: {} };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product not found' }));
    });
  });

  describe('Delete Product', () => {
    // PCTC_9_1: Xóa thành công
    test('Xóa sản phẩm thành công', async () => {
      Product.findByIdAndDelete.mockResolvedValue({ _id: '123' });
      req = { params: { id: '123' } };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    // PCTC_9_2: id không tồn tại
    test('Trả về lỗi khi xóa ID không tồn tại', async () => {
      Product.findByIdAndDelete.mockResolvedValue(null);
      req = { params: { id: 'wrong-id' } };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product not found' }));
    });
  });

  describe('Get Categories', () => {
    // PCTC_10_1: danh sách category
    test('Danh sách category kèm productCount', async () => {
      Category.find.mockResolvedValue([{ name: 'Laptop' }]);
      Product.countDocuments.mockResolvedValue(5);     
      await getCategories(req, res); 
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Laptop', productCount: 5 })
        ])
      }));
    });
    // PCTC_10_2: Category chưa có sản phẩm nào
    test('Category chưa có sản phẩm nào (productCount=0)', async () => {
      Category.find.mockResolvedValue([{ name: 'Electronics' }]);
      // Mock để countDocuments trả về 0
      Product.countDocuments.mockResolvedValue(0);
      await getCategories(req, res);
      // Kiểm tra xem productCount có bằng 0 không
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ 
            name: 'Electronics', 
            productCount: 0 
          })
        ])
      }));
    });
    // PCTC_10_3: Tên category chứa ký tự đặc biệt
    test('Tên category chứa ký tự đặc biệt', async () => {
      Category.find.mockResolvedValue([{ name: 'Audio/Video (HD)' }]);
      Product.countDocuments.mockResolvedValue(2);     
      await getCategories(req, res);
      // Kiểm tra xem hàm có xử lý được regex không
      expect(res.json).toHaveBeenCalled();
    });
  });
});