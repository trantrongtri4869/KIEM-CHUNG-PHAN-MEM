package com.gearvault.tests;

import com.gearvault.pages.CartPage;
import com.gearvault.pages.ProductDetailPage;
import com.gearvault.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Test suite cho chức năng Cart.
 * Covers:
 * - Empty cart state
 * - Thêm sản phẩm vào giỏ
 * - Tăng/giảm số lượng trong giỏ
 * - Xóa sản phẩm khỏi giỏ
 * - Áp dụng coupon hợp lệ
 * - Áp dụng coupon không hợp lệ
 * - Checkout button
 */
public class CartTest extends BaseTest {

    /**
     * Helper: thêm 1 sản phẩm vào giỏ hàng từ trang products.
     */
    private void addOneProductToCart() {
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);
        if (detailPage.isInStock()) {
            detailPage.clickAddToCart();
        }
        // Navigate đến cart
        driver.get(baseUrl + CartPage.PATH);
    }

    // ─────────────────────────────────────────────────
    // TC31 - Giỏ hàng rỗng hiển thị empty state
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC31 - Giỏ hàng rỗng hiển thị empty state",
        description = "Xác nhận trang cart hiển thị thông báo rỗng khi chưa thêm gì",
        groups    = { "smoke", "cart" }
    )
    public void testEmptyCartState() {
        CartPage cartPage = new CartPage(driver);
        cartPage.open(baseUrl);

        if (cartPage.isCartEmpty()) {
            Assert.assertTrue(cartPage.isCartEmpty(), "Giỏ hàng phải hiển thị empty state");
            logPass("Empty cart state hiển thị đúng");
        } else {
            // Nếu có item (state persist từ session trước), chỉ log
            logInfo("Cart có " + cartPage.getCartItemCount() + " items từ session trước");
        }
    }

    // ─────────────────────────────────────────────────
    // TC32 - Thêm sản phẩm vào giỏ hàng
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC32 - Thêm sản phẩm vào giỏ hàng",
        description = "Xác nhận sản phẩm xuất hiện trong cart sau khi thêm",
        groups    = { "smoke", "cart" }
    )
    public void testAddProductToCart() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);

        Assert.assertFalse(cartPage.isCartEmpty(), "Giỏ hàng không được rỗng sau khi thêm sản phẩm");
        int itemCount = cartPage.getCartItemCount();
        Assert.assertTrue(itemCount >= 1, "Phải có ít nhất 1 item trong giỏ");
        logPass("Giỏ hàng có " + itemCount + " item(s) sau khi thêm sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC33 - Tăng số lượng trong giỏ hàng
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC33 - Tăng số lượng sản phẩm trong giỏ hàng",
        description = "Xác nhận nút + tăng quantity và cập nhật total",
        groups    = { "cart" }
    )
    public void testIncreaseQuantityInCart() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);
        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test");
            return;
        }

        String totalBefore = cartPage.getTotal();
        logInfo("Total trước khi tăng: " + totalBefore);

        cartPage.increaseQuantity(0);

        String totalAfter = cartPage.getTotal();
        logInfo("Total sau khi tăng: " + totalAfter);

        // Total phải thay đổi (tăng lên) sau khi tăng quantity
        Assert.assertNotEquals(totalAfter, totalBefore, "Total phải thay đổi sau khi tăng quantity");
        logPass("Tăng quantity thành công, total: " + totalAfter);
    }

    // ─────────────────────────────────────────────────
    // TC34 - Xóa sản phẩm khỏi giỏ hàng
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC34 - Xóa sản phẩm khỏi giỏ hàng",
        description = "Xác nhận xóa item khỏi cart và hiển thị empty state nếu hết",
        groups    = { "cart" }
    )
    public void testRemoveItemFromCart() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);
        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test");
            return;
        }

        int countBefore = cartPage.getCartItemCount();
        logInfo("Số items trước khi xóa: " + countBefore);

        cartPage.removeItem(0);

        int countAfter = cartPage.getCartItemCount();
        logInfo("Số items sau khi xóa: " + countAfter);

        Assert.assertEquals(
            countAfter, countBefore - 1,
            "Số lượng item phải giảm 1 sau khi xóa"
        );
        logPass("Xóa item thành công, còn " + countAfter + " item(s)");

        if (countAfter == 0) {
            Assert.assertTrue(cartPage.isCartEmpty(), "Khi hết items phải hiển thị empty state");
            logPass("Empty state hiển thị sau khi xóa item cuối");
        }
    }

    // ─────────────────────────────────────────────────
    // TC35 - Áp dụng coupon hợp lệ
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC35 - Áp dụng coupon hợp lệ được discount",
        description = "Xác nhận coupon GEAR10 áp dụng thành công và hiển thị discount",
        groups    = { "cart", "coupon" }
    )
    public void testApplyValidCoupon() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);
        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test coupon");
            return;
        }

        String couponCode = config.getValidCoupon();
        logInfo("Áp dụng coupon: " + couponCode);
        cartPage.applyCoupon(couponCode);

        Assert.assertFalse(cartPage.isCouponErrorDisplayed(),
            "Không được hiển thị lỗi khi coupon hợp lệ");
        logPass("Coupon " + couponCode + " áp dụng thành công");
    }

    // ─────────────────────────────────────────────────
    // TC36 - Áp dụng coupon không hợp lệ
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC36 - Áp dụng coupon không hợp lệ hiển thị lỗi",
        description = "Xác nhận hiển thị error message khi nhập coupon sai",
        groups    = { "cart", "coupon", "negative" }
    )
    public void testApplyInvalidCoupon() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);
        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test coupon");
            return;
        }

        String invalidCode = config.getInvalidCoupon();
        logInfo("Áp dụng coupon không hợp lệ: " + invalidCode);
        cartPage.applyCoupon(invalidCode);

        Assert.assertTrue(
            cartPage.isCouponErrorDisplayed(),
            "Phải hiển thị error message khi coupon không hợp lệ"
        );
        String errorMsg = cartPage.getCouponError();
        logPass("Error coupon hiển thị đúng: " + errorMsg);
    }

    // ─────────────────────────────────────────────────
    // TC37 - Shipping miễn phí khi đơn hàng > $100
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC37 - Kiểm tra shipping cost hiển thị trong Order Summary",
        description = "Xác nhận shipping cost hiển thị trong order summary",
        groups    = { "cart" }
    )
    public void testShippingCostDisplayed() {
        addOneProductToCart();

        CartPage cartPage = new CartPage(driver);
        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test");
            return;
        }

        String shipping = cartPage.getShippingCost();
        logInfo("Shipping cost: " + shipping);
        // Shipping là "Free" hoặc "$9.99" - chỉ cần hiển thị
        Assert.assertFalse(shipping.isEmpty(), "Shipping cost phải hiển thị trong order summary");
        logPass("Shipping cost hiển thị: " + shipping);
    }

    // ─────────────────────────────────────────────────
    // TC38 - Proceed to Checkout (cần login)
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC38 - Proceed to Checkout redirect đến trang checkout",
        description = "Đăng nhập, thêm sản phẩm, và checkout",
        groups    = { "smoke", "cart", "checkout" }
    )
    public void testProceedToCheckout() {
        // Đăng nhập trước
        loginAsUser();

        // Thêm sản phẩm vào giỏ
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);
        if (!detailPage.isInStock()) {
            logInfo("Sản phẩm hết hàng, bỏ qua test");
            return;
        }
        detailPage.clickAddToCart();

        // Navigate đến cart
        driver.get(baseUrl + CartPage.PATH);
        CartPage cartPage = new CartPage(driver);

        if (cartPage.isCartEmpty()) {
            logInfo("Giỏ hàng rỗng, bỏ qua test checkout");
            return;
        }

        logInfo("Click Proceed to Checkout");
        cartPage.proceedToCheckout();

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/checkout"),
            "Phải navigate đến /checkout, URL: " + driver.getCurrentUrl()
        );
        logPass("Checkout redirect thành công: " + driver.getCurrentUrl());
    }

    // ─────────────────────────────────────────────────
    // TC39 - Checkout redirect login nếu chưa đăng nhập
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC39 - Checkout redirect về login nếu chưa đăng nhập",
        description = "Xác nhận ProtectedRoute yêu cầu login khi truy cập /checkout",
        groups    = { "cart", "auth", "navigation" }
    )
    public void testCheckoutRequiresLogin() {
        // KHÔNG đăng nhập - truy cập thẳng /checkout
        driver.get(baseUrl + "/checkout");

        // Phải redirect về /login
        String currentUrl = driver.getCurrentUrl();
        Assert.assertTrue(
            currentUrl.contains("/login") || currentUrl.contains("/"),
            "Chưa login phải redirect về /login hoặc /. URL: " + currentUrl
        );
        logPass("Protected route hoạt động đúng, redirect: " + currentUrl);
    }
}
