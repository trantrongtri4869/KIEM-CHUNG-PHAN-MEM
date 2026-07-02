require('dotenv').config()
const mongoose = require('mongoose')
const { User, Category, Product, Coupon, Review, Order } = require('../models')

const CATEGORIES = [
  { name: 'Gaming Mice', slug: 'gaming-mice', description: 'Precision gaming mice for every play style', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80' },
  { name: 'Keyboards', slug: 'keyboards', description: 'Mechanical and optical gaming keyboards', image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400&q=80' },
  { name: 'Headsets', slug: 'headsets', description: 'Immersive gaming audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { name: 'Monitors', slug: 'monitors', description: 'High refresh rate gaming displays', image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&q=80' },
  { name: 'Controllers', slug: 'controllers', description: 'Console and PC game controllers', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400&q=80' },
  { name: 'Mousepads', slug: 'mousepads', description: 'Large surface gaming mousepads', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80' },
]

const PRODUCTS = [
  {
    name: 'Razer DeathAdder V3 Pro',
    slug: 'razer-deathadder-v3-pro',
    description: 'The Razer DeathAdder V3 Pro is the pinnacle of wireless gaming mice. Built for elite FPS players with ultra-light 63g design and Focus Pro 30K optical sensor.',
    shortDescription: 'Ultra-lightweight wireless FPS gaming mouse with 30K DPI',
    price: 149.99, originalPrice: 189.99, discount: 21,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80'],
    category: 'Gaming Mice', brand: 'Razer', stock: 45, sold: 328, rating: 4.8, numReviews: 124,
    tags: ['wireless', 'fps', 'lightweight', 'esports'],
    specs: new Map([['DPI', '30,000'], ['Weight', '63g'], ['Battery', '90 hrs'], ['Connection', 'Wireless 2.4GHz']]),
    isFeatured: true, isFlashSale: true, flashSaleEndsAt: new Date(Date.now() + 6 * 3600000),
  },
  {
    name: 'Logitech G Pro X Superlight 2',
    slug: 'logitech-gpro-x-superlight-2',
    description: 'SUPERLIGHT 2 is our fastest, most accurate gaming mouse ever, featuring HERO 2 sensor under 60g.',
    shortDescription: 'Competition-grade wireless mouse under 60g',
    price: 159.99,
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80'],
    category: 'Gaming Mice', brand: 'Logitech', stock: 32, sold: 512, rating: 4.9, numReviews: 287,
    tags: ['wireless', 'esports', 'ultra-light'],
    specs: new Map([['DPI', '32,000'], ['Weight', '60g'], ['Battery', '95 hrs']]),
    isFeatured: true, isFlashSale: false,
  },
  {
    name: 'SteelSeries Apex Pro TKL',
    slug: 'steelseries-apex-pro-tkl',
    description: "The world's fastest keyboard with OmniPoint 2.0 adjustable switches and 0.2mm actuation.",
    shortDescription: "World's fastest mechanical keyboard with adjustable actuation",
    price: 199.99, originalPrice: 239.99, discount: 17,
    images: ['https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&q=80'],
    category: 'Keyboards', brand: 'SteelSeries', stock: 18, sold: 203, rating: 4.7, numReviews: 98,
    tags: ['mechanical', 'tkl', 'rgb', 'adjustable'],
    specs: new Map([['Switch', 'OmniPoint 2.0'], ['Layout', 'TKL'], ['Polling', '8000 Hz']]),
    isFeatured: true, isFlashSale: false,
  },
  {
    name: 'Razer BlackShark V2 Pro',
    slug: 'razer-blackshark-v2-pro',
    description: 'Wireless esports headset with THX Spatial Audio and HyperClear Supercardioid Mic.',
    shortDescription: 'Wireless esports headset with THX Spatial Audio',
    price: 179.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    category: 'Headsets', brand: 'Razer', stock: 27, sold: 445, rating: 4.6, numReviews: 189,
    tags: ['wireless', 'thx', 'esports'],
    specs: new Map([['Drivers', '50mm TriForce Titanium'], ['Battery', '70 hrs']]),
    isFeatured: true, isFlashSale: true, flashSaleEndsAt: new Date(Date.now() + 4 * 3600000),
  },
  {
    name: 'ASUS ROG Swift 360Hz Monitor',
    slug: 'asus-rog-swift-360hz',
    description: '27" 1080p 360Hz esports monitor with G-SYNC and 1ms response time.',
    shortDescription: '27" 1080p 360Hz esports gaming monitor',
    price: 699.99, originalPrice: 799.99, discount: 13,
    images: ['https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80'],
    category: 'Monitors', brand: 'ASUS ROG', stock: 8, sold: 76, rating: 4.8, numReviews: 43,
    tags: ['360hz', 'gsync', '1080p', 'esports'],
    specs: new Map([['Panel', '27" IPS'], ['Resolution', '1920x1080'], ['Refresh', '360Hz']]),
    isFeatured: true, isFlashSale: false,
  },
  {
    name: 'Xbox Elite Controller Series 2',
    slug: 'xbox-elite-controller-series-2',
    description: 'Pro controller with 30+ customizable components and 40-hour battery.',
    shortDescription: 'Pro controller with 30+ customizable components',
    price: 179.99,
    images: ['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80'],
    category: 'Controllers', brand: 'Xbox', stock: 22, sold: 334, rating: 4.5, numReviews: 212,
    tags: ['wireless', 'customizable', 'pro'],
    specs: new Map([['Battery', '40 hrs'], ['Connection', 'Bluetooth + USB-C']]),
    isFeatured: false, isFlashSale: true, flashSaleEndsAt: new Date(Date.now() + 8 * 3600000),
  },
  {
    name: 'SteelSeries QcK Heavy XXL',
    slug: 'steelseries-qck-heavy-xxl',
    description: '900x400mm optimized cloth gaming mousepad with 6mm non-slip base.',
    shortDescription: '900x400mm cloth gaming mousepad',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80'],
    category: 'Mousepads', brand: 'SteelSeries', stock: 0, sold: 1240, rating: 4.7, numReviews: 567,
    tags: ['xxl', 'cloth', 'desk-pad'],
    specs: new Map([['Size', '900x400mm'], ['Thickness', '6mm']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'HyperX Cloud Alpha Wireless',
    slug: 'hyperx-cloud-alpha-wireless',
    description: '300-hour battery wireless gaming headset with dual-chamber drivers.',
    shortDescription: '300-hour battery wireless gaming headset',
    price: 199.99, originalPrice: 229.99, discount: 13,
    images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=600&q=80'],
    category: 'Headsets', brand: 'HyperX', stock: 15, sold: 289, rating: 4.7, numReviews: 143,
    tags: ['wireless', '300hr', 'noise-cancelling'],
    specs: new Map([['Battery', '300 hrs'], ['Drivers', '50mm Dual-Chamber']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Keychron Q1 Pro',
    slug: 'keychron-q1-pro',
    description: 'Wireless custom mechanical keyboard with full CNC aluminum and QMK/VIA support.',
    shortDescription: 'Wireless custom keyboard with double gasket',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'],
    category: 'Keyboards', brand: 'Keychron', stock: 11, sold: 167, rating: 4.9, numReviews: 89,
    tags: ['wireless', 'custom', 'qmk', 'aluminum'],
    specs: new Map([['Material', 'Full CNC Aluminum'], ['Switch', 'Gateron G Pro'], ['Layout', '75%']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Glorious Model O Wireless',
    slug: 'glorious-model-o-wireless',
    description: '69g wireless honeycomb gaming mouse with BAMF 2.0 sensor and RGB.',
    shortDescription: '69g wireless honeycomb gaming mouse',
    price: 79.99, originalPrice: 99.99, discount: 20,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
    category: 'Gaming Mice', brand: 'Glorious', stock: 38, sold: 402, rating: 4.5, numReviews: 201,
    tags: ['wireless', 'honeycomb', 'rgb', 'lightweight'],
    specs: new Map([['DPI', '19,000'], ['Weight', '69g'], ['Battery', '71 hrs']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Corsair K100 RGB',
    slug: 'corsair-k100-rgb',
    description: 'Flagship keyboard with OPX optical switches and 4000Hz polling rate.',
    shortDescription: 'Flagship keyboard with OPX optical switches',
    price: 229.99,
    images: ['https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&q=80'],
    category: 'Keyboards', brand: 'Corsair', stock: 14, sold: 98, rating: 4.6, numReviews: 67,
    tags: ['optical', '4000hz', 'full-size'],
    specs: new Map([['Switch', 'OPX Optical'], ['Polling', '4,000Hz']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Sony DualSense Edge',
    slug: 'sony-dualsense-edge',
    description: 'PS5 pro controller with remappable buttons and swappable stick caps.',
    shortDescription: 'PS5 pro controller with full customization',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80'],
    category: 'Controllers', brand: 'Sony', stock: 19, sold: 276, rating: 4.4, numReviews: 178,
    tags: ['ps5', 'customizable', 'wireless'],
    specs: new Map([['Platform', 'PlayStation 5'], ['Battery', '12 hrs']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Razer Huntsman V2',
    slug: 'razer-huntsman-v2',
    description: 'Full-size optical gaming keyboard with Razer Purple optical switches and 8000Hz polling.',
    shortDescription: 'Optical gaming keyboard with 8000Hz polling',
    price: 189.99,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80'],
    category: 'Keyboards', brand: 'Razer', stock: 25, sold: 155, rating: 4.6, numReviews: 82,
    tags: ['optical', '8000hz', 'rgb', 'full-size'],
    specs: new Map([['Switch', 'Razer Purple Optical'], ['Polling', '8,000Hz'], ['Layout', 'Full-size']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Samsung Odyssey G7 32"',
    slug: 'samsung-odyssey-g7-32',
    description: '32" QHD 240Hz curved gaming monitor with 1ms response and QLED technology.',
    shortDescription: '32" QHD 240Hz curved QLED gaming monitor',
    price: 599.99, originalPrice: 699.99, discount: 14,
    images: ['https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80'],
    category: 'Monitors', brand: 'Samsung', stock: 12, sold: 89, rating: 4.7, numReviews: 56,
    tags: ['240hz', '1440p', 'curved', 'qled'],
    specs: new Map([['Panel', '32" VA QLED'], ['Resolution', '2560x1440'], ['Refresh', '240Hz'], ['Curvature', '1000R']]),
    isFeatured: false, isFlashSale: true, flashSaleEndsAt: new Date(Date.now() + 5 * 3600000),
  },
  {
    name: 'Logitech G435 Wireless',
    slug: 'logitech-g435-wireless',
    description: 'Lightweight 165g wireless headset with Bluetooth and LIGHTSPEED, made with recycled plastic.',
    shortDescription: 'Ultra-light eco-friendly wireless gaming headset',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    category: 'Headsets', brand: 'Logitech', stock: 30, sold: 198, rating: 4.3, numReviews: 94,
    tags: ['wireless', 'lightweight', 'eco-friendly', 'bluetooth'],
    specs: new Map([['Weight', '165g'], ['Battery', '18 hrs'], ['Connection', 'BT + LIGHTSPEED']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Endgame Gear XM1r',
    slug: 'endgame-gear-xm1r',
    description: 'Ultra-responsive wired gaming mouse with Kailh GM 8.0 switches and PAW3370 sensor.',
    shortDescription: 'Precision wired mouse with Kailh GM 8.0 switches',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
    category: 'Gaming Mice', brand: 'Endgame Gear', stock: 50, sold: 312, rating: 4.6, numReviews: 143,
    tags: ['wired', 'lightweight', 'esports'],
    specs: new Map([['Sensor', 'PAW3370'], ['DPI', '19,000'], ['Weight', '70g'], ['Switches', 'Kailh GM 8.0']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Razer Firefly V2 Pro',
    slug: 'razer-firefly-v2-pro',
    description: "World's first LED-backlit gaming mousepad with Chroma RGB and hard surface for fast glide.",
    shortDescription: 'RGB hard surface illuminated gaming mousepad',
    price: 99.99,
    images: ['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80'],
    category: 'Mousepads', brand: 'Razer', stock: 20, sold: 187, rating: 4.4, numReviews: 78,
    tags: ['rgb', 'hard-surface', 'illuminated'],
    specs: new Map([['Size', '355x255mm'], ['Surface', 'Hard micro-textured'], ['Lighting', 'Chroma RGB']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Nintendo Switch Pro Controller',
    slug: 'nintendo-switch-pro-controller',
    description: 'Official Nintendo Pro Controller with HD Rumble, amiibo support, and 40hr battery.',
    shortDescription: 'Official Switch Pro Controller with HD Rumble',
    price: 69.99,
    images: ['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80'],
    category: 'Controllers', brand: 'Nintendo', stock: 35, sold: 567, rating: 4.8, numReviews: 320,
    tags: ['nintendo', 'switch', 'wireless', 'hd-rumble'],
    specs: new Map([['Platform', 'Nintendo Switch'], ['Battery', '40 hrs'], ['Connection', 'Bluetooth']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'Beyerdynamic MMX 300 Pro',
    slug: 'beyerdynamic-mmx-300-pro',
    description: 'Audiophile-grade closed gaming headset with Hi-Res Audio certification and Meta Voice mic.',
    shortDescription: 'Audiophile closed gaming headset with Hi-Res Audio',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    category: 'Headsets', brand: 'Beyerdynamic', stock: 9, sold: 65, rating: 4.9, numReviews: 38,
    tags: ['audiophile', 'hi-res', 'wired', 'premium'],
    specs: new Map([['Drivers', '45mm Tesla'], ['Frequency', '5Hz-35kHz'], ['Impedance', '32 Ohm']]),
    isFeatured: false, isFlashSale: false,
  },
  {
    name: 'LG UltraGear 27GP850-B',
    slug: 'lg-ultragear-27gp850',
    description: '27" Nano IPS 165Hz gaming monitor with 1ms GtG, NVIDIA G-Sync Compatible.',
    shortDescription: '27" Nano IPS 165Hz G-Sync gaming monitor',
    price: 379.99, originalPrice: 449.99, discount: 16,
    images: ['https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80'],
    category: 'Monitors', brand: 'LG', stock: 17, sold: 134, rating: 4.6, numReviews: 71,
    tags: ['165hz', '1440p', 'nano-ips', 'gsync'],
    specs: new Map([['Panel', '27" Nano IPS'], ['Resolution', '2560x1440'], ['Refresh', '165Hz'], ['Response', '1ms GtG']]),
    isFeatured: false, isFlashSale: false,
  },
]

const COUPONS = [
  { code: 'GEAR10', discount: 10, type: 'fixed', minOrder: 50, maxUses: 500, expiresAt: new Date(Date.now() + 30 * 86400000), isActive: true },
  { code: 'GEAR20', discount: 20, type: 'fixed', minOrder: 100, maxUses: 200, expiresAt: new Date(Date.now() + 30 * 86400000), isActive: true },
  { code: 'NEWUSER', discount: 15, type: 'fixed', minOrder: 0, maxUses: 1000, expiresAt: new Date(Date.now() + 60 * 86400000), isActive: true },
  { code: 'FLASHSALE', discount: 30, type: 'fixed', minOrder: 150, maxUses: 50, expiresAt: new Date(Date.now() + 7 * 86400000), isActive: true },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ])
    console.log('🗑️  Cleared existing data')

    // Seed users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gearvault.com',
      password: 'admin123',
      role: 'admin',
    })
    const normalUser = await User.create({
      name: 'John Gamer',
      email: 'user@gearvault.com',
      password: 'user123',
      role: 'user',
    })
    console.log(`👥 Created ${2} users`)

    // Seed categories
    await Category.insertMany(CATEGORIES)
    console.log(`📁 Created ${CATEGORIES.length} categories`)

    // Seed products
    await Product.insertMany(PRODUCTS)
    console.log(`📦 Created ${PRODUCTS.length} products`)

    // Seed coupons
    await Coupon.insertMany(COUPONS)
    console.log(`🎟️  Created ${COUPONS.length} coupons`)

    console.log('\n🚀 Seed complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Admin  → admin@gearvault.com / admin123')
    console.log('User   → user@gearvault.com  / user123')
    console.log('Coupons → GEAR10, GEAR20, NEWUSER, FLASHSALE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error.message)
    process.exit(1)
  }
}

seed()
