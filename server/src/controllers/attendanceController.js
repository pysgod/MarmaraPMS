const { Op } = require('sequelize')
const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const WorkSchedule = require('../models/WorkSchedule')
const ShiftType = require('../models/ShiftType')
const EmployeeHistory = require('../models/EmployeeHistory')

/**
 * Record a QR scan for attendance (Entry or Exit)
 * POST /api/attendance/scan
 * Body: { projectId, employeeId, type: 'entry' | 'exit' }
 */
const recordScan = async (req, res) => {
  try {
    // Helper to parsing "HH:mm:ss" to Date on a specific day
    const parseTime = (dateStr, timeStr) => {
      if (!timeStr) return null
      return new Date(`${dateStr}T${timeStr}`)
    }

    // Helper to calculate overlap in minutes between two ranges [start1, end1] and [start2, end2]
    const getOverlapMinutes = (start1, end1, start2, end2) => {
      const maxStart = new Date(Math.max(start1, start2))
      const minEnd = new Date(Math.min(end1, end2))
      if (maxStart < minEnd) {
        return (minEnd - maxStart) / (1000 * 60)
      }
      return 0
    }

    const { projectId, employeeId, type } = req.body

    console.log(`[SCAN ATTEMPT] Project: ${projectId}, Employee: ${employeeId}, Type: ${type}`)

    if (!projectId || !employeeId || !type) {
      console.warn('[SCAN ERROR] Missing fields')
      return res.status(400).json({ message: 'projectId, employeeId, and type are required' })
    }

    // Use local date to match database records (stored as YYYY-MM-DD based on local time)
    const toLocalDateString = (date) => {
      const offset = date.getTimezoneOffset()
      const localDate = new Date(date.getTime() - (offset * 60 * 1000))
      return localDate.toISOString().split('T')[0]
    }

    const now = new Date()
    const today = toLocalDateString(now)
    console.log(`[SCAN DATE] Local Date for DB Query: ${today}, Time: ${now.toLocaleTimeString()}`)

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId)
    if (!employee) {
       console.error(`[SCAN ERROR] Employee not found: ${employeeId}`)
       return res.status(404).json({ message: 'Personel bulunamadı' })
    }

    // Find or create today's attendance record
    let attendance = await Attendance.findOne({
      where: {
        project_id: projectId,
        employee_id: employeeId,
        date: today
      }
    })

    // Get today's work schedule with BOTH shift types
    const workSchedule = await WorkSchedule.findOne({
      where: {
        project_id: projectId,
        employee_id: employeeId,
        date: today
      },
      include: [
        { model: ShiftType, as: 'shiftType' },
        { model: ShiftType, as: 'mesaiShiftType' }
      ]
    })

    console.log(`[SCAN DATA] Found Attendance: ${attendance ? 'Yes' : 'No'}`)

    // --- ENTRY LOGIC ---
    if (type === 'entry') {
      if (attendance && attendance.check_in_time) {
        console.warn(`[SCAN WARNING] Entry already exists for ${employeeId}`)
        return res.status(400).json({ message: 'Giriş zaten yapılmış', attendance })
      }

      if (!attendance) {
        attendance = await Attendance.create({
          project_id: projectId,
          employee_id: employeeId,
          date: today,
          check_in_time: now,
          status: 'incomplete', // Will update to late/present based on schedule
          verification_method: 'qr'
        })
        console.log(`[SCAN SUCCESS] Created new attendance for ${employeeId}`)
      } else {
        attendance.check_in_time = now
        attendance.status = 'incomplete' // Reset status on re-entry attempt if needed
        await attendance.save()
        console.log(`[SCAN SUCCESS] Updated existing attendance entry for ${employeeId}`)
      }

      // Determine Start Context (Regular vs Overtime)
      let logMessage = `QR ile giriş yapıldı. Saat: ${now.toLocaleTimeString('tr-TR')}`
      let isLate = false
      let expectedStart = null
      let context = 'Normal'

      if (workSchedule) {
        const regularStart = workSchedule.shiftType ? parseTime(today, workSchedule.shiftType.start_time) : null
        const mesaiStart = workSchedule.mesaiShiftType ? parseTime(today, workSchedule.mesaiShiftType.start_time) : null

        // Determine which one we are starting closest to (or if we are late for one)
        // Simple heuristic: If now is before regularStart, and mesaiStart is even earlier, check logic
        
        let targetStart = regularStart
        // If we have both, and Mesai is strictly earlier than Regular, and we are entering roughly before Regular
        if (mesaiStart && regularStart && mesaiStart < regularStart) {
            // Mesai is first (Morning Overtime)
            // If we are closer to Mesai start than Regular start?
            // Or simply: if now < (RegularStart - buffer), assume starting for Mesai
            if (now < new Date(regularStart.getTime() - 30 * 60000)) { 
                context = 'Mesai'
                targetStart = mesaiStart
            }
        } else if (mesaiStart && regularStart && mesaiStart > regularStart) {
             // Mesai is after (Evening Overtime) -> Standard start is Regular
             context = 'Vardiya'
             targetStart = regularStart
        } else if (mesaiStart && !regularStart) {
             context = 'Mesai'
             targetStart = mesaiStart
        } else if (regularStart) {
             context = 'Vardiya'
             targetStart = regularStart
        }

        if (context === 'Mesai') {
            logMessage += ` (Tespit Edilen: Mesai Başlangıcı)`
        } else if (context === 'Vardiya') {
            logMessage += ` (Tespit Edilen: Vardiya Başlangıcı)`
        }

        // Lateness Check (Grace Period 15m)
        if (targetStart) {
           const gracePeriod = 15 * 60 * 1000
           if (now > new Date(targetStart.getTime() + gracePeriod)) {
             isLate = true
             attendance.status = 'late'
             await attendance.save()
             logMessage += ` [GEÇ KALDI - ${context}]`
           }
        }
      }

      // Log to archive
      try {
        await EmployeeHistory.create({
          employee_id: employeeId,
          project_id: projectId,
          company_id: employee.company_id, // Ensure company_id is logged if possible, usually inferred
          action: 'shift_entry',
          notes: logMessage
        })
      } catch (historyError) {
        console.error('Failed to log entry to history:', historyError)
      }

      let responseMessage = 'Giriş kaydedildi'
      if (context === 'Mesai') {
        responseMessage = 'Mesai Başlangıcı Kaydedildi'
      } else if (context === 'Vardiya') {
        responseMessage = 'Vardiya Başlangıcı Kaydedildi'
      }
      
      return res.json({ 
        message: responseMessage, 
        attendance,
        context: context // Sending context explicitly if frontend wants to use it for coloring etc.
      })
    }

    // --- EXIT LOGIC ---
    if (type === 'exit') {
      if (!attendance) {
        console.warn(`[SCAN ERROR] Exit attempted without entry for ${employeeId}`)
        return res.status(400).json({ message: 'Önce giriş yapılmalı' })
      }

      if (attendance.check_out_time) {
        console.warn(`[SCAN WARNING] Exit already exists for ${employeeId}`)
        return res.status(400).json({ message: 'Çıkış zaten yapılmış', attendance })
      }

      attendance.check_out_time = now
      
      // Calculate Total Actual Hours
      const checkIn = new Date(attendance.check_in_time)
      const diffMs = now - checkIn
      const actualHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100
      attendance.actual_hours = actualHours

      // Calculate Planned (Regular) Hours
      let plannedHours = 0
      let plannedMesaiHours = 0

      if (workSchedule && workSchedule.shiftType && workSchedule.shiftType.hours) {
        plannedHours = parseFloat(workSchedule.shiftType.hours)
      }
      if (workSchedule && workSchedule.mesaiShiftType && workSchedule.mesaiShiftType.hours) {
        plannedMesaiHours = parseFloat(workSchedule.mesaiShiftType.hours)
      }
      attendance.planned_hours = plannedHours

      // Calculate actual hours using OVERLAP with shift windows
      let actualShiftHours = 0
      let actualMesaiHours = 0
      
      // Try to compute overlap if windows exist
      if (workSchedule) {
          const regStart = workSchedule.shiftType ? parseTime(today, workSchedule.shiftType.start_time) : null
          const regEnd = workSchedule.shiftType ? parseTime(today, workSchedule.shiftType.end_time) : null
          const mesStart = workSchedule.mesaiShiftType ? parseTime(today, workSchedule.mesaiShiftType.start_time) : null
          const mesEnd = workSchedule.mesaiShiftType ? parseTime(today, workSchedule.mesaiShiftType.end_time) : null
          
          // Handle midnight crossing for End times if End < Start
          if (regStart && regEnd && regEnd < regStart) regEnd.setDate(regEnd.getDate() + 1)
          if (mesStart && mesEnd && mesEnd < mesStart) mesEnd.setDate(mesEnd.getDate() + 1)

          // Calculate overlap with each window
          if (regStart && regEnd) {
             const regOverlap = getOverlapMinutes(checkIn, now, regStart, regEnd)
             actualShiftHours = Math.round((regOverlap / 60) * 100) / 100
          }
          if (mesStart && mesEnd) {
             const mesOverlap = getOverlapMinutes(checkIn, now, mesStart, mesEnd)
             actualMesaiHours = Math.round((mesOverlap / 60) * 100) / 100
          }
      }
      
      // If no mesai shift defined, use the old calculation: overtime = actual - planned
      if (!workSchedule?.mesaiShiftType) {
          actualShiftHours = actualHours > plannedHours ? plannedHours : actualHours
          actualMesaiHours = actualHours > plannedHours ? Math.round((actualHours - plannedHours) * 100) / 100 : 0
      }
      
      // Store values - actual_hours is total, overtime_hours is mesai portion
      attendance.actual_hours = actualHours // Total time worked
      attendance.overtime_hours = actualMesaiHours // Mesai time specifically

      // Detailed Breakdown for Logging
      let breakdownMsg = `Toplam: ${actualHours} sa (Vardiya: ${actualShiftHours}s, Mesai: ${actualMesaiHours}s)`
      
      // Intelligence: Determine which "started" first for the log
      if (workSchedule) {
          const mesStart = workSchedule.mesaiShiftType ? parseTime(today, workSchedule.mesaiShiftType.start_time) : null
          const regStart = workSchedule.shiftType ? parseTime(today, workSchedule.shiftType.start_time) : null
          
          let startContext = 'Bilinmeyen'
          if (mesStart && checkIn < new Date(regStart ? regStart.getTime() - 60000 : 0)) startContext = 'Mesai'
          else startContext = 'Vardiya'
          
          breakdownMsg += ` [Başlangıç: ${startContext}]`
      }

      // Final Status Update
      if (attendance.status === 'incomplete' || attendance.status === 'late') {
         // If late, keep it? Or if they made up time? Usually keep 'late' flag if they were late.
         // If incomplete, set to present.
         if (attendance.status === 'incomplete') attendance.status = 'present'
      }

      await attendance.save()
      console.log(`[SCAN SUCCESS] Exit recorded. ${breakdownMsg}`)

      // Log to archive
      try {
        await EmployeeHistory.create({
          employee_id: employeeId,
          project_id: projectId,
          company_id: employee.company_id,
          action: 'shift_exit',
          notes: `QR ile çıkış yapıldı. Giriş: ${checkIn.toLocaleTimeString('tr-TR')}, Çıkış: ${now.toLocaleTimeString('tr-TR')}, ${breakdownMsg}`
        })
      } catch (historyError) {
        console.error('Failed to log exit to history:', historyError)
      }

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
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message, error: error.message })
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
