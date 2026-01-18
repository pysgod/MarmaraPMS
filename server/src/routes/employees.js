const express = require('express')
const router = express.Router()
const { Employee, Company, ProjectEmployee, Project, PatrolAssignment, PatrolLog, EmployeeHistory } = require('../models')
const { sequelize } = require('../models') // for transaction
const { Op } = require('sequelize')

// ===========================================
// GET /api/employees
// Tüm personelleri getir (firma bağımsız)
// Query params:
//   - companyId: Belirli firmaya ait personeller
//   - status: idle | assigned (atama durumuna göre filtre)
//   - employeeStatus: active | passive | archived (çalışan durumu)
// ===========================================
router.get('/', async (req, res) => {
  try {
    const { companyId, status, employeeStatus } = req.query
    const where = {}
    
    // Firma filtresi
    if (companyId) {
      where.company_id = companyId
    }
    
    // Atama durumu filtresi - NULL durumları da dikkate al
    if (status === 'idle') {
      // Boşta: assignment_status = 'idle' VEYA (assignment_status NULL VE company_id NULL)
      where[Op.or] = [
        { assignment_status: 'idle' },
        { assignment_status: null, company_id: null }
      ]
    } else if (status === 'assigned') {
      // Atanmış: assignment_status != 'idle' VEYA company_id != NULL
      where[Op.or] = [
        { assignment_status: { [Op.in]: ['assigned_to_company', 'assigned_to_project'] } },
        { company_id: { [Op.ne]: null }, assignment_status: null }
      ]
    }
    
    // Çalışan durumu filtresi (active, passive, archived)
    if (employeeStatus) {
      where.status = employeeStatus
    }
    
    let employees = await Employee.findAll({
      where,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] },
        { 
          model: ProjectEmployee, 
          as: 'projectAssignments',
          attributes: ['id', 'project_id', 'status'],
          where: { status: 'active' },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })
    
    // Mevcut personeller için assignment_status hesaplaması (NULL durumu için)
    employees = employees.map(emp => {
      const empData = emp.toJSON()
      // assignment_status'u her zaman hesapla (DB'deki değer senkronize değilse bile)
      if (empData.company_id) {
        // Proje ataması var mı kontrol et (status='active' olanlar include edildi)
        if (empData.projectAssignments && empData.projectAssignments.length > 0) {
          empData.assignment_status = 'assigned_to_project'
        } else {
          empData.assignment_status = 'assigned_to_company'
        }
      } else {
        empData.assignment_status = 'idle'
      }
      return empData
    })
    
    res.json(employees)
  } catch (error) {
    console.error('Get employees error:', error)
    res.status(500).json({ message: 'Çalışanlar getirilirken hata oluştu', error: error.message })
  }
})

// ===========================================
// GET /api/employees/idle
// Sadece boşta olan personelleri getir
// ===========================================
router.get('/idle', async (req, res) => {
  try {
    // Boşta: assignment_status = 'idle' VEYA (assignment_status NULL VE company_id NULL)
    const employees = await Employee.findAll({
      where: {
        [Op.or]: [
          { assignment_status: 'idle' },
          { assignment_status: null, company_id: null }
        ]
      },
      order: [['created_at', 'DESC']]
    })
    
    // assignment_status NULL olanlar için 'idle' ata
    const result = employees.map(emp => {
      const data = emp.toJSON()
      if (!data.assignment_status) {
        data.assignment_status = 'idle'
      }
      return data
    })
    
    res.json(result)
  } catch (error) {
    console.error('Get idle employees error:', error)
    res.status(500).json({ message: 'Boşta personeller getirilirken hata oluştu', error: error.message })
  }
})

// ===========================================
// GET /api/employees/history
// Genel personel geçmişi (filtreli)
// ===========================================
router.get('/history', async (req, res) => {
  try {
    const { companyId, employeeId, startDate, endDate } = req.query
    const where = {}
    
    if (companyId) where.company_id = companyId
    if (employeeId) where.employee_id = employeeId
    
    if (startDate || endDate) {
      where.performed_at = {}
      if (startDate) where.performed_at[Op.gte] = new Date(startDate)
      if (endDate) where.performed_at[Op.lte] = new Date(endDate)
    }

    const history = await EmployeeHistory.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name'] },
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['performed_at', 'DESC']]
    })
    
    res.json(history)
  } catch (error) {
    console.error('Get history error:', error)
    res.status(500).json({ message: 'Geçmiş kayıtları getirilirken hata oluştu', error: error.message })
  }
})

