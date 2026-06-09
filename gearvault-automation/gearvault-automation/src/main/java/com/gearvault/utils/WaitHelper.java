package com.gearvault.utils;

import com.gearvault.config.ConfigReader;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Tập trung tất cả wait logic.
 * KHÔNG dùng Thread.sleep() ở bất kỳ đâu.
 * Chỉ dùng WebDriverWait + ExpectedConditions.
 */
public class WaitHelper {

    private final WebDriverWait wait;
    private final WebDriver driver;

    public WaitHelper(WebDriver driver) {
        this.driver = driver;
        int timeout = ConfigReader.getInstance().getExplicitWait();
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeout));
    }

    /** Tạo wait với timeout tùy chỉnh */
    public WaitHelper(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    // =============================================
    // Visibility
    // =============================================

    /** Chờ element hiển thị trên DOM và visible */
    public WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    public WebElement waitForVisible(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element));
    }

    /** Chờ element biến mất */
    public boolean waitForInvisible(By locator) {
        return wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    /** Chờ tất cả elements trong danh sách visible */
    public List<WebElement> waitForAllVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    // =============================================
    // Clickability
    // =============================================

    /** Chờ element có thể click được (visible + enabled) */
    public WebElement waitForClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    public WebElement waitForClickable(WebElement element) {
        return wait.until(ExpectedConditions.elementToBeClickable(element));
    }

    // =============================================
    // Presence
    // =============================================

    /** Chờ element tồn tại trong DOM (không cần visible) */
    public WebElement waitForPresence(By locator) {
        return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    public List<WebElement> waitForAllPresent(By locator) {
        return wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
    }

    // =============================================
    // URL & Title
    // =============================================

    /** Chờ URL chứa chuỗi nhất định */
    public boolean waitForUrlContains(String partialUrl) {
        return wait.until(ExpectedConditions.urlContains(partialUrl));
    }

    /** Chờ URL khớp chính xác */
    public boolean waitForUrlToBe(String exactUrl) {
        return wait.until(ExpectedConditions.urlToBe(exactUrl));
    }

    /** Chờ title trang chứa chuỗi */
    public boolean waitForTitleContains(String partialTitle) {
        return wait.until(ExpectedConditions.titleContains(partialTitle));
    }

    // =============================================
    // Text & Attribute
    // =============================================

    /** Chờ text của element không rỗng */
    public boolean waitForTextPresent(By locator, String text) {
        return wait.until(ExpectedConditions.textToBePresentInElementLocated(locator, text));
    }

    /** Chờ attribute của element có giá trị nhất định */
    public boolean waitForAttributeContains(By locator, String attribute, String value) {
        return wait.until(ExpectedConditions.attributeContains(locator, attribute, value));
    }

    // =============================================
    // Selection / State
    // =============================================

    /** Chờ số lượng elements đúng với expected */
    public List<WebElement> waitForNumberOfElements(By locator, int expectedCount) {
        return wait.until(ExpectedConditions.numberOfElementsToBe(locator, expectedCount));
    }

    /** Chờ số lượng elements >= minimum */
    public List<WebElement> waitForMinimumElements(By locator, int minimum) {
        return wait.until(ExpectedConditions.numberOfElementsToBeMoreThan(locator, minimum - 1));
    }

    // =============================================
    // Page Load
    // =============================================

    /** Chờ page load xong (document.readyState === 'complete') */
    public void waitForPageLoad() {
        wait.until((ExpectedCondition<Boolean>) wd ->
            ((JavascriptExecutor) wd)
                .executeScript("return document.readyState")
                .equals("complete")
        );
    }

    /** Chờ React/SPA render xong - chờ loading spinner biến mất */
    public void waitForSpinnerToDisappear(By spinnerLocator) {
        try {
            // Chờ spinner xuất hiện trước (nếu có)
            new WebDriverWait(driver, Duration.ofSeconds(2))
                .until(ExpectedConditions.visibilityOfElementLocated(spinnerLocator));
            // Rồi chờ nó biến mất
            wait.until(ExpectedConditions.invisibilityOfElementLocated(spinnerLocator));
        } catch (TimeoutException e) {
            // Spinner không xuất hiện hoặc đã biến mất - OK
        }
    }

    // =============================================
    // Alert
    // =============================================

    public Alert waitForAlert() {
        return wait.until(ExpectedConditions.alertIsPresent());
    }

    // =============================================
    // Custom condition
    // =============================================

    /** Chờ với điều kiện tùy chỉnh */
    public <T> T waitFor(ExpectedCondition<T> condition) {
        return wait.until(condition);
    }

    /** Chờ với timeout tùy chỉnh */
    public <T> T waitFor(ExpectedCondition<T> condition, int timeoutSeconds) {
        return new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds))
            .until(condition);
    }
}
