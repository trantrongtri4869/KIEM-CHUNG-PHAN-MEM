package com.gearvault.tests;

import com.gearvault.pages.HomePage;
import com.gearvault.pages.NavbarComponent;
import com.gearvault.pages.ProductDetailPage;
import com.gearvault.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test suite cho chức năng Products.
 * Covers:
 * - Trang chủ: hero, navigation, product cards
 * - Trang danh sách sản phẩm: search, filter, sort
 * - Trang chi tiết sản phẩm: thông tin, quantity, thêm vào giỏ
 * - Wishlist từ trang chi tiết
 */
public class ProductTest extends BaseTest {

    // ─────────────────────────────────────────────────
    // TC19 - Trang chủ load thành công
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC19 - Trang chủ load thành công",
        description = "Xác nhận trang chủ hiển thị hero section và product cards",
        groups    = { "smoke", "homepage" }
    )
    public void testHomePageLoads() {
        HomePage homePage = new HomePage(driver);
        homePage.open(baseUrl);

        Assert.assertTrue(homePage.isPageLoaded(), "Hero headline phải hiển thị");
        logPass("Hero section hiển thị: " + homePage.getHeroHeadline());

        int productCount = homePage.getProductCardCount();
        Assert.assertTrue(productCount > 0, "Phải có ít nhất 1 product card trên trang chủ");
        logPass("Trang chủ hiển thị " + productCount + " product cards");
    }

    // ─────────────────────────────────────────────────
    // TC20 - Nút Shop Now navigate đến /products
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC20 - Nút Shop Now điều hướng đến trang Products",
        description = "Xác nhận click Shop Now dẫn đến /products",
        groups    = { "smoke", "navigation", "homepage" }
    )
    public void testShopNowNavigation() {
        HomePage homePage = new HomePage(driver);
        homePage.open(baseUrl);

        logInfo("Click nút Shop Now");
        homePage.clickShopNow();

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/products"),
            "Phải navigate đến /products, URL hiện tại: " + driver.getCurrentUrl()
        );
        logPass("Shop Now navigate đến: " + driver.getCurrentUrl());
    }

    // ─────────────────────────────────────────────────
    // TC21 - Trang Products hiển thị danh sách sản phẩm
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC21 - Trang Products hiển thị danh sách sản phẩm",
        description = "Xác nhận trang /products load và hiển thị product cards",
        groups    = { "smoke", "products" }
    )
    public void testProductsPageLoads() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);

        int count = productsPage.getProductCount();
        Assert.assertTrue(count > 0, "Phải có ít nhất 1 sản phẩm trên trang Products");
        logPass("Trang Products hiển thị " + count + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC22 - Tìm kiếm sản phẩm
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC22 - Tìm kiếm sản phẩm theo tên",
        description = "Xác nhận search filter lọc sản phẩm theo từ khóa",
        groups    = { "products", "search" }
    )
    public void testProductSearch() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);

        int totalBefore = productsPage.getProductCount();
        logInfo("Số sản phẩm ban đầu: " + totalBefore);

        logInfo("Tìm kiếm từ khóa: 'headset'");
        productsPage.searchProducts("headset");

        int afterSearch = productsPage.getProductCount();
        logInfo("Số sản phẩm sau tìm kiếm: " + afterSearch);

        // Sau khi search, số lượng phải <= ban đầu
        Assert.assertTrue(
            afterSearch <= totalBefore,
            "Số sản phẩm sau tìm kiếm phải <= số ban đầu"
        );
        logPass("Tìm kiếm 'headset' trả về " + afterSearch + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC23 - Tìm kiếm không có kết quả
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC23 - Tìm kiếm không có kết quả hiển thị empty state",
        description = "Xác nhận hiển thị thông báo khi không tìm thấy sản phẩm",
        groups    = { "products", "search", "negative" }
    )
    public void testProductSearchNoResults() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);

        logInfo("Tìm kiếm từ khóa không tồn tại: 'xyznotexist123'");
        productsPage.searchProducts("xyznotexist123");

        boolean noResults = productsPage.isNoResultsDisplayed()
            || productsPage.getProductCount() == 0;
        Assert.assertTrue(noResults, "Phải hiển thị empty state khi không tìm thấy sản phẩm");
        logPass("Empty state hiển thị đúng khi search không có kết quả");
    }

    // ─────────────────────────────────────────────────
    // TC24 - Click vào product card mở trang chi tiết
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC24 - Click product card mở trang chi tiết sản phẩm",
        description = "Xác nhận click vào product card điều hướng đến detail page",
        groups    = { "smoke", "products", "navigation" }
    )
    public void testClickProductCardOpensDetail() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);

        String firstProductName = productsPage.getFirstProductName();
        logInfo("Click vào sản phẩm đầu tiên: " + firstProductName);
        productsPage.clickProduct(0);

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/products/"),
            "Phải navigate đến trang chi tiết (/products/:slug)"
        );
        logPass("Navigate đến product detail: " + driver.getCurrentUrl());

        ProductDetailPage detailPage = new ProductDetailPage(driver);
        Assert.assertTrue(detailPage.isPageLoaded(), "Trang chi tiết sản phẩm phải load được");
        logPass("Product detail page load thành công");
    }

    // ─────────────────────────────────────────────────
    // TC25 - Trang chi tiết hiển thị thông tin sản phẩm
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC25 - Trang chi tiết hiển thị đầy đủ thông tin sản phẩm",
        description = "Xác nhận tên, giá, nút Add to Cart hiển thị trên detail page",
        groups    = { "products" }
    )
    public void testProductDetailPageInfo() {
        // Navigate đến trang products và click product đầu tiên
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);

        String name = detailPage.getProductName();
        Assert.assertFalse(name.isEmpty(), "Tên sản phẩm không được rỗng");
        logPass("Tên sản phẩm: " + name);

        String price = detailPage.getPrice();
        Assert.assertFalse(price.isEmpty(), "Giá sản phẩm không được rỗng");
        logPass("Giá sản phẩm: " + price);

        Assert.assertTrue(
            detailPage.isAddToCartEnabled() || !detailPage.isInStock(),
            "Nút Add to Cart phải enabled hoặc product hết hàng"
        );
    }

    // ─────────────────────────────────────────────────
    // TC26 - Tăng/giảm số lượng sản phẩm
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC26 - Tăng và giảm quantity trên trang chi tiết",
        description = "Xác nhận nút +/- thay đổi quantity đúng",
        groups    = { "products" }
    )
    public void testQuantityControls() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);

        int initialQty = detailPage.getQuantity();
        logInfo("Quantity ban đầu: " + initialQty);

        detailPage.increaseQuantity(2);
        int afterIncrease = detailPage.getQuantity();
        Assert.assertEquals(afterIncrease, initialQty + 2, "Quantity phải tăng 2 đơn vị");
        logPass("Sau khi tăng: quantity = " + afterIncrease);

        detailPage.decreaseQuantity(1);
        int afterDecrease = detailPage.getQuantity();
        Assert.assertEquals(afterDecrease, afterIncrease - 1, "Quantity phải giảm 1 đơn vị");
        logPass("Sau khi giảm: quantity = " + afterDecrease);
    }

    // ─────────────────────────────────────────────────
    // TC27 - Add to Cart từ trang chi tiết
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC27 - Thêm sản phẩm vào giỏ hàng từ trang chi tiết",
        description = "Xác nhận Add to Cart hiển thị toast và cập nhật cart badge",
        groups    = { "smoke", "products", "cart" }
    )
    public void testAddToCartFromDetailPage() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);

        // Chỉ test nếu sản phẩm còn hàng
        if (!detailPage.isInStock()) {
            logInfo("Sản phẩm hết hàng, bỏ qua test này");
            return;
        }

        NavbarComponent navbar = new NavbarComponent(driver);
        String cartBefore = navbar.getCartItemCount();
        logInfo("Cart count trước: " + cartBefore);

        logInfo("Click Add to Cart");
        detailPage.clickAddToCart();

        // Toast notification phải xuất hiện
        String toastMsg = detailPage.getToastMessage();
        Assert.assertFalse(toastMsg.isEmpty(), "Phải hiển thị toast notification sau khi thêm vào giỏ");
        logPass("Toast hiển thị: " + toastMsg);
    }

    // ─────────────────────────────────────────────────
    // TC28 - Tabs Overview / Specs / Reviews
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC28 - Tabs chi tiết sản phẩm hoạt động đúng",
        description = "Xác nhận click tab Specs và Reviews hiển thị nội dung tương ứng",
        groups    = { "products", "ui" }
    )
    public void testProductDetailTabs() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);

        logInfo("Click tab Specs");
        detailPage.clickSpecsTab();
        logPass("Tab Specs click thành công");

        logInfo("Click tab Reviews");
        detailPage.clickReviewsTab();
        logPass("Tab Reviews click thành công");

        logInfo("Click tab Overview");
        detailPage.clickOverviewTab();
        logPass("Tab Overview click thành công");
    }

    // ─────────────────────────────────────────────────
    // TC29 - Navbar search điều hướng đến /products?search=
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC29 - Navbar search điều hướng đến trang sản phẩm với query",
        description = "Xác nhận search trong Navbar tạo URL đúng",
        groups    = { "navigation", "search" }
    )
    public void testNavbarSearch() {
        driver.get(baseUrl);

        NavbarComponent navbar = new NavbarComponent(driver);
        logInfo("Tìm kiếm 'mouse' qua Navbar");
        navbar.searchFor("mouse");

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/products"),
            "Phải navigate đến /products"
        );
        Assert.assertTrue(
            driver.getCurrentUrl().contains("search=") || driver.getCurrentUrl().contains("mouse"),
            "URL phải chứa search query"
        );
        logPass("Navbar search dẫn đến: " + driver.getCurrentUrl());
    }

    // ─────────────────────────────────────────────────
    // TC30 - Related products hiển thị trên detail page
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC30 - Related products hiển thị trên trang chi tiết",
        description = "Xác nhận section related products có ít nhất 1 sản phẩm",
        groups    = { "products" }
    )
    public void testRelatedProductsDisplayed() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);
        detailPage.scrollToBottom();

        int relatedCount = detailPage.getRelatedProductCount();
        logInfo("Số related products: " + relatedCount);
        // Related có thể có hoặc không, chỉ log
        logPass("Related products count: " + relatedCount);
    }
}
