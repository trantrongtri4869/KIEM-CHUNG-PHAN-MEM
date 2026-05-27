package gearvault.base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public class BaseTest {

    // driver = "bàn tay" điều khiển Chrome
    protected WebDriver driver;

    // Địa chỉ website cần test
    protected String baseUrl = "http://localhost:5173";

    // Chạy TRƯỚC mỗi bài test: mở Chrome
    @BeforeMethod
    public void setUp() {
        // Tự tải ChromeDriver đúng version, không cần cài tay
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        // Bỏ comment dòng dưới nếu muốn chạy không hiện Chrome
        // options.addArguments("--headless");

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        System.out.println("✅ Da mo Chrome: " + baseUrl);
    }

    // Chạy SAU mỗi bài test: đóng Chrome
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            System.out.println("✅ Da dong Chrome");
        }
    }
}