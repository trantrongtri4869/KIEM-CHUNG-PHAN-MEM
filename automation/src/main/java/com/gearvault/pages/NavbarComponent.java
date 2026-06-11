package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.Keys;

public class NavbarComponent extends BasePage {

    // Logo — codegen: page.getByRole('banner').getByRole('link', { name: 'GearVault' })
    private final By logoLocator = By.xpath(
        "//header[@role='banner']//a[normalize-space()='GearVault'] | //nav//a[normalize-space()='GearVault']"
    );

    // Shop link — codegen: page.getByRole('link', { name: 'Shop', exact: true })
    private final By shopLinkLocator = By.xpath(
        "//header//a[normalize-space()='Shop'] | //nav//a[normalize-space()='Shop']"
    );

    // Cart button — codegen: page.getByRole('button', { name: 'Cart' })
    // Console: TEXT: "9+" | CLASS: btn-ghost p-2.5 rounded-xl relative
    // Cart button navigate → dùng link /cart thay vì button (button mở drawer)
    private final By cartBtnLocator = By.xpath(
        "//button[normalize-space()='Cart' or @aria-label='Cart']"
    );
    private final By cartLinkLocator = By.xpath(
        "//a[contains(@href,'/cart')] | //a[normalize-space()='Cart']"
    );

    // User avatar button — Console: TEXT: "A" | CLASS: btn-ghost p-1 rounded-xl flex items-center gap-1
    private final By userAvatarLocator = By.cssSelector(
        "button.btn-ghost.p-1.rounded-xl"
    );

    // Sign Out — xuất hiện trong dropdown sau khi click avatar
    private final By signOutBtnLocator = By.xpath(
        "//button[normalize-space()='Sign Out']"
    );

    // Sign In link — visible khi chưa login
    private final By signInLinkLocator = By.xpath(
        "//a[normalize-space()='Sign In' or normalize-space()='Sign in'] | //header//a[contains(@href,'/login')]"
    );

    // Search button — icon kính lúp, mở overlay
    private final By searchBtnLocator = By.xpath(
        "//button[@aria-label='Search' or normalize-space()='Search']"
    );

    // Search input — chỉ visible SAU khi click Search button
    private final By searchInputLocator = By.xpath(
        "//input[contains(@placeholder,'Search for gaming') or contains(@placeholder,'Search products')]"
    );

    public NavbarComponent(WebDriver driver) {
        super(driver);
    }

    public void clickLogo() {
        click(logoLocator);
    }

    public void clickShop() {
        click(shopLinkLocator);
        waitForUrlContains("/products");
    }

    /**
     * Cart button trong navbar MỞ DRAWER, không navigate đến /cart.
     * Để navigate đến /cart, dùng navigateToCart().
     */
    public void clickCart() {
        click(cartBtnLocator);
    }

    /**
     * Navigate trực tiếp đến /cart bằng URL.
     * Dùng cho test cần assert URL = /cart.
     */
    public void navigateToCart(String baseUrl) {
        driver.get(baseUrl + "/cart");
        waitForUrlContains("/cart");
    }

    public void logout() {
        // Avatar button: CSS selector chính xác từ console
        click(userAvatarLocator);
        waitForVisible(signOutBtnLocator);
        click(signOutBtnLocator);
    }

    public boolean isUserLoggedIn() {
        try {
            return !isDisplayed(signInLinkLocator);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSignInVisible() {
        return isDisplayed(signInLinkLocator);
    }

    public String getCartItemCount() {
        try {
            // Console: TEXT: "9+" | CLASS: btn-ghost p-2.5 rounded-xl relative
            By badgeLocator = By.cssSelector("button.btn-ghost.rounded-xl.relative span");
            return getText(badgeLocator);
        } catch (Exception e) {
            return "0";
        }
    }

    public void searchFor(String query) {
        click(searchBtnLocator);
        waitForVisible(searchInputLocator);
        type(searchInputLocator, query);
        driver.findElement(searchInputLocator).sendKeys(Keys.ENTER);
        waitForUrlContains("/products");
    }
}
