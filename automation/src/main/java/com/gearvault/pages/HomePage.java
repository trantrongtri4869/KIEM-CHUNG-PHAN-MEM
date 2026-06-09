package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

/**
 * Page Object cho trang chủ (/).
 * Dựa trên HomePage.tsx.
 *
 * Sections:
 * - Hero: headline, CTA buttons
 * - Flash Sale: countdown timer, product cards
 * - Featured Products
 * - Category grid
 * - Best Sellers
 * - Testimonials
 */
public class HomePage extends BasePage {

    public static final String PATH = "/";

    // ── Hero ──────────────────────────────────────────
    @FindBy(xpath = "//a[contains(@href,'/products') and contains(normalize-space(),'Shop Now')]")
    private WebElement shopNowBtn;

    @FindBy(xpath = "//a[contains(@href,'/products') and contains(normalize-space(),'View Deals')]")
    private WebElement viewDealsBtn;

    private final By heroHeadlineLocator = By.cssSelector("section h1");

    // ── Flash Sale ────────────────────────────────────
    private final By flashSaleSectionLocator  = By.xpath("//*[contains(normalize-space(),'Flash Sale') or contains(normalize-space(),'flash-sale')]");
    private final By countdownHoursLocator    = By.cssSelector("[class*='font-mono']");
    private final By flashSaleProductsLocator = By.cssSelector("section .card, section [class*='product']");

    // ── Products ──────────────────────────────────────
    private final By productCardLocator       = By.cssSelector("a.group.block[href*='/products'], [class*='product-card'], article.card, .card.group, [class*='ProductCard']");
    private final By addToCartBtnLocator      = By.xpath("//button[contains(normalize-space(),'Add to Cart') or contains(normalize-space(),'Add')]");

    // ── Categories ────────────────────────────────────
    private final By categoryCardLocator      = By.cssSelector("a[href*='category']");

    // ── Testimonials ──────────────────────────────────
    private final By testimonialLocator       = By.cssSelector("[class*='testimonial'], blockquote");

    // ── Features (Shipping, Warranty, etc.) ───────────
    private final By featureBannerLocator     = By.cssSelector("[class*='feature'], [class*='banner']");

    public HomePage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        navigateTo(baseUrl + PATH);
    }

    // ── Hero ──────────────────────────────────────────

    public void clickShopNow() {
        click(shopNowBtn);
        waitForUrlContains("/products");
    }

    public void clickViewDeals() {
        click(viewDealsBtn);
        waitForUrlContains("/products");
    }

    public String getHeroHeadline() {
        return getText(heroHeadlineLocator);
    }

    // ── Products ──────────────────────────────────────

    /**
     * Lấy danh sách tất cả product card hiển thị trên trang chủ.
     */
    public List<WebElement> getProductCards() {
        return wait.waitForMinimumElements(productCardLocator, 1);
    }

    /**
     * Click "Add to Cart" của product card đầu tiên.
     */
    public void addFirstProductToCart() {
        List<WebElement> addBtns = wait.waitForMinimumElements(addToCartBtnLocator, 1);
        click(addBtns.get(0));
    }

    /**
     * Click vào product card theo index (0-based).
     */
    public void clickProductCard(int index) {
        List<WebElement> cards = getProductCards();
        if (index >= cards.size()) {
            throw new IndexOutOfBoundsException("Chỉ có " + cards.size() + " product cards, index=" + index);
        }
        scrollToElement(cards.get(index));
        click(cards.get(index));
    }

    // ── Categories ────────────────────────────────────

    public List<WebElement> getCategoryCards() {
        return wait.waitForAllVisible(categoryCardLocator);
    }

    /**
     * Click vào category theo tên (case-insensitive).
     */
    public void clickCategory(String categoryName) {
        By locator = By.xpath(
            "//a[contains(@href,'category') and contains(translate(normalize-space(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'"
            + categoryName.toLowerCase() + "')]"
        );
        scrollToElement(locator);
        click(locator);
        waitForUrlContains("category=" + categoryName.toLowerCase().replace(" ", "-"));
    }

    // ── Flash Sale ────────────────────────────────────

    public boolean isFlashSaleSectionVisible() {
        return isDisplayed(flashSaleSectionLocator);
    }

    /**
     * Kiểm tra countdown timer đang đếm ngược (có text dạng số).
     */
    public boolean isCountdownVisible() {
        try {
            List<WebElement> timers = wait.waitForMinimumElements(countdownHoursLocator, 1);
            return timers.stream().anyMatch(el -> el.getText().matches("\\d+"));
        } catch (Exception e) {
            return false;
        }
    }

    // ── Page state ────────────────────────────────────

    public boolean isPageLoaded() {
        return isDisplayed(heroHeadlineLocator);
    }

    public int getProductCardCount() {
        return findElements(productCardLocator).size();
    }
}
