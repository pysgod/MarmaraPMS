const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    
    const admin = await User.findOne({ where: { email: 'admin@marmara.com' } });
    if (!admin) {
        console.log('Admin user not found to reset.');
        return;
    }

    // Hash manually to be sure (or let hook do it if updating via instance)
    // Let's rely on hook first
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Admin password reset to: admin123');
    
    // Verify immediately
    const valid = await admin.validatePassword('admin123');
    console.log(`Verifying... Is Valid: ${valid}`);

  } catch (error) {
    console.error('Reset Error:', error);
  } finally {
    process.exit();
  }
}

resetAdminPassword();
