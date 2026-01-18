const { WorkSchedule, WorkScheduleJoker, Project, Employee, ProjectEmployee, Company, ShiftType } = require('../models')
const { Op } = require('sequelize')

// Fallback shift hours if no dynamic type found
const DEFAULT_SHIFT_HOURS = {
  off: 0
}

// Get work schedule for a project and month
exports.getProjectWorkSchedule = async (req, res) => {
  try {
    const { projectId } = req.params
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' })
    }

    const project = await Project.findByPk(projectId, {
      include: [{ model: Company, as: 'company' }]
    })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Get all employees assigned to this project
    const projectEmployees = await ProjectEmployee.findAll({
      where: { project_id: projectId },
      include: [{ model: Employee, as: 'employee' }]
    })

    const employees = projectEmployees.map(pe => pe.employee).filter(Boolean)

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Get all work schedule entries for this project/month
    const schedules = await WorkSchedule.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      }
    })

    // Get joker slots for this project/month
    const jokers = await WorkScheduleJoker.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      order: [['date', 'ASC'], ['id', 'ASC']]
    })

    // Get shift types for this project
    const shiftTypes = await ShiftType.findAll({
      where: { project_id: projectId },
      order: [['order', 'ASC'], ['id', 'ASC']]
    })

    // Build schedule map: { "employee_id-date": { shift_type, leave_type, gozetim_hours, mesai_hours } }
    const scheduleMap = {}
    schedules.forEach(s => {
      scheduleMap[`${s.employee_id}-${s.date}`] = {
        shift_type_id: s.shift_type_id,
        leave_type: s.leave_type,
        gozetim_hours: parseFloat(s.gozetim_hours) || 0,
        mesai_hours: parseFloat(s.mesai_hours) || 0,
        mesai_shift_type_id: s.mesai_shift_type_id,
        notes: s.notes
      }
    })

    // Calculate monthly totals per employee
    const employeeTotals = {}
    employees.forEach(emp => {
      let totalGozetim = 0
      let totalMesai = 0
      
      schedules.filter(s => s.employee_id === emp.id).forEach(s => {
        totalGozetim += parseFloat(s.gozetim_hours) || 0
        totalMesai += parseFloat(s.mesai_hours) || 0
      })
      
      employeeTotals[emp.id] = { gozetim: totalGozetim, mesai: totalMesai }
    })

    // Generate days in month
    const daysInMonth = endDate.getDate()
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d)
      days.push({
        day: d,
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }

    res.json({
      project,
      employees,
      days,
      scheduleMap,
      employeeTotals,
      jokers,
      year: parseInt(year),
      month: parseInt(month),
      shiftTypes
    })
  } catch (error) {
    console.error('Error fetching work schedule:', error)
    res.status(500).json({ error: 'Failed to fetch work schedule' })
  }
}

// Update a single cell (employee + date)
exports.updateWorkSchedule = async (req, res) => {
  try {
    const { project_id, employee_id, date, shift_type_id, leave_type, gozetim_hours, mesai_hours, mesai_shift_type_id, notes } = req.body

    // Validate employee is in project
    const projectEmployee = await ProjectEmployee.findOne({
      where: { project_id, employee_id }
    })

    if (!projectEmployee) {
      return res.status(400).json({ error: 'Employee is not assigned to this project' })
    }

    // Calculate gozetim hours based on shift type if not provided
    let calculatedGozetim = gozetim_hours
    if (calculatedGozetim === undefined && shift_type_id && !leave_type) {
      const shiftType = await ShiftType.findByPk(shift_type_id)
      calculatedGozetim = shiftType ? parseFloat(shiftType.hours) : 0
    }

    // Find or create the schedule entry
    // Calculate mesai hours from shift type if mesai_shift_type_id is provided
    let calculatedMesai = mesai_hours
    if (mesai_shift_type_id && calculatedMesai === undefined) {
      const mesaiShiftType = await ShiftType.findByPk(mesai_shift_type_id)
      calculatedMesai = mesaiShiftType ? parseFloat(mesaiShiftType.hours) : 0
    }

    const [schedule, created] = await WorkSchedule.findOrCreate({
      where: { project_id, employee_id, date },
      defaults: { 
        shift_type_id: shift_type_id || null, // null = off or unknown
        leave_type: leave_type || null,
        gozetim_hours: calculatedGozetim || 0,
        mesai_hours: calculatedMesai || 0,
        mesai_shift_type_id: mesai_shift_type_id || null,
        notes
      }
    })

    if (!created) {
      const updateData = {}
      if (shift_type_id !== undefined) updateData.shift_type_id = shift_type_id
      if (leave_type !== undefined) updateData.leave_type = leave_type
      if (gozetim_hours !== undefined) updateData.gozetim_hours = gozetim_hours
      else if (shift_type_id && !leave_type) {
        // If updating shift type but not hours, fetch hours
        const shiftType = await ShiftType.findByPk(shift_type_id)
        updateData.gozetim_hours = shiftType ? parseFloat(shiftType.hours) : 0
      }
      if (mesai_shift_type_id !== undefined) {
        updateData.mesai_shift_type_id = mesai_shift_type_id
        // Auto-calculate mesai_hours from shift type if not explicitly provided
        if (mesai_hours === undefined && mesai_shift_type_id) {
          const mesaiShiftType = await ShiftType.findByPk(mesai_shift_type_id)
          updateData.mesai_hours = mesaiShiftType ? parseFloat(mesaiShiftType.hours) : 0
        } else if (!mesai_shift_type_id) {
          updateData.mesai_hours = 0
        }
      }
      if (mesai_hours !== undefined) updateData.mesai_hours = mesai_hours
      if (notes !== undefined) updateData.notes = notes
      
      // If leave type is set, reset shift hours
      if (leave_type) {
        updateData.gozetim_hours = 0
        updateData.shift_type_id = null
      }
      
      await schedule.update(updateData)
    }

    res.json(schedule)
  } catch (error) {
    console.error('Error updating work schedule:', error)
    res.status(500).json({ error: 'Failed to update work schedule' })
  }
}

