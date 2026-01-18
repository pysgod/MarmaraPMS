const express = require('express')
const router = express.Router()
const shiftTypeController = require('../controllers/shiftTypeController')
const { authMiddleware: auth, checkRole } = require('../middleware/auth') // Assuming auth needed

// Public or protected? Usually protected
router.use(auth)

// Get all shift types for a project
router.get('/project/:projectId', shiftTypeController.getProjectShiftTypes)

// Create
router.post('/', checkRole(['admin', 'company_manager', 'project_manager']), shiftTypeController.createShiftType)

// Update
router.put('/:id', checkRole(['admin', 'company_manager', 'project_manager']), shiftTypeController.updateShiftType)

// Delete
router.delete('/:id', checkRole(['admin', 'company_manager', 'project_manager']), shiftTypeController.deleteShiftType)

// Reorder
router.post('/reorder', checkRole(['admin', 'company_manager', 'project_manager']), shiftTypeController.reorderShiftTypes)

module.exports = router