// ===========================================
// GET /api/employees/:id
// Personel detayını getir
// ===========================================
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
        // Legacy shifts removed
        {
          model: EmployeeHistory,
          as: 'history',
          include: [
            { model: Company, as: 'company', attributes: ['id', 'name'] },
            { model: Project, as: 'project', attributes: ['id', 'name'] }
          ],
          order: [['performed_at', 'DESC']],
          limit: 20
        }
      ]
    })
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    // Mevcut personeller için assignment_status hesaplaması (NULL durumu için)
    const empData = employee.toJSON()
    if (!empData.assignment_status) {
      if (empData.company_id) {
        if (empData.projectAssignments && empData.projectAssignments.length > 0) {
          empData.assignment_status = 'assigned_to_project'
        } else {
          empData.assignment_status = 'assigned_to_company'
        }
      } else {
        empData.assignment_status = 'idle'
      }
    }
    
    res.json(empData)
  } catch (error) {
    console.error('Get employee error:', error)
    res.status(500).json({ message: 'Çalışan getirilirken hata oluştu', error: error.message })
  }
})

// ===========================================
// POST /api/employees
// Yeni personel oluştur (firma opsiyonel - boşta başlar)
// ===========================================
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

    // Sadece ad ve soyad zorunlu
    if (!first_name || !last_name) {
      await t.rollback();
      return res.status(400).json({ message: 'Ad ve Soyad zorunludur' })
    }
    
    // TC kontrolü - sistem genelinde unique
    if (tc_no) {
      const existing = await Employee.findOne({ where: { tc_no } })
      if (existing) {
         await t.rollback();
         return res.status(400).json({ message: 'Bu TC Kimlik numarası ile kayıtlı personel zaten var.' })
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

    // Atama durumunu belirle
    let assignmentStatus = 'idle';
    if (company_id) {
      assignmentStatus = 'assigned_to_company';
    }

    const employee = await Employee.create({
      company_id: company_id || null,
      first_name,
      last_name,
      tc_no,
      status: sanitizedData.status || 'active',
      assignment_status: assignmentStatus,
      ...sanitizedData
    }, { transaction: t })

    // Firma ataması yapıldıysa geçmiş kaydı oluştur
    if (company_id) {
      await EmployeeHistory.create({
        employee_id: employee.id,
        company_id: company_id,
        action: 'assigned_to_company',
        notes: 'İlk kayıt sırasında atandı'
      }, { transaction: t })
    }
    
    // Handle Project Assignment
    if (assign_project_id && assign_start_date && company_id) {
      try {
        await ProjectEmployee.create({
          project_id: assign_project_id,
          employee_id: employee.id,
          assigned_at: new Date(assign_start_date),
          status: 'active'
        }, { transaction: t })

        // Proje ataması varsa durumu güncelle
        await employee.update({ assignment_status: 'assigned_to_project' }, { transaction: t })

        await EmployeeHistory.create({
          employee_id: employee.id,
          company_id: company_id,
          project_id: assign_project_id,
          action: 'assigned_to_project',
          notes: 'İlk kayıt sırasında projeye atandı'
        }, { transaction: t })
      } catch (assignError) {
         console.error('Assignment Error (Non-fatal):', assignError);
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

// ===========================================
// PUT /api/employees/:id/assign-company
// Personeli firmaya ata
// ===========================================
router.put('/:id/assign-company', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const { company_id, notes } = req.body

    if (!company_id) {
      await t.rollback();
      return res.status(400).json({ message: 'Firma ID gerekli' })
    }

    const employee = await Employee.findByPk(req.params.id)
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }

    // Zaten bu firmaya atanmışsa hata
    if (employee.company_id === parseInt(company_id)) {
      await t.rollback();
      return res.status(400).json({ message: 'Personel zaten bu firmaya atanmış' })
    }

    // Başka firmaya atanmışsa önce çıkar
    if (employee.company_id) {
      // Mevcut projelerden çıkar
      await ProjectEmployee.destroy({
        where: { employee_id: employee.id },
        transaction: t
      })

      await EmployeeHistory.create({
        employee_id: employee.id,
        company_id: employee.company_id,
        action: 'removed_from_company',
        notes: 'Yeni firmaya atanmak için çıkarıldı'
      }, { transaction: t })
    }

    // Firmaya ata
    await employee.update({
      company_id: company_id,
      assignment_status: 'assigned_to_company'
    }, { transaction: t })

    await EmployeeHistory.create({
      employee_id: employee.id,
      company_id: company_id,
      action: 'assigned_to_company',
      notes: notes || null
    }, { transaction: t })

    await t.commit();

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'company_code'] }]
    })

    res.json(updatedEmployee)
  } catch (error) {
    if (t) await t.rollback();
    console.error('Assign company error:', error)
    res.status(500).json({ message: 'Firmaya atama yapılırken hata oluştu', error: error.message })
  }
})

