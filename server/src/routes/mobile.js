const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

// Models
const Employee = require('../models/Employee')
const Company = require('../models/Company')
const Project = require('../models/Project')
const ProjectEmployee = require('../models/ProjectEmployee')
const WorkSchedule = require('../models/WorkSchedule')
const WorkScheduleJoker = require('../models/WorkScheduleJoker')
const ShiftType = require('../models/ShiftType')
const Attendance = require('../models/Attendance')

// Patrol Models
const Patrol = require('../models/Patrol')
const PatrolAssignment = require('../models/PatrolAssignment')
const PatrolLog = require('../models/PatrolLog')

// ============================================
// 🔐 AUTHENTICATION
// ============================================

/**
 * POST /api/mobile/auth/login
 * 4 haneli aktivasyon kodu ile giriş
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { code } = req.body

    if (!code || code.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir 4 haneli kod giriniz'
      })
    }

    // Aktivasyon kodunu ara
    const employee = await Employee.findOne({
      where: { 
        activation_code: code,
        status: 'active'
      },
      include: [
        { model: Company, as: 'company' }
      ]
    })

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz aktivasyon kodu'
      })
    }

    // Basit token oluştur (production'da JWT kullanılmalı)
    const token = Buffer.from(`${employee.id}:${Date.now()}`).toString('base64')

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        employee: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          title: employee.title,
          company_name: employee.company?.name || null
        }
      }
    })

  } catch (error) {
    console.error('Mobile login error:', error)
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    })
  }
})

// ============================================
// 📊 DASHBOARD
// ============================================

/**
 * GET /api/mobile/dashboard
 * Aggregate endpoint - Profil + Aktif Vardiya + Uyarılar
 */
router.get('/dashboard/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params
    
    // Correctly get LOCAL date string YYYY-MM-DD
    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    
    console.log('Mobile Dashboard Request:', { employeeId, today })

    // Personel bilgileri
    const employee = await Employee.findByPk(employeeId, {
      include: [
        { model: Company, as: 'company' }
      ]
    })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Personel bulunamadı'
      })
    }

    // Aktif proje ataması (Sadece bilgi amaçlı)
    const projectAssignment = await ProjectEmployee.findOne({
      where: { 
        employee_id: employeeId,
        is_active: true
      },
      include: [
        { model: Project, as: 'project' }
      ]
    })

    // --- SHIFT LOGIC START ---
    let todayShift = null
    
    // 1. Check Joker (Overrides regular schedule)
    const joker = await WorkScheduleJoker.findOne({
        where: { date: today } // Check if any joker exists for this date. 
        // Note: Joker might be for PROJECT. We need to check if employee is in that project?
        // Since we don't have employee_id in Joker typically (it's slot based?), this might be risky.
        // Let's stick to WorkSchedule. WorkSchedule is the source of truth for "Assignment".
        // Use logic: WorkSchedule is what matters for "Employee has shift".
    })

    // Re-query WorkSchedule with more broad check
    const schedule = await WorkSchedule.findOne({
      where: {
        employee_id: employeeId,
        date: today
      },
      include: [
        { model: ShiftType, as: 'shiftType' },
        { model: Project, as: 'project' } 
      ]
    })
    
    // Fallback or Main Logic
    const activeRecord = schedule; 
    
    if (activeRecord) {
        if (activeRecord.leave_type) {
             // 1. Leave
             todayShift = {
                shift_name: `İZİN: ${activeRecord.leave_type.toUpperCase()}`,
                status: 'leave',
                start_time: '00:00',
                end_time: '00:00',
                planned_hours: 0
            }
        } else if (activeRecord.shiftType) {
             // 2. Standard Shift Type
             const [h1, m1] = activeRecord.shiftType.start_time.split(':')
             const [h2, m2] = activeRecord.shiftType.end_time.split(':')
             let start = parseInt(h1) * 60 + parseInt(m1)
             let end = parseInt(h2) * 60 + parseInt(m2)
             if (end < start) end += 24 * 60 
             
             const durationHours = ((end - start) / 60).toFixed(1)
             
             todayShift = {
               shift_name: activeRecord.shiftType.name,
               start_time: activeRecord.shiftType.start_time,
               end_time: activeRecord.shiftType.end_time,
               planned_hours: durationHours,
               status: 'scheduled'
             }
        } else if (parseFloat(activeRecord.gozetim_hours) > 0) {
             // 3. Manual Hours (No Shift Type)
             todayShift = {
                shift_name: 'Özel Plan',
                status: 'scheduled',
                start_time: '00:00', 
                end_time: '00:00',
                planned_hours: parseFloat(activeRecord.gozetim_hours).toFixed(1)
             }
        }
    }
    // --- SHIFT LOGIC END ---

    // --- DASHBOARD LATEST ATTENDANCE LOGIC ---
    // Fetch ALL records for today to sum hours
    const todayAttendances = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        date: today
      },
      order: [['check_in_time', 'ASC']]
    })
    
    let workedHours = 0
    let isActive = false
    let currentSessionCheckIn = null
    let lastCheckOut = null
    
    todayAttendances.forEach(att => {
        if (att.check_in_time) {
            const checkIn = new Date(att.check_in_time)
            const checkOut = att.check_out_time ? new Date(att.check_out_time) : new Date()
            
            const diffMs = checkOut - checkIn
            workedHours += (diffMs / (1000 * 60 * 60))
            
            if (!att.check_out_time) {
                isActive = true
                currentSessionCheckIn = att.check_in_time
            } else {
                lastCheckOut = att.check_out_time
            }
        }
    })
    
    // Formatting
    const displayCheckIn = isActive ? currentSessionCheckIn : (todayAttendances.length > 0 ? todayAttendances[0].check_in_time : null)
    const displayCheckOut = isActive ? null : lastCheckOut
    
    res.json({
      success: true,
      data: {
        profile: {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          title: employee.title,
          company_name: employee.company?.name || null,
          project_name: projectAssignment?.project?.name || null
        },
        today_shift: todayShift,
        attendance: todayAttendances.length > 0 ? {
          check_in: displayCheckIn,
          check_out: displayCheckOut,
          status: isActive ? 'working' : (todayAttendances[todayAttendances.length-1].status),
          worked_hours: workedHours.toFixed(2),
          is_active: isActive,
          session_count: todayAttendances.length
        } : null,
        alerts: [] 
      }
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Dashboard verileri alınamadı'
    })
  }
})

