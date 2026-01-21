const cron = require('node-cron')
const { WorkSchedule, Attendance, Employee } = require('../models')
const { Op } = require('sequelize')

/**
 * Initializes all scheduled jobs
 */
const initScheduledJobs = () => {
  console.log('Initializing scheduled jobs...')

  // Run every day at 23:55 (11:55 PM)
  cron.schedule('55 23 * * *', async () => {
    console.log('Running daily attendance check...')
    try {
      await processDailyAbsences()
    } catch (error) {
      console.error('Error running daily attendance check:', error)
    }
  }, {
    timezone: "Europe/Istanbul"
  })
}

/**
 * Checks for employees who had a shift today but no attendance record
 * and marks them as 'absent'.
 */
const processDailyAbsences = async (targetDate = new Date()) => {
  try {
    const todayStr = targetDate.toISOString().split('T')[0]
    console.log(`Processing absences for date: ${todayStr}`)

    // 1. Find all schedules for today where there is a shift assigned (shift_type_id not null)
    const schedules = await WorkSchedule.findAll({
      where: {
        date: todayStr,
        shift_type_id: { [Op.not]: null } // Must have a shift
      }
    })

    if (schedules.length === 0) {
      console.log('No shifts found for today.')
      return
    }

    // 2. Find all attendance records for today
    const existingAttendances = await Attendance.findAll({
      where: {
        date: todayStr
      }
    })

    // Map of employee_id -> boolean (has attendance)
    const attendanceMap = new Set()
    existingAttendances.forEach(a => attendanceMap.add(a.employee_id))

    // 3. Filter schedules where employee has NO attendance record
    const missingEmployees = schedules.filter(sch => !attendanceMap.has(sch.employee_id))

    console.log(`Found ${missingEmployees.length} employees with missing attendance out of ${schedules.length} scheduled.`)

    if (missingEmployees.length === 0) {
      return
    }

    // 4. Create 'absent' records for these employees
    const newRecords = missingEmployees.map(sch => ({
      project_id: sch.project_id, // Assuming WorkSchedule has project_id, which it should
      employee_id: sch.employee_id,
      date: todayStr,
      status: 'absent',
      verification_method: 'manual', // System generated
      notes: 'Otomatik Eksik İşlem: QR Okutulmadı (Sistem Tarafından Oluşturuldu)',
      planned_hours: sch.gozetim_hours || 0,
      actual_hours: 0,
      overtime_hours: 0
    }))

    await Attendance.bulkCreate(newRecords)

    console.log(`Successfully created ${newRecords.length} absent records.`)

  } catch (error) {
    console.error('Error in processDailyAbsences:', error)
    throw error
  }
}

module.exports = {
  initScheduledJobs,
  processDailyAbsences // Exported for manual triggering if needed
}
