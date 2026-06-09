package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Page Object cho Navbar - xuất hiện trên tất cả trang.
 * Dựa trên Navbar.tsx: cart icon, search, dark mode toggle, user dropdown.
 */
public class NavbarComponent extends BasePage {

    // Logo
    @FindBy(css = "a[href='/']")
    private WebElement logoLink;

    // Navigation links
    @FindBy(linkText = "Shop")
    private WebElement shopLink;

    // Search
    @FindBy(css = "button[aria-label='search'], button svg.lucide-search")
    private WebElement searchButton;

    @FindBy(css = "input[placeholder*='Search'], input[type='search']")
    private WebElement searchInput;

    // Cart
    private final By cartButtonLocator = By.cssSelector("button[aria-label='cart'], button .lucide-shopping-cart");
    private final By cartBadgeLocator  = By.cssSelector("[data-testid='cart-count'], .cart-badge");

    // Wishlist
    private final By wishlistButtonLocator = By.cssSelector("a[href='/wishlist'], button .lucide-heart");

    // Dark mode toggle
    @FindBy(css = "button[aria-label='toggle dark mode'], button .lucide-moon, button .lucide-sun")
    private WebElement darkModeToggle;

    // User area
    private final By userAvatarLocator   = By.cssSelector("button[aria-label='user menu'], button .lucide-user");
    private final By userDropdownLocator = By.cssSelector("[data-testid='user-dropdown'], nav .dropdown-menu");
    private final By logoutBtnLocator    = By.xpath("//button[contains(normalize-space(),'Sign out') or contains(normalize-space(),'Logout')]");
    private final By dashboardLinkLocator = By.xpath("//a[contains(@href,'/dashboard')]");

    // Sign in / Register buttons (khi chưa login)
    private final By signInLinkLocator   = By.xpath("//a[contains(@href,'/login')]");

    public NavbarComponent(WebDriver driver) {
        super(driver);
    }

    public void clickShop() {
        click(By.linkText("Shop"));
        waitForUrlContains("/products");
    }

    public void clickCart() {
        click(cartButtonLocator);
    }

    public void clickWishlist() {
        click(wishlistButtonLocator);
        waitForUrlContains("/wishlist");
    }

    public void openSearch() {
        click(searchButton);
        waitForVisible(By.cssSelector("input[placeholder*='Search']"));
    }

    public void searchFor(String query) {
        openSearch();
        type(By.cssSelector("input[placeholder*='Search']"), query);
        searchInput.submit();
        waitForUrlContains("/products?search=");
    }

    public void toggleDarkMode() {
        click(darkModeToggle);
    }

    public void openUserDropdown() {
        click(userAvatarLocator);
        waitForVisible(userDropdownLocator);
    }

    public void logout() {
        openUserDropdown();
        click(logoutBtnLocator);
        waitForUrlContains("/");
    }

    public void goToDashboard() {
        openUserDropdown();
        click(dashboardLinkLocator);
        waitForUrlContains("/dashboard");
    }

    public boolean isUserLoggedIn() {
        // Nếu có user avatar button thì đang đăng nhập
        return isDisplayed(userAvatarLocator);
    }

    public boolean isSignInVisible() {
        return isDisplayed(signInLinkLocator);
    }

    public String getCartItemCount() {
        try {
            return getText(cartBadgeLocator);
        } catch (Exception e) {
            return "0";
        }
    }
}
