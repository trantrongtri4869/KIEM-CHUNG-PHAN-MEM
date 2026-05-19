// ==================== USER ====================
export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: string
}

// ==================== PRODUCT ====================
export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  brand: string
  stock: number
  sold: number
  rating: number
  numReviews: number
  tags: string[]
  specs: Record<string, string>
  isFeatured: boolean
  isFlashSale: boolean
  flashSaleEndsAt?: string
  createdAt: string
}

// ==================== REVIEW ====================
export interface Review {
  _id: string
  user: { _id: string; name: string; avatar?: string }
  product: string
  rating: number
  title: string
  comment: string
  createdAt: string
}

// ==================== CART ====================
export interface CartItem {
  product: Product
  quantity: number
}

// ==================== ORDER ====================
export interface Order {
  _id: string
  user: string
  items: Array<{
    product: Product
    quantity: number
    price: number
  }>
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentResult?: {
    id: string
    status: string
    updateTime: string
  }
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

// ==================== SHIPPING ====================
export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

// ==================== COUPON ====================
export interface Coupon {
  _id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minOrder: number
  maxUses: number
  usedCount: number
  expiresAt: string
  isActive: boolean
}

// ==================== CATEGORY ====================
export interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ==================== FILTERS ====================
export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular'
  search?: string
  page?: number
  limit?: number
}

// ==================== AUTH ====================
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
