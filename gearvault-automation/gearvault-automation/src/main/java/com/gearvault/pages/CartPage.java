package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

/**
 * Page Object cho trang Cart (/cart).
 * Dựa trên CartPage.tsx.
 *
 * Features:
 * - Cart items list: tên, giá, quantity, remove
 * - Coupon code input
 * - Order summary: subtotal, shipping, discount, total
 * - Proceed to Checkout button
 * - Empty cart state
 */
public class CartPage extends BasePage {

    public static final String PATH = "/cart";

    // ── Empty State ───────────────────────────────────
    private final By emptyCartLocator        = By.xpath("//*[contains(normalize-space(),'Your cart is empty')]");
    private final By browseShopBtnLocator    = By.xpath("//a[contains(normalize-space(),'Start Shopping')]");

    // ── Cart Items ────────────────────────────────────
    private final By cartItemLocator         = By.cssSelector(".card.p-5.flex.gap-5");
    private final By itemNameLocator         = By.cssSelector("a h3.font-semibold");
    private final By itemPriceLocator        = By.cssSelector("div.text-right p.font-bold");
    private final By removeItemBtnLocator    = By.xpath("//button[contains(@class, 'text-red-500')]");

    // ── Quantity Controls ─────────────────────────────
    private final By quantityMinusBtnLocator = By.xpath("//button[.//svg[contains(@class, 'lucide-minus')]]");
    private final By quantityPlusBtnLocator  = By.xpath("//button[.//svg[contains(@class, 'lucide-plus')]]");

    // ── Coupon ────────────────────────────────────────
    @FindBy(css = "input[placeholder='Enter coupon code']")
    private WebElement couponInput;

    @FindBy(xpath = "//button[contains(normalize-space(),'Apply')]")
    private WebElement applyCouponBtn;

    private final By couponErrorLocator      = By.cssSelector("p.text-red-500");
    private final By appliedCouponLocator    = By.cssSelector(".bg-emerald-50");
    private final By removeCouponBtnLocator  = By.xpath("//button[.//svg[contains(@class, 'lucide-x')]]");
    private final By couponLoadingLocator    = By.cssSelector("svg.animate-spin");

    // ── Order Summary ─────────────────────────────────
    private final By subtotalLocator         = By.xpath("//span[contains(normalize-space(),'Subtotal')]/following-sibling::span[@class='font-medium']");
    private final By shippingCostLocator     = By.xpath("//span[contains(normalize-space(),'Shipping')]/following-sibling::span[@class='font-medium']");
    private final By discountAmountLocator   = By.xpath("//span[contains(normalize-space(),'Discount')]/following-sibling::span[@class='font-medium']");
    private final By totalLocator            = By.xpath("//span[normalize-space()='Total']/following-sibling::span[@class='font-medium']");

    // ── Clear Cart ────────────────────────────────────
    private final By clearCartBtnLocator     = By.xpath("//button[contains(normalize-space(),'Clear Cart')]");

    // ── Checkout ──────────────────────────────────────
    @FindBy(xpath = "//button[contains(normalize-space(),'Proceed to Checkout')]")
    private WebElement checkoutBtn;

    // ── Continue Shopping ─────────────────────────────
    private final By continueShoppingLocator = By.xpath("//a[contains(normalize-space(),'Continue Shopping')]");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        navigateTo(baseUrl + PATH);
    }

    // ── Empty State ───────────────────────────────────

    public boolean isCartEmpty() {
        return isDisplayed(emptyCartLocator);
    }

    public void clickBrowseShop() {
        click(browseShopBtnLocator);
        waitForUrlContains("/products");
    }

    // ── Cart Items ────────────────────────────────────

    public List<WebElement> getCartItems() {
        try {
            return wait.waitForMinimumElements(cartItemLocator, 1);
        } catch (Exception e) {
            return findElements(cartItemLocator);
        }
    }

    public int getCartItemCount() {
        return findElements(cartItemLocator).size();
    }

    /**
     * Xóa item theo index (0-based).
     */
    public void removeItem(int index) {
        List<WebElement> removeBtns = wait.waitForMinimumElements(removeItemBtnLocator, 1);
        click(removeBtns.get(index));
    }

    /**
     * Tăng quantity của item theo index.
     */
    public void increaseQuantity(int itemIndex) {
        List<WebElement> plusBtns = findElements(quantityPlusBtnLocator);
        click(plusBtns.get(itemIndex));
    }

    /**
     * Giảm quantity của item theo index.
     */
    public void decreaseQuantity(int itemIndex) {
        List<WebElement> minusBtns = findElements(quantityMinusBtnLocator);
        click(minusBtns.get(itemIndex));
    }

    public void clearCart() {
        if (isDisplayed(clearCartBtnLocator)) {
            click(clearCartBtnLocator);
        }
    }

    // ── Coupon ────────────────────────────────────────

    public void applyCoupon(String code) {
        type(couponInput, code);
        click(applyCouponBtn);
        wait.waitForSpinnerToDisappear(couponLoadingLocator);
    }

    public void removeCoupon() {
        if (isDisplayed(removeCouponBtnLocator)) {
            click(removeCouponBtnLocator);
        }
    }

    public boolean isCouponApplied() {
        return isDisplayed(appliedCouponLocator);
    }

    public boolean isCouponErrorDisplayed() {
        return isDisplayed(couponErrorLocator);
    }

    public String getCouponError() {
        return getText(couponErrorLocator);
    }

    // ── Order Summary ─────────────────────────────────

    public String getSubtotal() {
        try { return getText(subtotalLocator); } catch (Exception e) { return ""; }
    }

    public String getShippingCost() {
        try { return getText(shippingCostLocator); } catch (Exception e) { return ""; }
    }

    public String getTotal() {
        try { return getText(totalLocator); } catch (Exception e) { return ""; }
    }

    // ── Checkout ──────────────────────────────────────

    public void proceedToCheckout() {
        scrollToElement(checkoutBtn);
        click(checkoutBtn);
        waitForUrlContains("/checkout");
    }

    public void continueShopping() {
        click(continueShoppingLocator);
        waitForUrlContains("/products");
    }

    // ── Page State ────────────────────────────────────

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH)
            && (isCartEmpty() || getCartItemCount() > 0);
    }
}
