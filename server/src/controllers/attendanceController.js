const { Op } = require('sequelize')
const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const WorkSchedule = require('../models/WorkSchedule')
const ShiftType = require('../models/ShiftType')

/**
 * Record a QR scan for attendance (Entry or Exit)
 * POST /api/attendance/scan
 * Body: { projectId, employeeId, type: 'entry' | 'exit' }
 */
const recordScan = async (req, res) => {
  try {
    const { projectId, employeeId, type } = req.body

    if (!projectId || !employeeId || !type) {
      return res.status(400).json({ message: 'projectId, employeeId, and type are required' })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const now = new Date()

    // Find or create today's attendance record
    let attendance = await Attendance.findOne({
      where: {
        project_id: projectId,
        employee_id: employeeId,
        date: today
      }
    })

    if (type === 'entry') {
      if (attendance && attendance.check_in_time) {
        return res.status(400).json({ message: 'Giriş zaten yapılmış', attendance })
      }

      if (!attendance) {
        attendance = await Attendance.create({
          project_id: projectId,
          employee_id: employeeId,
          date: today,
          check_in_time: now,
          status: 'incomplete',
          verification_method: 'qr'
        })
      } else {
        attendance.check_in_time = now
        await attendance.save()
      }

      // Check lateness - get today's work schedule with shift type
      const workSchedule = await WorkSchedule.findOne({
        where: {
          project_id: projectId,
          employee_id: employeeId,
          date: today
        },
        include: [{
          model: ShiftType,
          as: 'shiftType'
        }]
      })

      if (workSchedule && workSchedule.shiftType && workSchedule.shiftType.start_time) {
        const shiftStart = new Date(`${today}T${workSchedule.shiftType.start_time}`)
        const gracePeriod = 15 * 60 * 1000 // 15 minutes grace
        if (now > new Date(shiftStart.getTime() + gracePeriod)) {
          attendance.status = 'late'
          await attendance.save()
        }
      }

      return res.json({ message: 'Giriş kaydedildi', attendance })
    }

    if (type === 'exit') {
      if (!attendance) {
        return res.status(400).json({ message: 'Önce giriş yapılmalı' })
      }

      if (attendance.check_out_time) {
        return res.status(400).json({ message: 'Çıkış zaten yapılmış', attendance })
      }

      attendance.check_out_time = now

      // Calculate actual worked hours
      const checkIn = new Date(attendance.check_in_time)
      const diffMs = now - checkIn
      const actualHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Round to 2 decimals
      attendance.actual_hours = actualHours

      // Get planned hours from shift type
      const workSchedule = await WorkSchedule.findOne({
        where: {
          project_id: projectId,
          employee_id: employeeId,
          date: today
        },
        include: [{
          model: ShiftType,
          as: 'shiftType'
        }]
      })

      let plannedHours = 0
      if (workSchedule && workSchedule.shiftType && workSchedule.shiftType.hours) {
        plannedHours = parseFloat(workSchedule.shiftType.hours)
      }
      attendance.planned_hours = plannedHours

      // Calculate overtime (if actual > planned)
      const overtime = actualHours > plannedHours ? Math.round((actualHours - plannedHours) * 100) / 100 : 0
      attendance.overtime_hours = overtime

      // If was incomplete, mark as present (or keep late if it was late)
      if (attendance.status === 'incomplete') {
        attendance.status = 'present'
      }

      await attendance.save()

      return res.json({ 
        message: 'Çıkış kaydedildi', 
        attendance,
        summary: {
          planned: plannedHours,
          actual: actualHours,
          overtime: overtime
        }
      })
    }

    return res.status(400).json({ message: 'type must be "entry" or "exit"' })
  } catch (error) {
    console.error('Attendance scan error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Get attendance records for a project in a date range
 * GET /api/attendance/project/:projectId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getProjectAttendance = async (req, res) => {
  try {
    const { projectId } = req.params
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' })
    }

    const attendances = await Attendance.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['date', 'ASC']]
    })

    res.json(attendances)
  } catch (error) {
    console.error('Get project attendance error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Get attendance summary/stats for a project
 * GET /api/attendance/stats/:projectId?month=YYYY-MM
 */
const getAttendanceStats = async (req, res) => {
  try {
    const { projectId } = req.params
    const { month } = req.query // Format: YYYY-MM

    if (!month) {
      return res.status(400).json({ message: 'month parameter is required (YYYY-MM)' })
    }

    const [year, monthNum] = month.split('-')
    const startDate = `${year}-${monthNum}-01`
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0] // Last day of month

    const attendances = await Attendance.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      late: attendances.filter(a => a.status === 'late').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      incomplete: attendances.filter(a => a.status === 'incomplete').length,
      earlyLeave: attendances.filter(a => a.status === 'early_leave').length
    }

    res.json(stats)
  } catch (error) {
    console.error('Get attendance stats error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  recordScan,
  getProjectAttendance,
  getAttendanceStats
}
