package com.gearvault.tests;

import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.gearvault.config.ConfigReader;
import com.gearvault.utils.DriverManager;
import com.gearvault.utils.ExtentReportManager;
import com.gearvault.utils.ScreenshotHelper;
import org.openqa.selenium.WebDriver;
import org.testng.ITestResult;
import org.testng.annotations.*;

import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Base class cho tất cả test classes.
 * Xử lý: setup/teardown driver, ExtentReport, screenshot on failure.
 */
public abstract class BaseTest {

    protected WebDriver driver;
    protected ConfigReader config;
    protected String baseUrl;

    // ─────────────────────────────────────────────────
    // Suite level: chạy 1 lần cho cả suite
    // ─────────────────────────────────────────────────

    @BeforeSuite(alwaysRun = true)
    public void setUpSuite() throws Exception {
        // Tạo thư mục output
        Files.createDirectories(Paths.get("test-output/reports"));
        Files.createDirectories(Paths.get("test-output/screenshots"));
        // Khởi tạo ExtentReports
        ExtentReportManager.getInstance();
    }

    @AfterSuite(alwaysRun = true)
    public void tearDownSuite() {
        ExtentReportManager.flush();
    }

    // ─────────────────────────────────────────────────
    // Test level: chạy trước/sau mỗi @Test method
    // ─────────────────────────────────────────────────

    @BeforeMethod(alwaysRun = true)
    public void setUp(Method method) {
        config  = ConfigReader.getInstance();
        baseUrl = config.getBaseUrl();

        // Khởi động driver
        DriverManager.initDriver();
        driver = DriverManager.getDriver();

        // Tạo ExtentTest node
        Test testAnnotation = method.getAnnotation(Test.class);
        String testName = (testAnnotation != null && !testAnnotation.testName().isEmpty())
            ? testAnnotation.testName()
            : method.getName();
        String description = (testAnnotation != null) ? testAnnotation.description() : "";

        ExtentReportManager.createTest(testName, description);
        ExtentReportManager.getTest().log(Status.INFO, "Test bắt đầu: " + testName);
        ExtentReportManager.getTest().log(Status.INFO, "Browser: " + config.getBrowser());
        ExtentReportManager.getTest().log(Status.INFO, "URL: " + baseUrl);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        ExtentTest test = ExtentReportManager.getTest();

        if (result.getStatus() == ITestResult.FAILURE) {
            // Chụp screenshot khi fail
            if (config.isScreenshotOnFail() && driver != null) {
                String screenshotPath = ScreenshotHelper.takeScreenshot(driver, result.getName());
                if (!screenshotPath.isEmpty()) {
                    try {
                        test.addScreenCaptureFromPath(screenshotPath, "Screenshot khi fail");
                    } catch (Exception ignored) {}
                }
            }
            test.log(Status.FAIL, "Test THẤT BẠI: " + result.getName());
            test.log(Status.FAIL, result.getThrowable());

        } else if (result.getStatus() == ITestResult.SKIP) {
            test.log(Status.SKIP, "Test bị BỎ QUA: " + result.getName());

        } else {
            test.log(Status.PASS, "Test THÀNH CÔNG: " + result.getName());
        }

        // Đóng driver
        DriverManager.quitDriver();
        ExtentReportManager.removeTest();
    }

    // ─────────────────────────────────────────────────
    // Helper methods cho subclasses
    // ─────────────────────────────────────────────────

    protected void logInfo(String message) {
        ExtentReportManager.getTest().log(Status.INFO, message);
    }

    protected void logPass(String message) {
        ExtentReportManager.getTest().log(Status.PASS, message);
    }

    protected void logFail(String message) {
        ExtentReportManager.getTest().log(Status.FAIL, message);
    }

    /**
     * Điều hướng đến trang login và đăng nhập.
     */
    protected void loginAsUser() {
        driver.get(baseUrl + "/login");
        com.gearvault.pages.LoginPage loginPage = new com.gearvault.pages.LoginPage(driver);
        loginPage.login(config.getUserEmail(), config.getUserPassword());
        loginPage.waitForUrlContains("/");
        logInfo("Đã đăng nhập với tài khoản: " + config.getUserEmail());
    }

    protected void loginAsAdmin() {
        driver.get(baseUrl + "/login");
        com.gearvault.pages.LoginPage loginPage = new com.gearvault.pages.LoginPage(driver);
        loginPage.login(config.getAdminEmail(), config.getAdminPassword());
        loginPage.waitForUrlContains("/");
        logInfo("Đã đăng nhập với tài khoản admin: " + config.getAdminEmail());
    }
}
