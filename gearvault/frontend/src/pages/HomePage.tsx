import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Zap, Shield, Truck, RefreshCcw,
  ChevronRight, Star, Timer
} from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { MOCK_CATEGORIES, TESTIMONIALS } from '../utils/mockData'
import { useCartStore } from '../store'
import { productAPI } from '../services/api'
import { Product } from '../types'
import toast from 'react-hot-toast'

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return setTime({ h: 0, m: 0, s: 0 })
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-surface-900 dark:bg-black rounded-xl flex items-center justify-center font-bold text-xl text-white font-mono shadow-inner">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const { addItem } = useCartStore()
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])

  useEffect(() => {
    productAPI.getFlashSale().then((res) => setFlashSaleProducts(res.data.data)).catch(() => setFlashSaleProducts([]))
    productAPI.getFeatured().then((res) => setFeatured(res.data.data.slice(0, 4))).catch(() => setFeatured([]))
    productAPI.getBestSellers().then((res) => setBestSellers(res.data.data.slice(0, 4))).catch(() => setBestSellers([]))
  }, [])

  const flashSaleEnd = flashSaleProducts[0]?.flashSaleEndsAt || new Date(Date.now() + 6 * 3600000).toISOString()
  const countdown = useCountdown(flashSaleEnd)

  return (
    <div className="page-enter">
      {/* ====== HERO ====== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-surface-950">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950/50" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
            <img
              src="https://images.unsplash.com/photo-1593640408182-31c228b9d763?w=1200&q=80"
              alt="Gaming setup"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/80 to-transparent" />
          {/* Glow orb */}
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              New arrivals just dropped
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Gear Up for
              <br />
              <span className="gradient-text">Greatness</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-surface-300 text-lg leading-relaxed mb-8 max-w-md"
            >
              Premium gaming peripherals for the serious player. Precision-engineered, competitively priced, fast shipping.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/products" className="btn-primary text-base px-6 py-3 group shadow-glow">
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products?sale=true" className="flex items-center gap-2 px-6 py-3 rounded-xl text-surface-200 hover:text-white border border-surface-700 hover:border-surface-500 font-semibold transition-all duration-200">
                View Deals
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-8 mt-10 pt-8 border-t border-surface-800"
            >
              {[
                { label: 'Products', value: '500+' },
                { label: 'Happy Gamers', value: '50K+' },
                { label: 'Rating', value: '4.9★' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-surface-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-0.5 h-8 bg-gradient-to-b from-surface-400 to-transparent animate-pulse-slow" />
        </motion.div>
      </section>

      {/* ====== TRUST BADGES ====== */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--border)]">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Authentic Gear', desc: '100% genuine products' },
              { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Zap, title: 'Fast Support', desc: '24/7 live chat' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES ====== */}
      <SectionReveal>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Browse Categories</h2>
              <p className="section-subtitle">Find gear for every play style</p>
            </div>
            <Link to="/products" className="btn-ghost text-sm hidden md:flex items-center gap-1">
              All categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOCK_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 card-hover rounded-2xl text-center"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden img-zoom-container">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-brand-600 transition-colors">{cat.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{cat.productCount} items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ====== FEATURED PRODUCTS ====== */}
      <SectionReveal>
        <section className="py-20 bg-surface-50 dark:bg-surface-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title">Featured Gear</h2>
                <p className="section-subtitle">Editor's picks for peak performance</p>
              </div>
              <Link to="/products?featured=true" className="btn-ghost text-sm hidden md:flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ====== FLASH SALE ====== */}
      <SectionReveal>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-500" />
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">Flash Sale</h2>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[var(--text-muted)]" />
                <div className="flex items-center gap-1">
                  <TimeBox value={countdown.h} label="hrs" />
                  <span className="text-[var(--text-muted)] font-bold mb-4">:</span>
                  <TimeBox value={countdown.m} label="min" />
                  <span className="text-[var(--text-muted)] font-bold mb-4">:</span>
                  <TimeBox value={countdown.s} label="sec" />
                </div>
              </div>
            </div>
            <Link to="/products?sale=true" className="btn-secondary text-sm">
              All deals <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSaleProducts.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* ====== BANNER ====== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <p className="text-brand-200 font-medium mb-2 text-sm uppercase tracking-wider">Limited Time Offer</p>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">Get 20% off your first order</h2>
              <p className="text-brand-200 text-base">Use code <span className="font-mono font-bold bg-white/10 px-2 py-0.5 rounded">NEWUSER</span> at checkout</p>
            </div>
            <Link
              to="/register"
              className="relative z-10 flex-shrink-0 px-8 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg text-base"
            >
              Claim Offer
            </Link>
          </div>
        </div>
      </section>

      {/* ====== BEST SELLERS ====== */}
      <SectionReveal>
        <section className="py-20 bg-surface-50 dark:bg-surface-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title">Best Sellers</h2>
                <p className="section-subtitle">What the pros are using right now</p>
              </div>
              <Link to="/products?sort=popular" className="btn-ghost text-sm hidden md:flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ====== TESTIMONIALS ====== */}
      <SectionReveal>
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Trusted by Gamers</h2>
            <p className="section-subtitle mx-auto">See why thousands of players choose GearVault</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 star-filled" fill="currentColor" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm mb-5">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700"
                  />
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </SectionReveal>
    </div>
  )
}
