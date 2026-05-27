package gearvault.tests;

import gearvault.base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;
import java.time.Duration;

public class LoginTest extends BaseTest {

    // ══════════════════════════════════════════════
    // TC-AUTH-001: Đăng nhập đúng thông tin
    // ══════════════════════════════════════════════
    @Test(description = "TC-AUTH-001: Dang nhap thanh cong voi User")
    public void TC_AUTH_001_LoginSuccess() throws InterruptedException {

        // 1. Mở trang đăng nhập
        driver.get(baseUrl + "/login");

        // 2. Chờ trang load xong (tối đa 10 giây)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // 3. Tìm ô Email và gõ vào
        WebElement emailInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("input[type='email']")
                )
        );
        emailInput.sendKeys("user@gearvault.com");

        // 4. Tìm ô Password và gõ vào
        WebElement passwordInput = driver.findElement(
                By.cssSelector("input[type='password']")
        );
        passwordInput.sendKeys("user123");

        // 5. Nhấn nút Đăng nhập
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        // 6. Chờ trang chuyển (2 giây)
        Thread.sleep(2000);

        // 7. Kiểm tra: phải thoát khỏi trang /login
        String currentUrl = driver.getCurrentUrl();
        Assert.assertFalse(
                currentUrl.contains("/login"),
                "FAIL: Van o trang login! URL hien tai: " + currentUrl
        );
        System.out.println("✅ PASS TC-AUTH-001: Dang nhap thanh cong → " + currentUrl);
    }

    // ══════════════════════════════════════════════
    // TC-AUTH-002: Đăng nhập sai mật khẩu
    // ══════════════════════════════════════════════
    @Test(description = "TC-AUTH-002: Dang nhap sai mat khau phai hien loi")
    public void TC_AUTH_002_LoginWrongPassword() throws InterruptedException {

        driver.get(baseUrl + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement emailInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("input[type='email']")
                )
        );
        emailInput.sendKeys("user@gearvault.com");
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys("MATKHAUSAI123");
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        Thread.sleep(2000);

        // Kiểm tra: phải vẫn ở trang login (vì sai mật khẩu)
        Assert.assertTrue(
                driver.getCurrentUrl().contains("/login"),
                "FAIL: Dang nhap sai mat khau nhung van chuyen trang!"
        );
        System.out.println("✅ PASS TC-AUTH-002: Dang nhap sai bi chan dung");
    }

    // ══════════════════════════════════════════════
    // TC-AUTH-003: Bỏ trống email không cho đăng nhập
    // ══════════════════════════════════════════════
    @Test(description = "TC-AUTH-003: Bo trong email khong cho dang nhap")
    public void TC_AUTH_003_EmptyEmail() throws InterruptedException {

        driver.get(baseUrl + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Chỉ nhập password, không nhập email
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[type='password']")
        )).sendKeys("user123");

        driver.findElement(By.cssSelector("button[type='submit']")).click();
        Thread.sleep(1500);

        // Phải vẫn ở trang login
        Assert.assertTrue(
                driver.getCurrentUrl().contains("/login"),
                "FAIL: Bo trong email van dang nhap duoc!"
        );
        System.out.println("✅ PASS TC-AUTH-003: Bo trong email bi chan");
    }

    // ══════════════════════════════════════════════
    // TC-AUTH-004: Nhấn Demo User tự điền thông tin
    // ══════════════════════════════════════════════
    @Test(description = "TC-AUTH-004: Nut Demo User tu dien thong tin")
    public void TC_AUTH_004_DemoUserButton() throws InterruptedException {

        driver.get(baseUrl + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Tìm nút "Demo User" và click
        WebElement demoBtn = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[contains(text(),'Demo User')]")
                )
        );
        demoBtn.click();
        Thread.sleep(500);

        // Nhấn Submit
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        Thread.sleep(2000);

        // Phải thoát khỏi trang login
        Assert.assertFalse(
                driver.getCurrentUrl().contains("/login"),
                "FAIL: Nut Demo User khong hoat dong!"
        );
        System.out.println("✅ PASS TC-AUTH-004: Demo User hoat dong");
    }

    // ══════════════════════════════════════════════
    // TC-AUTH-005: Chưa đăng nhập vào /dashboard
    //              phải chuyển về /login
    // ══════════════════════════════════════════════
    @Test(description = "TC-AUTH-005: Chua dang nhap vao dashboard bi redirect")
    public void TC_AUTH_005_ProtectedRoute() throws InterruptedException {

        // Cố tình vào thẳng trang dashboard không qua đăng nhập
        driver.get(baseUrl + "/dashboard");
        Thread.sleep(2000);

        String url = driver.getCurrentUrl();
        Assert.assertTrue(
                url.contains("/login"),
                "FAIL: Vao /dashboard ma khong can dang nhap! URL: " + url
        );
        System.out.println("✅ PASS TC-AUTH-005: Chuyen ve /login thanh cong");
    }
}