package com.gearvault.pages;

import com.gearvault.utils.WaitHelper;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.Select;

import java.util.List;

/**
 * Base class cho tất cả Page Objects.
 * Cung cấp các phương thức helper chung, tất cả đều dùng wait thay vì sleep.
 */
public abstract class BasePage {

    protected final WebDriver driver;
    protected final WaitHelper wait;
    protected final Actions actions;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WaitHelper(driver);
        this.actions = new Actions(driver);
        // Khởi tạo @FindBy annotations
        PageFactory.initElements(driver, this);
    }

    // =============================================
    // Navigation
    // =============================================

    public void navigateTo(String url) {
        driver.get(url);
        wait.waitForPageLoad();
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public String getPageTitle() {
        return driver.getTitle();
    }

    // =============================================
    // Element interactions - tất cả có wait
    // =============================================

    protected void click(By locator) {
        wait.waitForClickable(locator).click();
    }

    protected void click(WebElement element) {
        wait.waitForClickable(element).click();
    }

    /** Click bằng JavaScript - dùng khi element bị che khuất */
    protected void jsClick(By locator) {
        WebElement element = wait.waitForPresence(locator);
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    protected void jsClick(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }

    protected void type(By locator, String text) {
        WebElement element = wait.waitForVisible(locator);
        element.clear();
        element.sendKeys(text);
    }

    protected void type(WebElement element, String text) {
        wait.waitForVisible(element);
        element.clear();
        element.sendKeys(text);
    }

    protected void clearAndType(By locator, String text) {
        WebElement element = wait.waitForVisible(locator);
        element.sendKeys(Keys.CONTROL + "a");
        element.sendKeys(Keys.DELETE);
        element.sendKeys(text);
    }

    protected String getText(By locator) {
        return wait.waitForVisible(locator).getText().trim();
    }

    protected String getText(WebElement element) {
        return wait.waitForVisible(element).getText().trim();
    }

    protected String getAttribute(By locator, String attribute) {
        return wait.waitForPresence(locator).getAttribute(attribute);
    }

    protected boolean isDisplayed(By locator) {
        try {
            return wait.waitForVisible(locator).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            return false;
        }
    }

    protected boolean isDisplayed(WebElement element) {
        try {
            return wait.waitForVisible(element).isDisplayed();
        } catch (TimeoutException | StaleElementReferenceException e) {
            return false;
        }
    }

    protected boolean isEnabled(By locator) {
        return wait.waitForPresence(locator).isEnabled();
    }

    protected List<WebElement> findElements(By locator) {
        return driver.findElements(locator);
    }

    // =============================================
    // Dropdown
    // =============================================

    protected void selectByText(By locator, String visibleText) {
        WebElement element = wait.waitForVisible(locator);
        new Select(element).selectByVisibleText(visibleText);
    }

    protected void selectByValue(By locator, String value) {
        WebElement element = wait.waitForVisible(locator);
        new Select(element).selectByValue(value);
    }

    // =============================================
    // Hover
    // =============================================

    protected void hover(By locator) {
        WebElement element = wait.waitForVisible(locator);
        actions.moveToElement(element).perform();
    }

    // =============================================
    // Scroll
    // =============================================

    protected void scrollToElement(By locator) {
        WebElement element = wait.waitForPresence(locator);
        ((JavascriptExecutor) driver)
            .executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);
    }

    public void scrollToElement(WebElement element) {
        ((JavascriptExecutor) driver)
            .executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);
    }

    public void scrollToBottom() {
        ((JavascriptExecutor) driver)
            .executeScript("window.scrollTo(0, document.body.scrollHeight);");
    }

    // =============================================
    // Wait helpers
    // =============================================

    public void waitForUrlContains(String partialUrl) {
        wait.waitForUrlContains(partialUrl);
    }

    public void waitForVisible(By locator) {
        wait.waitForVisible(locator);
    }

    public void waitForInvisible(By locator) {
        wait.waitForInvisible(locator);
    }
}
