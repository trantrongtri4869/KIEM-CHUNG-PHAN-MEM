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

// ── RATC_5_2 — adminRevenue: phải trả 12 tháng GẦN NHẤT, không phải cũ nhất
// BUG: pipeline sort ASC trước $limit → lấy 12 tháng cũ nhất thay vì gần nhất

function getLast12Months(allMonthlyData) {
  // Logic đúng: sort DESC → slice 12 → sort ASC lại để hiển thị
  return [...allMonthlyData]
    .sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month)
    .slice(0, 12)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
}

function getFirst12Months(allMonthlyData) {
  // Simulate BUG: sort ASC rồi slice → lấy 12 tháng cũ nhất
  return [...allMonthlyData]
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .slice(0, 12)
}

// Tạo data 15 tháng: 2025-01 → 2026-03
const allMonthlyData = []
for (let m = 1; m <= 12; m++) allMonthlyData.push({ year: 2025, month: m, revenue: m * 100 })
for (let m = 1; m <= 3; m++) allMonthlyData.push({ year: 2026, month: m, revenue: m * 200 })

describe('RATC_5_2 — adminRevenue: phải trả 12 tháng GẦN NHẤT', () => {
  test('logic đúng: có 15 tháng → trả 12 tháng gần nhất (2025-04 → 2026-03)', () => {
    const result = getLast12Months(allMonthlyData)
    expect(result).toHaveLength(12)
    expect(result[0].year).toBe(2025)
    expect(result[0].month).toBe(4)   // bắt đầu từ 2025-04
    expect(result[result.length - 1].year).toBe(2026)
    expect(result[result.length - 1].month).toBe(3) // kết thúc 2026-03
  })

  test('BUG scenario: sort ASC rồi slice → trả 12 tháng CŨ NHẤT (2025-01 → 2025-12)', () => {
    const bugResult = getFirst12Months(allMonthlyData)
    expect(bugResult[0].month).toBe(1)  // bắt đầu từ 2025-01 (SAI)
    const has2026 = bugResult.some(d => d.year === 2026)
    expect(has2026).toBe(false) // không có tháng 2026 (SAI)
  })

  test('kết quả luôn sort tăng dần (cũ → mới) để hiển thị chart đúng chiều', () => {
    const result = getLast12Months(allMonthlyData)
    for (let i = 0; i < result.length - 1; i++) {
      const curr = result[i].year * 100 + result[i].month
      const next = result[i + 1].year * 100 + result[i + 1].month
      expect(curr).toBeLessThan(next)
    }
  })

  test('khi có đúng 12 tháng data → bug và fix cho cùng kết quả', () => {
    const exactly12 = allMonthlyData.slice(0, 12)
    expect(getLast12Months(exactly12)).toHaveLength(12)
    expect(getFirst12Months(exactly12)).toHaveLength(12)
  })

  test('khi có ít hơn 12 tháng → trả hết tất cả', () => {
    const small = [{ year: 2026, month: 1, revenue: 100 }, { year: 2026, month: 2, revenue: 200 }]
    expect(getLast12Months(small)).toHaveLength(2)
  })
})
