package com.gearvault.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

public class ProductsPage extends BasePage {

    public static final String PATH = "/products";

    private final By searchBtnLocator = By.xpath(
        "//button[@aria-label='Search' or normalize-space()='Search']"
    );
    private final By searchInputLocator = By.xpath(
        "//input[contains(@placeholder,'Search for gaming') or contains(@placeholder,'Search products')]"
    );

    private final By sortSelectLocator = By.cssSelector("select");
    private final By productCardLocator = By.cssSelector("a[href*='/products/']");

    // No results — app có thể hiển thị heading "Search: "query"" hoặc "No products found"
    private final By noResultsLocator = By.xpath(
        "//*[contains(normalize-space(),'No products') or " +
        "contains(normalize-space(),'no products') or " +
        "contains(normalize-space(),'not found') or " +
        "contains(normalize-space(),'0 results') or " +
        "contains(normalize-space(),'No results')]"
    );

    private final By skeletonLocator = By.cssSelector("[class*='skeleton'], [class*='animate-pulse']");

    private final By gridViewBtnLocator = By.xpath(
        "//button[.//*[local-name()='svg'][contains(@class,'lucide-layout-grid') or contains(@class,'lucide-grid')]]"
    );
    private final By listViewBtnLocator = By.xpath(
        "//button[.//*[local-name()='svg'][contains(@class,'lucide-list')]]"
    );

    private final By clearFiltersLocator = By.xpath(
        "//button[contains(normalize-space(),'Clear All Filters')]"
    );

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        navigateTo(baseUrl + PATH);
        waitForProductsToLoad();
    }

    public void waitForProductsToLoad() {
        wait.waitForSpinnerToDisappear(skeletonLocator);
        // Không throw nếu không có sản phẩm (search no results)
        try { Thread.sleep(500); } catch (InterruptedException ignored) {}
    }

    public void searchProducts(String query) {
        click(searchBtnLocator);
        waitForVisible(searchInputLocator);
        type(searchInputLocator, query);
        driver.findElement(searchInputLocator).sendKeys(Keys.ENTER);
        // Đợi navigate đến trang search results
        try { Thread.sleep(1500); } catch (InterruptedException ignored) {}
        // Đợi skeleton biến mất
        wait.waitForSpinnerToDisappear(skeletonLocator);
        try { Thread.sleep(500); } catch (InterruptedException ignored) {}
    }

    public void sortBy(String optionTextOrValue) {
        waitForVisible(sortSelectLocator);
        WebElement selectEl = driver.findElement(sortSelectLocator);
        Select select = new Select(selectEl);
        try {
            select.selectByValue(toSortValue(optionTextOrValue));
        } catch (Exception e) {
            select.selectByVisibleText(optionTextOrValue);
        }
        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
        waitForProductsToLoad();
    }

    private String toSortValue(String label) {
        switch (label.toLowerCase()) {
            case "price: low to high": case "price_asc": return "price_asc";
            case "price: high to low": case "price_desc": return "price_desc";
            case "best rated": case "rating": return "rating";
            case "popular": case "most popular": return "popular";
            default: return label;
        }
    }

    /**
     * Filter theo category/brand.
     * Console xác nhận: LABEL class="flex items-center gap-2.5 cursor-pointer group"
     * TEXT = "Gaming Mice12" (số dính liền) → dùng contains(normalize-space(), name)
     *
     * CSS selector cho class có spaces: dùng từng class riêng lẻ
     * label.cursor-pointer khớp với class string chứa "cursor-pointer"
     */
    public void filterByCategory(String categoryName) {
        // outerHTML xác nhận: label > input[checkbox] + span(name) + span(count)
        // normalize-space(label) = "Headsets10" → starts-with đúng
        // Nhưng label có thể off-screen → dùng scrollToElement + jsClick
        By locator = By.xpath(
            "//label[contains(@class,'cursor-pointer') and " +
            "starts-with(normalize-space(),'" + categoryName + "')]"
        );
        // Scroll vào trước để đảm bảo visible
        scrollToElement(locator);
        // Dùng jsClick để bypass visibility check
        jsClick(locator);
        try { Thread.sleep(600); } catch (InterruptedException ignored) {}
        waitForProductsToLoad();
    }

    public void filterByBrand(String brandName) {
        filterByCategory(brandName);
    }

    public void filterByRating(String ratingLabel) {
        By locator = By.xpath(
            "//label[contains(normalize-space(),'" + ratingLabel + "')]"
        );
        click(locator);
        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
        waitForProductsToLoad();
    }

    public void filterByPrice(String priceLabel) {
        By locator = By.xpath(
            "//label[contains(normalize-space(),'" + priceLabel + "')]"
        );
        click(locator);
        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
        waitForProductsToLoad();
    }

    public void clearAllFilters() {
        if (isDisplayed(clearFiltersLocator)) {
            click(clearFiltersLocator);
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
            // Scroll xuống để trigger lazy load
            scrollToBottom();
            try { Thread.sleep(800); } catch (InterruptedException ignored) {}
            scrollToBottom();
            try { Thread.sleep(500); } catch (InterruptedException ignored) {}
        }
    }

    public void switchToGridView() {
        if (isDisplayed(gridViewBtnLocator)) click(gridViewBtnLocator);
    }

    public void switchToListView() {
        if (isDisplayed(listViewBtnLocator)) click(listViewBtnLocator);
    }

    public int getProductCount() {
        return findElements(productCardLocator).size();
    }

    public void clickProduct(int index) {
        List<WebElement> cards = findElements(productCardLocator);
        scrollToElement(cards.get(index));
        click(cards.get(index));
    }

    public void clickProductByName(String productName) {
        By locator = By.xpath(
            "//a[contains(normalize-space(),'" + productName + "') and contains(@href,'/products/')]"
        );
        click(locator);
    }

    public String getFirstProductName() {
        List<WebElement> products = findElements(productCardLocator);
        if (products.isEmpty()) return null;
        return products.get(0).getText();
    }

    public boolean isNoResultsDisplayed() {
        return isDisplayed(noResultsLocator);
    }

    public boolean isPageLoaded() {
        return getCurrentUrl().contains(PATH);
    }
}
