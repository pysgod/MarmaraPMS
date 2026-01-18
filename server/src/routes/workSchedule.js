const express = require('express')
const router = express.Router()
const workScheduleController = require('../controllers/workScheduleController')
const { authMiddleware: auth, checkRole } = require('../middleware/auth')

// All routes require authentication
router.use(auth)

// Get work schedule for a project (year/month as query params)
router.get('/project/:projectId', workScheduleController.getProjectWorkSchedule)

// Get monthly summary for accounting
router.get('/project/:projectId/summary', workScheduleController.getMonthlySummary)

// Get work schedule for a specific employee
router.get('/employee/:employeeId', workScheduleController.getEmployeeWorkSchedule)

// Get company-wide stats for charts
router.get('/company/:companyId/stats', workScheduleController.getCompanyWorkScheduleStats)

// Update single cell
router.post('/update', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.updateWorkSchedule)

// Toggle shift type (cycle through: off -> sabahci -> aksamci -> tam_gun -> off)
router.post('/toggle', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.toggleWorkSchedule)

// Set leave type
router.post('/leave', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.setLeaveType)

// Bulk update
router.post('/bulk', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.bulkUpdateWorkSchedule)

// Joker routes
router.get('/jokers/:projectId', workScheduleController.getProjectJokers)
router.post('/jokers/toggle', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.toggleJoker)
router.post('/jokers', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.addJoker)
router.delete('/jokers/:id', checkRole(['admin', 'company_manager', 'project_manager']), workScheduleController.deleteJoker)

module.exports = router
