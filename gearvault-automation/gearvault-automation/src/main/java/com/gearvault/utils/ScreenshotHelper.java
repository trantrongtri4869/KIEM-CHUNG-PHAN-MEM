package com.gearvault.utils;

import com.gearvault.config.ConfigReader;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Chụp màn hình khi test thất bại.
 */
public class ScreenshotHelper {

    private static final ConfigReader config = ConfigReader.getInstance();
    private static final DateTimeFormatter FORMATTER =
        DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private ScreenshotHelper() {}

    /**
     * Chụp màn hình và lưu vào thư mục screenshot.
     * @return đường dẫn file screenshot (để đính kèm vào report)
     */
    public static String takeScreenshot(WebDriver driver, String testName) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String fileName = testName + "_" + timestamp + ".png";
        String dirPath = config.getScreenshotDir();

        try {
            // Tạo thư mục nếu chưa tồn tại
            Path dir = Paths.get(dirPath);
            Files.createDirectories(dir);

            // Chụp screenshot
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path destPath = dir.resolve(fileName);
            Files.copy(srcFile.toPath(), destPath);

            return destPath.toAbsolutePath().toString();
        } catch (IOException e) {
            System.err.println("Không thể lưu screenshot: " + e.getMessage());
            return "";
        }
    }
}
