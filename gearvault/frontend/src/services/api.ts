import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH ====================
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: FormData | Record<string, string>) =>
    api.put('/auth/profile', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
}

// ==================== PRODUCTS ====================
export const productAPI = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getFlashSale: () => api.get('/products/flash-sale'),
  getRelated: (slug: string) => api.get(`/products/${slug}/related`),
  search: (q: string) => api.get('/products/search', { params: { q } }),
  // Admin
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
}

// ==================== REVIEWS ====================
export const reviewAPI = {
  getByProduct: (productId: string) => api.get(`/reviews/${productId}`),
  create: (data: { product: string; rating: number; title: string; comment: string }) =>
    api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

// ==================== ORDERS ====================
export const orderAPI = {
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id: string) => api.get(`/orders/${id}`),
  // Admin
  getAll: (params?: Record<string, string | number | undefined>) => api.get('/orders', { params }),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
}

// ==================== COUPONS ====================
export const couponAPI = {
  validate: (code: string, total: number) =>
    api.post('/coupons/validate', { code, total }),
}

// ==================== CATEGORIES ====================
export const categoryAPI = {
  getAll: () => api.get('/categories'),
}

// ==================== USERS (Admin) ====================
export const userAPI = {
  getAll: (params?: Record<string, string | number | undefined>) => api.get('/users', { params }),
  update: (id: string, data: Record<string, string>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

// ==================== ADMIN STATS ====================
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueChart: () => api.get('/admin/revenue'),
  getTopProducts: () => api.get('/admin/top-products'),
}

export default api
