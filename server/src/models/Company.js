const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  company_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('active', 'passive', 'archived'),
    defaultValue: 'active'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Türkiye'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  fax: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tax_office: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tax_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sgk_number: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  registration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Europe/Istanbul'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: true
})

module.exports = Company

