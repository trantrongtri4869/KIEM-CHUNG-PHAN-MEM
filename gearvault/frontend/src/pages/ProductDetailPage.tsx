import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, ArrowLeft, Star, Minus, Plus,
  Truck, Shield, RefreshCcw, Check, ChevronRight, Zap
} from 'lucide-react'
import { MOCK_REVIEWS } from '../utils/mockData'
import { productAPI } from '../services/api'
import { Product } from '../types'
import { useCartStore, useWishlistStore, useAuthStore } from '../store'
import ProductCard from '../components/product/ProductCard'
import StarRating from '../components/ui/StarRating'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setSelectedImage(0)
    productAPI
      .getBySlug(slug)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
    productAPI
      .getRelated(slug)
      .then((res) => setRelated(res.data.data))
      .catch(() => setRelated([]))
  }, [slug])

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-[var(--text-muted)]">Loading...</div>
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-2xl font-bold text-[var(--text-primary)]">Product not found</p>
        <Link to="/products" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const inWishlist = isInWishlist(product._id)
  const isOutOfStock = product.stock === 0
  const reviews = MOCK_REVIEWS.filter((r) => r.product === product._id)

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    toast.success(`${product.name} added to cart`, { icon: '🛒' })
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    addItem(product, quantity)
    navigate('/checkout')
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to write a review')
      return
    }
    toast.success('Review submitted! Thank you')
    setReviewText('')
    setReviewRating(5)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
        <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-[var(--text-primary)] transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/products?category=${product.category.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-[var(--text-primary)] transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--text-primary)] truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* ---- LEFT: Images ---- */}
        <div>
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 mb-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount && (
                <span className="badge bg-red-500 text-white text-sm px-3 py-1">
                  -{product.discount}% OFF
                </span>
              )}
              {product.isFlashSale && (
                <span className="badge bg-amber-500 text-white flex items-center gap-1 px-3 py-1">
                  <Zap className="w-3 h-3" /> Flash Sale
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => {
                toggleItem(product)
                toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', {
                  icon: inWishlist ? '💔' : '❤️',
                })
              }}
              className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
                inWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-surface-800/90 text-[var(--text-secondary)] hover:bg-white dark:hover:bg-surface-700'
              }`}
            >
              <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? 'border-brand-500 shadow-glow-sm'
                      : 'border-[var(--border)] hover:border-brand-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- RIGHT: Info ---- */}
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">{product.brand}</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" showValue count={product.numReviews} />
            <span className="text-sm text-[var(--text-muted)]">·</span>
            <span className="text-sm text-[var(--text-muted)]">{product.sold} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-[var(--text-primary)]">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="price-original text-lg">${product.originalPrice.toFixed(2)}</span>
            )}
            {product.discount && (
              <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm px-2.5 py-1">
                Save ${(product.originalPrice! - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{product.shortDescription}</p>

          {/* Stock */}
          <div className={`flex items-center gap-2 mb-6 text-sm font-medium ${
            isOutOfStock ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOutOfStock ? 'bg-red-500' : product.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            {isOutOfStock
              ? 'Out of Stock'
              : product.stock <= 5
              ? `Only ${product.stock} left in stock`
              : 'In Stock'}
          </div>

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Quantity:</span>
              <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-[var(--text-primary)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-secondary flex-1 justify-center py-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Free shipping over $100' },
              { icon: Shield, text: '2-year warranty' },
              { icon: RefreshCcw, text: '30-day returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-[var(--border)] text-center">
                <Icon className="w-4 h-4 text-brand-600" />
                <span className="text-xs text-[var(--text-muted)]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- TABS ---- */}
      <div className="mb-16">
        <div className="flex border-b border-[var(--border)] mb-8 gap-1">
          {(['overview', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
              {tab === 'reviews' && ` (${reviews.length})`}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-[var(--text-secondary)] leading-relaxed text-base">{product.description}</p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge badge-info">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-surface-50 dark:bg-surface-800/30' : ''}>
                        <td className="px-5 py-3.5 text-sm font-semibold text-[var(--text-secondary)] w-40">{key}</td>
                        <td className="px-5 py-3.5 text-sm text-[var(--text-primary)] font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating summary */}
                <div className="card p-6 flex flex-col sm:flex-row items-center gap-8">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-[var(--text-primary)]">{product.rating.toFixed(1)}</p>
                    <StarRating rating={product.rating} size="lg" />
                    <p className="text-sm text-[var(--text-muted)] mt-1">{product.numReviews} reviews</p>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const count = reviews.filter((rev) => Math.floor(rev.rating) === r).length
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={r} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-[var(--text-muted)] w-4">{r}</span>
                          <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-muted)] w-4">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review list */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="card p-5">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`}
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full bg-surface-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm text-[var(--text-primary)]">{review.user.name}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                            <p className="font-semibold text-sm text-[var(--text-primary)] mt-2">{review.title}</p>
                            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[var(--text-muted)] py-8">No reviews yet. Be the first!</p>
                )}

                {/* Write review */}
                <div className="card p-6">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-4">Write a Review</h3>
                  {!isAuthenticated ? (
                    <div className="text-center py-6">
                      <p className="text-[var(--text-muted)] mb-3">Sign in to write a review</p>
                      <Link to="/login" className="btn-primary text-sm">Sign In</Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Your Rating</label>
                        <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="input-field resize-none"
                        required
                      />
                      <button type="submit" className="btn-primary">
                        <Check className="w-4 h-4" />
                        Submit Review
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- RELATED PRODUCTS ---- */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
