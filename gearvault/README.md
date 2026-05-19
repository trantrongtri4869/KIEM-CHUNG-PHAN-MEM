# GearVault — Nền Tảng Thương Mại Điện Tử Thiết Bị Gaming Cao Cấp

<div align="center">

Một website thương mại điện tử đầy đủ tính năng dành cho thiết bị gaming

Demo · Ảnh giao diện · Hướng dẫn chạy

</div>

---

# Mục lục

* Giới thiệu dự án
* Công nghệ sử dụng
* Tính năng
* Ảnh giao diện
* Hướng dẫn chạy
* Cấu trúc dự án
* Tài liệu API
* Hướng dẫn Testing
* Tài khoản demo

---

# Giới thiệu dự án

GearVault là một website thương mại điện tử chất lượng cao được xây dựng nhằm phục vụ mục đích portfolio cá nhân. Dự án thể hiện quy trình phát triển Full-stack hiện đại bao gồm kiến trúc sạch, giao diện responsive, xác thực JWT, quản lý state và kiểm thử toàn diện.

## Mục đích xây dựng

* Làm portfolio/CV
* Quay video demo
* Thực hành Manual Testing & Automation Testing
* Viết test case cho vị trí Tester/QA
* Ứng tuyển Frontend/Fullstack Developer

---

# Công nghệ sử dụng

## Frontend

| Công nghệ             | Mục đích                          |
| --------------------- | --------------------------------- |
| React 18 + Vite       | Framework giao diện + build nhanh |
| TypeScript            | Kiểm soát kiểu dữ liệu            |
| TailwindCSS           | Thiết kế giao diện                |
| Framer Motion         | Hiệu ứng animation                |
| Zustand               | Quản lý state                     |
| React Router v6       | Điều hướng trang                  |
| React Hook Form + Zod | Form + validation                 |
| Axios                 | Gửi HTTP request                  |
| Recharts              | Biểu đồ dashboard                 |
| Lucide React          | Icon                              |
| React Hot Toast       | Thông báo                         |

---

## Backend

| Công nghệ           | Mục đích            |
| ------------------- | ------------------- |
| Node.js + Express   | REST API server     |
| MongoDB + Mongoose  | Database            |
| JWT                 | Xác thực người dùng |
| bcryptjs            | Mã hóa mật khẩu     |
| express-validator   | Kiểm tra dữ liệu    |
| Helmet + rate-limit | Bảo mật             |
| Morgan              | Logging request     |

---

## Testing

| Công nghệ             | Mục đích           |
| --------------------- | ------------------ |
| Vitest                | Unit test          |
| React Testing Library | Component testing  |
| Cypress               | End-to-end testing |

---

# Tính năng

## Mua sắm

* Danh sách sản phẩm dạng grid
* Bộ lọc nâng cao (category, brand, price, rating)
* Tìm kiếm realtime
* Sắp xếp theo giá, đánh giá, mới nhất
* Trang chi tiết sản phẩm
* Thêm vào giỏ hàng nhanh
* Giỏ hàng dạng drawer animation
* Hệ thống mã giảm giá
* Thanh tiến trình miễn phí vận chuyển
* Wishlist
* Hiển thị trạng thái còn hàng

---

## Thanh toán

* Quy trình checkout 3 bước
* Validation bằng Zod
* Nhiều phương thức thanh toán
* Trang xác nhận đơn hàng

---

## Xác thực

* Đăng nhập/đăng ký bằng JWT
* Protected Route
* Hiển thị độ mạnh mật khẩu
* Demo account
* Lưu trạng thái đăng nhập

---

## Dashboard người dùng

* Quản lý profile
* Lịch sử đơn hàng
* Wishlist
* Cài đặt tài khoản

---

## Dashboard admin

* Biểu đồ doanh thu
* Biểu đồ đơn hàng
* Top sản phẩm bán chạy
* CRUD sản phẩm
* Quản lý người dùng
* Quản lý đơn hàng

---

## UI/UX

* Dark mode / Light mode
* Responsive trên mọi thiết bị
* Navbar sticky blur
* Skeleton loading
* Empty state
* Trang 404
* Animation mượt
* Toast notification
* Hover animation
* Flash sale countdown

---

# Ảnh giao diện