// ============================================
// 👤 PROFILE
// ============================================

/**
 * GET /api/mobile/profile/:employeeId
 * Personel profil bilgileri (read-only)
 */
router.get('/profile/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params

    const employee = await Employee.findByPk(employeeId, {
      include: [
        { model: Company, as: 'company' }
      ],
      attributes: {
        exclude: ['activation_code'] // Güvenlik için kodu gizle
      }
    })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Personel bulunamadı'
      })
    }

    // Get active project assignment
    const projectAssignment = await ProjectEmployee.findOne({
      where: { employee_id: employeeId },
      include: [{ model: Project, as: 'project' }]
    })

    res.json({
      success: true,
      data: {
        ...employee.toJSON(),
        project: projectAssignment?.project ? {
          id: projectAssignment.project.id,
          name: projectAssignment.project.name
        } : null
      }
    })

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınamadı'
    })
  }
})

// ============================================
// 📅 SHIFTS (Vardiyalar)
// ============================================

/**
 * GET /api/mobile/shifts/:employeeId
 * Personelin vardiya programı
 */
router.get('/shifts/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params
    const { start_date, end_date } = req.query

    // Varsayılan: Bu hafta
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1) // Pazartesi
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Pazar

    const startDate = start_date || weekStart.toISOString().split('T')[0]
    const endDate = end_date || weekEnd.toISOString().split('T')[0]

    const schedules = await WorkSchedule.findAll({
      where: {
        employee_id: employeeId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: ShiftType, as: 'shiftType' },
        { model: ShiftType, as: 'mesaiShiftType' },
        { model: Project, as: 'project' }
      ],
      order: [['date', 'ASC']]
    })

    res.json({
      success: true,
      data: {
        start_date: startDate,
        end_date: endDate,
        shifts: schedules.map(s => {
          // Tarih nesnesini yerel saat dilimine göre YYYY-MM-DD stringine çevir
          // JSON serialization sırasında oluşan timezone kaymasını önler
          const d = new Date(s.date);
          const dateStr = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
          ].join('-');
          
          return {
            id: s.id,
            date: dateStr,
            project_name: s.project?.name,
            shift_name: s.shiftType?.name,
            start_time: s.shiftType?.start_time,
            end_time: s.shiftType?.end_time,
            mesai_shift_name: s.mesaiShiftType?.name,
            mesai_start_time: s.mesaiShiftType?.start_time,
            mesai_end_time: s.mesaiShiftType?.end_time,
            mesai_hours: s.mesai_hours,
            status: s.status
          }
        })
      }
    })

  } catch (error) {
    console.error('Shifts error:', error)
    res.status(500).json({
      success: false,
      message: 'Vardiya bilgileri alınamadı'
    })
  }
})

