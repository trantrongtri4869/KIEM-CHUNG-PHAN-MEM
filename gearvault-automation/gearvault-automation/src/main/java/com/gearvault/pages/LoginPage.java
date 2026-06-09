package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object cho trang Login (/login).
 * Dựa trên LoginPage trong AuthPages.tsx.
 *
 * Locators:
 * - Email input: type="email", placeholder="you@example.com"
 * - Password input: type="password", placeholder="••••••••"
 * - Demo User button: "👤 Demo User"
 * - Demo Admin button: "⚡ Demo Admin"
 * - Submit button: "Sign In"
 * - Error message: red alert box
 * - Forgot password link
 * - Register link
 */
public class LoginPage extends BasePage {

    // URL
    public static final String PATH = "/login";

    // Inputs
    @FindBy(css = "input[type='email']")
    private WebElement emailInput;

    @FindBy(css = "input[type='password']")
    private WebElement passwordInput;

    // Buttons
    @FindBy(xpath = "//button[contains(normalize-space(),'Demo User')]")
    private WebElement demoUserBtn;

    @FindBy(xpath = "//button[contains(normalize-space(),'Demo Admin')]")
    private WebElement demoAdminBtn;

    @FindBy(xpath = "//button[@type='submit']")
    private WebElement signInBtn;

    // Toggle password visibility
    @FindBy(css = "button[type='button'] svg.lucide-eye, button[type='button'] svg.lucide-eye-off")
    private WebElement passwordToggleBtn;

    // Links
    @FindBy(xpath = "//a[contains(@href,'/forgot-password')]")
    private WebElement forgotPasswordLink;

    @FindBy(xpath = "//a[contains(@href,'/register')]")
    private WebElement registerLink;

    // Error message
    private final By errorMessageLocator = By.cssSelector(".text-red-700, .text-red-400, [class*='bg-red']");

    // Loading spinner
    private final By spinnerLocator = By.cssSelector("svg.animate-spin");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    /**
     * Điền email + password và nhấn Sign In.
     * Chờ loading spinner biến mất trước khi trả về.
     */
    public void login(String email, String password) {
        type(emailInput, email);
        type(passwordInput, password);
        click(signInBtn);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    /**
     * Đăng nhập và chờ redirect về trang đích.
     */
    public void loginAndWaitForRedirect(String email, String password, String expectedUrlPart) {
        login(email, password);
        waitForUrlContains(expectedUrlPart);
    }

    /**
     * Click nút Demo User để tự động điền credentials.
     */
    public void clickDemoUser() {
        click(demoUserBtn);
    }

    /**
     * Click nút Demo Admin để tự động điền credentials.
     */
    public void clickDemoAdmin() {
        click(demoAdminBtn);
    }

    /**
     * Đăng nhập bằng Demo User (1 click).
     */
    public void loginAsDemoUser() {
        clickDemoUser();
        click(signInBtn);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    /**
     * Đăng nhập bằng Demo Admin (1 click).
     */
    public void loginAsDemoAdmin() {
        clickDemoAdmin();
        click(signInBtn);
        wait.waitForSpinnerToDisappear(spinnerLocator);
    }

    public void togglePasswordVisibility() {
        click(By.cssSelector("button[type='button']:has(svg)"));
    }

    public void clickForgotPassword() {
        click(forgotPasswordLink);
    }

    public void clickRegister() {
        click(registerLink);
        waitForUrlContains("/register");
    }

    // =============================================
    // Assertions helpers
    // =============================================

    public boolean isErrorDisplayed() {
        return isDisplayed(errorMessageLocator);
    }

    public String getErrorMessage() {
        return getText(errorMessageLocator);
    }

    public boolean isSignInButtonEnabled() {
        return isEnabled(By.cssSelector("button[type='submit']"));
    }

    public boolean isLoading() {
        return isDisplayed(spinnerLocator);
    }

    public String getEmailInputValue() {
        return getAttribute(By.cssSelector("input[type='email']"), "value");
    }

    public String getPasswordInputType() {
        return getAttribute(By.cssSelector("input[type='password'], input[type='text'][placeholder='••••••••']"), "type");
    }

    /**
     * Kiểm tra trang login đã load chưa - có title "Welcome back"
     */
    public boolean isPageLoaded() {
        return isDisplayed(By.xpath("//h1[contains(text(),'Welcome back')]"));
    }
}
