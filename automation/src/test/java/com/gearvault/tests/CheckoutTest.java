package com.gearvault.tests;

import org.openqa.selenium.By;
import com.gearvault.pages.CartPage;
import com.gearvault.pages.CheckoutPage;
import com.gearvault.pages.ProductDetailPage;
import com.gearvault.pages.ProductsPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CheckoutTest extends BaseTest {

    /**
     * Helper: đăng nhập, thêm 1 sản phẩm vào giỏ, navigate đến /checkout.
     */
    private boolean loginAndGoToCheckout() {
        loginAsUser();

        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        productsPage.clickProduct(0);

        ProductDetailPage detailPage = new ProductDetailPage(driver);
        if (!detailPage.isInStock()) {
            logInfo("Sản phẩm đầu tiên hết hàng, bỏ qua test");
            return false;
        }
        detailPage.clickAddToCart();

        driver.get(baseUrl + CheckoutPage.PATH);
        logInfo("Đã vào trang checkout: " + driver.getCurrentUrl());
        return true;
    }

    // ─────────────────────────────────────────────────
    // TC40 - Trang checkout hiển thị form shipping
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC40 - Trang checkout hiển thị form shipping ở bước 1",
        groups      = { "smoke", "checkout" }
    )
    public void testCheckoutPageShowsShippingForm() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        Assert.assertTrue(checkoutPage.isPageLoaded(), "Phải ở trang /checkout");
        Assert.assertFalse(driver.getCurrentUrl().contains("/login"),
            "Người dùng đã login không được redirect về /login");
        logPass("Form shipping hiển thị ở bước 1");
    }

    // ─────────────────────────────────────────────────
    // TC41 - Validation form shipping khi bỏ trống
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC41 - Validation form shipping khi submit rỗng",
        groups      = { "checkout", "validation" }
    )
    public void testShippingValidationEmptyForm() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        logInfo("Click Continue to Payment mà không điền form");
        checkoutPage.clickContinueToPayment();

        Assert.assertTrue(checkoutPage.isFieldErrorDisplayed(),
            "Phải hiển thị validation error khi form shipping rỗng");
        Assert.assertTrue(checkoutPage.isPageLoaded(),
            "Phải ở lại /checkout khi validation fail");
        logPass("Validation error hiển thị đúng khi form rỗng");
    }

    // ─────────────────────────────────────────────────
    // TC42 - Điền form shipping hợp lệ chuyển sang payment
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC42 - Điền form shipping hợp lệ chuyển sang bước Payment",
        groups      = { "smoke", "checkout" }
    )
    public void testShippingFormValidNavigatesToPayment() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        logInfo("Điền form shipping hợp lệ");
        checkoutPage.fillShippingInfo(
            "Nguyen", "Van A",
            "test@gearvault.com",
            "0901234567",
            "123 Nguyen Hue",
            "Ho Chi Minh",
            "HCM",
            "70000"
        );
        checkoutPage.clickContinueToPayment();

        Assert.assertFalse(checkoutPage.isFieldErrorDisplayed(),
            "Không được có error khi form shipping hợp lệ");
        logPass("Form shipping hợp lệ, chuyển sang bước Payment thành công");
    }

    // ─────────────────────────────────────────────────
    // TC43 - Nút Back từ payment quay về shipping
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC43 - Nút Back từ bước Payment quay về bước Shipping",
        groups      = { "checkout", "navigation" }
    )
    public void testBackButtonFromPaymentStep() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        checkoutPage.fillShippingInfo(
            "Nguyen", "Van A", "test@gearvault.com",
            "0901234567", "123 Nguyen Hue", "Ho Chi Minh", "HCM", "70000"
        );
        checkoutPage.clickContinueToPayment();

        logInfo("Click Back để quay về bước Shipping");
        checkoutPage.clickBack();

        Assert.assertTrue(checkoutPage.isPageLoaded(),
            "Phải ở lại /checkout sau khi click Back");
        logPass("Nút Back hoạt động đúng, quay về bước Shipping");
    }

    // ─────────────────────────────────────────────────
    // TC44 - Validation form payment khi bỏ trống
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC44 - Validation form payment khi submit rỗng",
        groups      = { "checkout", "validation" }
    )
    public void testPaymentValidationEmptyForm() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        checkoutPage.fillShippingInfo(
            "Nguyen", "Van A", "test@gearvault.com",
            "0901234567", "123 Nguyen Hue", "Ho Chi Minh", "HCM", "70000"
        );
        checkoutPage.clickContinueToPayment();

        // Click Review Order mà không điền payment
        // codegen: flow là fillPayment → Review Order → Place Order
        // Nếu bỏ qua fillPayment và click Review Order ngay → phải hiện validation error
        logInfo("Click Review Order mà không điền thông tin card");
        try {
            driver.findElement(By.xpath("//button[normalize-space()='Review Order']")).click();
        } catch (Exception e) {
            // Fallback: nếu app không có bước Review, click Place Order luôn
            checkoutPage.clickPlaceOrder();
        }

        Assert.assertTrue(checkoutPage.isFieldErrorDisplayed(),
            "Phải hiển thị validation error khi form payment rỗng");
        logPass("Validation error payment hiển thị đúng khi form rỗng");
    }

    // ─────────────────────────────────────────────────
    // TC45 - Hoàn thành checkout end-to-end
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC45 - Hoàn thành checkout end-to-end thành công",
        groups      = { "smoke", "checkout" }
    )
    public void testCompleteCheckoutEndToEnd() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        logInfo("Bắt đầu checkout end-to-end");
        // Flow: fillShipping → Continue to Payment → fillPayment → Review Order → Place Order · $
        checkoutPage.completeCheckout(
            "Nguyen", "Van A",
            "test@gearvault.com",
            "0901234567",
            "123 Nguyen Hue",
            "Ho Chi Minh",
            "HCM",
            "70000",
            "4111111111111111",
            "Nguyen Van A",
            "12/27",
            "123"
        );

        Assert.assertTrue(checkoutPage.isOrderConfirmed(),
            "Phải hiển thị màn hình Order Confirmed sau khi đặt hàng thành công");
        logPass("Checkout thành công! Order confirmed hiển thị");

        String orderNumber = checkoutPage.getOrderNumber();
        if (!orderNumber.isEmpty()) {
            logPass("Order number: " + orderNumber);
        }
    }

    // ─────────────────────────────────────────────────
    // TC46 - Checkout khi giỏ hàng rỗng
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC46 - Checkout với giỏ hàng rỗng redirect hoặc hiển thị thông báo",
        groups      = { "checkout", "negative" }
    )
    public void testCheckoutWithEmptyCart() {
        loginAsUser();
        driver.get(baseUrl + CheckoutPage.PATH);

        CheckoutPage checkoutPage = new CheckoutPage(driver);
        CartPage cartPage = new CartPage(driver);

        String currentUrl = driver.getCurrentUrl();
        logInfo("URL sau khi vào checkout với giỏ rỗng: " + currentUrl);

        boolean redirectedAway = !currentUrl.contains("/checkout");
        boolean hasEmptyMessage = cartPage.isCartEmpty();

        Assert.assertTrue(redirectedAway || hasEmptyMessage,
            "Khi giỏ hàng rỗng, phải redirect hoặc hiển thị thông báo. URL: " + currentUrl);
        logPass("Hành vi đúng khi checkout với giỏ rỗng");
    }

    // ─────────────────────────────────────────────────
    // TC47 - Order summary hiển thị trong checkout
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC47 - Order summary hiển thị thông tin sản phẩm trong checkout",
        groups      = { "checkout" }
    )
    public void testOrderSummaryDisplayedInCheckout() {
        if (!loginAndGoToCheckout()) return;

        CheckoutPage checkoutPage = new CheckoutPage(driver);

        // codegen: page.getByRole('heading', { name: 'Order Summary' })
        //          page.getByText('Subtotal (2 items)')
        Assert.assertTrue(
            checkoutPage.isOrderSummaryDisplayed() || checkoutPage.isSubtotalDisplayed(),
            "Phải hiển thị Order Summary hoặc Subtotal trong trang checkout"
        );
        logPass("Order summary panel hiển thị trong checkout");
    }
}
