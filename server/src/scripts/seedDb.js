const { 
  sequelize, 
  User, 
  Company, 
  Employee, 
  Project, 
  ProjectEmployee, 
  Patrol, 
  PatrolAssignment, 
  PatrolLog 
} = require('../models')
const bcrypt = require('bcryptjs')

async function seed() {
  try {
    console.log('🌱 Seed verileri oluşturuluyor...')

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@marmara.com',
      password: 'admin123',
      role: 'admin'
    })
    console.log('  ✓ Admin kullanıcısı oluşturuldu')

    // Create companies
    const companies = await Company.bulkCreate([
      { 
        name: 'Marmara Güvenlik A.Ş.', 
        company_code: 'MRM001', 
        status: 'active',
        country: 'Türkiye',
        city: 'İstanbul',
        timezone: 'Europe/Istanbul'
      },
      { 
        name: 'Anadolu Koruma Ltd.', 
        company_code: 'ANK001', 
        status: 'active',
        country: 'Türkiye',
        city: 'Ankara',
        timezone: 'Europe/Istanbul'
      },
      { 
        name: 'Ege Güvenlik Hizmetleri', 
        company_code: 'EGE001', 
        status: 'active',
        country: 'Türkiye',
        city: 'İzmir',
        timezone: 'Europe/Istanbul'
      }
    ])
    console.log('  ✓ 3 firma oluşturuldu')

    // Create employees for each company
    const employeesData = [
      // Marmara employees
      { company_id: companies[0].id, name: 'Ahmet Yılmaz', phone: '+90 532 111 2233', role: 'Güvenlik Şefi', status: 'active' },
      { company_id: companies[0].id, name: 'Mehmet Demir', phone: '+90 533 222 3344', role: 'Güvenlik Görevlisi', status: 'active' },
      { company_id: companies[0].id, name: 'Ayşe Kaya', phone: '+90 534 333 4455', role: 'Güvenlik Görevlisi', status: 'active' },
      { company_id: companies[0].id, name: 'Fatma Yıldız', phone: '+90 535 444 5566', role: 'Devriye Amiri', status: 'active' },
      { company_id: companies[0].id, name: 'Ali Çelik', phone: '+90 536 555 6677', role: 'Güvenlik Görevlisi', status: 'passive' },
      // Anadolu employees
      { company_id: companies[1].id, name: 'Mustafa Öz', phone: '+90 537 666 7788', role: 'Güvenlik Şefi', status: 'active' },
      { company_id: companies[1].id, name: 'Zeynep Aksoy', phone: '+90 538 777 8899', role: 'Güvenlik Görevlisi', status: 'active' },
      { company_id: companies[1].id, name: 'Hasan Koç', phone: '+90 539 888 9900', role: 'Devriye Amiri', status: 'active' },
      // Ege employees
      { company_id: companies[2].id, name: 'İbrahim Şahin', phone: '+90 540 999 0011', role: 'Güvenlik Şefi', status: 'active' },
      { company_id: companies[2].id, name: 'Elif Aslan', phone: '+90 541 000 1122', role: 'Güvenlik Görevlisi', status: 'active' }
    ]
    const employees = await Employee.bulkCreate(employeesData)
    console.log('  ✓ 10 çalışan oluşturuldu')

    // Create projects for each company
    const projectsData = [
      // Marmara projects
      { company_id: companies[0].id, name: 'İstanbul Plaza Güvenlik', description: 'İstanbul Plaza iş merkezi güvenlik hizmeti', status: 'active', start_date: '2024-01-01', end_date: '2024-12-31' },
      { company_id: companies[0].id, name: 'Ataşehir AVM Güvenlik', description: 'Ataşehir alışveriş merkezi güvenlik projesi', status: 'active', start_date: '2024-02-01', end_date: '2025-01-31' },
      { company_id: companies[0].id, name: 'Kadıköy Ofis Park', description: 'Kadıköy ofis parkı güvenlik hizmeti', status: 'pending', start_date: '2024-06-01', end_date: '2025-05-31' },
      // Anadolu projects
      { company_id: companies[1].id, name: 'Ankara Teknokent', description: 'Ankara teknoloji merkezi güvenlik', status: 'active', start_date: '2024-01-15', end_date: '2024-12-31' },
      { company_id: companies[1].id, name: 'Çankaya Residence', description: 'Çankaya konut güvenliği', status: 'active', start_date: '2024-03-01', end_date: '2025-02-28' },
      // Ege projects
      { company_id: companies[2].id, name: 'İzmir Liman Güvenlik', description: 'İzmir limanı güvenlik projesi', status: 'active', start_date: '2024-01-01', end_date: '2024-12-31' },
      { company_id: companies[2].id, name: 'Konak AVM', description: 'Konak alışveriş merkezi güvenlik', status: 'completed', start_date: '2023-06-01', end_date: '2024-05-31' }
    ]
    const projects = await Project.bulkCreate(projectsData)
    console.log('  ✓ 7 proje oluşturuldu')

    // Assign employees to projects
    const projectEmployeesData = [
      // İstanbul Plaza
      { project_id: projects[0].id, employee_id: employees[0].id, assigned_role: 'Proje Sorumlusu', status: 'active' },
      { project_id: projects[0].id, employee_id: employees[1].id, assigned_role: 'Gündüz Nöbetçisi', status: 'active' },
      { project_id: projects[0].id, employee_id: employees[2].id, assigned_role: 'Gece Nöbetçisi', status: 'active' },
      // Ataşehir AVM
      { project_id: projects[1].id, employee_id: employees[3].id, assigned_role: 'Proje Sorumlusu', status: 'active' },
      { project_id: projects[1].id, employee_id: employees[1].id, assigned_role: 'Devriye Görevlisi', status: 'active' },
      // Ankara Teknokent
      { project_id: projects[3].id, employee_id: employees[5].id, assigned_role: 'Proje Sorumlusu', status: 'active' },
      { project_id: projects[3].id, employee_id: employees[6].id, assigned_role: 'Gündüz Nöbetçisi', status: 'active' },
      // İzmir Liman
      { project_id: projects[5].id, employee_id: employees[8].id, assigned_role: 'Proje Sorumlusu', status: 'active' },
      { project_id: projects[5].id, employee_id: employees[9].id, assigned_role: 'Liman Güvenliği', status: 'active' }
    ]
    await ProjectEmployee.bulkCreate(projectEmployeesData)
    console.log('  ✓ Proje-çalışan atamaları yapıldı')

    // Create patrols
    const patrolsData = [
      { company_id: companies[0].id, project_id: projects[0].id, name: 'Giriş Kontrol Devriyesi', description: 'Ana giriş ve otopark kontrol noktaları', status: 'active' },
      { company_id: companies[0].id, project_id: projects[0].id, name: 'Kat Devriyesi', description: 'Tüm katların periyodik kontrolü', status: 'active' },
      { company_id: companies[0].id, project_id: projects[1].id, name: 'AVM Gece Devriyesi', description: 'Gece saatlerinde kapsamlı devriye', status: 'active' },
      { company_id: companies[1].id, project_id: projects[3].id, name: 'Kampüs Devriyesi', description: 'Teknokent kampüsü devriye görevi', status: 'active' },
      { company_id: companies[2].id, project_id: projects[5].id, name: 'Liman Güvenlik Turu', description: 'Liman alanı periyodik kontrol', status: 'active' }
    ]
    const patrols = await Patrol.bulkCreate(patrolsData)
    console.log('  ✓ 5 devriye oluşturuldu')

    // Create patrol assignments
    const assignmentsData = [
      { patrol_id: patrols[0].id, employee_id: employees[1].id, schedule_type: 'daily', start_time: '08:00', end_time: '16:00', status: 'active' },
      { patrol_id: patrols[0].id, employee_id: employees[2].id, schedule_type: 'daily', start_time: '16:00', end_time: '00:00', status: 'active' },
      { patrol_id: patrols[1].id, employee_id: employees[3].id, schedule_type: 'daily', start_time: '09:00', end_time: '17:00', status: 'active' },
      { patrol_id: patrols[2].id, employee_id: employees[1].id, schedule_type: 'daily', start_time: '22:00', end_time: '06:00', status: 'active' },
      { patrol_id: patrols[3].id, employee_id: employees[6].id, schedule_type: 'weekly', start_time: '08:00', end_time: '20:00', status: 'active' },
      { patrol_id: patrols[4].id, employee_id: employees[9].id, schedule_type: 'daily', start_time: '06:00', end_time: '18:00', status: 'active' }
    ]
    await PatrolAssignment.bulkCreate(assignmentsData)
    console.log('  ✓ Devriye atamaları yapıldı')

    // Create sample patrol logs
    const now = new Date()
    const logsData = [
      { patrol_id: patrols[0].id, employee_id: employees[1].id, check_time: new Date(now - 3600000), latitude: 41.0082, longitude: 28.9784, result: 'success' },
      { patrol_id: patrols[0].id, employee_id: employees[1].id, check_time: new Date(now - 7200000), latitude: 41.0085, longitude: 28.9780, result: 'success' },
      { patrol_id: patrols[1].id, employee_id: employees[3].id, check_time: new Date(now - 1800000), latitude: 41.0090, longitude: 28.9790, result: 'success' },
      { patrol_id: patrols[2].id, employee_id: employees[1].id, check_time: new Date(now - 10800000), latitude: 40.9920, longitude: 29.0200, result: 'missed' },
      { patrol_id: patrols[3].id, employee_id: employees[6].id, check_time: new Date(now - 86400000), latitude: 39.9334, longitude: 32.8597, result: 'success' },
      { patrol_id: patrols[4].id, employee_id: employees[9].id, check_time: new Date(now - 43200000), latitude: 38.4192, longitude: 27.1287, result: 'success' }
    ]
    await PatrolLog.bulkCreate(logsData)
    console.log('  ✓ Devriye logları oluşturuldu')

    console.log('🎉 Seed işlemi tamamlandı!')
    return true
  } catch (error) {
    console.error('❌ Seed hatası:', error)
    throw error
  }
}

// Export for use in index.js
module.exports = { seed }

// Run directly if called from command line
if (require.main === module) {
  sequelize.sync({ force: true }).then(() => {
    seed().then(() => process.exit(0)).catch(() => process.exit(1))
  })
}
