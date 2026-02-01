const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

const PatrolSection = sequelize.define('PatrolSection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patrol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patrols',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  qr_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    defaultValue: () => `PS-${uuidv4().substring(0, 8).toUpperCase()}`
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'patrol_sections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  hooks: {
    beforeCreate: (section) => {
      if (!section.qr_code) {
        section.qr_code = `PS-${uuidv4().substring(0, 8).toUpperCase()}`
      }
    }
  }
})

module.exports = PatrolSection
