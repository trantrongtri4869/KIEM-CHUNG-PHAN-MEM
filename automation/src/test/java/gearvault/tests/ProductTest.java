package gearvault.tests;

import gearvault.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;
import java.time.Duration;
import java.util.List;

public class ProductTest extends BaseTest {

    // TC-PROD-001: Trang sản phẩm hiển thị được sản phẩm
    @Test(description = "TC-PROD-001: Trang san pham co san pham hien thi")
    public void TC_PROD_001_ProductListLoads() throws InterruptedException {

        driver.get(baseUrl + "/products");
        Thread.sleep(2500);

        // Đếm số thẻ sản phẩm trên trang
        List<WebElement> cards = driver.findElements(
                By.cssSelector("[class*='card']")
        );

        Assert.assertTrue(
                cards.size() > 0,
                "FAIL: Trang san pham trong! Khong co san pham nao. Count = " + cards.size()
        );
        System.out.println("✅ PASS TC-PROD-001: Hien thi " + cards.size() + " san pham");
    }

    // TC-PROD-002: Tìm kiếm "Razer" ra kết quả
    @Test(description = "TC-PROD-002: Tim kiem Razer ra ket qua")
    public void TC_PROD_002_SearchRazer() throws InterruptedException {

        driver.get(baseUrl + "/products");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Tìm ô search và gõ "Razer"
        WebElement searchBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("input[placeholder*='Search']")
                )
        );
        searchBox.sendKeys("Razer");
        Thread.sleep(1500);

        // Kiểm tra vẫn còn sản phẩm hiển thị
        List<WebElement> cards = driver.findElements(
                By.cssSelector("[class*='card']")
        );
        Assert.assertTrue(
                cards.size() > 0,
                "FAIL: Tim 'Razer' nhung khong co ket qua!"
        );
        System.out.println("✅ PASS TC-PROD-002: Tim 'Razer' ra " + cards.size() + " ket qua");
    }

    // TC-PROD-003: Tìm từ không tồn tại → hiện "No products found"
    @Test(description = "TC-PROD-003: Tim tu khong ton tai hien thong bao trong")
    public void TC_PROD_003_SearchNotExist() throws InterruptedException {

        driver.get(baseUrl + "/products");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement searchBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("input[placeholder*='Search']")
                )
        );
        searchBox.sendKeys("xyzkhongtontai999abc");
        Thread.sleep(1500);

        // Phải thấy thông báo không có kết quả
        boolean noResult = driver.getPageSource().contains("No products found");
        Assert.assertTrue(noResult,
                "FAIL: Tim khong co ket qua nhung khong hien thong bao!"
        );
        System.out.println("✅ PASS TC-PROD-003: Hien 'No products found' dung");
    }

    // TC-PROD-004: Mở chi tiết sản phẩm thành công
    @Test(description = "TC-PROD-004: Mo trang chi tiet san pham")
    public void TC_PROD_004_ProductDetail() throws InterruptedException {

        driver.get(baseUrl + "/products/razer-deathadder-v3-pro");
        Thread.sleep(2000);

        String url = driver.getCurrentUrl();
        Assert.assertTrue(
                url.contains("razer-deathadder-v3-pro"),
                "FAIL: Khong mo duoc trang chi tiet san pham!"
        );
        System.out.println("✅ PASS TC-PROD-004: Trang chi tiet mo thanh cong");
    }

    // TC-PROD-005: Trang 404 hiển thị đúng
    @Test(description = "TC-PROD-005: Trang khong ton tai hien 404")
    public void TC_PROD_005_NotFoundPage() throws InterruptedException {

        driver.get(baseUrl + "/trang-nay-khong-co-xyz-123");
        Thread.sleep(2000);

        boolean has404 = driver.getPageSource().contains("404");
        Assert.assertTrue(has404, "FAIL: Khong hien trang 404!");
        System.out.println("✅ PASS TC-PROD-005: Trang 404 hien thi dung");
    }

    // TC-PROD-006: Nhấn icon giỏ hàng mở Cart Drawer
    @Test(description = "TC-PROD-006: Nhan icon gio hang mo cart drawer")
    public void TC_PROD_006_CartDrawerOpen() throws InterruptedException {

        driver.get(baseUrl + "/products");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Tìm và click icon giỏ hàng
        WebElement cartBtn = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.cssSelector("button[aria-label='Cart']")
                )
        );
        cartBtn.click();
        Thread.sleep(1000);

        // Kiểm tra cart drawer đã mở chưa
        boolean cartOpen = driver.getPageSource().contains("My Cart");
        Assert.assertTrue(cartOpen, "FAIL: Cart Drawer khong mo!");
        System.out.println("✅ PASS TC-PROD-006: Cart Drawer mo thanh cong");
    }
}