const { ShiftDefinition, ShiftAssignment, Project, Employee, Company, User, ProjectEmployee } = require('../models')

exports.createShiftDefinition = async (req, res) => {
  try {
    const { company_id, name, start_time, end_time, break_duration } = req.body

    const shift = await ShiftDefinition.create({
      company_id,
      name,
      start_time,
      end_time,
      break_duration
    })

    res.status(201).json(shift)
  } catch (error) {
    console.error('Error creating shift definition:', error)
    res.status(500).json({ error: 'Failed to create shift definition' })
  }
}

exports.updateShiftDefinition = async (req, res) => {
  try {
    const { id } = req.params
    const { name, start_time, end_time, break_duration } = req.body

    const shift = await ShiftDefinition.findByPk(id)
    if (!shift) {
      return res.status(404).json({ error: 'Shift definition not found' })
    }

    await shift.update({ name, start_time, end_time, break_duration })
    res.json(shift)
  } catch (error) {
    console.error('Error updating shift definition:', error)
    res.status(500).json({ error: 'Failed to update shift definition' })
  }
}

exports.deleteShiftDefinition = async (req, res) => {
  try {
    const { id } = req.params
    const shift = await ShiftDefinition.findByPk(id)
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift definition not found' })
    }

    // Check for existing assignments
    const count = await ShiftAssignment.count({ where: { shift_id: id } })
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete shift definition with active assignments' })
    }

    await shift.destroy()
    res.json({ message: 'Shift definition deleted' })
  } catch (error) {
    console.error('Error deleting shift definition:', error)
    res.status(500).json({ error: 'Failed to delete shift definition' })
  }
}

exports.getCompanyShifts = async (req, res) => {
  try {
    const { companyId } = req.params
    const shifts = await ShiftDefinition.findAll({
      where: { company_id: companyId },
      order: [['start_time', 'ASC']]
    })
    res.json(shifts)
  } catch (error) {
    console.error('Error fetching company shifts:', error)
    res.status(500).json({ error: 'Failed to fetch company shifts' })
  }
}

exports.assignShift = async (req, res) => {
  try {
    const { project_id, employee_id, shift_id } = req.body

    // Validate employee belongs to project
    const projectEmployee = await ProjectEmployee.findOne({
      where: { project_id, employee_id }
    })

    if (!projectEmployee) {
      return res.status(400).json({ error: 'Employee is not assigned to this project' })
    }

    // Upsert assignment (Unique constraint on project_id + employee_id handles replacement)
    // Actually, upsert might fail if the constraint name isn't handled or if we want to replace explicitly.
    // Let's try to find existing assignment first.
    const existing = await ShiftAssignment.findOne({
      where: { project_id, employee_id }
    })

    if (existing) {
      if (shift_id === null) {
        // Remove assignment
        await existing.destroy()
        return res.json({ message: 'Shift assignment removed' })
      }
      // Update
      await existing.update({ shift_id })
      return res.json(existing)
    } else {
       if (shift_id === null) return res.json({ message: 'No change' })
       
       const newAssignment = await ShiftAssignment.create({
         project_id,
         employee_id,
         shift_id
       })
       return res.status(201).json(newAssignment)
    }

  } catch (error) {
    console.error('Error assigning shift:', error)
    res.status(500).json({ error: 'Failed to assign shift' })
  }
}

exports.unassignShift = async (req, res) => {
     try {
    const { project_id, employee_id } = req.body

    const existing = await ShiftAssignment.findOne({
      where: { project_id, employee_id }
    })

    if (existing) {
        await existing.destroy()
        return res.json({ message: 'Shift assignment removed' })
    } 
    res.json({ message: 'No assignment found to remove'})
  } catch (error) {
    console.error('Error unassigning shift:', error)
    res.status(500).json({ error: 'Failed to unassign shift' })
  }
}


exports.getProjectShiftAssignments = async (req, res) => {
  try {
    const { projectId } = req.params

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Company,
          as: 'company',
          include: [{ model: ShiftDefinition, as: 'shiftDefinitions' }]
        }
      ]
    })

    if (!project) return res.status(404).json({ error: 'Project not found' })

    const assignments = await ShiftAssignment.findAll({
      where: { project_id: projectId },
      include: [
        { model: Employee, as: 'employee' },
        { model: ShiftDefinition, as: 'shiftDefinition' }
      ]
    })
    
    // Also fetch all employees in the project to show unassigned ones
    const allEmployees = await project.getEmployees()

    res.json({
      project,
      shiftDefinitions: project.company.shiftDefinitions,
      assignments,
      employees: allEmployees
    })
  } catch (error) {
    console.error('Error fetching project shift assignments:', error)
    res.status(500).json({ error: 'Failed to fetch project shift assignments' })
  }
}
