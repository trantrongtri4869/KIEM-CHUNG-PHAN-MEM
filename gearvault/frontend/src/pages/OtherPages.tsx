import { Link } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import { useWishlistStore } from '../store'
import ProductCard from '../components/product/ProductCard'
import { motion } from 'framer-motion'

export function WishlistPage() {
  const { items } = useWishlistStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-3">
          <Heart className="w-7 h-7 text-red-500" fill="currentColor" />
          My Wishlist
        </h1>
        <p className="text-[var(--text-muted)] mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 text-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Heart className="w-10 h-10 text-[var(--text-muted)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your wishlist is empty</h2>
            <p className="text-[var(--text-muted)]">Save items you love to buy them later.</p>
          </div>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 page-enter">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10rem] font-bold leading-none gradient-text mb-6"
        >
          404
        </motion.div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Page not found</h1>
        <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/products" className="btn-secondary">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
