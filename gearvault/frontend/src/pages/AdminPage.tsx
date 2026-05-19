import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  TrendingUp, DollarSign, Star, Zap,
  Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { MOCK_PRODUCTS } from '../utils/mockData'
import toast from 'react-hot-toast'

const REVENUE_DATA = [
  { month: 'Sep', revenue: 12400, orders: 89 },
  { month: 'Oct', revenue: 15600, orders: 112 },
  { month: 'Nov', revenue: 18900, orders: 143 },
  { month: 'Dec', revenue: 28700, orders: 210 },
  { month: 'Jan', revenue: 22100, orders: 164 },
  { month: 'Feb', revenue: 19800, orders: 147 },
  { month: 'Mar', revenue: 24500, orders: 182 },
]

const MOCK_USERS_DATA = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@example.com', orders: 5, total: 849.95, role: 'user', joined: '2024-01-10' },
  { id: 'u2', name: 'Sarah Kim', email: 'sarah@example.com', orders: 3, total: 339.98, role: 'user', joined: '2024-01-15' },
  { id: 'u3', name: 'Mike Torres', email: 'mike@example.com', orders: 8, total: 1289.92, role: 'user', joined: '2023-12-20' },
  { id: 'u4', name: 'Emma Wilson', email: 'emma@example.com', orders: 2, total: 229.98, role: 'user', joined: '2024-02-01' },
]

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', href: '/admin/users', icon: Users },
]

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter">
      <div className="flex gap-8">
        {/* Admin Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border)]">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-[var(--text-primary)]">Admin Panel</span>
            </div>
            <nav className="space-y-1">
              {ADMIN_NAV.map(({ label, href, icon: Icon, exact }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                        : 'text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link to="/" className="btn-ghost w-full text-sm justify-center">← Back to Store</Link>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

// ---- Admin Overview ----
export function AdminOverview() {
  const stats = [
    { label: 'Total Revenue', value: '$141,500', change: '+12.5%', up: true, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Total Orders', value: '1,047', change: '+8.2%', up: true, icon: ShoppingBag, color: 'text-brand-600' },
    { label: 'Total Users', value: '4,821', change: '+23.1%', up: true, icon: Users, color: 'text-purple-600' },
    { label: 'Avg. Rating', value: '4.7★', change: '+0.2', up: true, icon: Star, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
        <span className="badge badge-info">Admin</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {stat.up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</p>
            <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h3 className="font-bold text-[var(--text-primary)] mb-5">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={REVENUE_DATA}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '13px',
              }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-5">Orders Per Month</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }}
              />
              <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-5">Top Products</h3>
          <div className="space-y-3">
            {MOCK_PRODUCTS.sort((a, b) => b.sold - a.sold).slice(0, 4).map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(p.sold / 1500) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] w-12 text-right">{p.sold} sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Admin Products ----
export function AdminProducts() {
  const [search, setSearch] = useState('')
  const products = MOCK_PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
        <button
          onClick={() => toast.success('Product creation form would open here')}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="card p-4 flex gap-3">
        <div className="flex items-center flex-1 input-field py-2.5 gap-2">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-surface-50 dark:bg-surface-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sales</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)] line-clamp-1 max-w-40">{p.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">${p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
                      {p.stock === 0 ? 'Out' : p.stock <= 5 ? `${p.stock} left` : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{p.sold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toast.success(`Editing ${p.name}`)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-brand-600 transition-colors rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toast.error('Delete would prompt confirmation')}
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---- Admin Users ----
export function AdminUsers() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-surface-50 dark:bg-surface-800/50">
                {['User', 'Email', 'Orders', 'Total Spent', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {MOCK_USERS_DATA.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.orders}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">${u.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(u.joined).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toast('User management action', { icon: '⚙️' })}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---- Admin Orders ----
export function AdminOrders() {
  const ORDERS = [
    { id: 'GV-AB12CD', user: 'Alex Chen', date: '2024-02-10', status: 'delivered', total: 329.98, items: 2 },
    { id: 'GV-EF34GH', user: 'Sarah Kim', date: '2024-01-28', status: 'shipped', total: 179.99, items: 1 },
    { id: 'GV-IJ56KL', user: 'Mike Torres', date: '2024-01-15', status: 'processing', total: 49.99, items: 1 },
    { id: 'GV-MN78OP', user: 'Emma Wilson', date: '2024-01-10', status: 'cancelled', total: 699.99, items: 1 },
  ]

  const STATUS_COLOR: Record<string, string> = {
    pending: 'badge-warning', processing: 'badge-info',
    shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger',
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-surface-50 dark:bg-surface-800/50">
                {['Order ID', 'Customer', 'Date', 'Items', 'Status', 'Total', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-xs text-[var(--text-primary)]">{o.id}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{o.user}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(o.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{o.items} item{o.items !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLOR[o.status]} capitalize`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--text-primary)]">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toast.success(`Viewing order ${o.id}`)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
