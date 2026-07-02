import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Package, Heart, Settings, LogOut,
  ChevronRight, Star, Clock, CheckCircle2, Truck
} from 'lucide-react'
import { useAuthStore, useWishlistStore } from '../store'
import { orderAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import toast from 'react-hot-toast'

interface OrderItem {
  _id: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  totalPrice: number
  createdAt: string
  items: OrderItem[]
}

const NAV_ITEMS = [
  { label: 'Profile', href: '/dashboard', icon: User, exact: true },
  { label: 'Orders', href: '/dashboard/orders', icon: Package },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderAPI
      .getMyOrders()
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return { orders, loading }
}

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'badge-warning', icon: Clock },
  processing: { label: 'Processing', color: 'badge-info', icon: Clock },
  shipped: { label: 'Shipped', color: 'badge-info', icon: Truck },
  delivered: { label: 'Delivered', color: 'badge-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'badge-danger', icon: LogOut },
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border)]">
              <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="badge badge-info text-[10px] mt-0.5">Admin</span>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1 mb-4">
              {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                        : 'text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-[var(--text-primary)]'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5" />
                  {label}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                        : 'text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`
                  }
                >
                  ⚡ Admin Panel
                </NavLink>
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

// ---- Profile Tab ----
export function ProfileTab() {
  const { user, updateUser } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const { orders } = useMyOrders()
  const { items: wishlistItems } = useWishlistStore()

  const handleSave = () => {
    setSaved(true)
    toast.success('Profile updated successfully')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.name}</h3>
            <p className="text-[var(--text-muted)]">{user?.email}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Member since {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Full Name', value: user?.name, key: 'name' },
            { label: 'Email', value: user?.email, key: 'email', type: 'email' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{field.label}</label>
              <input
                defaultValue={field.value}
                type={field.type || 'text'}
                onChange={(e) => updateUser({ [field.key]: e.target.value })}
                className="input-field"
              />
            </div>
          ))}
        </div>

        <button onClick={handleSave} className={`btn-primary mt-6 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Wishlist Items', value: wishlistItems.length },
          { label: 'Reviews', value: 2 },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 text-center">
            <p className="text-3xl font-bold text-brand-600 mb-1">{stat.value}</p>
            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Orders Tab ----
export function OrdersTab() {
  const { orders, loading } = useMyOrders()

  if (loading) {
    return <div className="py-12 text-center text-[var(--text-muted)]">Loading orders...</div>
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="font-semibold text-[var(--text-primary)] mb-2">No orders yet</p>
          <Link to="/products" className="btn-primary text-sm">Start Shopping</Link>
        </div>
      ) : (
        orders.map((order) => {
          const config = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending
          const Icon = config.icon
          return (
            <div key={order._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${config.color} flex items-center gap-1`}>
                    <Icon className="w-3 h-3" />{config.label}
                  </span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-surface-100"
                    />
                    <span className="text-xs text-[var(--text-secondary)] truncate max-w-28">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ---- Wishlist Tab ----
export function WishlistTab() {
  const { items } = useWishlistStore()

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="font-semibold text-[var(--text-primary)] mb-2">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary text-sm">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}

// ---- Settings Tab ----
export function SettingsTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
      <div className="card p-6 space-y-5">
        <h3 className="font-semibold text-[var(--text-primary)]">Change Password</h3>
        <div className="space-y-4">
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
              <input type="password" className="input-field" placeholder="••••••••" />
            </div>
          ))}
          <button className="btn-primary">Update Password</button>
        </div>
      </div>

      <div className="card p-6 border-red-200 dark:border-red-900">
        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Permanently delete your account and all associated data.</p>
        <button className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}
