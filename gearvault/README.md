# ⚡ GearVault — Premium Gaming Gear Ecommerce

<div align="center">

![GearVault Banner](https://images.unsplash.com/photo-1593640408182-31c228b9d763?w=1200&h=400&fit=crop&q=80)

**A full-featured, production-quality ecommerce platform for gaming peripherals**

[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://mongodb.com)

[🎮 Live Demo](#) · [📸 Screenshots](#screenshots) · [🚀 Quick Start](#quick-start)

</div>

---

## 📋 Table of Contents

- [About the Project](#about)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Project Structure](#structure)
- [API Reference](#api)
- [Testing Guide](#testing)
- [Demo Accounts](#demo)

---

## 🎯 About the Project <a name="about"></a>

GearVault is a **production-quality** ecommerce web application built as a portfolio project. It showcases modern full-stack development practices including clean architecture, responsive UI/UX, JWT authentication, state management, and comprehensive testing.

**Built for:**
- 📄 Portfolio/CV showcase
- 🎥 Video demo recording
- ✅ Manual & automation testing practice
- 🧪 Writing test cases (Tester/QA role)
- 💼 Frontend/Fullstack Developer job applications

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework + fast bundler |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Framer Motion | Smooth animations |
| Zustand | Lightweight state management |
| React Router v6 | Client-side routing |
| React Hook Form + Zod | Form handling + validation |
| Axios | HTTP client |
| Recharts | Admin dashboard charts |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| Helmet + rate-limit | Security middleware |
| Morgan | HTTP logging |

### Testing
| Technology | Purpose |
|-----------|---------|
| Vitest | Unit/component test runner |
| React Testing Library | Component testing |
| Cypress (optional) | E2E testing |

---

## ✨ Features <a name="features"></a>

### 🛒 Shopping
- [x] Product listing with grid layout
- [x] Advanced filter (category, brand, price, rating)
- [x] Real-time search
- [x] Sort (newest, price, rating, popular)
- [x] Product detail with image gallery
- [x] Quick add to cart
- [x] Cart drawer with slide animation
- [x] Coupon code system (GEAR10, GEAR20, NEWUSER, FLASHSALE)
- [x] Free shipping threshold progress bar
- [x] Wishlist management
- [x] Stock status indicator

### 💳 Checkout
- [x] 3-step checkout flow (Shipping → Payment → Review)
- [x] Form validation with Zod
- [x] Multiple payment methods (Card, PayPal, COD)
- [x] Order confirmation page with order ID

### 🔐 Authentication
- [x] JWT-based login/register
- [x] Protected routes
- [x] Password strength indicator
- [x] Demo accounts (one-click fill)
- [x] Persistent auth state

### 👤 User Dashboard
- [x] Profile management
- [x] Order history with status badges
- [x] Wishlist view
- [x] Settings page

### ⚡ Admin Dashboard
- [x] Revenue area chart
- [x] Orders bar chart
- [x] Top products ranking
- [x] Product CRUD table
- [x] User management table
- [x] Order management

### 🎨 UI/UX
- [x] Dark mode / Light mode
- [x] Fully responsive (mobile, tablet, desktop)
- [x] Sticky blur navbar
- [x] Skeleton loading states
- [x] Empty states
- [x] 404 page
- [x] Smooth page animations
- [x] Toast notifications
- [x] Hover animations on product cards
- [x] Flash sale countdown timer

---

## 📸 Screenshots <a name="screenshots"></a>

> Take screenshots of these pages for your portfolio:

| Page | URL | Key Features |
|------|-----|-------------|
| Home | `/` | Hero, categories, flash sale, testimonials |
| Products | `/products` | Filter sidebar, grid, search |
| Product Detail | `/products/razer-deathadder-v3-pro` | Gallery, specs, reviews |
| Cart | `/cart` | Coupon, quantity, summary |
| Checkout | `/checkout` | 3-step form, order success |
| Login | `/login` | Demo accounts, validation |
| Dashboard | `/dashboard` | Profile, orders, wishlist |
| Admin | `/admin` | Charts, tables |

---

## 🚀 Quick Start <a name="quick-start"></a>

### Prerequisites

Make sure you have installed:
- **Node.js** v18+ → [download](https://nodejs.org)
- **MongoDB** v6+ → [download](https://mongodb.com/try/download/community)
- **Git** → [download](https://git-scm.com)

### Step-by-step Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/gearvault.git
cd gearvault

# 2. Install all dependencies (root + frontend + backend)
npm run install:all

# 3. Configure environment variables
# Backend:
cp backend/.env.example backend/.env
# Edit backend/.env and set your MONGODB_URI if needed

# 4. Start MongoDB (if running locally)
mongod --dbpath /data/db    # Mac/Linux
# or start MongoDB Compass

# 5. Seed the database with sample data
npm run seed

# 6. Start both frontend and backend
npm run dev
```

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:5000  
**API Health Check:** http://localhost:5000/api/health

### Run frontend only (without backend)
```bash
cd frontend
npm run dev
# The app works fully with mock data — no backend needed!
```

---

## 📁 Project Structure <a name="structure"></a>

```
gearvault/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer, Layout
│   │   │   ├── product/       # ProductCard, ProductGrid
│   │   │   ├── cart/          # CartDrawer
│   │   │   ├── ui/            # StarRating, shared UI
│   │   │   └── shared/        # ProtectedRoute
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── AuthPages.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── OtherPages.tsx
│   │   ├── store/             # Zustand stores (auth, cart, wishlist, UI)
│   │   ├── services/          # Axios API service layer
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Mock data, helpers
│   │   ├── test/              # Vitest unit + component tests
│   │   └── styles/            # Global CSS
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express route handlers
│   │   ├── middleware/        # Auth JWT, error handling
│   │   └── seeds/             # Database seed script
│   ├── package.json
│   └── .env
│
└── package.json               # Root scripts
```

---

## 🔌 API Reference <a name="api"></a>

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login, returns JWT |
| GET | `/api/auth/profile` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | - | List products (with filters) |
| GET | `/api/products/featured` | - | Featured products |
| GET | `/api/products/flash-sale` | - | Flash sale products |
| GET | `/api/products/best-sellers` | - | Best selling products |
| GET | `/api/products/:slug` | - | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | JWT | Create order |
| GET | `/api/orders/my` | JWT | My orders |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

### Query Parameters (GET /api/products)
```
?category=gaming-mice
?brand=Razer
?minPrice=50&maxPrice=200
?rating=4
?sort=price_asc | price_desc | newest | rating | popular
?search=wireless mouse
?page=1&limit=12
?featured=true
?sale=true
```

---

## 🧪 Testing Guide <a name="testing"></a>

### Run Unit Tests
```bash
cd frontend
npm run test           # Run all tests
npm run test:ui        # Open Vitest UI
npm run test:coverage  # Coverage report
```

### Test Cases for Manual Testing

#### ✅ Happy Path
1. Register new account → Login → Add to cart → Checkout → Order success
2. Browse products → Filter by category → Sort by price → View detail
3. Add to wishlist → View wishlist → Move to cart

#### ❌ Error States to Test
| Test Case | How to trigger |
|-----------|---------------|
| Login with wrong password | Enter wrong credentials |
| Out of stock product | View SteelSeries QcK Heavy XXL |
| Empty cart | Navigate to /cart with nothing added |
| Invalid coupon | Enter "INVALID123" at cart |
| Form validation | Submit checkout with empty fields |
| Protected route | Navigate to /dashboard when logged out |
| Admin-only route | Login as user, navigate to /admin |

#### 🎟️ Test Coupons
| Code | Discount | Min Order |
|------|----------|-----------|
| GEAR10 | -$10 | $50 |
| GEAR20 | -$20 | $100 |
| NEWUSER | -$15 | No min |
| FLASHSALE | -$30 | $150 |

---

## 👤 Demo Accounts <a name="demo"></a>

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@gearvault.com | admin123 | Full admin panel |
| User | user@gearvault.com | user123 | User dashboard |

> 💡 **Tip:** On the Login page, click "Demo User" or "Demo Admin" to auto-fill credentials.

---

## 🗺️ Demo Flow for Portfolio Video

1. **Home page** — Show hero, categories, flash sale countdown
2. **Browse products** — Apply filters, sort, search
3. **Product detail** — Gallery, specs tab, reviews tab
4. **Add to cart** — Cart drawer animation, coupon code
5. **Checkout** — 3-step form, order success
6. **Dashboard** — Profile, orders
7. **Admin panel** — Charts, product table, orders
8. **Dark mode** — Toggle in navbar
9. **Mobile view** — Responsive layout

---

## 📄 License

MIT © 2024 GearVault

---

<div align="center">
  Built with ❤️ for portfolio & learning purposes
</div>
