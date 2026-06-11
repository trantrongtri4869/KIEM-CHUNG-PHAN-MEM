package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

public class CartPage extends BasePage {

    public static final String PATH = "/cart";

    private final By emptyCartLocator = By.xpath(
        "//*[contains(normalize-space(),'Your cart is empty') or contains(normalize-space(),'cart is empty')]"
    );

    // Remove button — console: CLASS: "p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
    // Selector ổn định nhất: button có class p-1.5 và hover:text-red-500
    private final By removeItemBtnLocator = By.cssSelector(
        "button.p-1\\.5[class*='hover:text-red-500']"
    );

    // Quantity minus (-) — console: CLASS: "w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
    // KHÔNG có "disabled:opacity-30"
    private final By quantityMinusBtnLocator = By.cssSelector(
        "button.w-6.h-6[class*='rounded'][class*='hover:bg-surface-100']:not([class*='disabled:opacity-30'])"
    );

    // Quantity plus (+) — console: CLASS thêm "disabled:opacity-30" so với nút minus
    private final By quantityPlusBtnLocator = By.cssSelector(
        "button.w-6.h-6[class*='rounded'][class*='disabled:opacity-30']"
    );

    private final By toastLocator = By.xpath(
        "//*[contains(normalize-space(),'added to cart') or contains(normalize-space(),'Added to cart')]"
    );

    // Checkout link — Snippet A xác nhận: nằm trong cart DRAWER
    // CLASS: "btn-primary w-full justify-center group" | HREF: /checkout
    private final By checkoutLinkLocator = By.cssSelector(
        "a[href*='/checkout'].btn-primary, a.btn-primary[href*='checkout']"
    );

    // Cart drawer open button (navbar) — để mở drawer khi cần
    private final By cartDrawerBtnLocator = By.xpath(
        "//button[@aria-label='Cart' or normalize-space()='Cart' or " +
        "contains(@class,'rounded-xl') and contains(@class,'relative')]"
    );

    private final By subtotalLocator = By.xpath(
        "//*[contains(normalize-space(),'Subtotal')]/following-sibling::* | " +
        "//*[contains(normalize-space(),'Subtotal')]/following::*[contains(normalize-space(),'$')][1]"
    );
    private final By shippingLocator = By.xpath(
        "//*[normalize-space()='Shipping']/following-sibling::* | " +
        "//*[contains(normalize-space(),'Shipping')]/following::*[1]"
    );
    // Total — log xác nhận text là "$149.99" (ngắn, chứa $)
    // Tìm element nhỏ nhất chứa $ đứng sau label "Total"
    private final By totalLocator = By.xpath(
        "(//*[self::span or self::p or self::div][normalize-space(text())='Total']" +
        "/following-sibling::*[self::span or self::p][contains(normalize-space(),'$')])[1]"
    );

    private final By couponErrorLocator = By.cssSelector("p.text-red-500, [class*='error']");
    private final By couponLoadingLocator = By.cssSelector("svg.animate-spin");

    @FindBy(css = "input[placeholder*='coupon'], input[placeholder*='Coupon'], input[placeholder*='code']")
    private WebElement couponInput;

    @FindBy(xpath = "//button[contains(normalize-space(),'Apply') or contains(normalize-space(),'apply')]")
    private WebElement applyCouponBtn;

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        navigateTo(baseUrl + PATH);
    }

    public boolean isCartEmpty() {
        return isDisplayed(emptyCartLocator);
    }

    /**
     * Đếm số items = số remove buttons.
     * Console: remove = button.p-1.5[hover:text-red-500] — 1 per item
     */
    public int getCartItemCount() {
        return findElements(removeItemBtnLocator).size();
    }

    public void removeItem(int index) {
        List<WebElement> removeBtns = findElements(removeItemBtnLocator);
        if (index < removeBtns.size()) {
            click(removeBtns.get(index));
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
        }
    }

    /**
     * Tăng quantity: nút + có class "disabled:opacity-30", index theo item
     */
    public void increaseQuantity(int itemIndex) {
        List<WebElement> plusBtns = findElements(quantityPlusBtnLocator);
        if (itemIndex < plusBtns.size()) {
            click(plusBtns.get(itemIndex));
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
        }
    }

    /**
     * Giảm quantity: nút - KHÔNG có "disabled:opacity-30"
     */
    public void decreaseQuantity(int itemIndex) {
        List<WebElement> minusBtns = findElements(quantityMinusBtnLocator);
        if (itemIndex < minusBtns.size()) {
            click(minusBtns.get(itemIndex));
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
        }
    }

    public void applyCoupon(String code) {
        type(couponInput, code);
        click(applyCouponBtn);
        wait.waitForSpinnerToDisappear(couponLoadingLocator);
    }

    public boolean isCouponErrorDisplayed() {
        return isDisplayed(couponErrorLocator);
    }

    public String getCouponError() {
        return getText(couponErrorLocator);
    }

    public String getSubtotal() {
        try { return getText(subtotalLocator); } catch (Exception e) { return ""; }
    }

    public String getShippingCost() {
        try { return getText(shippingLocator); } catch (Exception e) { return ""; }
    }

    public String getTotal() {
        try { return getText(totalLocator); } catch (Exception e) { return ""; }
    }

    /**
     * Proceed to checkout.
     * Snippet A xác nhận: link Checkout (btn-primary href=/checkout) nằm trong DRAWER.
     * Nếu đang ở /cart page, cần mở drawer trước bằng Cart button trên navbar.
     * Nếu drawer đã mở (từ trước), click thẳng vào link.
     */
    public void proceedToCheckout() {
        // Thử click Checkout link trực tiếp (nếu drawer đang mở)
        try {
            waitForVisible(checkoutLinkLocator);
            click(checkoutLinkLocator);
            waitForUrlContains("/checkout");
            return;
        } catch (Exception ignored) {}

        // Drawer chưa mở → mở drawer bằng Cart button
        try {
            click(cartDrawerBtnLocator);
            waitForVisible(checkoutLinkLocator);
            click(checkoutLinkLocator);
            waitForUrlContains("/checkout");
        } catch (Exception e) {
            // Last resort: navigate trực tiếp
            driver.get(driver.getCurrentUrl().split("/cart")[0] + "/checkout");
        }
    }

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH);
    }
}
