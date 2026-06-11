package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

public class ProductDetailPage extends BasePage {

    @FindBy(css = "h1")
    private WebElement productNameHeading;

    private final By priceLocator = By.xpath(
        "//*[contains(@class,'text-3xl') or contains(@class,'font-bold')][contains(normalize-space(),'$')] | " +
        "//span[contains(@class,'text-brand')]"
    );

    private final By stockStatusLocator = By.xpath(
        "//*[contains(normalize-space(),'In Stock') or contains(normalize-space(),'Out of Stock')]"
    );

    private final By discountBadgeLocator = By.cssSelector("span[class*='bg-red'], span[class*='discount']");
    private final By originalPriceLocator = By.cssSelector("span.line-through");

    // Quantity buttons — console xác nhận: CLASS "w-10 h-10 flex items-center justify-center..."
    // Có 3 nút w-10: [close button (absolute top-4)][minus][plus]
    // → loại trừ nút absolute (close/back) bằng :not([class*='absolute'])
    private final By quantityBtnsLocator = By.cssSelector(
        "button.w-10.h-10:not([class*='absolute'])"
    );

    // Quantity display — span chứa số lượng (text = "1", "2", ...)
    private final By quantityDisplayLocator = By.cssSelector(
        "span.w-8, span.font-semibold.w-8, span.text-center.w-8"
    );

    @FindBy(xpath = "//button[contains(normalize-space(),'Add to Cart') or contains(normalize-space(),'Add To Cart')]")
    private WebElement addToCartBtn;

    @FindBy(xpath = "//button[contains(normalize-space(),'Buy Now')]")
    private WebElement buyNowBtn;

    @FindBy(css = "button:has(svg.lucide-heart)")
    private WebElement wishlistBtn;

    private final By overviewTabLocator = By.xpath("//button[contains(normalize-space(),'overview') or contains(normalize-space(),'Overview')]");
    private final By specsTabLocator    = By.xpath("//button[contains(normalize-space(),'specs') or contains(normalize-space(),'Specs')]");
    private final By reviewsTabLocator  = By.xpath("//button[contains(normalize-space(),'reviews') or contains(normalize-space(),'Reviews')]");

    private final By toastLocator = By.xpath(
        "//*[contains(normalize-space(),'added to cart') or contains(normalize-space(),'Added to cart')]"
    );

    private final By relatedProductLocator = By.cssSelector("[class*='related'] a, [class*='related'] article");

    public ProductDetailPage(WebDriver driver) {
        super(driver);
    }

    public String getProductName() {
        return getText(productNameHeading);
    }

    public String getPrice() {
        waitForVisible(priceLocator);
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

    /**
     * Lấy quantity buttons, loại trừ nút close (có class 'absolute').
     * Selenium CSS :not() không hỗ trợ class substring → dùng Java filter.
     */
    private List<WebElement> getQuantityButtons() {
        List<WebElement> all = findElements(By.cssSelector("button.w-10.h-10"));
        List<WebElement> filtered = new java.util.ArrayList<>();
        for (WebElement btn : all) {
            String cls = btn.getAttribute("class");
            if (cls != null && !cls.contains("absolute")) {
                filtered.add(btn);
            }
        }
        return filtered;
    }

    public void increaseQuantity(int times) {
        for (int i = 0; i < times; i++) {
            List<WebElement> btns = getQuantityButtons();
            if (btns.size() >= 2) {
                click(btns.get(1)); // index 1 = nút +
                try { Thread.sleep(300); } catch (InterruptedException ignored) {}
            }
        }
    }

    public void decreaseQuantity(int times) {
        for (int i = 0; i < times; i++) {
            List<WebElement> btns = getQuantityButtons();
            if (!btns.isEmpty()) {
                click(btns.get(0)); // index 0 = nút -
                try { Thread.sleep(300); } catch (InterruptedException ignored) {}
            }
        }
    }

    public int getQuantity() {
        try {
            return Integer.parseInt(getText(quantityDisplayLocator).trim());
        } catch (Exception e) {
            return 1;
        }
    }

    public void clickAddToCart() {
        scrollToElement(addToCartBtn);
        click(addToCartBtn);
        waitForVisible(toastLocator);
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

    public void clickOverviewTab() { click(overviewTabLocator); }

    public void clickSpecsTab() {
        click(specsTabLocator);
        waitForVisible(By.cssSelector("table, [class*='specs']"));
    }

    public void clickReviewsTab() { click(reviewsTabLocator); }

    public boolean isPageLoaded() {
        return isDisplayed(By.cssSelector("h1")) && getCurrentUrl().contains("/products/");
    }

    public String getToastMessage() {
        waitForVisible(toastLocator);
        return getText(toastLocator);
    }

    public int getRelatedProductCount() {
        try {
            return wait.waitForMinimumElements(relatedProductLocator, 1).size();
        } catch (Exception e) {
            return 0;
        }
    }
}