// Toggle shift type (cycle through: off -> type1 -> type2 -> ... -> off)
exports.toggleWorkSchedule = async (req, res) => {
  try {
    const { project_id, employee_id, date } = req.body
    console.log('[TOGGLE DEBUG] Received:', { project_id, employee_id, date })

    const projectEmployee = await ProjectEmployee.findOne({
      where: { project_id, employee_id }
    })

    if (!projectEmployee) {
      return res.status(400).json({ error: 'Employee is not assigned to this project' })
    }

    const existing = await WorkSchedule.findOne({
      where: { project_id, employee_id, date }
    })

    // Get dynamic shift types
    const shiftTypes = await ShiftType.findAll({
      where: { project_id },
      order: [['order', 'ASC'], ['id', 'ASC']]
    })
    
    // Cycle: off (null) -> type1 -> type2 -> ... -> off
    // If empty shiftTypes, just toggle off->off
    
    let nextShiftTypeId = null
    let nextHours = 0
    
    if (shiftTypes.length > 0) {
      // Find current index
      let currentIndex = -1 // -1 means 'off'
      
      if (existing && existing.shift_type_id) {
         // Find in array
         currentIndex = shiftTypes.findIndex(st => st.id === existing.shift_type_id)
      }
      
      // Logic:
      // If off (-1) -> go to index 0
      // If index 0 -> go to index 1
      // If index last -> go to off (-1)
      
      if (currentIndex === -1) {
        // Was off, go to first
        nextShiftTypeId = shiftTypes[0].id
        nextHours = parseFloat(shiftTypes[0].hours)
      } else if (currentIndex < shiftTypes.length - 1) {
        // Go to next
        nextShiftTypeId = shiftTypes[currentIndex + 1].id
        nextHours = parseFloat(shiftTypes[currentIndex + 1].hours)
      } else {
        // Was last, go to off
        nextShiftTypeId = null
        nextHours = 0
      }
    }

    if (existing) {
      await existing.update({
        shift_type_id: nextShiftTypeId,
        leave_type: null,
        gozetim_hours: nextHours
      })
      return res.json(existing)
    }

    const schedule = await WorkSchedule.create({
      project_id,
      employee_id,
      date,
      shift_type_id: nextShiftTypeId,
      gozetim_hours: nextHours
    })

    res.status(201).json(schedule)
  } catch (error) {
    console.error('Error toggling work schedule:', error)
    res.status(500).json({ error: 'Failed to toggle work schedule' })
  }
}

// Set leave type for a cell
exports.setLeaveType = async (req, res) => {
  try {
    const { project_id, employee_id, date, leave_type } = req.body

    const [schedule, created] = await WorkSchedule.findOrCreate({
      where: { project_id, employee_id, date },
      defaults: { 
        shift_type_id: null,
        leave_type,
        gozetim_hours: 0,
        mesai_hours: 0
      }
    })

    if (!created) {
      await schedule.update({
        leave_type,
        shift_type_id: null,
        gozetim_hours: 0
      })
    }

    res.json(schedule)
  } catch (error) {
    console.error('Error setting leave type:', error)
    res.status(500).json({ error: 'Failed to set leave type' })
  }
}

