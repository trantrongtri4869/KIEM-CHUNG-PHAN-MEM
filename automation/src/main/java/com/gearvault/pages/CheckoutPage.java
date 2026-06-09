package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object cho trang Checkout (/checkout).
 * Dựa trên CheckoutPage.tsx.
 *
 * Steps: Shipping → Payment → Confirmation
 */
public class CheckoutPage extends BasePage {

    public static final String PATH = "/checkout";

    // ── Step Indicators ───────────────────────────────
    private final By currentStepLocator      = By.cssSelector("[class*='step'][class*='active'], [aria-current='step']");

    // ── Shipping Form ─────────────────────────────────
    @FindBy(css = "input[name='firstName'], input[placeholder*='First name'], input[placeholder*='first']")
    private WebElement firstNameInput;

    @FindBy(css = "input[name='lastName'], input[placeholder*='Last name'], input[placeholder*='last']")
    private WebElement lastNameInput;

    @FindBy(css = "input[name='email'], input[type='email']")
    private WebElement emailInput;

    @FindBy(css = "input[name='phone'], input[type='tel']")
    private WebElement phoneInput;

    @FindBy(css = "input[name='address'], input[placeholder*='address'], input[placeholder*='Address']")
    private WebElement addressInput;

    @FindBy(css = "input[name='city'], input[placeholder*='City']")
    private WebElement cityInput;

    @FindBy(css = "input[name='state'], input[placeholder*='State'], select[name='state']")
    private WebElement stateInput;

    @FindBy(css = "input[name='zipCode'], input[placeholder*='ZIP'], input[placeholder*='Postal']")
    private WebElement zipInput;

    // ── Payment Form ──────────────────────────────────
    @FindBy(css = "input[name='cardNumber'], input[placeholder*='Card number'], input[placeholder*='1234']")
    private WebElement cardNumberInput;

    @FindBy(css = "input[name='cardHolder'], input[placeholder*='Card holder'], input[placeholder*='Name on']")
    private WebElement cardHolderInput;

    @FindBy(css = "input[name='expiry'], input[placeholder*='MM/YY'], input[placeholder*='expiry']")
    private WebElement expiryInput;

    @FindBy(css = "input[name='cvv'], input[placeholder*='CVV'], input[placeholder*='CVC']")
    private WebElement cvvInput;

    // ── Buttons ───────────────────────────────────────
    private final By continueToPaymentBtnLocator = By.xpath(
        "//button[contains(normalize-space(),'Continue') and contains(normalize-space(),'Payment')]" +
        " | //button[contains(normalize-space(),'Next')]"
    );

    private final By placeOrderBtnLocator        = By.xpath(
        "//button[contains(normalize-space(),'Place Order') or contains(normalize-space(),'Confirm Order')]"
    );

    private final By backBtnLocator              = By.xpath("//button[contains(normalize-space(),'Back')]");

    // ── Order Confirmation ────────────────────────────
    private final By confirmationLocator         = By.xpath(
        "//*[contains(normalize-space(),'Order Confirmed') or contains(normalize-space(),'Thank you') or contains(normalize-space(),'order placed')]"
    );
    private final By orderNumberLocator          = By.cssSelector("[class*='order-number'], [class*='order-id']");

    // ── Validation errors ─────────────────────────────
    private final By fieldErrorLocator          = By.cssSelector("p.text-red-500, [class*='error-message']");

    // ── Loading ───────────────────────────────────────
    private final By spinnerLocator              = By.cssSelector("svg.animate-spin");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    // ── Shipping ──────────────────────────────────────

    public void fillShippingInfo(String firstName, String lastName, String email,
                                  String phone, String address, String city,
                                  String state, String zip) {
        type(firstNameInput, firstName);
        type(lastNameInput, lastName);
        type(emailInput, email);
        type(phoneInput, phone);
        type(addressInput, address);
        type(cityInput, city);
        type(stateInput, state);
        type(zipInput, zip);
    }

    public void clickContinueToPayment() {
        click(continueToPaymentBtnLocator);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    // ── Payment ───────────────────────────────────────

    public void fillPaymentInfo(String cardNumber, String cardHolder,
                                 String expiry, String cvv) {
        type(cardNumberInput, cardNumber);
        type(cardHolderInput, cardHolder);
        type(expiryInput, expiry);
        type(cvvInput, cvv);
    }

    public void clickPlaceOrder() {
        scrollToElement(placeOrderBtnLocator);
        click(placeOrderBtnLocator);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    public void clickBack() {
        click(backBtnLocator);
    }

    /**
     * Hoàn thành checkout đầy đủ từ bước 1.
     */
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
        } catch (Exception e) {
            return false;
        }
    }

    public String getOrderNumber() {
        try { return getText(orderNumberLocator); } catch (Exception e) { return ""; }
    }

    public boolean isFieldErrorDisplayed() {
        return isDisplayed(fieldErrorLocator);
    }

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH);
    }
}
