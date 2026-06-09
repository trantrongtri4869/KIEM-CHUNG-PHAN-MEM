package com.gearvault.utils;

import com.gearvault.config.ConfigReader;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

/**
 * Quản lý WebDriver với ThreadLocal để hỗ trợ parallel test.
 * Dùng WebDriverManager để tự động download driver.
 */
public class DriverManager {

    // ThreadLocal để mỗi thread có driver riêng (parallel testing)
    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();
    private static final ConfigReader config = ConfigReader.getInstance();

    private DriverManager() {}

    /**
     * Khởi tạo WebDriver dựa trên config browser.
     */
    public static void initDriver() {
        String browser = config.getBrowser().toLowerCase();
        boolean headless = config.isHeadless();
        WebDriver driver;

        switch (browser) {
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                if (headless) firefoxOptions.addArguments("--headless");
                driver = new FirefoxDriver(firefoxOptions);
                break;

            case "edge":
                WebDriverManager.edgedriver().setup();
                EdgeOptions edgeOptions = new EdgeOptions();
                if (headless) edgeOptions.addArguments("--headless");
                driver = new EdgeDriver(edgeOptions);
                break;

            case "chrome":
            default:
                WebDriverManager.chromedriver().setup();
                ChromeOptions chromeOptions = new ChromeOptions();
                if (headless) {
                    chromeOptions.addArguments("--headless=new");
                    chromeOptions.addArguments("--disable-gpu");
                }
                chromeOptions.addArguments("--window-size=1920,1080");
                chromeOptions.addArguments("--no-sandbox");
                chromeOptions.addArguments("--disable-dev-shm-usage");
                // Tắt thông báo "Chrome is being controlled by automation"
                chromeOptions.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
                driver = new ChromeDriver(chromeOptions);
                break;
        }

        // Không dùng implicitWait - dùng explicit wait ở từng page
        driver.manage().timeouts().pageLoadTimeout(
            Duration.ofSeconds(config.getPageLoadTimeout())
        );
        driver.manage().window().maximize();

        driverThreadLocal.set(driver);
    }

    /**
     * Lấy WebDriver của thread hiện tại.
     */
    public static WebDriver getDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver == null) {
            throw new IllegalStateException("Driver chưa được khởi tạo. Hãy gọi initDriver() trước.");
        }
        return driver;
    }

    /**
     * Đóng và xóa WebDriver của thread hiện tại.
     */
    public static void quitDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver != null) {
            driver.quit();
            driverThreadLocal.remove();
        }
    }
}
