const express = require('express')
const router = express.Router()
const shiftController = require('../controllers/shiftController')
const { authMiddleware: auth, checkRole } = require('../middleware/auth')

// Public routes (none for shifts usually, but if needed)
// Protected routes
router.use(auth)

// Company Shift Definitions
// DEPRECATED: New system uses workSchedule.js
// router.post('/', checkRole(['admin', 'company_manager']), shiftController.createShiftDefinition)
// router.get('/company/:companyId', shiftController.getCompanyShifts)
// router.put('/:id', checkRole(['admin', 'company_manager']), shiftController.updateShiftDefinition)
// router.delete('/:id', checkRole(['admin', 'company_manager']), shiftController.deleteShiftDefinition)

// Project Shift Assignments
// router.get('/project/:projectId', shiftController.getProjectShiftAssignments)
// router.post('/assign', checkRole(['admin', 'company_manager', 'project_manager']), shiftController.assignShift)
// router.post('/unassign', checkRole(['admin', 'company_manager', 'project_manager']), shiftController.unassignShift)

module.exports = router
