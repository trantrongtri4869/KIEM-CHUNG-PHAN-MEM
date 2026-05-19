import { Link } from 'react-router-dom'
import { Zap, Twitter, Youtube, Twitch, Instagram, Mail } from 'lucide-react'

const LINKS = {
  Shop: [
    { label: 'Gaming Mice', href: '/products?category=gaming-mice' },
    { label: 'Keyboards', href: '/products?category=keyboards' },
    { label: 'Headsets', href: '/products?category=headsets' },
    { label: 'Monitors', href: '/products?category=monitors' },
    { label: 'Controllers', href: '/products?category=controllers' },
    { label: 'Flash Sales', href: '/products?sale=true' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Warranty', href: '/warranty' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

const SOCIALS = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitch, href: '#', label: 'Twitch' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

const PAYMENT_ICONS = ['VISA', 'MC', 'AMEX', 'PP']

export default function Footer() {
  return (
    <footer className="bg-surface-950 dark:bg-black border-t border-surface-800 text-surface-400">
      {/* Newsletter */}
      <div className="border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold mb-1">Stay in the game</h3>
              <p className="text-surface-400 text-sm">Get early access to drops, exclusive deals & pro tips.</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
            >
              <div className="flex items-center bg-surface-800 rounded-xl flex-1 md:w-72 px-4 gap-2 border border-surface-700 focus-within:border-brand-500 transition-colors">
                <Mail className="w-4 h-4 text-surface-500 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none flex-1"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Gear<span className="text-brand-400">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-6">
              Premium gaming gear for players who demand the best. No compromises, no fakes.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600 flex items-center justify-center transition-colors duration-200 border border-surface-700 hover:border-brand-500"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-surface-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} GearVault. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {PAYMENT_ICONS.map((p) => (
              <span
                key={p}
                className="px-2 py-1 bg-surface-800 border border-surface-700 rounded text-[10px] font-bold text-surface-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