// ===========================================
// PUT /api/employees/:id/unassign-company
// Personeli firmadan çıkar (projelerden de otomatik çıkar)
// ===========================================
router.put('/:id/unassign-company', async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const { notes } = req.body

    const employee = await Employee.findByPk(req.params.id)
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }

    if (!employee.company_id) {
      await t.rollback();
      return res.status(400).json({ message: 'Personel zaten boşta' })
    }

    const oldCompanyId = employee.company_id

    // Önce projelerden çıkar
    const projectAssignments = await ProjectEmployee.findAll({
      where: { employee_id: employee.id }
    })

    for (const pa of projectAssignments) {
      await EmployeeHistory.create({
        employee_id: employee.id,
        company_id: oldCompanyId,
        project_id: pa.project_id,
        action: 'removed_from_project',
        notes: 'Firmadan çıkarılırken otomatik çıkarıldı'
      }, { transaction: t })
    }

    await ProjectEmployee.destroy({
      where: { employee_id: employee.id },
      transaction: t
    })

    // Firmadan çıkar
    await EmployeeHistory.create({
      employee_id: employee.id,
      company_id: oldCompanyId,
      action: 'removed_from_company',
      notes: notes || null
    }, { transaction: t })

    await employee.update({
      company_id: null,
      assignment_status: 'idle'
    }, { transaction: t })

    await t.commit();

    const updatedEmployee = await Employee.findByPk(employee.id)
    res.json(updatedEmployee)
  } catch (error) {
    if (t) await t.rollback();
    console.error('Unassign company error:', error)
    res.status(500).json({ message: 'Firmadan çıkarılırken hata oluştu', error: error.message })
  }
})

// ===========================================
// PUT /api/employees/:id
// Personel bilgilerini güncelle
// ===========================================
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id)
    
    if (!employee) {
      return res.status(404).json({ message: 'Çalışan bulunamadı' })
    }
    
    // assignment_status güncellemeyi engelle (özel endpoint kullan)
    const { assignment_status, ...updateData } = req.body
    
    // Update all fields provided in body
    await employee.update(updateData)

    // Handle Project Assignment (New logic)
    const { assign_project_id, assign_start_date } = req.body
    if (assign_project_id && assign_start_date && employee.company_id) {
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

         // assignment_status güncelle
         await employee.update({ assignment_status: 'assigned_to_project' })

         await EmployeeHistory.create({
           employee_id: employee.id,
           company_id: employee.company_id,
           project_id: assign_project_id,
           action: 'assigned_to_project'
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

// ===========================================
// DELETE /api/employees/:id
// Personeli sil
// ===========================================
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

// ===========================================
// GET /api/employees/:id/history
// Personel geçmişini getir
// ===========================================
router.get('/:id/history', async (req, res) => {
  try {
    const history = await EmployeeHistory.findAll({
      where: { employee_id: req.params.id },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['performed_at', 'DESC']]
    })
    res.json(history)
  } catch (error) {
    console.error('Get employee history error:', error)
    res.status(500).json({ message: 'Personel geçmişi getirilirken hata oluştu', error: error.message })
  }
})

module.exports = router
