const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// ==================== USER MODEL ====================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

// ==================== CATEGORY MODEL ====================
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
}, { timestamps: true })

const Category = mongoose.model('Category', categorySchema)

// ==================== PRODUCT MODEL ====================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  originalPrice: Number,
  discount: Number,
  images: [String],
  category: { type: String, required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [String],
  specs: { type: Map, of: String },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEndsAt: Date,
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text', brand: 'text' })

const Product = mongoose.model('Product', productSchema)

// ==================== ORDER MODEL ====================
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
  },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

// ==================== REVIEW MODEL ====================
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true })

reviewSchema.index({ user: 1, product: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

// ==================== COUPON MODEL ====================
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const Coupon = mongoose.model('Coupon', couponSchema)

module.exports = { User, Category, Product, Order, Review, Coupon }
