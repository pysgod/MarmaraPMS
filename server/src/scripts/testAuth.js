require('dotenv').config({ path: '../../.env' })
const { sequelize, User } = require('../models')

async function fixPassword() {
  try {
    await sequelize.authenticate()
    console.log('DB Connection OK')

    const user = await User.findOne({ where: { email: 'admin@marmara.com' } })
    if (!user) {
      console.log('User NOT FOUND!')
      return
    }
    
    // Set plain password - the model hook will hash it!
    user.password = 'admin123'
    await user.save()
    console.log('Password reset to admin123 (plain -> hashed by hook)')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sequelize.close()
  }
}

fixPassword()
