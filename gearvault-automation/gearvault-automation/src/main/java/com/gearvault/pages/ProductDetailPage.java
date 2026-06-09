package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

/**
 * Page Object cho trang Product Detail (/products/:slug).
 * Dựa trên ProductDetailPage.tsx.
 *
 * Sections:
 * - Breadcrumb
 * - Image gallery (main + thumbnails)
 * - Product info: name, price, rating, stock, brand
 * - Quantity selector
 * - Add to Cart / Buy Now / Wishlist buttons
 * - Tabs: Overview | Specs | Reviews
 * - Review form (khi đã login)
 * - Related products
 */
public class ProductDetailPage extends BasePage {

    // ── Breadcrumb ────────────────────────────────────
    private final By breadcrumbLocator        = By.cssSelector("nav[aria-label='breadcrumb'] a, nav.flex a");

    // ── Image Gallery ─────────────────────────────────
    private final By mainImageLocator         = By.cssSelector(".img-zoom-container img");
    private final By thumbnailLocator         = By.cssSelector(".w-20.h-20.rounded-xl button img");

    // ── Product Info ──────────────────────────────────
    private final By productNameLocator       = By.cssSelector("h1.text-3xl");
    private final By priceLocator             = By.xpath("//p[contains(@class,'text-3xl') or contains(@class,'font-bold')]");
    private final By originalPriceLocator     = By.cssSelector("span.line-through");
    private final By discountBadgeLocator     = By.cssSelector(".badge.bg-red-500");
    private final By stockStatusLocator       = By.xpath("//*[contains(normalize-space(),'In Stock') or contains(normalize-space(),'Out of Stock') or contains(normalize-space(),'stock')]");
    private final By ratingLocator            = By.cssSelector(".flex.items-center span");

    // ── Quantity ──────────────────────────────────────
    private final By minusBtnLocator          = By.xpath("//button[.//svg[contains(@class, 'lucide-minus')]]");
    private final By plusBtnLocator           = By.xpath("//button[.//svg[contains(@class, 'lucide-plus')]]");
    private final By quantityDisplayLocator   = By.xpath("//input[@type='number']");

    // ── Action Buttons ────────────────────────────────
    @FindBy(xpath = "//button[contains(normalize-space(),'Add to Cart')]")
    private WebElement addToCartBtn;

    @FindBy(xpath = "//button[contains(normalize-space(),'Buy Now')]")
    private WebElement buyNowBtn;

    @FindBy(xpath = "//button[.//svg[contains(@class, 'lucide-heart')]]")
    private WebElement wishlistBtn;

    // ── Tabs ──────────────────────────────────────────
    @FindBy(xpath = "//button[contains(normalize-space(),'Overview')]")
    private WebElement overviewTab;

    @FindBy(xpath = "//button[contains(normalize-space(),'Specs')]")
    private WebElement specsTab;

    @FindBy(xpath = "//button[contains(normalize-space(),'Reviews')]")
    private WebElement reviewsTab;

    // ── Review Form ───────────────────────────────────
    private final By reviewTextareaLocator    = By.cssSelector("textarea");
    private final By submitReviewBtnLocator   = By.xpath("//button[@type='submit']");

    // ── Related Products ──────────────────────────────
    private final By relatedProductLocator    = By.cssSelector("a.group.block");

    // ── Toast / Notification ──────────────────────────
    private final By toastLocator             = By.xpath("//*[contains(@class, 'hot-toast') or contains(@class, 'toast')]");

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    // ── Image Gallery ─────────────────────────────────

    public void clickThumbnail(int index) {
        List<WebElement> thumbs = wait.waitForMinimumElements(thumbnailLocator, 1);
        if (index < thumbs.size()) {
            click(thumbs.get(index));
        }
    }

    // ── Product Info ──────────────────────────────────

    public String getProductName() {
        return getText(productNameLocator);
    }

    public String getPrice() {
        return getText(priceLocator);
    }

    public boolean hasDiscount() {
        return isDisplayed(discountBadgeLocator) || isDisplayed(originalPriceLocator);
    }

    public boolean isInStock() {
        try {
            String stockText = getText(stockStatusLocator);
            return stockText.toLowerCase().contains("in stock");
        } catch (Exception e) {
            return true;
        }
    }

    // ── Quantity ──────────────────────────────────────

    public void increaseQuantity(int times) {
        for (int i = 0; i < times; i++) {
            click(plusBtnLocator);
        }
    }

    public void decreaseQuantity(int times) {
        for (int i = 0; i < times; i++) {
            click(minusBtnLocator);
        }
    }

    public int getQuantity() {
        try {
            WebElement quantityInput = driver.findElement(quantityDisplayLocator);
            String value = quantityInput.getAttribute("value");
            return value != null && !value.isEmpty() ? Integer.parseInt(value) : 1;
        } catch (Exception e) {
            return 1;
        }
    }

    // ── Action Buttons ────────────────────────────────

    public void clickAddToCart() {
        scrollToElement(addToCartBtn);
        click(addToCartBtn);
        // Chờ toast notification xuất hiện
        wait.waitForVisible(toastLocator);
    }

    public void clickBuyNow() {
        scrollToElement(buyNowBtn);
        click(buyNowBtn);
        waitForUrlContains("/checkout");
    }

    public void clickWishlist() {
        scrollToElement(wishlistBtn);
        click(wishlistBtn);
    }

    public boolean isAddToCartEnabled() {
        return isEnabled(By.xpath("//button[contains(normalize-space(),'Add to Cart')]"));
    }

    public boolean isWishlistActive() {
        String classes = wishlistBtn.getAttribute("class");
        return classes != null && (classes.contains("text-red") || classes.contains("fill-red"));
    }

    // ── Tabs ──────────────────────────────────────────

    public void clickOverviewTab() {
        click(overviewTab);
    }

    public void clickSpecsTab() {
        click(specsTab);
        waitForVisible(By.xpath("//table | //*[contains(@class,'specs')]"));
    }

    public void clickReviewsTab() {
        click(reviewsTab);
    }

    // ── Review Form ───────────────────────────────────

    public void writeReview(int starRating, String reviewText) {
        clickReviewsTab();
        // Click star rating (1-5)
        By starLocator = By.cssSelector(
            "[class*='star-rating'] button:nth-child(" + starRating + "), " +
            "button[data-rating='" + starRating + "']"
        );
        if (isDisplayed(starLocator)) {
            click(starLocator);
        }
        type(reviewTextareaLocator, reviewText);
        click(submitReviewBtnLocator);
    }

    public boolean isReviewFormVisible() {
        return isDisplayed(reviewTextareaLocator);
    }

    // ── Related Products ──────────────────────────────

    public int getRelatedProductCount() {
        try {
            return wait.waitForMinimumElements(relatedProductLocator, 1).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public void clickFirstRelatedProduct() {
        List<WebElement> related = wait.waitForMinimumElements(relatedProductLocator, 1);
        scrollToElement(related.get(0));
        click(related.get(0));
    }

    // ── Page State ────────────────────────────────────

    public boolean isPageLoaded() {
        return isDisplayed(By.cssSelector("h1")) && getCurrentUrl().contains("/products/");
    }

    public String getToastMessage() {
        return getText(toastLocator);
    }
}
