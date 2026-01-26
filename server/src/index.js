require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { sequelize } = require('./models')

// Routes
const authRoutes = require('./routes/auth')
const companyRoutes = require('./routes/companies')
const projectRoutes = require('./routes/projects')
const employeeRoutes = require('./routes/employees')
const patrolRoutes = require('./routes/patrols')
const notificationRoutes = require('./routes/notifications')

const statsRoutes = require('./routes/stats')
const reportRoutes = require('./routes/reports')
const documentRoutes = require('./routes/documents')
const activityRoutes = require('./routes/activities')
const shiftRoutes = require('./routes/shifts')
const workScheduleRoutes = require('./routes/workSchedule')
const shiftTypeRoutes = require('./routes/shiftTypes')
const attendanceRoutes = require('./routes/attendance')
const mobileRoutes = require('./routes/mobile')
const app = express()

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowed = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
    if (!origin || allowed.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/patrols', patrolRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/shifts', shiftRoutes)
app.use('/api/work-schedule', workScheduleRoutes)
app.use('/api/shift-types', shiftTypeRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/data-view', require('./routes/dataView'))
app.use('/api/mobile', mobileRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Sunucu hatası', error: err.message })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' })
})

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await sequelize.authenticate()
    console.log('✅ PostgreSQL bağlantısı başarılı')
    
    // Sync database - alter tables to match models without dropping
    await sequelize.sync({ alter: true })
    console.log('✅ Veritabanı senkronize edildi (Veriler korundu)')
    
    // Initialize scheduled jobs
    require('./services/scheduler')

    // Run seed after sync
    // await require('./scripts/seedDb').seed()
    console.log('✅ Veritabanı hazır')
    
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`)
    })
  } catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error)
    process.exit(1)
  }
}

start()
