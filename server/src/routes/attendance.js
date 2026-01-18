const express = require('express')
const router = express.Router()
const { recordScan, getProjectAttendance, getAttendanceStats } = require('../controllers/attendanceController')

// POST /api/attendance/scan - Record QR scan (entry or exit)
router.post('/scan', recordScan)

// GET /api/attendance/project/:projectId - Get attendance for a project
router.get('/project/:projectId', getProjectAttendance)

// GET /api/attendance/stats/:projectId - Get attendance stats for a project
router.get('/stats/:projectId', getAttendanceStats)

module.exports = router