| Trang             | URL             | Chức năng        |
| ----------------- | --------------- | ---------------- |
| Trang chủ         | `/`             | Hero, flash sale |
| Sản phẩm          | `/products`     | Filter, search   |
| Chi tiết sản phẩm | `/products/...` | Gallery, review  |
| Giỏ hàng          | `/cart`         | Coupon, summary  |
| Thanh toán        | `/checkout`     | Form 3 bước      |
| Đăng nhập         | `/login`        | Validation       |
| Dashboard         | `/dashboard`    | Orders, profile  |
| Admin             | `/admin`        | Charts, tables   |

---

# Hướng dẫn chạy dự án

## Yêu cầu cài đặt

Cần cài:

* Node.js v18+
* MongoDB v6+
* Git

---

# Cài đặt từng bước

```bash
# Clone project
git clone https://github.com/yourusername/gearvault.git

cd gearvault

# Cài dependency
npm run install:all

# Tạo file môi trường
cp backend/.env.example backend/.env

# Khởi động MongoDB
mongod --dbpath /data/db

# Seed dữ liệu mẫu
npm run seed

# Chạy frontend + backend
npm run dev
```

---

## Địa chỉ chạy

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

API Health:

```text
http://localhost:5000/api/health
```

---

# Cấu trúc dự án

```text
gearvault/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── test/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── seeds/
│   ├── package.json
│   └── .env
│
└── package.json
```

---

# Tài liệu API

## Authentication

| Method | Endpoint             | Mô tả              |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Đăng ký            |
| POST   | `/api/auth/login`    | Đăng nhập          |
| GET    | `/api/auth/profile`  | Lấy thông tin user |
| PUT    | `/api/auth/profile`  | Cập nhật profile   |

---

## Products

| Method | Endpoint                   | Mô tả              |
| ------ | -------------------------- | ------------------ |
| GET    | `/api/products`            | Danh sách sản phẩm |
| GET    | `/api/products/featured`   | Sản phẩm nổi bật   |
| GET    | `/api/products/flash-sale` | Flash sale         |
| GET    | `/api/products/:slug`      | Chi tiết sản phẩm  |
| POST   | `/api/products`            | Tạo sản phẩm       |
| PUT    | `/api/products/:id`        | Cập nhật           |
| DELETE | `/api/products/:id`        | Xóa                |

---

## Orders

| Method | Endpoint                 | Mô tả               |
| ------ | ------------------------ | ------------------- |
| POST   | `/api/orders`            | Tạo đơn hàng        |
| GET    | `/api/orders/my`         | Đơn hàng của tôi    |
| GET    | `/api/orders`            | Tất cả đơn hàng     |
| PUT    | `/api/orders/:id/status` | Cập nhật trạng thái |

---

# Hướng dẫn Testing

## Chạy Unit Test

```bash
cd frontend

npm run test
npm run test:ui
npm run test:coverage
```

---

# Các test case quan trọng

## Happy Path

1. Đăng ký → Đăng nhập → Thêm giỏ hàng → Thanh toán
2. Tìm kiếm sản phẩm → Filter → Xem chi tiết
3. Wishlist → Chuyển vào cart

---

## Error Cases

| Test case       | Cách test                          |
| --------------- | ---------------------------------- |
| Sai mật khẩu    | Nhập password sai                  |
| Hết hàng        | Xem sản phẩm hết stock             |
| Cart rỗng       | Truy cập cart khi chưa có sản phẩm |
| Coupon sai      | Nhập mã không hợp lệ               |
| Validation form | Submit form rỗng                   |
| Protected route | Truy cập dashboard khi chưa login  |
| Admin route     | User thường vào admin              |

---

# Mã giảm giá test

| Code      | Giảm giá | Điều kiện     |
| --------- | -------- | ------------- |
| GEAR10    | -10$     | Đơn từ 50$    |
| GEAR20    | -20$     | Đơn từ 100$   |
| NEWUSER   | -15$     | Không yêu cầu |
| FLASHSALE | -30$     | Đơn từ 150$   |

---

# Tài khoản demo

| Vai trò | Email                                             | Password |
| ------- | ------------------------------------------------- | -------- |
| Admin   | [admin@gearvault.com](mailto:admin@gearvault.com) | admin123 |
| User    | [user@gearvault.com](mailto:user@gearvault.com)   | user123  |

---

# Flow demo dự án

1. Trang chủ
2. Xem sản phẩm
3. Filter + search
4. Chi tiết sản phẩm
5. Thêm giỏ hàng
6. Checkout
7. Dashboard
8. Admin panel
9. Dark mode
10. Responsive mobile

---

# Giấy phép

MIT License © 2024 GearVault

---

<div align="center">
Dự án được xây dựng phục vụ mục đích học tập và portfolio
</div>
