package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import java.util.List;

/**
 * Checkout Page — fix dựa trên console output:
 *
 * Shipping fields (name có):
 *   fullName, email, phone, address, city, state, zipCode, country(select)
 *
 * Payment fields (name="" — rỗng, chỉ dùng placeholder):
 *   placeholder="4242 4242 4242 4242"  → card number
 *   placeholder="12/28"                → expiry
 *   placeholder="123"                  → CVV
 *   KHÔNG CÓ cardHolder field
 *   radio name="payment"               → chọn phương thức (Credit Card mặc định)
 */
public class CheckoutPage extends BasePage {

    public static final String PATH = "/checkout";

    // ── Shipping Form ─────────────────────────────────
    @FindBy(css = "input[name='fullName']")
    private WebElement fullNameInput;

    @FindBy(css = "input[name='email']")
    private WebElement emailInput;

    @FindBy(css = "input[name='phone']")
    private WebElement phoneInput;

    @FindBy(css = "input[name='address']")
    private WebElement addressInput;

    @FindBy(css = "input[name='city']")
    private WebElement cityInput;

    @FindBy(css = "input[name='state']")
    private WebElement stateInput;

    @FindBy(css = "input[name='zipCode']")
    private WebElement zipCodeInput;

    // ── Payment Form ──────────────────────────────────
    // Console xác nhận: tất cả name="" → chỉ dùng placeholder
    // placeholder="4242 4242 4242 4242"
    @FindBy(css = "input[placeholder='4242 4242 4242 4242']")
    private WebElement cardNumberInput;

    // placeholder="12/28"
    @FindBy(css = "input[placeholder='12/28']")
    private WebElement expiryInput;

    // placeholder="123" type=password
    @FindBy(css = "input[placeholder='123']")
    private WebElement cvvInput;

    // Payment method radio — name="payment", Credit Card là mặc định (index 0)
    private final By creditCardRadioLocator = By.xpath(
        "//input[@type='radio' and @name='payment'][1] | " +
        "//input[@type='radio' and @value='credit']"
    );

    // ── Buttons ───────────────────────────────────────
    private final By continueToPaymentBtnLocator = By.xpath(
        "//button[normalize-space()='Continue to Payment']"
    );

    private final By reviewOrderBtnLocator = By.xpath(
        "//button[normalize-space()='Review Order']"
    );

    private final By placeOrderBtnLocator = By.xpath(
        "//button[contains(normalize-space(),'Place Order')]"
    );

    private final By backBtnLocator = By.xpath(
        "//button[contains(normalize-space(),'Back')]"
    );

    // ── Confirmation ──────────────────────────────────
    private final By confirmationLocator = By.xpath(
        "//*[contains(normalize-space(),'Order Confirmed') or contains(normalize-space(),'Thank you')] | " +
        "//a[normalize-space()='Shop More']"
    );

    private final By orderNumberLocator = By.cssSelector(
        "[class*='order-number'], [class*='order-id'], [class*='orderId']"
    );

    // ── Validation errors ─────────────────────────────
    private final By fieldErrorLocator = By.cssSelector(
        "p.text-red-500, .text-red-500, [class*='error-message'], .text-destructive"
    );

    private final By spinnerLocator = By.cssSelector("svg.animate-spin");

    // ── Order Summary ─────────────────────────────────
    private final By orderSummaryLocator = By.xpath("//*[normalize-space()='Order Summary']");
    private final By subtotalLocator = By.xpath("//*[contains(normalize-space(),'Subtotal')]");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    // ── Shipping ──────────────────────────────────────

    public void fillShippingInfo(String firstName, String lastName, String email,
                                  String phone, String address, String city,
                                  String state, String zip) {
        type(fullNameInput, firstName + " " + lastName);
        type(emailInput, email);
        type(phoneInput, phone);
        type(addressInput, address);
        type(cityInput, city);
        type(stateInput, state);
        type(zipCodeInput, zip);
    }

    public void clickContinueToPayment() {
        scrollToElement(continueToPaymentBtnLocator);
        click(continueToPaymentBtnLocator);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    // ── Payment ───────────────────────────────────────

    /**
     * Điền payment form.
     * Console: card number placeholder="4242 4242 4242 4242", expiry="12/28", cvv="123"
     * KHÔNG có cardHolder field → bỏ qua tham số cardHolder
     * Dùng safeFill vì các field này có thể dùng input masking
     */
    public void fillPaymentInfo(String cardNumber, String cardHolder,
                                 String expiry, String cvv) {
        // Đảm bảo Credit Card đang được chọn
        try {
            click(creditCardRadioLocator);
        } catch (Exception ignored) {}

        safeFill(cardNumberInput, cardNumber);
        // cardHolder field không tồn tại trong app → bỏ qua
        safeFill(expiryInput, expiry);
        safeFill(cvvInput, cvv);
    }

    /**
     * Safe fill cho masked/formatted input fields.
     * Thử clear() trước, nếu fail dùng Ctrl+A → type
     */
    private void safeFill(WebElement element, String value) {
        try {
            wait.waitForVisible(element);
            element.click();
            element.sendKeys(Keys.CONTROL + "a");
            element.sendKeys(Keys.DELETE);
            element.sendKeys(value);
        } catch (Exception e) {
            try {
                ((JavascriptExecutor) driver)
                    .executeScript("arguments[0].value='';", element);
                element.sendKeys(value);
            } catch (Exception ignored) {}
        }
    }

    public void clickPlaceOrder() {
        // Bước Review Order nếu có
        try {
            if (isDisplayed(reviewOrderBtnLocator)) {
                scrollToElement(reviewOrderBtnLocator);
                click(reviewOrderBtnLocator);
                wait.waitForSpinnerToDisappear(spinnerLocator);
            }
        } catch (Exception ignored) {}

        scrollToElement(placeOrderBtnLocator);
        click(placeOrderBtnLocator);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    public void clickBack() {
        click(backBtnLocator);
    }

    public void completeCheckout(String firstName, String lastName, String email,
                                  String phone, String address, String city,
                                  String state, String zip,
                                  String cardNumber, String cardHolder,
                                  String expiry, String cvv) {
        fillShippingInfo(firstName, lastName, email, phone, address, city, state, zip);
        clickContinueToPayment();
        fillPaymentInfo(cardNumber, cardHolder, expiry, cvv);
        clickPlaceOrder();
    }

    // ── Assertions ────────────────────────────────────

    public boolean isOrderConfirmed() {
        try {
            return wait.waitForVisible(confirmationLocator).isDisplayed();
        } catch (Exception e) { return false; }
    }

    public String getOrderNumber() {
        try { return getText(orderNumberLocator); } catch (Exception e) { return ""; }
    }

    public boolean isFieldErrorDisplayed() {
        // Check p.text-red-500 trước
        if (isDisplayed(fieldErrorLocator)) return true;
        // Check HTML5 native validation (input:invalid)
        try {
            List<org.openqa.selenium.WebElement> invalidInputs = driver.findElements(
                By.cssSelector("input:invalid, select:invalid")
            );
            if (!invalidInputs.isEmpty()) return true;
        } catch (Exception ignored) {}
        // Check browser validation message via JS
        try {
            Object result = ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript(
                    "return [...document.querySelectorAll('input,select')].some(el => !el.validity.valid)"
                );
            if (Boolean.TRUE.equals(result)) return true;
        } catch (Exception ignored) {}
        return false;
    }

    public boolean isOrderSummaryDisplayed() {
        return isDisplayed(orderSummaryLocator);
    }

    public boolean isSubtotalDisplayed() {
        return isDisplayed(subtotalLocator);
    }

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH);
    }
}
