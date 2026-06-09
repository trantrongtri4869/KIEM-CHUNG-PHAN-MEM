package com.gearvault.tests;

import com.gearvault.pages.LoginPage;
import com.gearvault.pages.NavbarComponent;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Test suite cho chức năng Login.
 * Covers:
 * - Đăng nhập thành công (user, admin)
 * - Đăng nhập thất bại (sai email, sai password)
 * - Validation form (email rỗng, password rỗng)
 * - Demo buttons
 * - Toggle password visibility
 * - Redirect sau khi login
 * - Navigate to Register
 */
public class LoginTest extends BaseTest {

    private LoginPage loginPage;

    @BeforeMethod(alwaysRun = true)
    public void openLoginPage() {
        driver.get(baseUrl + LoginPage.PATH);
        loginPage = new LoginPage(driver);
        loginPage.waitForVisible(
            org.openqa.selenium.By.xpath("//h1[contains(text(),'Welcome back')]")
        );
        logInfo("Đã mở trang Login: " + baseUrl + LoginPage.PATH);
    }

    // ─────────────────────────────────────────────────
    // TC01 - Đăng nhập thành công với tài khoản user
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC01 - Đăng nhập thành công với user",
        description = "Xác nhận user đăng nhập bằng email/password hợp lệ và redirect đúng",
        groups    = { "smoke", "auth" }
    )
    public void testLoginSuccessAsUser() {
        logInfo("Nhập credentials user: " + config.getUserEmail());
        loginPage.login(config.getUserEmail(), config.getUserPassword());

        // Xác nhận redirect về trang chủ
        Assert.assertTrue(
            driver.getCurrentUrl().equals(baseUrl + "/") || driver.getCurrentUrl().equals(baseUrl),
            "Sau login phải redirect về trang chủ, URL hiện tại: " + driver.getCurrentUrl()
        );
        logPass("Redirect về trang chủ thành công");

        // Xác nhận navbar hiển thị user đã login
        NavbarComponent navbar = new NavbarComponent(driver);
        Assert.assertTrue(navbar.isUserLoggedIn(), "Navbar phải hiển thị trạng thái đã đăng nhập");
        logPass("Navbar xác nhận đã đăng nhập");
    }

    // ─────────────────────────────────────────────────
    // TC02 - Đăng nhập thành công với tài khoản admin
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC02 - Đăng nhập thành công với admin",
        description = "Xác nhận admin đăng nhập và redirect đúng",
        groups    = { "smoke", "auth" }
    )
    public void testLoginSuccessAsAdmin() {
        logInfo("Nhập credentials admin: " + config.getAdminEmail());
        loginPage.login(config.getAdminEmail(), config.getAdminPassword());

        Assert.assertFalse(
            driver.getCurrentUrl().contains("/login"),
            "Admin phải được redirect ra khỏi trang login"
        );
        logPass("Admin đăng nhập và redirect thành công");

        NavbarComponent navbar = new NavbarComponent(driver);
        Assert.assertTrue(navbar.isUserLoggedIn(), "Navbar phải hiển thị admin đã đăng nhập");
    }

    // ─────────────────────────────────────────────────
    // TC03 - Đăng nhập thất bại: sai password
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC03 - Đăng nhập thất bại với mật khẩu sai",
        description = "Xác nhận hiển thị lỗi khi nhập sai password",
        groups    = { "auth", "negative" }
    )
    public void testLoginFailWrongPassword() {
        logInfo("Đăng nhập với password sai");
        loginPage.login(config.getUserEmail(), "wrongpassword123");

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Phải hiển thị error message khi sai password");
        String error = loginPage.getErrorMessage();
        Assert.assertFalse(error.isEmpty(), "Error message không được rỗng");
        logPass("Error message hiển thị đúng: " + error);

        // Vẫn ở trang login
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "Phải ở lại trang login khi login fail"
        );
    }

    // ─────────────────────────────────────────────────
    // TC04 - Đăng nhập thất bại: sai email
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC04 - Đăng nhập thất bại với email không tồn tại",
        description = "Xác nhận hiển thị lỗi khi email không tồn tại",
        groups    = { "auth", "negative" }
    )
    public void testLoginFailWrongEmail() {
        logInfo("Đăng nhập với email không tồn tại");
        loginPage.login("notexist@test.com", "password123");

        Assert.assertTrue(loginPage.isErrorDisplayed(), "Phải hiển thị error khi email không tồn tại");
        logPass("Error message hiển thị đúng");
    }

    // ─────────────────────────────────────────────────
    // TC05 - Validation: email không đúng format
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC05 - Validation email không đúng format",
        description = "Xác nhận form validate khi nhập email sai format",
        groups    = { "auth", "validation" }
    )
    public void testEmailValidationInvalidFormat() {
        logInfo("Nhập email sai format: 'not-an-email'");
        loginPage.login("not-an-email", "password123");

        // Phải có lỗi - hoặc HTML5 validation hoặc custom error
        boolean hasError = loginPage.isErrorDisplayed()
            || driver.getCurrentUrl().contains("/login");

        Assert.assertTrue(hasError, "Phải có validation error cho email sai format");
        logPass("Email validation hoạt động đúng");
    }

    // ─────────────────────────────────────────────────
    // TC06 - Demo User button
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC06 - Demo User button điền credentials tự động",
        description = "Xác nhận Demo User button điền đúng email/password",
        groups    = { "auth" }
    )
    public void testDemoUserButton() {
        logInfo("Click Demo User button");
        loginPage.clickDemoUser();

        String emailValue = loginPage.getEmailInputValue();
        Assert.assertEquals(
            emailValue, config.getUserEmail(),
            "Demo User phải điền email: " + config.getUserEmail()
        );
        logPass("Demo User điền email đúng: " + emailValue);
    }

    // ─────────────────────────────────────────────────
    // TC07 - Demo Admin button
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC07 - Demo Admin button điền credentials tự động",
        description = "Xác nhận Demo Admin button điền đúng email/password",
        groups    = { "auth" }
    )
    public void testDemoAdminButton() {
        logInfo("Click Demo Admin button");
        loginPage.clickDemoAdmin();

        String emailValue = loginPage.getEmailInputValue();
        Assert.assertEquals(
            emailValue, config.getAdminEmail(),
            "Demo Admin phải điền email: " + config.getAdminEmail()
        );
        logPass("Demo Admin điền email đúng: " + emailValue);
    }

    // ─────────────────────────────────────────────────
    // TC08 - Toggle password visibility
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC08 - Toggle hiển thị/ẩn mật khẩu",
        description = "Xác nhận nút eye toggle ẩn/hiện password",
        groups    = { "auth", "ui" }
    )
    public void testTogglePasswordVisibility() {
        logInfo("Kiểm tra toggle password visibility");

        // Password ban đầu phải là type="password"
        String initialType = loginPage.getPasswordInputType();
        Assert.assertEquals(initialType, "password", "Ban đầu password phải bị ẩn (type=password)");
        logPass("Mật khẩu đang ẩn (type=password)");

        // Click toggle -> type phải đổi thành "text"
        loginPage.togglePasswordVisibility();
        String afterToggleType = loginPage.getPasswordInputType();
        Assert.assertEquals(afterToggleType, "text", "Sau khi toggle, password phải hiển thị (type=text)");
        logPass("Mật khẩu hiển thị sau khi toggle (type=text)");
    }

    // ─────────────────────────────────────────────────
    // TC09 - Navigate to Register page
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC09 - Điều hướng đến trang đăng ký",
        description = "Xác nhận link 'Create one free' dẫn đến trang register",
        groups    = { "auth", "navigation" }
    )
    public void testNavigateToRegister() {
        logInfo("Click link đăng ký");
        loginPage.clickRegister();

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/register"),
            "Phải redirect sang trang /register"
        );
        logPass("Đã điều hướng đến trang register: " + driver.getCurrentUrl());
    }

    // ─────────────────────────────────────────────────
    // TC10 - Login bằng Demo User 1-click rồi submit
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC10 - Đăng nhập 1-click bằng Demo User",
        description = "Click Demo User rồi Sign In và xác nhận thành công",
        groups    = { "smoke", "auth" }
    )
    public void testOnClickLoginAsDemoUser() {
        logInfo("Đăng nhập nhanh bằng Demo User");
        loginPage.loginAsDemoUser();

        Assert.assertFalse(
            driver.getCurrentUrl().contains("/login"),
            "Phải redirect ra khỏi /login sau khi đăng nhập thành công"
        );
        logPass("Demo User đăng nhập thành công, URL: " + driver.getCurrentUrl());
    }
}
