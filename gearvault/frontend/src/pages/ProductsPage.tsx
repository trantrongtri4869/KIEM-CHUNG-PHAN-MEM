import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, SlidersHorizontal, X, ChevronDown, Search, Grid2X2, List } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard'
import { MOCK_PRODUCTS, MOCK_CATEGORIES, BRANDS, PRICE_RANGES } from '../utils/mockData'
import { Product } from '../types'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

function sortProducts(products: Product[], sort: string) {
  switch (sort) {
    case 'price_asc': return [...products].sort((a, b) => a.price - b.price)
    case 'price_desc': return [...products].sort((a, b) => b.price - a.price)
    case 'rating': return [...products].sort((a, b) => b.rating - a.rating)
    case 'popular': return [...products].sort((a, b) => b.sold - a.sold)
    default: return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading] = useState(false)

  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''
  const sortParam = searchParams.get('sort') || 'newest'
  const saleParam = searchParams.get('sale') === 'true'

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [minRating, setMinRating] = useState<number>(0)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const filtered = useMemo(() => {
    let products = MOCK_PRODUCTS

    if (localSearch) {
      const q = localSearch.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      )
    }

    if (selectedCategories.length > 0) {
      products = products.filter((p) =>
        selectedCategories.some(
          (c) => p.category.toLowerCase().replace(/\s/g, '-') === c
        )
      )
    }

    if (selectedBrands.length > 0) {
      products = products.filter((p) => selectedBrands.includes(p.brand))
    }

    if (priceRange) {
      products = products.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max)
    }

    if (minRating > 0) {
      products = products.filter((p) => p.rating >= minRating)
    }

    if (saleParam) {
      products = products.filter((p) => p.isFlashSale || !!p.discount)
    }

    return sortProducts(products, sortParam)
  }, [localSearch, selectedCategories, selectedBrands, priceRange, minRating, sortParam, saleParam])

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange(null)
    setMinRating(0)
    setLocalSearch('')
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceRange ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Search</label>
        <div className="flex items-center gap-2 input-field py-2.5">
          <Search className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')}>
              <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Category</label>
        <div className="space-y-2">
          {MOCK_CATEGORIES.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors flex-1">
                {cat.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{cat.productCount}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Brand</label>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded accent-brand-600 cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Price Range</label>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={priceRange?.min === range.min && priceRange?.max === range.max}
                onChange={() => setPriceRange({ min: range.min, max: range.max })}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                {range.label}
              </span>
            </label>
          ))}
          {priceRange && (
            <button
              onClick={() => setPriceRange(null)}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-sm font-semibold text-[var(--text-primary)] mb-3 block">Min Rating</label>
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="w-4 h-4 accent-brand-600 cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                <span className="star-filled">{'★'.repeat(r)}</span>
                <span className="text-[var(--text-muted)]">& above</span>
              </span>
            </label>
          ))}
          {minRating > 0 && (
            <button onClick={() => setMinRating(0)} className="text-xs text-brand-600 hover:text-brand-700">
              Clear
            </button>
          )}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="btn-secondary w-full text-sm">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          {localSearch ? `Search: "${localSearch}"` : saleParam ? '⚡ Flash Deals' : 'All Products'}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">{filtered.length} products found</p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="badge badge-info">{activeFilterCount}</span>
                )}
              </span>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-secondary text-sm lg:hidden flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="badge badge-info">{activeFilterCount}</span>
              )}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2">
                <span className="text-xs text-[var(--text-muted)] font-medium">Sort:</span>
                <select
                  value={sortParam}
                  onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value })}
                  className="text-sm text-[var(--text-primary)] bg-transparent focus:outline-none cursor-pointer font-medium"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)] mb-1">No products found</p>
                <p className="text-sm text-[var(--text-muted)]">Try different filters or search terms</p>
              </div>
              <button onClick={clearFilters} className="btn-primary text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 h-full w-80 bg-[var(--surface)] z-[60] flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <span className="font-semibold text-[var(--text-primary)]">Filters</span>
                <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-2 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                <FilterPanel />
              </div>
              <div className="p-5 border-t border-[var(--border)]">
                <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full">
                  Show {filtered.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
