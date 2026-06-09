package com.gearvault.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Đọc cấu hình từ file config.properties.
 * Singleton pattern để chỉ load file một lần.
 */
public class ConfigReader {

    private static ConfigReader instance;
    private final Properties properties;

    private static final String CONFIG_PATH = "src/test/resources/config.properties";

    private ConfigReader() {
        properties = new Properties();
        try (InputStream input = new FileInputStream(CONFIG_PATH)) {
            properties.load(input);
        } catch (IOException e) {
            throw new RuntimeException("Không tìm thấy file config.properties: " + CONFIG_PATH, e);
        }
    }

    public static ConfigReader getInstance() {
        if (instance == null) {
            synchronized (ConfigReader.class) {
                if (instance == null) {
                    instance = new ConfigReader();
                }
            }
        }
        return instance;
    }

    public String getProperty(String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new RuntimeException("Không tìm thấy property: " + key);
        }
        return value.trim();
    }

    public String getBaseUrl()           { return getProperty("base.url"); }
    public String getBrowser()           { return getProperty("browser"); }
    public boolean isHeadless()          { return Boolean.parseBoolean(getProperty("headless")); }
    public int getExplicitWait()         { return Integer.parseInt(getProperty("explicit.wait")); }
    public int getPageLoadTimeout()      { return Integer.parseInt(getProperty("page.load.timeout")); }
    public boolean isScreenshotOnFail()  { return Boolean.parseBoolean(getProperty("screenshot.on.failure")); }
    public String getReportDir()         { return getProperty("report.dir"); }
    public String getScreenshotDir()     { return getProperty("screenshot.dir"); }

    // Test accounts
    public String getUserEmail()         { return getProperty("user.email"); }
    public String getUserPassword()      { return getProperty("user.password"); }
    public String getUserName()          { return getProperty("user.name"); }
    public String getAdminEmail()        { return getProperty("admin.email"); }
    public String getAdminPassword()     { return getProperty("admin.password"); }

    // Coupon codes
    public String getValidCoupon()       { return getProperty("coupon.valid"); }
    public String getInvalidCoupon()     { return getProperty("coupon.invalid"); }
}