// ... (existing code)

// ... (existing code)

// ============================================
// 🛡️ PATROLS
// ============================================

/**
 * GET /api/mobile/patrols/:employeeId
 * Personelin devriye görevleri
 */
router.get('/patrols/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params
    
    // Aktif devriye görevlerini getir
    const assignments = await PatrolAssignment.findAll({
      where: {
        employee_id: employeeId,
        status: 'active'
      },
      include: [
        { model: Patrol, as: 'patrol' }
      ]
    })

    // Bugünün loglarını getir
    const today = new Date()
    const startOfDay = new Date(today.setHours(0,0,0,0))
    const endOfDay = new Date(today.setHours(23,59,59,999))

    const logs = await PatrolLog.findAll({
      where: {
        employee_id: employeeId,
        check_time: {
            [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [['check_time', 'DESC']],
      limit: 10
    })

    res.json({
      success: true,
      data: {
        assignments: assignments.map(a => ({
          id: a.id,
          patrol_name: a.patrol?.name,
          schedule_type: a.schedule_type,
          start_time: a.start_time,
          end_time: a.end_time
        })),
        recent_logs: logs.map(l => ({
          id: l.id,
          time: l.check_time,
          result: l.result
        }))
      }
    })

  } catch (error) {
    console.error('Patrols error:', error)
    res.status(500).json({
      success: false,
      message: 'Devriye bilgileri alınamadı'
    })
  }
})

// ============================================
// 📷 SCAN & ACTION
// ============================================

/**
 * POST /api/mobile/scan
 * QR Kod tarama işlemi
 */
router.post('/scan', async (req, res) => {
  try {
    const { employeeId, code, location } = req.body

    // 1. Checkpoint taraması (Örn: "CP-12345")
    if (code.startsWith('CP-')) {
       // Devriye mantığı buraya eklenecek
       return res.json({
         success: true,
         message: 'Devriye noktası okundu',
         data: { type: 'checkpoint', code }
       })
    }

    // 2. Proje/Lokasyon taraması
    // Format 1: URL query param (http://.../attendance/scan?projectId=123...)
    // Format 2: Prefix format (PRJ-123)
    
    let scannedProjectId = null;
    let scannedType = null; // 'entry' or 'exit' (if available in current URL format)

    // URL Format Kontrolü
    if (code.includes('projectId=')) {
        try {
            // Tam URL olmayabilir, query string'den parse etmeye çalış
            const pMatch = code.match(/projectId=([^&]+)/);
            if (pMatch) {
                scannedProjectId = pMatch[1];
            }
            
            const tMatch = code.match(/type=([^&]+)/);
            if (tMatch) {
                // type 'entry' veya 'exit' olabilir
                scannedType = tMatch[1]; 
            }
        } catch (e) {
            console.error('URL parse fail', e);
        }
    } 
    // Prefix Format Kontrolü
    else if (code.startsWith('PRJ-')) {
        // "PRJ-123" formatından ID çıkarma (varsa)
        const parts = code.split('-');
        if (parts.length > 1 && !isNaN(parts[1])) {
            scannedProjectId = parts[1];
        }
    }

    if (scannedProjectId || code.startsWith('PRJ-') || code.includes('/attendance/scan')) {
       // --- ATTENDANCE LOGIC START ---
       
       // 1. Check if employee HAS a shift today
       const today = new Date()
       const dateStr = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, '0'),
          String(today.getDate()).padStart(2, '0')
       ].join('-')
       
       // Vardiya kontrolü
       const scheduleCriteria = {
          employee_id: employeeId,
          date: dateStr
       };

       if (scannedProjectId) {
          scheduleCriteria.project_id = scannedProjectId;
       }

       // 1.1 Check Joker First
       const joker = await WorkScheduleJoker.findOne({
           where: { date: dateStr, project_id: scannedProjectId || { [Op.ne]: null } } // Joker usually needs context if project specific? 
           // Simplification: just date & employee? Joker table has no employee_id column in my previous view? 
           // Wait, WorkScheduleJoker model view lines 1-84 (from controller) did not show employee_id?
           // WorkScheduleJoker has project_id, date, shift_type_id. IT DOES NOT HAVE EMPLOYEE_ID. It is for PROJECT.
           // Ah, Joker is "Slot" based? Or "All employees"? 
           // "WorkScheduleJoker.findAll({ where: { project_id... } })"
           // This means Joker applies to the PROJECT (extra slots).
           // But how do we know if THIS employee is assigned to that Joker?
           // WorkSchedule is per Employee. Joker is per Project.
           // If the employee is just scanning to enter, does he consume a Joker?
           // Let's stick to WorkSchedule logic which is Person Specific. 
           // Just fix the Midnight bug first.
       });
       
       const schedule = await WorkSchedule.findOne({
          where: scheduleCriteria,
          include: [
            { model: ShiftType, as: 'shiftType' },
            { model: ShiftType, as: 'mesaiShiftType' }
          ]
       })
       
       // Fallback for Manual Hours (no shift type)
       let effectiveShiftStart = "09:00:00"
       let effectiveShiftEnd = "18:00:00"
       let strictTimeCheck = false
       
       let activeSchedule = schedule;
       
       if (!schedule || (!schedule.shiftType && !schedule.mesaiShiftType && parseFloat(schedule?.gozetim_hours || 0) <= 0)) {
           // ... (Not Found Logic same as before)
          if (scannedProjectId) {
              const anySchedule = await WorkSchedule.findOne({
                 where: { employee_id: employeeId, date: dateStr },
                 include: [{ model: Project, as: 'project' }]
              });
              
              if (anySchedule) {
                  return res.status(400).json({
                    success: false,
                    message: `Seçilen proje (${scannedProjectId}) için vardiyanız yok.\n\nBugün ${anySchedule.project?.name} projesinde göreviniz var.\nTarih: ${dateStr}`
                  })
              }
          }

          let debugMsg = `Bugün (${dateStr}) için planlanmış vardiyanız bulunmamaktadır.`;
          return res.status(400).json({
            success: false,
            message: debugMsg
          })
       }
       
       // Detect times (Dual Check)
       // Determine the earliest start time for permission Check
       if (activeSchedule.shiftType || activeSchedule.mesaiShiftType) {
           const s1 = activeSchedule.shiftType ? activeSchedule.shiftType.start_time : "23:59:59"
           const s2 = activeSchedule.mesaiShiftType ? activeSchedule.mesaiShiftType.start_time : "23:59:59"
           const e1 = activeSchedule.shiftType ? activeSchedule.shiftType.end_time : "00:00:00"
           const e2 = activeSchedule.mesaiShiftType ? activeSchedule.mesaiShiftType.end_time : "00:00:00"

           // Simplest Logic: Allow entry if close to ANY start time.
           // However, strictTimeCheck logic below needs a single 'startDt' to calculate diff.
           // Let's pick the EARLIEST start time as the effective start for "Can I Enter?" purposes.
           
           if (s1 < s2) {
               effectiveShiftStart = s1
           } else {
               effectiveShiftStart = s2
           }
           
           // For end time, pick the latest? Or the one corresponding to the session?
           // Usually we want the latest end time to not close session early?
           // Actually, for Check-IN validation, StartTime is what matters.
           // For Check-OUT validation, EndTime matters. we might need to be smarter there too.
           
           // Handle Midnight crossing for End Logic simplisticly for now:
           // If either end time is smaller than start, it likely crosses midnight.
           
           // effectiveShiftEnd: Just pick the latest one for now to avoid 'late exit' warnings if overlapping
           // But comparing strings "02:00" vs "18:00" is tricky if one is next day.
           // Let's rely on the Primary Shift End for now if exists, else Mesai.
           effectiveShiftEnd = activeSchedule.shiftType ? activeSchedule.shiftType.end_time : activeSchedule.mesaiShiftType.end_time

           strictTimeCheck = true
       } else {
           // Manual hours - allow entry anytime
           strictTimeCheck = false
           // We can assume "Now" is start time for logging purposes?
           const n = new Date()
           effectiveShiftStart = `${n.getHours()}:${n.getMinutes()}:00`
           effectiveShiftEnd = "23:59:59"
       }
       
       // 2. Check existing OPEN attendance (Session)
       // We look for ANY record that is NOT closed (check_out_time IS NULL)
       const openSession = await Attendance.findOne({
          where: {
             employee_id: employeeId,
             date: dateStr,
             check_out_time: null // Active Session
          }
       })
       
       // Helper to convert time string to Date object for today
       const getTimeDate = (timeStr) => {
         const [h, m] = timeStr.split(':')
         const d = new Date(today)
         d.setHours(parseInt(h), parseInt(m), 0, 0)
         return d
       }
       
       const startDt = getTimeDate(effectiveShiftStart)
       let endDt = getTimeDate(effectiveShiftEnd)
       const now = new Date()
       
       if (endDt <= startDt) {
           endDt.setDate(endDt.getDate() + 1)
       }
       
       const BUFFER_MIN = 5
       
       // --- ACTION DECISION ---
       
       if (!openSession) {
          // --- CHECK IN SCENARIO (New Session) ---

          // KURAL 1: QR Exit Type Check
          if (scannedType === 'exit') {
              return res.status(400).json({
                  success: false,
                  message: 'Giriş yapmadan çıkış işlemi yapamazsınız. Lütfen GİRİŞ QR kodunu okutunuz.'
              })
          }

          // KURAL 2: Late Check (Only if strict)
          if (strictTimeCheck && now > endDt) {
              return res.status(400).json({
                  success: false,
                  message: 'Mesai saati bittiği için giriş yapamazsınız.'
              })
          }
          
          const diffMs = now - startDt
          const diffMins = Math.floor(diffMs / 60000)
          
          if (strictTimeCheck && diffMins < -BUFFER_MIN) {
             return res.status(400).json({
                success: false,
                message: `Mesai başlangıcına ${Math.abs(diffMins)} dakika var. En erken 5 dakika kala giriş yapabilirsiniz.`
             })
          }
          
          let statusMessage = "Vardiya Başlatılacak"
          let statusType = "normal" 
          let attendanceStatus = "present"
          
          if (strictTimeCheck && diffMins > BUFFER_MIN) {
             statusMessage = `⚠️ ${diffMins} dakika gecikme ile başlatıyorsunuz.`
             statusType = "warning"
             attendanceStatus = "late"
          } else {
             statusMessage = "✅ Giriş Yapılıyor."
             statusType = "success"
             attendanceStatus = "present"
          }
          
          return res.json({
             success: true,
             data: {
                type: 'attendance_check_in',
                action: 'check_in',
                project_id: activeSchedule ? activeSchedule.project_id : (scannedProjectId || 0), 
                shift_time: `${effectiveShiftStart.slice(0,5)} - ${effectiveShiftEnd.slice(0,5)}`,
                title: "Giriş İşlemi",
                message: statusMessage,
                status_type: statusType,
                attendance_status: attendanceStatus,
                can_confirm: true
             }
          })
          
       } else {
          // --- CHECK OUT SCENARIO (Close Session) ---
          
          const diffMs = now - endDt
          const diffMins = Math.floor(diffMs / 60000)
          
          let statusMessage = "Oturum Kapatılacak"
          let statusType = "normal"
          let attendanceStatus = openSession.status 
          
          if (strictTimeCheck && diffMins < -BUFFER_MIN) {
             statusMessage = `⚠️ ${Math.abs(diffMins)} dakika erken çıkıyorsunuz.`
             statusType = "warning"
             attendanceStatus = "early_leave" 
          } else {
             statusMessage = "✅ Çıkış Yapılıyor."
             statusType = "success"
          }
          
          return res.json({
             success: true,
             data: {
                type: 'attendance_check_out',
                action: 'check_out',
                project_id: openSession.project_id,
                shift_time: `${effectiveShiftStart.slice(0,5)} - ${effectiveShiftEnd.slice(0,5)}`,
                title: "Çıkış İşlemi",
                message: statusMessage,
                status_type: statusType,
                attendance_status: attendanceStatus,
                can_confirm: true
             }
          })
       }
       // --- ATTENDANCE LOGIC END ---
    }

    // Bilinmeyen format
    return res.status(400).json({
      success: false,
      message: 'Tanımsız QR Kod formatı'
    })

  } catch (error) {
    console.error('Scan error:', error)
    res.status(500).json({
      success: false,
      message: 'Tarama işlemi başarısız'
    })
  }
})