// Bulk update (e.g., set entire row or column)
exports.bulkUpdateWorkSchedule = async (req, res) => {
  try {
    const { project_id, updates } = req.body

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' })
    }

    const results = []
    for (const { employee_id, date, shift_type_id, leave_type, gozetim_hours, mesai_hours } of updates) {
      // Logic handling... simple overwrite for bulk for now
      // Note: This logic assumes frontend provides correct data. 
      
      const [schedule, created] = await WorkSchedule.findOrCreate({
        where: { project_id, employee_id, date },
        defaults: { 
          shift_type_id: shift_type_id || null,
          leave_type,
          gozetim_hours: gozetim_hours || 0,
          mesai_hours: mesai_hours || 0
        }
      })

      if (!created) {
        await schedule.update({ 
          shift_type_id: shift_type_id !== undefined ? shift_type_id : schedule.shift_type_id, 
          leave_type: leave_type !== undefined ? leave_type : schedule.leave_type,
          gozetim_hours: gozetim_hours !== undefined ? gozetim_hours : schedule.gozetim_hours,
          mesai_hours: mesai_hours !== undefined ? mesai_hours : schedule.mesai_hours
        })
      }
      results.push(schedule)
    }

    res.json({ updated: results.length })
  } catch (error) {
    console.error('Error bulk updating work schedule:', error)
    res.status(500).json({ error: 'Failed to bulk update work schedule' })
  }
}

// Get joker slots for a project/month
exports.getProjectJokers = async (req, res) => {
  try {
    const { projectId } = req.params
    const { year, month } = req.query

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const jokers = await WorkScheduleJoker.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      order: [['date', 'ASC'], ['id', 'ASC']]
    })

    res.json(jokers)
  } catch (error) {
    console.error('Error fetching jokers:', error)
    res.status(500).json({ error: 'Failed to fetch joker slots' })
  }
}

// Toggle joker slot (cycle through: off -> type1 -> type2 -> ... -> off)
exports.toggleJoker = async (req, res) => {
  try {
    const { project_id, date, shift_type, mesai_hours, mesai_shift_type_id, notes } = req.body // shift_type can be ID now

    const joker = await WorkScheduleJoker.findOne({
      where: { project_id, date }
    })

    // Get dynamic shift types for JOKER too
    const shiftTypes = await ShiftType.findAll({
      where: { project_id },
      order: [['order', 'ASC'], ['id', 'ASC']]
    })

    let nextShiftTypeId = null
    let nextHours = 0

    // Determine New State
    if (joker) {
      if (mesai_hours !== undefined || mesai_shift_type_id !== undefined) {
         // Explicit overtime update
         let updateMesai = mesai_hours
         let updateMesaiShiftTypeId = mesai_shift_type_id
         
         // If mesai_shift_type_id provided, calculate hours from it
         if (mesai_shift_type_id !== undefined) {
           if (mesai_shift_type_id) {
             const st = shiftTypes.find(t => t.id === parseInt(mesai_shift_type_id))
             updateMesai = st ? parseFloat(st.hours) : 0
           } else {
             updateMesai = 0
             updateMesaiShiftTypeId = null
           }
         }
         
         await joker.update({
           mesai_hours: updateMesai !== undefined ? updateMesai : joker.mesai_hours,
           mesai_shift_type_id: updateMesaiShiftTypeId !== undefined ? updateMesaiShiftTypeId : joker.mesai_shift_type_id,
           notes: notes !== undefined ? notes : joker.notes
         })
         return res.json(joker)
       }

      if (shift_type) {
         // User selected specific ID from context menu for Shift
         nextShiftTypeId = shift_type 
         const st = shiftTypes.find(t => t.id === parseInt(nextShiftTypeId))
         nextHours = st ? parseFloat(st.hours) : 0
      } else {
         // Cycle Shift Type
          let currentIndex = -1 
          if (joker.shift_type_id) {
             currentIndex = shiftTypes.findIndex(st => st.id === joker.shift_type_id)
          }
          
          if (shiftTypes.length > 0) {
            if (currentIndex === -1) {
              nextShiftTypeId = shiftTypes[0].id
              nextHours = parseFloat(shiftTypes[0].hours)
            } else if (currentIndex < shiftTypes.length - 1) {
              nextShiftTypeId = shiftTypes[currentIndex + 1].id
              nextHours = parseFloat(shiftTypes[currentIndex + 1].hours)
            } else {
              nextShiftTypeId = null
              nextHours = 0
            }
          }
      }
      
      await joker.update({ 
        shift_type_id: nextShiftTypeId,
        gozetim_hours: nextHours,
        // Preserve existing mesai data if not explicitly changed
        mesai_hours: joker.mesai_hours,
        mesai_shift_type_id: joker.mesai_shift_type_id, 
        notes: notes !== undefined ? notes : joker.notes 
      })
      return res.json(joker)
    }

    // New Joker Creation
    let initialMesai = mesai_hours || 0
    let initialMesaiShiftTypeId = mesai_shift_type_id || null
    
    // Calculate mesai hours from shift type if provided
    if (mesai_shift_type_id) {
      const st = shiftTypes.find(t => t.id === parseInt(mesai_shift_type_id))
      initialMesai = st ? parseFloat(st.hours) : 0
    }
    
    if (mesai_hours !== undefined || mesai_shift_type_id !== undefined) {
      // Creating joker with only mesai data - don't set gozetim
      nextShiftTypeId = null
      nextHours = 0
    } else {
        // Standard Cycle Creation (clicking on gozetim row)
        if (shiftTypes.length > 0) {
        // Start with first type
        nextShiftTypeId = shiftTypes[0].id
        nextHours = parseFloat(shiftTypes[0].hours)
        }
    }

    const newJoker = await WorkScheduleJoker.create({
      project_id,
      date,
      shift_type_id: nextShiftTypeId,
      gozetim_hours: nextHours,
      mesai_hours: initialMesai,
      mesai_shift_type_id: initialMesaiShiftTypeId,
      notes
    })

    res.json(newJoker)
  } catch (error) {
    console.error('Error toggling joker:', error)
    res.status(500).json({ error: 'Failed to toggle joker slot' })
  }
}

