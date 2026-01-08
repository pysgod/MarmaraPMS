const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ProjectClothingType = sequelize.define('ProjectClothingType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  clothing_type: {
    type: DataTypes.ENUM('shirt', 'sweater', 'pants', 'coat', 'shoes', 'suit', 'beret', 'cap', 'uniform'),
    allowNull: false
  }
}, {
  tableName: 'project_clothing_types',
  timestamps: true,
  underscored: true
})

module.exports = ProjectClothingType
