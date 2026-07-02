const mongoose = require('mongoose');
const { User } = require('../models'); 
require('dotenv').config({ path: '../../.env' }); 

const seedAdmin = async () => {
    console.log("--- Bắt đầu script tạo Admin ---"); 
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gearvault');
        
        const email = 'admin@gearvault.com';
        const existingAdmin = await User.findOne({ email });
        
        if (existingAdmin) {
            console.log('Admin đã tồn tại!');
        } else {
            const adminData = {
                name: 'Admin GearVault',
                email: email,
                password: 'admin123',
                role: 'admin'
            };
            await User.create(adminData);
            console.log('Tạo Admin thành công!');
        }
    } catch (error) {
        console.error('Lỗi chi tiết:', error);
    } finally {
        await mongoose.disconnect();
        console.log("--- Kết thúc script ---");
        process.exit();
    }
};

seedAdmin(); 