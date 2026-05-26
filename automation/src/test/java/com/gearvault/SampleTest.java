package com.gearvault;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class SampleTest {
    WebDriver driver;

    @BeforeMethod
    public void setUp() {
        // Tự động quản lý và tải ChromeDriver
        WebDriverManager.chromedriver().setup();
        
        // Cấu hình Chrome chạy ẩn (Headless) bắt buộc cho máy ảo GitHub Actions
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");

        driver = new ChromeDriver(options);
    }

    @Test
    public void testGearVaultPipeline() {
        System.out.println("🟢 [GearVault] Đang kết nối thử nghiệm hệ thống...");
        // Test thử truy cập một trang web public bất kỳ để đảm bảo mạng máy ảo thông suốt
        driver.get("https://www.google.com");
        String title = driver.getTitle();
        System.out.println("🟢 [GearVault] Tiêu đề trang tải được: " + title);
        assert title != null;
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
