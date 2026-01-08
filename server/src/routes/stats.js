const express = require('express')
const router = express.Router()
const { Company, Employee, Project, Patrol, PatrolLog } = require('../models')
const { Op } = require('sequelize')

// Get dashboard stats
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query
    const where = companyId ? { company_id: companyId } : {}
    
    const [
      totalCompanies,
      activeEmployees,
      activeProjects,
      activePatrols,
      completedPatrols,
      recentLogs
    ] = await Promise.all([
      Company.count(),
      Employee.count({ where: { ...where, status: 'active' } }),
      Project.count({ where: { ...where, status: 'active' } }),
      Patrol.count({ where: { ...where, status: 'active' } }),
      Patrol.count({ where: { ...where, status: 'completed' } }),
      PatrolLog.count({ 
        where: { 
          check_time: { 
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          } 
        } 
      })
    ])
    
    res.json({
      totalCompanies,
      activeEmployees,
      activeProjects,
      activePatrols,
      completedPatrols,
      pendingPatrols: 0,
      recentLogs
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'İstatistikler getirilirken hata oluştu', error: error.message })
  }
})

module.exports = router
