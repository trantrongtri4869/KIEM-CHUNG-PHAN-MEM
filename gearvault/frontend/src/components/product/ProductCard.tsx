import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { Product } from '../../types'
import { useCartStore, useWishlistStore } from '../../store'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()

  const inWishlist = isInWishlist(product._id)
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    addItem(product)
    toast.success(`${product.name} added to cart`, {
      icon: '🛒',
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleItem(product)
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: inWishlist ? '💔' : '❤️',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/products/${product.slug}`} className="group block">
        <div className="card-hover overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
            <div className="img-zoom-container w-full h-full">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
                    inWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 dark:bg-surface-800/90 text-[var(--text-secondary)] hover:bg-white dark:hover:bg-surface-700'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                </motion.button>
              </div>

              {/* Quick add button */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-surface-300 dark:bg-surface-600 text-[var(--text-muted)] cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-glow'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.discount && (
                <span className="badge bg-red-500 text-white">
                  -{product.discount}%
                </span>
              )}
              {product.isFlashSale && (
                <span className="badge bg-amber-500 text-white flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  FLASH
                </span>
              )}
              {product.isFeatured && !product.discount && !product.isFlashSale && (
                <span className="badge badge-info">New</span>
              )}
            </div>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
                <span className="badge bg-surface-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">{product.brand}</p>
                <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {product.name}
                </h3>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'
                    }`}
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--text-muted)]">({product.numReviews})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[var(--text-primary)]">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="price-original">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              {isLowStock && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {product.stock} left
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Skeleton variant
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="shimmer aspect-square" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-3 w-16 rounded-full" />
        <div className="shimmer h-4 w-full rounded-lg" />
        <div className="shimmer h-3.5 w-3/4 rounded-lg" />
        <div className="shimmer h-4 w-24 rounded-lg mt-2" />
      </div>
    </div>
  )
}
