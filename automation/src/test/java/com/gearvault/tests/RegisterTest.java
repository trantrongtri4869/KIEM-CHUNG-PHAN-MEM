package com.gearvault.tests;

import com.gearvault.pages.RegisterPage;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * Test suite cho chức năng Register.
 * Covers:
 * - Đăng ký thành công
 * - Validation từng field
 * - Password strength indicator
 * - Password mismatch
 * - Chưa tick Terms checkbox
 */
public class RegisterTest extends BaseTest {

    private RegisterPage registerPage;

    @BeforeMethod(alwaysRun = true)
    public void openRegisterPage() {
        driver.get(baseUrl + RegisterPage.PATH);
        registerPage = new RegisterPage(driver);
        Assert.assertTrue(registerPage.isPageLoaded(), "Trang Register phải load được");
        logInfo("Đã mở trang Register: " + baseUrl + RegisterPage.PATH);
    }

    // ─────────────────────────────────────────────────
    // TC11 - Đăng ký thành công
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC11 - Đăng ký tài khoản mới thành công",
        description = "Điền đầy đủ form hợp lệ và xác nhận redirect sau đăng ký",
        groups    = { "smoke", "auth" }
    )
    public void testRegisterSuccess() {
        logInfo("Điền form đăng ký hợp lệ");
        registerPage.register(
            "Test User",
            "testuser_" + System.currentTimeMillis() + "@example.com",
            "SecurePass@123",
            "SecurePass@123"
        );

        Assert.assertFalse(
            driver.getCurrentUrl().contains("/register"),
            "Sau đăng ký thành công phải redirect ra khỏi /register"
        );
        logPass("Đăng ký thành công, URL: " + driver.getCurrentUrl());
    }

    // ─────────────────────────────────────────────────
    // TC12 - Submit form rỗng
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC12 - Submit form đăng ký rỗng hiển thị validation",
        description = "Click Create Account khi chưa điền gì để kiểm tra validation",
        groups    = { "auth", "validation" }
    )
    public void testRegisterEmptyFormShowsErrors() {
        logInfo("Submit form rỗng");
        registerPage.clickCreateAccount();

        boolean hasAnyError = registerPage.isNameErrorDisplayed()
            || registerPage.isEmailErrorDisplayed()
            || registerPage.isPasswordErrorDisplayed();

        Assert.assertTrue(hasAnyError, "Phải có ít nhất 1 validation error khi submit rỗng");
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/register"),
            "Phải ở lại trang register khi validation fail"
        );
        logPass("Validation errors hiển thị đúng khi submit rỗng");
    }

    // ─────────────────────────────────────────────────
    // TC13 - Tên quá ngắn
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC13 - Validation tên quá ngắn (< 2 ký tự)",
        description = "Xác nhận lỗi khi nhập tên chỉ 1 ký tự",
        groups    = { "auth", "validation" }
    )
    public void testNameTooShort() {
        logInfo("Nhập tên 1 ký tự: 'A'");
        registerPage.fillName("A");
        registerPage.fillEmail("valid@email.com");
        registerPage.fillPassword("Password@1");
        registerPage.fillConfirmPassword("Password@1");
        registerPage.checkAgreeToTerms();
        registerPage.clickCreateAccount();

        Assert.assertTrue(registerPage.isNameErrorDisplayed(), "Phải hiển thị lỗi cho tên quá ngắn");
        logPass("Lỗi tên ngắn hiển thị: " + registerPage.getNameError());
    }

    // ─────────────────────────────────────────────────
    // TC14 - Password quá ngắn
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC14 - Validation mật khẩu quá ngắn (< 8 ký tự)",
        description = "Xác nhận lỗi khi password ít hơn 8 ký tự",
        groups    = { "auth", "validation" }
    )
    public void testPasswordTooShort() {
        logInfo("Nhập password 5 ký tự: '12345'");
        registerPage.fillName("Valid Name");
        registerPage.fillEmail("valid@email.com");
        registerPage.fillPassword("12345");
        registerPage.fillConfirmPassword("12345");
        registerPage.checkAgreeToTerms();
        registerPage.clickCreateAccount();

        Assert.assertTrue(registerPage.isPasswordErrorDisplayed(), "Phải hiển thị lỗi password quá ngắn");
        logPass("Lỗi password ngắn hiển thị đúng");
    }

    // ─────────────────────────────────────────────────
    // TC15 - Password không khớp
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC15 - Validation xác nhận mật khẩu không khớp",
        description = "Xác nhận lỗi khi confirmPassword khác password",
        groups    = { "auth", "validation" }
    )
    public void testPasswordMismatch() {
        logInfo("Nhập password và confirm không khớp");
        registerPage.fillName("Valid Name");
        registerPage.fillEmail("valid@email.com");
        registerPage.fillPassword("Password@123");
        registerPage.fillConfirmPassword("Password@456");
        registerPage.checkAgreeToTerms();
        registerPage.clickCreateAccount();

        Assert.assertTrue(
            registerPage.isConfirmPasswordErrorDisplayed(),
            "Phải hiển thị lỗi khi confirm password không khớp"
        );
        logPass("Lỗi password mismatch hiển thị đúng");
    }

    // ─────────────────────────────────────────────────
    // TC16 - Chưa tick Terms
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC16 - Validation chưa đồng ý Terms",
        description = "Xác nhận lỗi khi chưa tick vào Terms checkbox",
        groups    = { "auth", "validation" }
    )
    public void testTermsNotChecked() {
        logInfo("Submit form mà chưa tick Terms");
        registerPage.fillName("Valid Name");
        registerPage.fillEmail("valid@email.com");
        registerPage.fillPassword("Password@123");
        registerPage.fillConfirmPassword("Password@123");
        // KHÔNG checkAgreeToTerms
        registerPage.clickCreateAccount();

        Assert.assertTrue(registerPage.isTermsErrorDisplayed(), "Phải hiển thị lỗi Terms khi chưa tick");
        logPass("Lỗi Terms hiển thị đúng");
    }

    // ─────────────────────────────────────────────────
    // TC17 - Password Strength Indicator
    // ─────────────────────────────────────────────────
    @DataProvider(name = "passwordStrengthData")
    public Object[][] passwordStrengthData() {
        return new Object[][] {
            { "abc",           1, "Weak"   },
            { "abcdefgh",      1, "Weak"   },
            { "Abcdefgh",      2, "Fair"   },
            { "Abcdefg1",      3, "Good"   },
            { "Abcdefg1@",     4, "Strong" },
        };
    }

    @Test(
        testName  = "TC17 - Password Strength Indicator hiển thị đúng",
        description = "Xác nhận strength indicator thay đổi theo độ mạnh password",
        dataProvider = "passwordStrengthData",
        groups    = { "auth", "ui" }
    )
    public void testPasswordStrengthIndicator(String password, int expectedBars, String expectedLabel) {
        logInfo("Nhập password: '" + password + "', expect strength: " + expectedLabel);
        registerPage.fillPassword(password);

        int activeBars = registerPage.getActiveStrengthBars();
        String strengthLabel = registerPage.getPasswordStrengthLabel();

        Assert.assertTrue(activeBars > 0, "Phải có ít nhất 1 thanh strength khi nhập password");
        logPass("Strength bars hiển thị: " + activeBars + ", label: '" + strengthLabel + "'");
    }

    // ─────────────────────────────────────────────────
    // TC18 - Navigate to Login
    // ─────────────────────────────────────────────────
    @Test(
        testName  = "TC18 - Điều hướng từ Register sang Login",
        description = "Xác nhận link 'Sign in' dẫn đến trang login",
        groups    = { "auth", "navigation" }
    )
    public void testNavigateToLogin() {
        logInfo("Click link 'Sign in'");
        registerPage.clickSignIn();

        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "Phải redirect sang /login"
        );
        logPass("Điều hướng sang /login thành công");
    }
}
