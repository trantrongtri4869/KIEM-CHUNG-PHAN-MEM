# GearVault UI Automation Framework

Framework automation test cho ứng dụng GearVault E-Commerce, sử dụng:
- **Java 11+**
- **Selenium WebDriver 4.x**
- **TestNG 7.x**
- **Page Object Model (POM)**
- **Explicit Wait** (không dùng `Thread.sleep`)
- **ExtentReports** (HTML report đẹp)
- **WebDriverManager** (tự động download driver)

---

## Cấu trúc dự án

```
gearvault-automation/
├── pom.xml
├── src/
│   ├── main/java/com/gearvault/
│   │   ├── config/
│   │   │   └── ConfigReader.java          # Đọc config.properties (Singleton)
│   │   ├── pages/                         # PAGE OBJECT MODEL
│   │   │   ├── BasePage.java              # Base class - tất cả helper methods
│   │   │   ├── NavbarComponent.java       # Navbar (dùng chung mọi trang)
│   │   │   ├── LoginPage.java             # /login
│   │   │   ├── RegisterPage.java          # /register
│   │   │   ├── HomePage.java              # /
│   │   │   ├── ProductsPage.java          # /products
│   │   │   ├── ProductDetailPage.java     # /products/:slug
│   │   │   ├── CartPage.java              # /cart
│   │   │   └── CheckoutPage.java          # /checkout
│   │   └── utils/
│   │       ├── DriverManager.java         # WebDriver ThreadLocal management
│   │       ├── WaitHelper.java            # Tất cả Explicit Wait methods
│   │       ├── ScreenshotHelper.java      # Chụp ảnh khi test fail
│   │       └── ExtentReportManager.java   # HTML report management
│   └── test/
│       ├── java/com/gearvault/tests/
│       │   ├── BaseTest.java              # Base test: setup/teardown/report
│       │   ├── LoginTest.java             # TC01-TC10: Authentication
│       │   ├── RegisterTest.java          # TC11-TC18: Registration
│       │   ├── ProductTest.java           # TC19-TC30: Products
│       │   └── CartTest.java              # TC31-TC39: Cart & Checkout
│       └── resources/
│           ├── config.properties          # Cấu hình môi trường
│           └── testng.xml                 # Suite configuration
└── test-output/                           # (tự tạo khi chạy)
    ├── reports/                           # HTML ExtentReport
    └── screenshots/                       # Screenshot khi fail
```

---

## Cài đặt

### Yêu cầu
- Java 11 hoặc cao hơn
- Maven 3.6+
- Chrome / Firefox / Edge đã cài đặt

### Bước 1: Clone và build
```bash
cd gearvault-automation
mvn clean install -DskipTests
```

### Bước 2: Cấu hình môi trường
Chỉnh sửa `src/test/resources/config.properties`:

```properties
# URL của ứng dụng đang chạy
base.url=http://localhost:5173

# Browser: chrome | firefox | edge
browser=chrome

# Chạy headless (không mở cửa sổ)
headless=false

# Timeout (giây)
explicit.wait=10
page.load.timeout=30
```

### Bước 3: Khởi động ứng dụng GearVault
```bash
cd frontend
npm install
npm run dev
# Ứng dụng chạy tại http://localhost:5173
```

---

## Chạy tests

### Chạy toàn bộ suite
```bash
mvn test
```

### Chỉ chạy Smoke Tests
```bash
mvn test -Dgroups=smoke
```

### Chỉ chạy một test class
```bash
mvn test -Dtest=LoginTest
mvn test -Dtest=CartTest
```

### Chỉ chạy một test method
```bash
mvn test -Dtest=LoginTest#testLoginSuccessAsUser
```

### Chạy headless (CI/CD)
```bash
mvn test -Dheadless=true
```

### Chạy với browser khác
```bash
mvn test -Dbrowser=firefox
mvn test -Dbrowser=edge
```

---

## Danh sách Test Cases

