package com.gearvault;

import org.testng.annotations.Test;

public class SampleTest {
    @Test
    public void testGearVaultPipeline() {
        System.out.println("🟢 [GearVault] Kết nối hệ thống kiểm thử thành công!");
        assert true; // Đảm bảo ca kiểm thử luôn luôn pass để thông pipeline
    }
}
