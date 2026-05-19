import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, CartItem, Product } from '../types'

// ==================== AUTH STORE ====================
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ==================== CART STORE ====================
interface CartState {
  items: CartItem[]
  isOpen: boolean
  couponCode: string
  couponDiscount: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCart: (open: boolean) => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  getTotalItems: () => number
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: '',
      couponDiscount: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.product._id === product._id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.product._id === product._id
                ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, quantity }] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCart: (open) => set({ isOpen: open }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().couponDiscount
        const shipping = subtotal > 100 ? 0 : 9.99
        return Math.max(0, subtotal - discount + shipping)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ==================== WISHLIST STORE ====================
interface WishlistState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().isInWishlist(product._id)) {
          set({ items: [...get().items, product] })
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i._id !== productId) }),
      toggleItem: (product) => {
        if (get().isInWishlist(product._id)) {
          get().removeItem(product._id)
        } else {
          get().addItem(product)
        }
      },
      isInWishlist: (productId) => get().items.some((i) => i._id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ==================== UI STORE ====================
interface UIState {
  isDarkMode: boolean
  toggleDarkMode: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleDarkMode: () => {
        const next = !get().isDarkMode
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ isDarkMode: next })
      },
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
)
