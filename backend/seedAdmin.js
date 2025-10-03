const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Delete existing admin
    await Admin.deleteMany({});

    // Create default admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@coffeeplease.com',
      phone: '09171234567',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin created successfully!');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Phone:', admin.phone);
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();