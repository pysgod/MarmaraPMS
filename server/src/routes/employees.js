const express = require('express')
const router = express.Router()
const { Employee, Company, ProjectEmployee, Project, PatrolAssignment, PatrolLog, ShiftAssignment, ShiftDefinition } = require('../models')
const { sequelize } = require('../models') // for transaction

// Get all employees (optionally filter by company)
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query
    const where = companyId ? { company_id: companyId } : {}
    
    const employees = await Employee.findAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }
      ],
      order: [['created_at', 'DESC']]
    })
    res.json(employees)
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ message: 'Çalışanlar getirilirken hata oluştu', error: error.message })
  }
})

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { 
          model: ProjectEmployee, 
          as: 'projectAssignments',
          include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'status'] }]
        },
        {
          model: ShiftAssignment,
          as: 'shiftAssignments',
          include: [
            { model: ShiftDefinition, as: 'shiftDefinition' },
            { model: Project, as: 'project', attributes: ['id', 'name'] }
          ]
        }
      ]
    })
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    res.json(employee)
  } catch (error) {
    console.error('Get employee error:', error)
    res.status(500).json({ message: 'Çalışan getirilirken hata oluştu', error: error.message })
  }
})

// Create employee
router.post('/', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    
    const { 
      company_id, 
      first_name, 
      last_name, 
      tc_no, 
      // ... catch all other fields from body
      ...otherData
    } = req.body

    // Assignment data might be separated or inside body
    const { assign_project_id, assign_start_date } = req.body

    if (!company_id || !first_name || !last_name) {
      await t.rollback();
      return res.status(400).json({ message: 'Firma, Ad ve Soyad zorunludur' })
    }
    
    // Check if TC exists
    if (tc_no) {
      const existing = await Employee.findOne({ where: { tc_no, company_id } })
      if (existing) {
         await t.rollback();
         return res.status(400).json({ message: 'Bu TC Kimlik numarası ile bu firmada kayıtlı personel zaten var.' })
      }
    }

    // Sanitize data
    const sanitizedData = { ...otherData };
    
    // Fix integer fields
    if (sanitizedData.children_count === '' || sanitizedData.children_count == null) {
      sanitizedData.children_count = 0;
    } else {
      sanitizedData.children_count = parseInt(sanitizedData.children_count) || 0;
    }

    // Fix date fields - set to NULL if empty or invalid
    const dateFields = ['birth_date', 'start_date', 'certificate_date', 'certificate_expiry'];
    dateFields.forEach(field => {
       if (!sanitizedData[field] || sanitizedData[field] === 'Invalid date' || sanitizedData[field] === '') {
          sanitizedData[field] = null;
       }
    });

    const employee = await Employee.create({
      company_id,
      first_name,
      last_name,
      tc_no,
      status: sanitizedData.status || 'active',
      ...sanitizedData
    }, { transaction: t })
    
    // Handle Assignment
    if (assign_project_id && assign_start_date) {
      try {
        await ProjectEmployee.create({
          project_id: assign_project_id,
          employee_id: employee.id,
          assigned_at: new Date(assign_start_date),
          status: 'active'
        }, { transaction: t })
      } catch (assignError) {
         console.error('Assignment Error (Non-fatal):', assignError);
         // We don't rollback main creation if assignment fails, or maybe we should?
         // User expects assignment. Let's rollback to be safe.
         throw assignError;
      }
    }
    
    await t.commit();

    const employeeWithCompany = await Employee.findByPk(employee.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.status(201).json(employeeWithCompany)
  } catch (error) {
    if (t) await t.rollback();
    console.error('Create employee error:', error)
    res.status(500).json({ message: 'Çalışan oluşturulurken hata oluştu', error: error.message })
  }
})

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    // Update all fields provided in body
    await employee.update(req.body)

    // Handle Project Assignment (New logic)
    const { assign_project_id, assign_start_date } = req.body
    if (assign_project_id && assign_start_date) {
      // Check if already assigned to this project
      const existingAssignment = await ProjectEmployee.findOne({
        where: {
          project_id: assign_project_id,
          employee_id: employee.id
        }
      })

      if (!existingAssignment) {
         await ProjectEmployee.create({
            project_id: assign_project_id,
            employee_id: employee.id,
            assigned_at: new Date(assign_start_date),
            status: 'active'
         })
      }
    }
    
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })
    
    res.json(updatedEmployee)
  } catch (error) {
    console.error('Update employee error:', error)
    res.status(500).json({ message: 'Çalışan güncellenirken hata oluştu', error: error.message })
  }
})

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    await employee.destroy()
    res.json({ message: 'Çalışan silindi' })
  } catch (error) {
    console.error('Delete employee error:', error)
    res.status(500).json({ message: 'Çalışan silinirken hata oluştu', error: error.message })
  }
})

module.exports = router