// Add joker slot (empty initially but ready)
exports.addJoker = async (req, res) => {
  try {
    const { project_id, date, notes } = req.body

    const joker = await WorkScheduleJoker.create({
      project_id,
      date,
      shift_type_id: null,
      gozetim_hours: 0,
      mesai_hours: 0,
      notes
    })

    res.status(201).json(joker)
  } catch (error) {
    console.error('Error adding joker:', error)
    res.status(500).json({ error: 'Failed to add joker slot' })
  }
}

// Delete joker slot
exports.deleteJoker = async (req, res) => {
  try {
    const { id } = req.params

    const joker = await WorkScheduleJoker.findByPk(id)
    if (!joker) {
      return res.status(404).json({ error: 'Joker slot not found' })
    }

    await joker.destroy()
    res.json({ message: 'Joker slot deleted' })
  } catch (error) {
    console.error('Error deleting joker:', error)
    res.status(500).json({ error: 'Failed to delete joker slot' })
  }
}

// Get monthly summary for accounting
exports.getMonthlySummary = async (req, res) => {
  try {
    const { projectId } = req.params
    const { year, month } = req.query

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const schedules = await WorkSchedule.findAll({
      where: {
        project_id: projectId,
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      include: [{ model: Employee, as: 'employee' }]
    })

    // Group by employee
    const summary = {}
    schedules.forEach(s => {
      if (!summary[s.employee_id]) {
        summary[s.employee_id] = {
          employee: s.employee,
          gozetim_total: 0,
          mesai_total: 0,
          work_days: 0,
          leave_days: {}
        }
      }
      
      summary[s.employee_id].gozetim_total += parseFloat(s.gozetim_hours) || 0
      summary[s.employee_id].mesai_total += parseFloat(s.mesai_hours) || 0
      
      if (s.shift_type_id && !s.leave_type) {
        summary[s.employee_id].work_days++
      }
      
      if (s.leave_type) {
        summary[s.employee_id].leave_days[s.leave_type] = 
          (summary[s.employee_id].leave_days[s.leave_type] || 0) + 1
      }
    })

    res.json(Object.values(summary))
  } catch (error) {
    console.error('Error fetching monthly summary:', error)
    res.status(500).json({ error: 'Failed to fetch monthly summary' })
  }
}
// Get company-wide stats for charts
exports.getCompanyWorkScheduleStats = async (req, res) => {
  try {
    const { companyId } = req.params
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // Get all projects for this company
    const projects = await Project.findAll({
      where: { company_id: companyId }
    })
    
    const projectIds = projects.map(p => p.id)

    if (projectIds.length === 0) {
      return res.json({
        projectStats: [],
        shiftTypeStats: [],
        totalHours: { gozetim: 0, mesai: 0 }
      })
    }

    // Get schedules
    const schedules = await WorkSchedule.findAll({
      where: {
        project_id: { [Op.in]: projectIds },
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      }
    })

    // Get ShiftTypes for metadata (names etc)
    const shiftTypes = await ShiftType.findAll({
      where: { project_id: { [Op.in]: projectIds } }
    })
    const shiftTypeMap = {}
    shiftTypes.forEach(st => {
      shiftTypeMap[st.id] = st
    })

    // 1. Project Stats: Total hours per project
    const projectStatsMap = {}
    projects.forEach(p => {
      projectStatsMap[p.id] = { 
        name: p.name, 
        gozetim: 0, 
        mesai: 0,
        employees: new Set()
      }
    })

    // 2. Shift Type Distribution
    const shiftTypeCountMap = {} // Key: shift type name (normalized), Value: count

    let totalGozetim = 0
    let totalMesai = 0

    schedules.forEach(s => {
      // Project Stats
      if (projectStatsMap[s.project_id]) {
        projectStatsMap[s.project_id].gozetim += parseFloat(s.gozetim_hours) || 0
        projectStatsMap[s.project_id].mesai += parseFloat(s.mesai_hours) || 0
        projectStatsMap[s.project_id].employees.add(s.employee_id)
      }
      
      totalGozetim += parseFloat(s.gozetim_hours) || 0
      totalMesai += parseFloat(s.mesai_hours) || 0

      // Shift Type Stats
      if (s.shift_type_id) {
        const st = shiftTypeMap[s.shift_type_id]
        if (st) {
          const name = st.name // Group by name even if different IDs across projects? 
          // Or group by short_code? User might have different naming.
          // Let's group by Name for now.
          shiftTypeCountMap[name] = (shiftTypeCountMap[name] || 0) + 1
        }
      }
    })

    // Format for charts
    const projectStats = Object.values(projectStatsMap).map(p => ({
      name: p.name,
      gozetim: Math.round(p.gozetim),
      mesai: Math.round(p.mesai),
      employeeCount: p.employees.size
    }))

    const shiftTypeStats = Object.entries(shiftTypeCountMap).map(([name, value]) => ({
      name,
      value
    }))

    res.json({
      projectStats,
      shiftTypeStats,
      totalHours: { 
        gozetim: Math.round(totalGozetim), 
        mesai: Math.round(totalMesai) 
      }
    })

  } catch (error) {
    console.error('Error fetching company stats:', error)
    res.status(500).json({ error: 'Failed to fetch company stats' })
  }
}
// Get work schedule for a specific employee
exports.getEmployeeWorkSchedule = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // First, get active project assignments for this employee
    // Only show schedules for projects the employee is STILL assigned to
    const employeeProjectAssignments = await ProjectEmployee.findAll({
      where: { employee_id: employeeId },
      attributes: ['project_id']
    })
    const activeProjectIds = employeeProjectAssignments.map(pe => pe.project_id)

    // If employee has no project assignments, return empty
    if (activeProjectIds.length === 0) {
      return res.json({
        schedules: [],
        scheduleMap: {},
        stats: { totalGozetim: 0, totalMesai: 0 }
      })
    }

    // Get schedules with Project and ShiftType info - ONLY for active projects
    const schedules = await WorkSchedule.findAll({
      where: {
        employee_id: employeeId,
        project_id: { [Op.in]: activeProjectIds },
        date: {
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        }
      },
      include: [
        { model: Project, as: 'project' },
        { model: ShiftType, as: 'shiftType' }
      ],
      order: [['date', 'ASC']]
    })

    // Organize by date
    // Note: If employee works multiple shifts same day (rare), last one might overwrite or we array them.
    // Standard system seems to assume one shift per day per employee-project.
    // But cross-project? 
    // Let's return a map: { "YYYY-MM-DD": [schedule1, schedule2] }
    
    const scheduleMap = {}
    schedules.forEach(s => {
      if (!scheduleMap[s.date]) scheduleMap[s.date] = []
      scheduleMap[s.date].push(s)
    })

    // Stats
    let totalGozetim = 0
    let totalMesai = 0
    schedules.forEach(s => {
      totalGozetim += parseFloat(s.gozetim_hours) || 0
      totalMesai += parseFloat(s.mesai_hours) || 0
    })

    res.json({
      schedules,
      scheduleMap,
      stats: { totalGozetim, totalMesai }
    })
  } catch (error) {
    console.error('Error fetching employee schedule:', error)
    res.status(500).json({ error: 'Failed to fetch employee schedule' })
  }
}
