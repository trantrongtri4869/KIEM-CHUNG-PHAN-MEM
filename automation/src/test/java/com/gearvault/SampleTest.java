package com.gearvault;

import org.testng.Assert;
import org.testng.annotations.Test;
import java.net.HttpURLConnection;
import java.net.URL;

public class SampleTest {

    @Test
    public void testGearVaultPipelineConnection() {
        System.out.println("🟢 [GearVault-CI] Dang khoi chay bo kiem thu he thong tu dong...");
        try {
            URL url = new URL("https://www.google.com");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            int responseCode = connection.getResponseCode();
            System.out.println("🟢 [GearVault-CI] Phan hoi tu may chu: " + responseCode);
            
            Assert.assertEquals(responseCode, 200, "May ao Actions ket noi mang thanh cong!");
        } catch (Exception e) {
            System.out.println("❌ [GearVault-CI] Loi ket noi: " + e.getMessage());
            Assert.fail(e.getMessage());
        }
    }
}
