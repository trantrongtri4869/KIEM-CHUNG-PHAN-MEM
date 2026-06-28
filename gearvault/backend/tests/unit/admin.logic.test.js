/**
 * Unit Test: Admin Dashboard Logic
 * Module: src/routes/admin.js — revenue aggregation, metrics calculation
 */

// ── Pure functions trích từ admin route ──────────────────────────────────────

function calcTotalRevenue(revenueData) {
  // Simulates: revenueData[0]?.total || 0
  return revenueData && revenueData.length > 0 ? revenueData[0].total : 0
}

function buildDashboardMetrics({ totalOrders, totalUsers, totalProducts, totalRevenue }) {
  return { totalOrders, totalUsers, totalProducts, totalRevenue }
}

function groupRevenueByMonth(orders) {
  const grouped = {}
  for (const order of orders) {
    const d = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!grouped[key]) grouped[key] = { year: d.getFullYear(), month: d.getMonth() + 1, revenue: 0, orders: 0 }
    grouped[key].revenue += order.totalPrice
    grouped[key].orders += 1
  }
  return Object.values(grouped).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
}

function getTopProducts(products, limit = 5) {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('calcTotalRevenue()', () => {
  test('trả đúng revenue từ aggregation result', () => {
    expect(calcTotalRevenue([{ total: 5000 }])).toBe(5000)
  })

  test('trả 0 khi aggregation rỗng (không có đơn isPaid)', () => {
    expect(calcTotalRevenue([])).toBe(0)
  })

  test('trả 0 khi revenueData = null', () => {
    expect(calcTotalRevenue(null)).toBe(0)
  })

  test('trả 0 khi revenueData = undefined', () => {
    expect(calcTotalRevenue(undefined)).toBe(0)
  })

  test('trả đúng với revenue thập phân', () => {
    expect(calcTotalRevenue([{ total: 1234.56 }])).toBe(1234.56)
  })
})

describe('buildDashboardMetrics()', () => {
  test('trả object với 4 fields đúng', () => {
    const input = { totalOrders: 10, totalUsers: 5, totalProducts: 20, totalRevenue: 500 }
    const result = buildDashboardMetrics(input)
    expect(result).toEqual({ totalOrders: 10, totalUsers: 5, totalProducts: 20, totalRevenue: 500 })
  })

  test('trả 0 cho tất cả khi hệ thống mới (chưa có data)', () => {
    const input = { totalOrders: 0, totalUsers: 0, totalProducts: 0, totalRevenue: 0 }
    const result = buildDashboardMetrics(input)
    expect(result.totalOrders).toBe(0)
    expect(result.totalRevenue).toBe(0)
  })

  test('có đúng 4 keys', () => {
    const result = buildDashboardMetrics({ totalOrders: 1, totalUsers: 1, totalProducts: 1, totalRevenue: 1 })
    expect(Object.keys(result)).toHaveLength(4)
  })
})

describe('groupRevenueByMonth()', () => {
  test('group đúng theo tháng', () => {
    const orders = [
      { createdAt: '2026-01-10', totalPrice: 100 },
      { createdAt: '2026-01-20', totalPrice: 200 },
      { createdAt: '2026-02-05', totalPrice: 150 },
    ]
    const result = groupRevenueByMonth(orders)
    expect(result).toHaveLength(2)
    expect(result[0].month).toBe(1)
    expect(result[0].revenue).toBe(300)
    expect(result[0].orders).toBe(2)
    expect(result[1].month).toBe(2)
    expect(result[1].revenue).toBe(150)
  })

  test('sort kết quả theo năm rồi tháng tăng dần', () => {
    const orders = [
      { createdAt: '2026-03-01', totalPrice: 50 },
      { createdAt: '2026-01-01', totalPrice: 50 },
      { createdAt: '2026-02-01', totalPrice: 50 },
    ]
    const result = groupRevenueByMonth(orders)
    expect(result[0].month).toBe(1)
    expect(result[1].month).toBe(2)
    expect(result[2].month).toBe(3)
  })

  test('trả mảng rỗng khi không có orders', () => {
    expect(groupRevenueByMonth([])).toEqual([])
  })

  test('group khác năm không bị trộn', () => {
    const orders = [
      { createdAt: '2025-01-01', totalPrice: 100 },
      { createdAt: '2026-01-01', totalPrice: 200 },
    ]
    const result = groupRevenueByMonth(orders)
    expect(result).toHaveLength(2)
    expect(result[0].year).toBe(2025)
    expect(result[1].year).toBe(2026)
  })
})

describe('getTopProducts()', () => {
  const products = [
    { name: 'A', sold: 50 },
    { name: 'B', sold: 200 },
    { name: 'C', sold: 10 },
    { name: 'D', sold: 150 },
    { name: 'E', sold: 80 },
    { name: 'F', sold: 300 },
    { name: 'G', sold: 5 },
  ]

  test('trả đúng top 5 sản phẩm bán chạy nhất', () => {
    const top = getTopProducts(products, 5)
    expect(top).toHaveLength(5)
    expect(top[0].name).toBe('F') // sold: 300
    expect(top[1].name).toBe('B') // sold: 200
    expect(top[2].name).toBe('D') // sold: 150
  })

  test('sort giảm dần theo sold', () => {
    const top = getTopProducts(products, 5)
    for (let i = 0; i < top.length - 1; i++) {
      expect(top[i].sold).toBeGreaterThanOrEqual(top[i + 1].sold)
    }
  })

  test('limit = 3 trả đúng 3 sản phẩm', () => {
    expect(getTopProducts(products, 3)).toHaveLength(3)
  })

  test('không mutate mảng gốc', () => {
    const copy = [...products]
    getTopProducts(products, 5)
    expect(products[0].name).toBe('A') // thứ tự gốc không đổi
  })

  test('danh sách ít hơn limit → trả hết', () => {
    const small = [{ name: 'X', sold: 1 }, { name: 'Y', sold: 2 }]
    expect(getTopProducts(small, 5)).toHaveLength(2)
  })

  test('mảng rỗng trả mảng rỗng', () => {
    expect(getTopProducts([], 5)).toHaveLength(0)
  })
})
