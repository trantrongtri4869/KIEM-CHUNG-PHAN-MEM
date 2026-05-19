import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Tag, X, ShoppingBag, ArrowLeft, Truck
} from 'lucide-react'
import { useCartStore } from '../store'
import toast from 'react-hot-toast'

const VALID_COUPONS: Record<string, number> = {
  'GEAR10': 10,
  'GEAR20': 20,
  'NEWUSER': 15,
  'FLASHSALE': 30,
}

export default function CartPage() {
  const navigate = useNavigate()
  const {
    items, removeItem, updateQuantity, clearCart,
    getSubtotal, getTotal, couponCode, couponDiscount,
    applyCoupon, removeCoupon,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = getTotal()

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    await new Promise((r) => setTimeout(r, 800))
    const discount = VALID_COUPONS[couponInput.toUpperCase()]
    if (discount) {
      applyCoupon(couponInput.toUpperCase(), discount)
      toast.success(`Coupon applied! $${discount} off`)
    } else {
      setCouponError('Invalid or expired coupon code')
    }
    setCouponLoading(false)
    setCouponInput('')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 page-enter">
        <div className="flex flex-col items-center justify-center gap-6 text-center py-16">
          <div className="w-24 h-24 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Your cart is empty</h2>
            <p className="text-[var(--text-muted)]">Looks like you haven't added any gear yet.</p>
          </div>
          <Link to="/products" className="btn-primary">
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Shopping Cart</h1>
          <p className="text-[var(--text-muted)] mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => {
            clearCart()
            toast.success('Cart cleared')
          }}
          className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.product._id}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="card p-5 flex gap-5"
              >
                {/* Image */}
                <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 img-zoom-container">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 mb-1">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium">{item.product.brand}</p>
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-brand-600 transition-colors line-clamp-2 text-sm sm:text-base"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.product._id)
                        toast.success('Item removed')
                      }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {item.product.stock <= 5 && item.product.stock > 0 && (
                    <p className="text-xs text-amber-600 mb-2">Only {item.product.stock} left!</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[var(--text-primary)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-9 h-9 flex items-center justify-center text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-[var(--text-muted)]">${item.product.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <Link to="/products" className="btn-ghost text-sm inline-flex mt-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-5">
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Order Summary</h2>

            {/* Coupon */}
            {!couponCode ? (
              <div>
                <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                  couponError ? 'border-red-400' : 'border-[var(--border)] focus-within:border-brand-500'
                }`}>
                  <div className="pl-3">
                    <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value)
                      setCouponError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 px-3 py-3 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput}
                    className="px-4 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-40 border-l border-[var(--border)]"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <X className="w-3 h-3" />{couponError}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-1.5">Try: GEAR10, GEAR20, NEWUSER</p>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-semibold">{couponCode} (−${couponDiscount})</span>
                </div>
                <button onClick={removeCoupon} className="text-emerald-600 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-3 text-sm pt-2 border-t border-[var(--border)]">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({couponCode})</span>
                  <span className="font-medium">−${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Shipping
                </span>
                <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : ''}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {subtotal > 0 && subtotal < 100 && (
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-brand-600 dark:text-brand-400">
                    Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to get free shipping!
                  </p>
                  <div className="mt-1.5 h-1 bg-brand-100 dark:bg-brand-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-[var(--text-primary)] pt-3 border-t border-[var(--border)]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full justify-center py-3.5 text-base group"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
              <span>🔒 Secure checkout</span>
              <span>·</span>
              <span>SSL encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
