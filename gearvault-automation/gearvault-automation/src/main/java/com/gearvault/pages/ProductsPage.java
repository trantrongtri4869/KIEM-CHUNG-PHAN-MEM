package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

/**
 * Page Object cho trang Products (/products).
 * Dựa trên ProductsPage.tsx.
 *
 * Features:
 * - Search bar (local search trong trang)
 * - Filter sidebar: category, brand, price range, rating
 * - Sort dropdown
 * - Grid / List view toggle
 * - Product cards
 */
public class ProductsPage extends BasePage {

    public static final String PATH = "/products";

    // ── Search ────────────────────────────────────────
    @FindBy(css = "input[placeholder*='Search'], input[type='search']")
    private WebElement searchInput;
    private final By searchToggleBtnLocator = By.cssSelector("button[aria-label='Search'], button[aria-label*='search']");
    private final By searchFieldLocator = By.cssSelector("input[placeholder*='Search'], input[type='search']");

    // ── Sort ──────────────────────────────────────────
    private final By sortDropdownLocator = By.cssSelector("select, [class*='sort'] button, button[class*='ChevronDown']");
    private final By sortOptionLocator   = By.cssSelector("[role='option'], option");

    // ── Filter Sidebar ────────────────────────────────
    private final By filterToggleBtnLocator  = By.cssSelector("button[class*='filter'], button:has(svg.lucide-sliders-horizontal), button:has(svg.lucide-filter)");
    private final By sidebarLocator          = By.cssSelector("aside, [class*='sidebar'], [class*='filter-panel']");

    // Category checkboxes/buttons
    private final By categoryFilterLocator   = By.xpath("//span[contains(text(),'Headsets') or contains(text(),'Mice') or contains(text(),'Keyboards') or contains(text(),'Monitors')]/preceding-sibling::input[@type='checkbox']");

    // Brand checkboxes
    private final By brandCheckboxLocator    = By.xpath("//input[@type='checkbox'][ancestor::*[contains(@class,'brand') or contains(@class,'Brand')]]");

    // Price range
    private final By priceRangeLocator       = By.cssSelector("input[type='radio'][name='price'], button[class*='price']");

    // Rating filter
    private final By ratingFilterLocator     = By.cssSelector("[class*='rating'] button, button[class*='star']");

    // Clear filters
    private final By clearFiltersLocator     = By.xpath("//button[contains(normalize-space(),'Clear') or contains(normalize-space(),'Reset')]");

    // ── View Toggle ───────────────────────────────────
    private final By gridViewBtnLocator      = By.cssSelector("button:has(svg.lucide-grid2x2), button[aria-label*='grid']");
    private final By listViewBtnLocator      = By.cssSelector("button:has(svg.lucide-list), button[aria-label*='list']");

    // ── Product Cards ─────────────────────────────────
    private final By productCardLocator      = By.cssSelector("a.group.block");
    private final By productNameLocator      = By.cssSelector("h3.font-semibold");
    private final By productPriceLocator     = By.cssSelector("span.font-bold.text-base");
    private final By noResultsLocator        = By.xpath("//*[contains(normalize-space(),'No products') or contains(normalize-space(),'no results')]");

    // ── Loading ───────────────────────────────────────
    private final By skeletonLocator         = By.cssSelector("[class*='skeleton'], [class*='animate-pulse']");

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        navigateTo(baseUrl + PATH);
        waitForProductsToLoad();
    }

    // ── Loading ───────────────────────────────────────

    public void waitForProductsToLoad() {
        wait.waitForSpinnerToDisappear(skeletonLocator);
        // Chờ ít nhất 1 product card xuất hiện
        try {
            wait.waitForMinimumElements(productCardLocator, 1);
        } catch (Exception ignored) {}
    }

    // ── Search ────────────────────────────────────────

    public void searchProducts(String query) {
        if (!isDisplayed(searchFieldLocator) && isDisplayed(searchToggleBtnLocator)) {
            click(searchToggleBtnLocator);
        }

        waitForVisible(searchFieldLocator);
        type(searchFieldLocator, query);

        // Chờ UI update sau khi search
        wait.waitFor(driver -> {
            List<WebElement> cards = driver.findElements(productCardLocator);
            return !cards.isEmpty() || driver.findElements(noResultsLocator).size() > 0;
        });
    }

    public void clearSearch() {
        if (!isDisplayed(searchFieldLocator) && isDisplayed(searchToggleBtnLocator)) {
            click(searchToggleBtnLocator);
        }
        type(searchFieldLocator, "");
    }

    // ── Sort ──────────────────────────────────────────

    /**
     * Chọn sort option theo label text.
     * Ví dụ: "Price: Low to High", "Best Rated"
     */
    public void sortBy(String optionText) {
        click(sortDropdownLocator);
        By optionLocator = By.xpath(
            "//option[normalize-space()='" + optionText + "'] | " +
            "//*[@role='option'][normalize-space()='" + optionText + "']"
        );
        wait.waitForClickable(optionLocator);
        click(optionLocator);
    }

    // ── Filters ───────────────────────────────────────

    public void openFilterSidebar() {
        if (!isDisplayed(sidebarLocator)) {
            click(filterToggleBtnLocator);
            waitForVisible(sidebarLocator);
        }
    }

    /**
     * Filter theo category name.
     */
    public void filterByCategory(String categoryName) {
        openFilterSidebar();
        By locator = By.xpath(
            "//label[contains(normalize-space(),'" + categoryName + "')]//input[@type='checkbox'] | " +
            "//button[contains(normalize-space(),'" + categoryName + "')]"
        );
        scrollToElement(locator);
        click(locator);
        waitForProductsToLoad();
    }

    /**
     * Filter theo brand name.
     */
    public void filterByBrand(String brandName) {
        openFilterSidebar();
        By locator = By.xpath(
            "//label[contains(normalize-space(),'" + brandName + "')]//input[@type='checkbox']"
        );
        scrollToElement(locator);
        click(locator);
        waitForProductsToLoad();
    }

    public void clearAllFilters() {
        if (isDisplayed(clearFiltersLocator)) {
            click(clearFiltersLocator);
            waitForProductsToLoad();
        }
    }

    // ── View Toggle ───────────────────────────────────

    public void switchToGridView() {
        if (isDisplayed(gridViewBtnLocator)) {
            click(gridViewBtnLocator);
        }
    }

    public void switchToListView() {
        if (isDisplayed(listViewBtnLocator)) {
            click(listViewBtnLocator);
        }
    }

    // ── Product Cards ─────────────────────────────────

    public List<WebElement> getProductCards() {
        try {
            return wait.waitForMinimumElements(productCardLocator, 1);
        } catch (Exception e) {
            return findElements(productCardLocator);
        }
    }

    public int getProductCount() {
        return findElements(productCardLocator).size();
    }

    /**
     * Click vào product card theo index (0-based).
     */
    public void clickProduct(int index) {
        List<WebElement> cards = getProductCards();
        scrollToElement(cards.get(index));
        click(cards.get(index));
    }

    /**
     * Click vào product card theo tên sản phẩm (partial match).
     */
    public void clickProductByName(String productName) {
        By locator = By.xpath(
            "//*[contains(@class,'card') or contains(@class,'product')]//*[contains(normalize-space(),'"
            + productName + "')]"
        );
        scrollToElement(locator);
        click(locator);
    }

    /**
     * Lấy tên của product card đầu tiên.
     */
    public String getFirstProductName() {
        return getText(productNameLocator);
    }

    public boolean isNoResultsDisplayed() {
        return isDisplayed(noResultsLocator);
    }

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH);
    }
}
