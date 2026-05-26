package com.gearvault;

import org.testng.Assert;
import org.testng.annotations.Test;
import java.net.HttpURLConnection;
import java.net.URL;

public class SampleTest {

    @Test
    public void testGearVaultPipeline Connection() {
        System.out.println("🟢 [GearVault-CI] Đang khởi chạy bộ kiểm thử hệ thống tự động...");
        try {
            // Kiểm tra kết nối mạng của máy ảo thông qua một máy chủ tin cậy
            URL url = new URL("https://www.google.com");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();
            System.out.println("🟢 [GearVault-CI] Phản hồi từ máy chủ: " + responseCode);
            
            // Nếu phản hồi là 200 OK, chứng tỏ pipeline thông suốt
            Assert.assertEquals(responseCode, 200, "Máy ảo Actions kết nối mạng thành công!");
        } catch (Exception e) {
            System.out.println("❌ [GearVault-CI] Lỗi kết nối: " + e.getMessage());
            Assert.fail(e.getMessage());
        }
    }
}
