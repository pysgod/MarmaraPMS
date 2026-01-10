require('dotenv').config();
const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected.');

    const email = 'admin@marmara.com';
    const password = 'admin123';

    console.log(`Attempting login with ${email}...`);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    console.log('✅ User found.');

    const isValid = await user.validatePassword(password);
    console.log(`Password valid: ${isValid}`);
    
    if (!isValid) {
      console.log('❌ Password mismatch!');
      return;
    }

    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET missing in env!');
        return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    console.log('✅ Token generated successfully.');
    console.log('Login Flow OK.');

  } catch (error) {
    console.error('❌ Login Error:', error);
  } finally {
    process.exit();
  }
}

testLogin();
