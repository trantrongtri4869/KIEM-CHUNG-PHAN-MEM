import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { MOCK_PRODUCTS } from '../../utils/mockData'

const VALID_COUPONS: Record<string, number> = {
  'GEAR10': 10,
  'GEAR20': 20,
  'NEWUSER': 15,
  'FLASHSALE': 30,
}

export default function CartDrawer() {
  const {
    items, isOpen, setCart, removeItem, updateQuantity,
    getSubtotal, getTotal, couponCode, couponDiscount,
    applyCoupon, removeCoupon, getTotalItems,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = getTotal()

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const discount = VALID_COUPONS[couponInput.toUpperCase()]
    if (discount) {
      applyCoupon(couponInput.toUpperCase(), discount)
      toast.success(`Coupon applied! $${discount} off your order`)
    } else {
      toast.error('Invalid coupon code')
    }
    setCouponLoading(false)
    setCouponInput('')
  }

  // Quick-add related product
  const suggestedProduct = MOCK_PRODUCTS.find(
    (p) => !items.find((i) => i.product._id === p._id) && p.price < 100
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCart(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[var(--surface)] z-[60] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-[var(--text-primary)]">
                  My Cart
                </span>
                {getTotalItems() > 0 && (
                  <span className="badge badge-info">{getTotalItems()} items</span>
                )}
              </div>
              <button
                onClick={() => setCart(false)}
                className="btn-ghost p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] mb-1">Your cart is empty</p>
                    <p className="text-sm text-[var(--text-muted)]">Add some gear to get started</p>
                  </div>
                  <button
                    onClick={() => setCart(false)}
                    className="btn-primary text-sm"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.product._id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-[var(--border)]"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-200 dark:bg-surface-700">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-brand-600 dark:text-brand-400 font-bold text-sm mt-0.5">
                            ${item.product.price.toFixed(2)}
                          </p>
                          {item.product.stock <= 5 && item.product.stock > 0 && (
                            <p className="text-amber-600 text-xs mt-0.5">Only {item.product.stock} left</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-sm font-semibold text-[var(--text-primary)]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                removeItem(item.product._id)
                                toast.success('Removed from cart')
                              }}
                              className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Suggested product */}
                  {suggestedProduct && (
                    <div className="border border-dashed border-brand-300 dark:border-brand-700 rounded-xl p-3">
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-2">You might also like</p>
                      <div className="flex gap-3 items-center">
                        <img
                          src={suggestedProduct.images[0]}
                          alt={suggestedProduct.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{suggestedProduct.name}</p>
                          <p className="text-brand-600 text-sm font-bold">${suggestedProduct.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            useCartStore.getState().addItem(suggestedProduct)
                            toast.success('Added to cart!')
                          }}
                          className="text-xs btn-primary py-1.5 px-3"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[var(--border)] px-6 py-5 space-y-4">
                {/* Coupon */}
                {!couponCode ? (
                  <div className="flex gap-2">
                    <div className="flex items-center flex-1 bg-surface-50 dark:bg-surface-800 border border-[var(--border)] rounded-xl px-3 gap-2 focus-within:border-brand-500 transition-colors">
                      <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1 py-2.5 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput}
                      className="btn-secondary text-sm px-4 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-semibold">{couponCode} (−${couponDiscount})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-emerald-600 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>−${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-[var(--text-primary)] pt-1 border-t border-[var(--border)]">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                  {subtotal < 100 && (
                    <p className="text-xs text-[var(--text-muted)] text-center">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                <Link
                  to="/checkout"
                  onClick={() => setCart(false)}
                  className="btn-primary w-full justify-center group"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCart(false)}
                  className="btn-ghost w-full justify-center text-sm"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
