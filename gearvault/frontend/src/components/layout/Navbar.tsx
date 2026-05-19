import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, Search, Moon, Sun, Menu, X,
  User, Package, LogOut, Settings, ChevronDown, Zap
} from 'lucide-react'
import { useCartStore, useAuthStore, useWishlistStore, useUIStore } from '../../store'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Deals', href: '/products?sale=true' },
  { label: 'Brands', href: '/products?sort=brand' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()
  const { getTotalItems, toggleCart } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useUIStore()

  const totalItems = getTotalItems()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDarkMode])

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    toast.success('Signed out successfully')
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-md shadow-sm border-b border-[var(--border)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">
                Gear<span className="text-brand-600">Vault</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `nav-link px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-2.5 rounded-xl"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark mode */}
              <button
                onClick={toggleDarkMode}
                className="btn-ghost p-2.5 rounded-xl"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="btn-ghost p-2.5 rounded-xl relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="btn-ghost p-2.5 rounded-xl relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="btn-ghost p-1 rounded-xl flex items-center gap-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 card p-1.5 shadow-xl z-50"
                        onMouseLeave={() => setUserDropdown(false)}
                      >
                        <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user?.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                        </div>
                        {[
                          { icon: User, label: 'My Profile', href: '/dashboard' },
                          { icon: Package, label: 'My Orders', href: '/dashboard/orders' },
                          { icon: Heart, label: 'Wishlist', href: '/wishlist' },
                          { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                          ...(user?.role === 'admin' ? [{ icon: Settings, label: '⚡ Admin Panel', href: '/admin' }] : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setUserDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-[var(--text-primary)] transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                        <hr className="border-[var(--border)] my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn-ghost p-2.5 rounded-xl md:hidden"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border)] bg-white/95 dark:bg-surface-950/95 backdrop-blur-md"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                          : 'text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!isAuthenticated && (
                  <div className="pt-2 flex gap-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 justify-center">Sign In</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 justify-center">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="card w-full max-w-2xl p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-2">
                <Search className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for gaming mice, keyboards, headsets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 py-3 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none text-base"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-ghost p-2 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              <div className="px-4 pb-2 pt-1">
                <p className="text-xs text-[var(--text-muted)]">Popular: Razer mouse, Mechanical keyboard, Wireless headset</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
