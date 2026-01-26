const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Personel firma seçmeden eklenebilir (Boşta)
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  // Personel atama durumu
  assignment_status: {
    type: DataTypes.ENUM('idle', 'assigned_to_company', 'assigned_to_project'),
    defaultValue: 'idle'
  },
  // --- Genel Bilgiler ---
  tc_no: {
    type: DataTypes.STRING(11),
    allowNull: true, 
    unique: true  // TC sisteme özel unique
  },
  type: {
    type: DataTypes.ENUM('white_collar', 'blue_collar'),
    allowNull: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  name: { // Deprecated but kept for compatibility
    type: DataTypes.STRING(255),
    allowNull: true
  },
  father_name: { type: DataTypes.STRING(100) },
  mother_name: { type: DataTypes.STRING(100) },
  birth_place: { type: DataTypes.STRING(100) },
  birth_date: { type: DataTypes.DATEONLY },
  marital_status: { type: DataTypes.STRING(50) },
  gender: { type: DataTypes.ENUM('male', 'female') },
  blood_type: { type: DataTypes.STRING(10) },
  military_status: { type: DataTypes.STRING(50) },
  education_level: { type: DataTypes.STRING(50) },
  start_date: { type: DataTypes.DATEONLY },
  status: {
    type: DataTypes.ENUM('active', 'passive', 'archived'),
    defaultValue: 'active'
  },
  height: { type: DataTypes.STRING(10) },
  weight: { type: DataTypes.STRING(10) },
  children_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  title: { type: DataTypes.STRING(100) },

  // --- İletişim Bilgileri ---
  phone: { type: DataTypes.STRING(20) }, // Cep Telefonu
  home_phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  address: { type: DataTypes.TEXT },
  emergency_contact_phone: { type: DataTypes.STRING(20) },
  emergency_contact_name: { type: DataTypes.STRING(100) },

  // --- Sertifika Bilgileri ---
  has_certificate: { type: DataTypes.BOOLEAN, defaultValue: false },
  certificate_city: { type: DataTypes.STRING(100) },
  certificate_no: { type: DataTypes.STRING(100) },
  certificate_date: { type: DataTypes.DATEONLY },
  certificate_expiry: { type: DataTypes.DATEONLY },
  weapon_status: { type: DataTypes.STRING(50) },

  // --- Kıyafet Bedenleri ---
  // JSON olarak saklayalım: { shirt: 'L', shoe: 42, ... }
  clothing_sizes: {
    type: DataTypes.JSON,
    allowNull: true
  },

  // --- Hesap Bilgisi ---
  bank_name: { type: DataTypes.STRING(100) },
  bank_branch_name: { type: DataTypes.STRING(100) },
  bank_branch_code: { type: DataTypes.STRING(50) },
  bank_account_no: { type: DataTypes.STRING(50) },
  iban: { type: DataTypes.STRING(50) },

  // --- Kart Bilgisi ---
  card_type: { type: DataTypes.STRING(50) },
  card_no: { type: DataTypes.STRING(50) },

  // Mobil Uygulama
  // 4 haneli benzersiz aktivasyon kodu
  activation_code: {
    type: DataTypes.STRING(4),
    allowNull: true,
    comment: 'Mobil uygulama giriş kodu (4 haneli)'
  }

}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['activation_code']
    },
    {
      unique: true,
      fields: ['tc_no']
    }
  ],
  hooks: {
    beforeSave: (employee) => {
      // Auto-update full name field for backward compatibility
      if (employee.first_name || employee.last_name) {
        employee.name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
      }
    }
  }
})

module.exports = Employee
