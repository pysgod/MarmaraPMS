require('dotenv').config()
const { sequelize } = require('../models')

async function sync() {
  try {
    await sequelize.sync({ alter: true })
    console.log('✅ Veritabanı senkronize edildi')
    process.exit(0)
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error)
    process.exit(1)
  }
}

sync()
