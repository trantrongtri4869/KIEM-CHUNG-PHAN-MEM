package com.gearvault.utils;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.gearvault.config.ConfigReader;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Quản lý ExtentReports HTML report.
 * ThreadLocal để hỗ trợ parallel test.
 */
public class ExtentReportManager {

    private static ExtentReports extentReports;
    private static final ThreadLocal<ExtentTest> testThreadLocal = new ThreadLocal<>();
    private static final ConfigReader config = ConfigReader.getInstance();

    private ExtentReportManager() {}

    /**
     * Khởi tạo ExtentReports - gọi một lần trước khi chạy suite.
     */
    public static synchronized ExtentReports getInstance() {
        if (extentReports == null) {
            String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String reportPath = config.getReportDir() + "/GearVault_Report_" + timestamp + ".html";

            ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath);
            sparkReporter.config().setTheme(Theme.DARK);
            sparkReporter.config().setDocumentTitle("GearVault Automation Report");
            sparkReporter.config().setReportName("GearVault UI Test Results");
            sparkReporter.config().setTimelineEnabled(true);

            extentReports = new ExtentReports();
            extentReports.attachReporter(sparkReporter);
            extentReports.setSystemInfo("Application", "GearVault E-Commerce");
            extentReports.setSystemInfo("Environment", config.getBaseUrl());
            extentReports.setSystemInfo("Browser", config.getBrowser());
            extentReports.setSystemInfo("OS", System.getProperty("os.name"));
            extentReports.setSystemInfo("Java Version", System.getProperty("java.version"));
        }
        return extentReports;
    }

    public static void createTest(String testName, String description) {
        ExtentTest test = getInstance().createTest(testName, description);
        testThreadLocal.set(test);
    }

    public static ExtentTest getTest() {
        return testThreadLocal.get();
    }

    public static void removeTest() {
        testThreadLocal.remove();
    }

    public static synchronized void flush() {
        if (extentReports != null) {
            extentReports.flush();
        }
    }
}