/**
 * POST /api/mobile/attendance/confirm
 * QR Onay Sonrası Kayıt
 */
router.post('/attendance/confirm', async (req, res) => {
  try {
    const { employeeId, projectId, action, attendanceStatus } = req.body
    
    const today = new Date()
    const dateStr = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, '0'),
          String(today.getDate()).padStart(2, '0')
       ].join('-')
       
    if (action === 'check_in') {
        const attendance = await Attendance.create({
            employee_id: employeeId,
            date: dateStr,
            project_id: projectId,
            check_in_time: new Date(),
            status: attendanceStatus,
            verification_method: 'qr'
        })
        
        return res.json({ success: true, message: 'Giriş Başarıyla Yapıldı' })
    }
    
    if (action === 'check_out') {
        const attendance = await Attendance.findOne({
            where: {
                employee_id: employeeId,
                date: dateStr,
                check_out_time: null // Find the ACTIVE session
            }
        })
        
        if (attendance) {
            let finalStatus = attendance.status
            if (attendanceStatus === 'early_leave' && attendance.status === 'present') {
                finalStatus = 'early_leave'
            }
            
            const checkOutTime = new Date()
            const checkInTime = new Date(attendance.check_in_time)
            const durationMs = checkOutTime - checkInTime
            const actualHours = (durationMs / (1000 * 60 * 60)).toFixed(2)
            
            await attendance.update({
                check_out_time: checkOutTime,
                status: finalStatus,
                actual_hours: actualHours
            })
            return res.json({ success: true, message: 'Çıkış Başarıyla Yapıldı' })
        }
        return res.status(404).json({ success: false, message: 'Aktif giriş kaydı bulunamadı' })
    }
    
    res.status(400).json({ success: false, message: 'Geçersiz işlem' })
    
  } catch (error) {
    console.error('Attendance confirm error:', error)
    res.status(500).json({ success: false, message: 'İşlem hatası' })
  }
})

// ============================================
// 🔧 UTILITIES
// ============================================

/**
 * Benzersiz 4 haneli aktivasyon kodu üret
 */
async function generateActivationCode() {
  let code
  let exists = true
  
  while (exists) {
    // 1000-9999 arası rastgele sayı
    code = Math.floor(1000 + Math.random() * 9000).toString()
    
    // Kodun benzersiz olduğunu kontrol et
    const existing = await Employee.findOne({
      where: { activation_code: code }
    })
    
    exists = !!existing
  }
  
  return code
}

/**
 * POST /api/mobile/generate-code/:employeeId
 * Personele aktivasyon kodu ata (Admin için)
 */
router.post('/generate-code/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params

    const employee = await Employee.findByPk(employeeId)
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Personel bulunamadı'
      })
    }

    const code = await generateActivationCode()
    
    await employee.update({ activation_code: code })

    res.json({
      success: true,
      message: 'Aktivasyon kodu oluşturuldu',
      data: { activation_code: code }
    })

  } catch (error) {
    console.error('Generate code error:', error)
    res.status(500).json({
      success: false,
      message: 'Kod oluşturulamadı'
    })
  }
})

module.exports = router