| TC  | Tên | Group | Mô tả |
|-----|-----|-------|-------|
| TC01 | Đăng nhập thành công - user | smoke, auth | Email/password hợp lệ |
| TC02 | Đăng nhập thành công - admin | smoke, auth | Admin credentials |
| TC03 | Đăng nhập thất bại - sai password | auth, negative | Error message |
| TC04 | Đăng nhập thất bại - sai email | auth, negative | Error message |
| TC05 | Validation email sai format | auth, validation | HTML5 + custom validation |
| TC06 | Demo User button | auth | Auto-fill credentials |
| TC07 | Demo Admin button | auth | Auto-fill admin credentials |
| TC08 | Toggle password visibility | auth, ui | Eye icon toggle |
| TC09 | Navigate đến Register | auth, navigation | Link điều hướng |
| TC10 | Login 1-click Demo User | smoke, auth | End-to-end login |
| TC11 | Đăng ký thành công | smoke, auth | Full form submit |
| TC12 | Submit form rỗng | auth, validation | All field errors |
| TC13 | Tên quá ngắn | auth, validation | Min 2 chars |
| TC14 | Password quá ngắn | auth, validation | Min 8 chars |
| TC15 | Password mismatch | auth, validation | Confirm password |
| TC16 | Chưa tick Terms | auth, validation | Required checkbox |
| TC17 | Password strength indicator | auth, ui | DataProvider test |
| TC18 | Navigate đến Login | auth, navigation | Link điều hướng |
| TC19 | Trang chủ load | smoke, homepage | Hero + products |
| TC20 | Shop Now navigation | smoke, navigation | Redirect /products |
| TC21 | Products page load | smoke, products | Product cards |
| TC22 | Tìm kiếm sản phẩm | products, search | Filter results |
| TC23 | Tìm kiếm không có kết quả | products, negative | Empty state |
| TC24 | Click product card | smoke, navigation | Detail page |
| TC25 | Thông tin chi tiết sản phẩm | products | Name, price, CTA |
| TC26 | Quantity controls | products | +/- buttons |
| TC27 | Add to Cart từ detail | smoke, cart | Toast notification |
| TC28 | Tabs Overview/Specs/Reviews | products, ui | Tab switching |
| TC29 | Navbar search | navigation, search | URL với query |
| TC30 | Related products | products | Section hiển thị |
| TC31 | Empty cart state | smoke, cart | Empty state UI |
| TC32 | Thêm sản phẩm vào giỏ | smoke, cart | Item count |
| TC33 | Tăng quantity trong giỏ | cart | Total thay đổi |
| TC34 | Xóa sản phẩm khỏi giỏ | cart | Item removed |
| TC35 | Coupon hợp lệ (GEAR10) | cart, coupon | Discount applied |
| TC36 | Coupon không hợp lệ | cart, coupon, negative | Error message |
| TC37 | Shipping cost hiển thị | cart | Order summary |
| TC38 | Proceed to Checkout | smoke, checkout | Login + checkout |
| TC39 | Checkout yêu cầu login | cart, auth | Protected route |

---

## Kiến trúc & Design Patterns

### Page Object Model
Mỗi trang có 1 class riêng trong `pages/`. Test class chỉ gọi methods của Page Object, không thao tác trực tiếp với Selenium.

```java
// ✅ Đúng - dùng POM
LoginPage loginPage = new LoginPage(driver);
loginPage.login("user@gearvault.com", "user123");

// ❌ Sai - test class thao tác Selenium trực tiếp
driver.findElement(By.cssSelector("input[type='email']")).sendKeys("...");
```

### Explicit Wait thay vì Thread.sleep
```java
// ✅ Đúng - Explicit Wait
wait.waitForVisible(By.id("element"));
wait.waitForClickable(By.cssSelector("button"));

// ❌ Sai - Thread.sleep
Thread.sleep(3000);
```

### ThreadLocal Driver (Parallel Ready)
```java
// DriverManager dùng ThreadLocal - an toàn khi chạy parallel
DriverManager.initDriver();   // BeforeMethod
DriverManager.getDriver();    // Trong test
DriverManager.quitDriver();   // AfterMethod
```

---

## Reports

Sau khi chạy, HTML report được tạo tại:
```
test-output/reports/GearVault_Report_<timestamp>.html
```

Screenshot khi test fail:
```
test-output/screenshots/<TestName>_<timestamp>.png
```

---

## Tài khoản demo (mock data từ AuthPages.tsx)

| Role | Email | Password |
|------|-------|----------|
| User | user@gearvault.com | user123 |
| Admin | admin@gearvault.com | admin123 |

## Coupon codes (từ CartPage.tsx)

| Code | Discount |
|------|----------|
| GEAR10 | $10 |
| GEAR20 | $20 |
| NEWUSER | $15 |
| FLASHSALE | $30 |
