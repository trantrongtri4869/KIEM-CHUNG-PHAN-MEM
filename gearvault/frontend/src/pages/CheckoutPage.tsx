import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CreditCard, Truck, CheckCircle2, ChevronRight,
  Lock, AlertCircle, Package, ArrowLeft
} from 'lucide-react'
import { useCartStore, useAuthStore } from '../store'
import { orderAPI } from '../services/api'

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code required'),
  country: z.string().min(2, 'Country is required'),
})

type ShippingForm = z.infer<typeof shippingSchema>

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️', desc: 'Pay securely with PayPal' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
]

const STEPS = ['Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getSubtotal, getTotal, couponDiscount, couponCode, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [step, setStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isPlacing, setIsPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId] = useState(`GV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      country: 'United States',
    },
  })

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = getTotal() + tax

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center page-enter">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Your cart is empty</h2>
        <p className="text-[var(--text-muted)] mb-6">Add some products before checking out.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 page-enter">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="card p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Order Confirmed! 🎉</h2>
          <p className="text-[var(--text-muted)] mb-2">Thank you for your purchase!</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 my-4">
            <Package className="w-4 h-4 text-brand-600" />
            <span className="font-mono font-bold text-brand-700 dark:text-brand-400 text-sm">{orderId}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            A confirmation email has been sent to <strong>{getValues('email')}</strong>. Your gear will arrive in 3-5 business days.
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard/orders" className="btn-secondary flex-1 justify-center text-sm">
              Track Order
            </Link>
            <Link to="/products" className="btn-primary flex-1 justify-center text-sm">
              Shop More
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const onSubmitShipping = () => setStep(1)

  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    try {
      const shipping = getValues()

      await orderAPI.create({
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          price: i.product.price,
        })),
        shippingAddress: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          country: shipping.country,
        },
        paymentMethod: paymentMethod === 'cod' ? 'COD' : paymentMethod,
      })

      clearCart()
      setOrderSuccess(true)
    } catch (err) {
      console.error('Đặt hàng thất bại:', err)
      alert('Đặt hàng thất bại, vui lòng thử lại.')
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <Link to="/cart" className="btn-ghost text-sm mb-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <h1 className="section-title">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                i === step
                  ? 'bg-brand-600 text-white'
                  : i < step
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-surface-100 dark:bg-surface-800 text-[var(--text-muted)]'
              }`}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-brand-600" />
                    </div>
                    <h2 className="font-bold text-lg text-[var(--text-primary)]">Shipping Information</h2>
                  </div>

                  <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="Full Name" error={errors.fullName?.message}>
                        <input
                          {...register('fullName')}
                          className={`input-field ${errors.fullName ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
                          placeholder="John Doe"
                        />
                      </FormField>
                      <FormField label="Email" error={errors.email?.message}>
                        <input
                          {...register('email')}
                          type="email"
                          className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
                          placeholder="john@email.com"
                        />
                      </FormField>
                    </div>

                    <FormField label="Phone Number" error={errors.phone?.message}>
                      <input
                        {...register('phone')}
                        type="tel"
                        className={`input-field ${errors.phone ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </FormField>

                    <FormField label="Street Address" error={errors.address?.message}>
                      <input
                        {...register('address')}
                        className={`input-field ${errors.address ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </FormField>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <FormField label="City" error={errors.city?.message}>
                        <input
                          {...register('city')}
                          className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                          placeholder="New York"
                        />
                      </FormField>
                      <FormField label="State" error={errors.state?.message}>
                        <input
                          {...register('state')}
                          className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                          placeholder="NY"
                        />
                      </FormField>
                      <FormField label="Zip Code" error={errors.zipCode?.message}>
                        <input
                          {...register('zipCode')}
                          className={`input-field ${errors.zipCode ? 'border-red-400' : ''}`}
                          placeholder="10001"
                        />
                      </FormField>
                    </div>

                    <FormField label="Country" error={errors.country?.message}>
                      <select {...register('country')} className="input-field">
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Vietnam">Vietnam</option>
                      </select>
                    </FormField>

                    <button type="submit" className="btn-primary w-full justify-center py-3.5">
                      Continue to Payment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-600" />
                    </div>
                    <h2 className="font-bold text-lg text-[var(--text-primary)]">Payment Method</h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-[var(--border)] hover:border-brand-300 dark:hover:border-brand-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="accent-brand-600 w-4 h-4"
                        />
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-[var(--text-primary)]">{method.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 mb-6 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-[var(--border)]"
                    >
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Demo Card Info</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Card Number</label>
                          <input
                            className="input-field font-mono"
                            placeholder="4242 4242 4242 4242"
                            defaultValue="4242 4242 4242 4242"
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Expiry</label>
                            <input className="input-field" placeholder="12/28" defaultValue="12/28" readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">CVV</label>
                            <input className="input-field" placeholder="123" defaultValue="123" type="password" readOnly />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-secondary flex-1">
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">
                      Review Order
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="card p-6 space-y-6">
                  <h2 className="font-bold text-lg text-[var(--text-primary)]">Review Your Order</h2>

                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex gap-3 items-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-lg object-cover bg-surface-100 dark:bg-surface-800"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address summary */}
                  <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Shipping To</p>
                      <button onClick={() => setStep(0)} className="text-xs text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {getValues('fullName')} · {getValues('address')}, {getValues('city')}, {getValues('state')} {getValues('zipCode')}
                    </p>
                  </div>

                  {/* Payment summary */}
                  <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Payment</p>
                      <button onClick={() => setStep(1)} className="text-xs text-brand-600 hover:text-brand-700">Edit</button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacing}
                      className="btn-primary flex-1 justify-center py-3.5 relative"
                    >
                      {isPlacing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Place Order · ${total.toFixed(2)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24 space-y-4">
            <h3 className="font-bold text-[var(--text-primary)]">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon ({couponCode})</span>
                  <span>−${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-600' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-[var(--text-primary)] pt-3 border-t border-[var(--border)]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] pt-1">
              <Lock className="w-3 h-3" />
              256-bit SSL Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
