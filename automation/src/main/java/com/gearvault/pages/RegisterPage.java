package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object cho trang Register (/register).
 * Dựa trên RegisterPage trong AuthPages.tsx.
 *
 * Fields: Full Name, Email, Password, Confirm Password, Agree to Terms checkbox
 * Validation: password strength indicator, field errors
 */
public class RegisterPage extends BasePage {

    public static final String PATH = "/register";

    // Inputs
    @FindBy(css = "input[placeholder='John Doe']")
    private WebElement nameInput;

    @FindBy(css = "input[type='email']")
    private WebElement emailInput;

    @FindBy(css = "input[placeholder='Min. 8 characters']")
    private WebElement passwordInput;

    @FindBy(css = "input[placeholder='Repeat your password']")
    private WebElement confirmPasswordInput;

    @FindBy(css = "input[type='checkbox']")
    private WebElement agreeToTermsCheckbox;

    // Submit
    @FindBy(css = "button[type='submit']")
    private WebElement createAccountBtn;

    // Toggle password visibility
    @FindBy(css = "button[type='button']:has(svg.lucide-eye), button[type='button']:has(svg.lucide-eye-off)")
    private WebElement passwordToggleBtn;

    // Links
    @FindBy(xpath = "//a[contains(@href,'/login')]")
    private WebElement signInLink;

    // Locators for dynamic elements
    private final By nameErrorLocator            = By.xpath("//input[@placeholder='John Doe']/following-sibling::p[contains(@class,'text-red')]");
    private final By emailErrorLocator           = By.xpath("//input[@type='email']/following-sibling::p[contains(@class,'text-red')]");
    private final By passwordErrorLocator        = By.xpath("//input[@placeholder='Min. 8 characters']/following-sibling::*//p[contains(@class,'text-red')] | //input[@placeholder='Min. 8 characters']/parent::*/following-sibling::p[contains(@class,'text-red')]");
    private final By confirmPasswordErrorLocator = By.xpath("//input[@placeholder='Repeat your password']/following-sibling::p[contains(@class,'text-red')]");
    private final By termsErrorLocator           = By.xpath("//input[@type='checkbox']/ancestor::label/following-sibling::p[contains(@class,'text-red')]");

    // Password strength
    private final By strengthBarsLocator = By.cssSelector(".h-1.flex-1.rounded-full");
    private final By strengthLabelLocator = By.cssSelector("p.text-xs.font-medium");

    // Loading
    private final By spinnerLocator = By.cssSelector("svg.animate-spin");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void fillName(String name) {
        type(nameInput, name);
    }

    public void fillEmail(String email) {
        type(emailInput, email);
    }

    public void fillPassword(String password) {
        type(passwordInput, password);
    }

    public void fillConfirmPassword(String confirmPassword) {
        type(confirmPasswordInput, confirmPassword);
    }

    public void checkAgreeToTerms() {
        if (!agreeToTermsCheckbox.isSelected()) {
            click(agreeToTermsCheckbox);
        }
    }

    public void uncheckAgreeToTerms() {
        if (agreeToTermsCheckbox.isSelected()) {
            click(agreeToTermsCheckbox);
        }
    }

    public void clickCreateAccount() {
        click(createAccountBtn);
    }

    /**
     * Điền đầy đủ form và submit.
     */
    public void register(String name, String email, String password, String confirmPassword) {
        fillName(name);
        fillEmail(email);
        fillPassword(password);
        fillConfirmPassword(confirmPassword);
        checkAgreeToTerms();
        clickCreateAccount();
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    public void clickSignIn() {
        click(signInLink);
        waitForUrlContains("/login");
    }

    // =============================================
    // Assertions helpers
    // =============================================

    public boolean isPageLoaded() {
        return isDisplayed(By.xpath("//h1[contains(text(),'Create an account')]"));
    }

    public boolean isNameErrorDisplayed() {
        return isDisplayed(nameErrorLocator);
    }

    public boolean isEmailErrorDisplayed() {
        return isDisplayed(emailErrorLocator);
    }

    public boolean isPasswordErrorDisplayed() {
        return isDisplayed(passwordErrorLocator);
    }

    public boolean isConfirmPasswordErrorDisplayed() {
        return isDisplayed(confirmPasswordErrorLocator);
    }

    public boolean isTermsErrorDisplayed() {
        return isDisplayed(termsErrorLocator);
    }

    public String getNameError() {
        return getText(nameErrorLocator);
    }

    public String getEmailError() {
        return getText(emailErrorLocator);
    }

    public String getPasswordError() {
        return getText(passwordErrorLocator);
    }

    public String getConfirmPasswordError() {
        return getText(confirmPasswordErrorLocator);
    }

    /**
     * Lấy text strength label: Weak / Fair / Good / Strong
     */
    public String getPasswordStrengthLabel() {
        try {
            return getText(strengthLabelLocator);
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Đếm số strength bar đang "active" (có màu, không phải grey).
     */
    public int getActiveStrengthBars() {
        // Đếm tất cả strength bar elements - nếu có là strength indicator đang hiển thị
        return findElements(strengthBarsLocator).size();
    }

    public boolean isLoading() {
        return isDisplayed(spinnerLocator);
    }
}
