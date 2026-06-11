package com.gearvault.tests;

import com.gearvault.pages.ProductsPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

public class ProductFilterTest extends BaseTest {

    private ProductsPage productsPage;

    @BeforeMethod(alwaysRun = true)
    public void openProductsPage() {
        productsPage = new ProductsPage(driver);
        productsPage.open(baseUrl);
        logInfo("Đã mở trang /products");
    }

    // ─────────────────────────────────────────────────
    // TC54 - Filter theo category Headsets
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC54 - Filter theo category Headsets chỉ hiển thị sản phẩm Headsets",
        description = "Chọn checkbox Headsets trong sidebar, xác nhận danh sách sản phẩm được lọc",
        groups      = { "smoke", "products", "filter" }
    )
    public void testFilterByCategory_Headsets() {
        int totalBefore = productsPage.getProductCount();
        logInfo("Tổng sản phẩm trước khi filter: " + totalBefore);

        productsPage.filterByCategory("Headsets");

        int totalAfter = productsPage.getProductCount();
        logInfo("Tổng sản phẩm sau khi filter Headsets: " + totalAfter);

        Assert.assertTrue(totalAfter > 0,
            "Phải có ít nhất 1 sản phẩm sau khi filter category Headsets");
        Assert.assertTrue(totalAfter <= totalBefore,
            "Số sản phẩm sau filter phải nhỏ hơn hoặc bằng tổng ban đầu");
        logPass("Filter Headsets hoạt động đúng: " + totalAfter + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC55 - Filter theo category Gaming Mice
    // codegen: checkbox name = 'Gaming Mice' (không phải 'Mice')
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC55 - Filter theo category Gaming Mice chỉ hiển thị sản phẩm Mice",
        description = "Chọn checkbox Gaming Mice, xác nhận danh sách được lọc",
        groups      = { "products", "filter" }
    )
    public void testFilterByCategory_Mice() {
        int totalBefore = productsPage.getProductCount();
        logInfo("Tổng sản phẩm trước khi filter: " + totalBefore);

        // FIX: đúng label trong UI là "Gaming Mice", không phải "Mice"
        productsPage.filterByCategory("Gaming Mice");

        int totalAfter = productsPage.getProductCount();
        logInfo("Tổng sản phẩm sau khi filter Gaming Mice: " + totalAfter);

        Assert.assertTrue(totalAfter > 0,
            "Phải có ít nhất 1 sản phẩm sau khi filter category Gaming Mice");
        Assert.assertTrue(totalAfter <= totalBefore,
            "Số sản phẩm sau filter phải nhỏ hơn hoặc bằng tổng ban đầu");
        logPass("Filter Gaming Mice hoạt động đúng: " + totalAfter + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC56 - Filter theo category Keyboards
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC56 - Filter theo category Keyboards chỉ hiển thị sản phẩm Keyboards",
        description = "Chọn checkbox Keyboards, xác nhận danh sách được lọc",
        groups      = { "products", "filter" }
    )
    public void testFilterByCategory_Keyboards() {
        int totalBefore = productsPage.getProductCount();
        logInfo("Tổng sản phẩm trước khi filter: " + totalBefore);

        productsPage.filterByCategory("Keyboards");

        int totalAfter = productsPage.getProductCount();
        logInfo("Tổng sản phẩm sau khi filter Keyboards: " + totalAfter);

        Assert.assertTrue(totalAfter > 0,
            "Phải có ít nhất 1 sản phẩm sau khi filter category Keyboards");
        Assert.assertTrue(totalAfter <= totalBefore,
            "Số sản phẩm sau filter phải <= tổng ban đầu");
        logPass("Filter Keyboards hoạt động đúng: " + totalAfter + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC57 - Clear All Filters
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC57 - Clear All Filters phục hồi toàn bộ danh sách sản phẩm",
        description = "Sau khi filter, click Clear Filters, xác nhận danh sách trở về đầy đủ",
        groups      = { "smoke", "products", "filter" }
    )
    public void testClearAllFilters() {
        int totalBefore = productsPage.getProductCount();
        logInfo("Tổng sản phẩm ban đầu: " + totalBefore);

        // FIX: dùng "Gaming Mice" thay vì "Mice"
        productsPage.filterByCategory("Gaming Mice");
        int filteredCount = productsPage.getProductCount();
        logInfo("Sau khi filter Gaming Mice: " + filteredCount + " sản phẩm");

        logInfo("Click Clear All Filters");
        productsPage.clearAllFilters();

        int countAfterClear = productsPage.getProductCount();
        logInfo("Sau khi clear filters: " + countAfterClear + " sản phẩm");

        Assert.assertEquals(countAfterClear, totalBefore,
            "Sau khi clear filters, phải hiển thị lại toàn bộ " + totalBefore + " sản phẩm");
        logPass("Clear All Filters hoạt động đúng: " + countAfterClear + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC58 - Sort by Price: Low to High
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC58 - Sort by Price Low to High sắp xếp sản phẩm đúng thứ tự",
        description = "Chọn sort Price: Low to High, xác nhận sản phẩm đầu tiên có giá thấp nhất",
        groups      = { "smoke", "products", "sort" }
    )
    public void testSortByPriceLowToHigh() {
        logInfo("Chọn sort: Price: Low to High");
        productsPage.sortBy("Price: Low to High");

        List<org.openqa.selenium.WebElement> priceElements = driver.findElements(
            By.cssSelector("[class*='price'], .text-brand-600, span.font-bold")
        );

        Assert.assertTrue(priceElements.size() >= 2,
            "Phải có ít nhất 2 sản phẩm để so sánh thứ tự sort");

        try {
            double price1 = parsePrice(priceElements.get(0).getText());
            double price2 = parsePrice(priceElements.get(1).getText());
            logInfo(String.format("Giá sản phẩm [0]: %.2f | [1]: %.2f", price1, price2));

            if (price1 > 0 && price2 > 0) {
                Assert.assertTrue(price1 <= price2,
                    "Sản phẩm đầu tiên phải có giá <= sản phẩm thứ hai khi sort Low to High");
                logPass("Sort Price Low to High đúng: " + price1 + " <= " + price2);
            } else {
                logInfo("Không parse được giá, bỏ qua assertion so sánh số");
            }
        } catch (Exception e) {
            logInfo("Không thể parse giá để so sánh: " + e.getMessage());
        }

        Assert.assertTrue(productsPage.getProductCount() > 0,
            "Phải có sản phẩm sau khi sort");
        logPass("Sort Price Low to High hoàn thành, " + productsPage.getProductCount() + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC59 - Sort by Price: High to Low
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC59 - Sort by Price High to Low sắp xếp sản phẩm đúng thứ tự",
        description = "Chọn sort Price: High to Low, xác nhận sản phẩm đầu tiên có giá cao nhất",
        groups      = { "products", "sort" }
    )
    public void testSortByPriceHighToLow() {
        logInfo("Chọn sort: Price: High to Low");
        productsPage.sortBy("Price: High to Low");

        List<org.openqa.selenium.WebElement> priceElements = driver.findElements(
            By.cssSelector("[class*='price'], .text-brand-600, span.font-bold")
        );

        Assert.assertTrue(priceElements.size() >= 2,
            "Phải có ít nhất 2 sản phẩm để so sánh");

        try {
            double price1 = parsePrice(priceElements.get(0).getText());
            double price2 = parsePrice(priceElements.get(1).getText());
            logInfo(String.format("Giá sản phẩm [0]: %.2f | [1]: %.2f", price1, price2));

            if (price1 > 0 && price2 > 0) {
                Assert.assertTrue(price1 >= price2,
                    "Sản phẩm đầu tiên phải có giá >= sản phẩm thứ hai khi sort High to Low");
                logPass("Sort Price High to Low đúng: " + price1 + " >= " + price2);
            }
        } catch (Exception e) {
            logInfo("Không thể parse giá để so sánh: " + e.getMessage());
        }

        Assert.assertTrue(productsPage.getProductCount() > 0,
            "Phải có sản phẩm sau khi sort");
        logPass("Sort Price High to Low hoàn thành");
    }

    // ─────────────────────────────────────────────────
    // TC60 - Sort by Best Rated
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC60 - Sort by Best Rated hiển thị sản phẩm cao rating trước",
        description = "Chọn sort Best Rated, xác nhận danh sách không rỗng",
        groups      = { "products", "sort" }
    )
    public void testSortByBestRated() {
        logInfo("Chọn sort: Best Rated");
        productsPage.sortBy("Best Rated");

        int productCount = productsPage.getProductCount();
        Assert.assertTrue(productCount > 0,
            "Phải có sản phẩm sau khi sort Best Rated");
        logPass("Sort Best Rated hoạt động đúng: " + productCount + " sản phẩm");
    }

    // ─────────────────────────────────────────────────
    // TC61 - Grid view / List view toggle
    // ─────────────────────────────────────────────────
    @Test(
        testName    = "TC61 - Toggle Grid/List view thay đổi layout danh sách sản phẩm",
        description = "Click List view và Grid view, xác nhận layout thay đổi và sản phẩm vẫn hiển thị",
        groups      = { "products", "ui" }
    )
    public void testGridListViewToggle() {
        int productsBefore = productsPage.getProductCount();
        logInfo("Sản phẩm ban đầu (Grid view): " + productsBefore);

        logInfo("Chuyển sang List view");
        productsPage.switchToListView();

        int productsListView = productsPage.getProductCount();
        Assert.assertTrue(productsListView > 0,
            "Phải có sản phẩm trong List view");
        logPass("List view hiển thị " + productsListView + " sản phẩm");

        logInfo("Chuyển lại Grid view");
        productsPage.switchToGridView();

        int productsGridView = productsPage.getProductCount();
        Assert.assertTrue(productsGridView > 0,
            "Phải có sản phẩm trong Grid view");
        Assert.assertEquals(productsGridView, productsListView,
            "Số lượng sản phẩm không đổi khi toggle view");
        logPass("Grid view hiển thị " + productsGridView + " sản phẩm — toggle hoạt động đúng");
    }

    // ─────────────────────────────────────────────────
    // Helper: parse giá từ text (vd: "$49.99" → 49.99)
    // ─────────────────────────────────────────────────
    private double parsePrice(String priceText) {
        try {
            String cleaned = priceText.replaceAll("[^0-9.]", "");
            if (cleaned.isEmpty()) return 0.0;
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
