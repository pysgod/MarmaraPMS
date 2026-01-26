import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { ChevronLeft, ChevronRight, Loader2, Users, Calendar, Coffee, Plus, Settings, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import ShiftTypeManager from './ShiftTypeManager'

// İzin türleri
const LEAVE_TYPES = {
  hafta_tatili: { label: 'HT', name: 'Hafta Tatili', color: 'bg-orange-500/30 text-orange-400' },
  resmi_tatil: { label: 'RT', name: 'Resmi Tatil', color: 'bg-red-500/30 text-red-400' },
  ucretsiz_izin: { label: 'Üİ', name: 'Ücretsiz İzin', color: 'bg-yellow-500/30 text-yellow-400' },
  yillik_izin: { label: 'Yİ', name: 'Yıllık İzin', color: 'bg-teal-500/30 text-teal-400' },
  raporlu: { label: 'RP', name: 'Raporlu', color: 'bg-pink-500/30 text-pink-400' },
  dogum_izni: { label: 'Dİ', name: 'Doğum İzni', color: 'bg-indigo-500/30 text-indigo-400' }
}

// Attendance status config
const ATTENDANCE_STATUS = {
  present: { label: '✓', name: 'Zamanında', color: 'bg-green-500/30 text-green-400', icon: CheckCircle },
  late: { label: 'G', name: 'Geç Kaldı', color: 'bg-amber-500/30 text-amber-400', icon: Clock },
  early_leave: { label: 'E', name: 'Erken Çıktı', color: 'bg-orange-500/30 text-orange-400', icon: AlertTriangle },
  absent: { label: '✗', name: 'Gelmedi', color: 'bg-red-500/30 text-red-400', icon: XCircle },
  incomplete: { label: '?', name: 'Eksik', color: 'bg-gray-500/30 text-gray-400', icon: Clock },
  off_day_work: { label: 'E+', name: 'Tatilde Çalıştı', color: 'bg-purple-500/30 text-purple-400', icon: CheckCircle },
}

export default function ProjectWorkSchedule({ projectId }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    project: null,
    employees: [],
    days: [],
    scheduleMap: {},
    employeeTotals: {},
    jokers: [],
    shiftTypes: [],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  })
  
  // Attendance data
  const [attendanceMap, setAttendanceMap] = useState({})
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedLeaveType, setSelectedLeaveType] = useState(null)
  
  // Context Menu State: { x, y, employeeId, date, isJoker, rowType: 'shift' | 'overtime' }
  const [contextMenu, setContextMenu] = useState(null)
  const [showShiftManager, setShowShiftManager] = useState(false)

  useEffect(() => {
    loadSchedule()
  }, [projectId, selectedYear, selectedMonth])

  // Load attendance whenever schedule loads
  useEffect(() => {
    if (data.days?.length > 0) {
      loadAttendance()
    }
  }, [data.days])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const result = await api.getProjectWorkSchedule(projectId, selectedYear, selectedMonth)
      setData(result)
    } catch (error) {
      console.error('Çizelge yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendance = async () => {
    if (!data.days?.length) return
    setLoadingAttendance(true)
    try {
      const startDate = data.days[0].date
      const endDate = data.days[data.days.length - 1].date
      const attendances = await api.getProjectAttendance(projectId, startDate, endDate)
      
      // Map for quick lookup: key = "employeeId-date"
      const map = {}
      
      // Aggregate multi-session attendances
      const grouping = {}
      attendances.forEach(a => {
        const key = `${a.employee_id}-${a.date}`
        if(!grouping[key]) grouping[key] = []
        grouping[key].push(a)
      })
      
      Object.entries(grouping).forEach(([key, list]) => {
          // Sort by check in
          list.sort((x, y) => new Date(x.check_in_time) - new Date(y.check_in_time))
          
          let totalActual = 0
          let totalOvertime = 0
          const statuses = new Set()
          
          list.forEach(item => {
              if (item.actual_hours) totalActual += parseFloat(item.actual_hours)
              if (item.overtime_hours) totalOvertime += parseFloat(item.overtime_hours)
              statuses.add(item.status)
          })
          
          // Merge Status: Late > Early > Present
          let mergedStatus = 'present'
          if (statuses.has('late')) mergedStatus = 'late'
          else if (statuses.has('early_leave')) mergedStatus = 'early_leave'
          else if (statuses.has('absent')) mergedStatus = 'absent'
          else if (statuses.has('incomplete')) mergedStatus = 'incomplete'
          
          const first = list[0]
          // Create synthetic attendance object with totals
          map[key] = {
              ...first,
              status: mergedStatus,
              actual_hours: totalActual.toFixed(2),
              overtime_hours: totalOvertime.toFixed(2),
              check_in_time: first.check_in_time,
              check_out_time: list[list.length - 1].check_out_time
          }
      })
      
      setAttendanceMap(map)
    } catch (error) {
      console.error('Attendance yüklenirken hata:', error)
    } finally {
      setLoadingAttendance(false)
    }
  }

  const getAttendanceData = (employeeId, date) => {
    return attendanceMap[`${employeeId}-${date}`] || null
  }

  const getCellData = (employeeId, date) => {
    const key = `${employeeId}-${date}`
    return data.scheduleMap[key] || { shift_type_id: null, leave_type: null, mesai_hours: 0, gozetim_hours: 0, mesai_shift_type_id: null }
  }

  // --- TIME FORMATTING HELPER ---
  const formatDuration = (hours, type = 'cell') => {
      const val = parseFloat(hours) || 0
      if (val === 0) return type === 'card' ? '0 sa 0 dk' : '-'
      
      const h = Math.floor(val)
      const m = Math.round((val - h) * 60)
      
      if (type === 'card') {
          // Format: "7 sa 30 dk"
          return `${h} sa ${m} dk`
      } else {
          // Cell Format
          // If less than 1 hour -> "45dk"
          if (val < 1) {
              return `${Math.round(val * 60)}dk`
          }
          // Else -> "07:30"
          const hStr = h.toString().padStart(2, '0')
          const mStr = m.toString().padStart(2, '0')
          return `${hStr}:${mStr}`
      }
  }

  const getShiftTypeDetails = (id) => {
    if (!id) return { label: '-', color: 'bg-gray-500/30 text-gray-400', hours: 0 }
    const type = data.shiftTypes?.find(t => t.id === id)
    if (!type) return { label: '?', color: 'bg-gray-500/30 text-gray-400', hours: 0 }
    
    const isHex = type.color.startsWith('#')
    return {
      id: type.id,
      label: type.short_code,
      color: type.color,
      isHex,
      hours: parseFloat(type.hours),
      name: type.name,
      start_time: type.start_time,
      end_time: type.end_time
    }
  }

  // Handle cell click (Primary Action)
  // Shift Mode: Toggle Shift
  // Leave Mode: Set Leave
  const handleCellClick = async (employeeId, date, rowType, isJoker = false) => {
    if (rowType === 'overtime') {
       const currentData = isJoker 
          ? (data.jokers.find(j => j.date === date) || { mesai_shift_type_id: null }) 
          : (getCellData(employeeId, date) || { mesai_shift_type_id: null })
          
       // Cycle through shift types like Gözetim row
       const sortedShifts = [...(data.shiftTypes || [])].sort((a,b) => a.order - b.order || a.id - b.id)
       
       let nextShiftTypeId = null
       let currentIndex = -1
       
       if (currentData.mesai_shift_type_id) {
         currentIndex = sortedShifts.findIndex(t => t.id === currentData.mesai_shift_type_id)
       }
       
       if (currentIndex === -1 && sortedShifts.length > 0) {
         // Off -> First Shift
         nextShiftTypeId = sortedShifts[0].id
       } else if (currentIndex !== -1 && currentIndex < sortedShifts.length - 1) {
         // Go to Next Shift
         nextShiftTypeId = sortedShifts[currentIndex + 1].id
       } else {
         // Last Shift or Unknown -> Off (null)
         nextShiftTypeId = null
       }

       setSaving(true)
       try {
         if (isJoker) {
           await api.toggleJoker({ 
             project_id: projectId, 
             date, 
             mesai_shift_type_id: nextShiftTypeId 
           })
         } else {
           const cellInfo = getCellData(employeeId, date)
           await api.updateWorkSchedule({
              project_id: projectId,
              employee_id: employeeId,
              date: date,
              shift_type_id: cellInfo.shift_type_id,
              gozetim_hours: cellInfo.gozetim_hours,
              leave_type: cellInfo.leave_type,
              mesai_shift_type_id: nextShiftTypeId,
              notes: cellInfo.notes
           })
         }
         loadSchedule()
       } catch (error) {
         console.error('Mesai güncelleme hatası:', error)
       } finally {
         setSaving(false)
       }
       return
    }

    if (isJoker) {
       // Joker Toggle
       setSaving(true)
       try {
         await api.toggleJoker({ project_id: projectId, date })
         loadSchedule()
       } catch (error) {
         console.error('Joker hatası:', error)
       } finally {
         setSaving(false)
       }
       return
    }

    // Standard Shift Row
    if (selectedLeaveType) {
      setSaving(true)
      try {
        await api.setLeaveType({
          project_id: projectId,
          employee_id: employeeId,
          date: date,
          leave_type: selectedLeaveType
        })
        loadSchedule()
      } catch (error) {
        console.error('İzin kaydetme hatası:', error)
      } finally {
        setSaving(false)
      }
    } else {
      setSaving(true)
      try {
        await api.toggleWorkSchedule({
          project_id: projectId,
          employee_id: employeeId,
          date: date
        })
        loadSchedule()
      } catch (error) {
        console.error('Vardiya güncelleme hatası:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleCellRightClick = (e, employeeId, date, rowType, isJoker = false) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Mouse pozisyonunu nativeEvent'ten al (React synthetic event sorunlarını önler)
    const mouseX = e.nativeEvent.clientX || e.clientX
    const mouseY = e.nativeEvent.clientY || e.clientY
    
    console.log('Right click at:', mouseX, mouseY) // Debug için
    
    setContextMenu({ 
      x: mouseX, 
      y: mouseY, 
      employeeId, 
      date, 
      rowType, 
      isJoker 
    })
  }

  const handleMenuAction = async (type, value) => {
    if (!contextMenu) return
    setSaving(true)
    
    try {
      if (contextMenu.isJoker) {
        if (contextMenu.rowType === 'shift') {
           // Set Shift Type
           await api.toggleJoker({
             project_id: projectId,
             date: contextMenu.date,
             shift_type: value // ID or null
           })
        } else {
           // Set Overtime (Mesai)
           if (type === 'shift') {
             await api.toggleJoker({
               project_id: projectId,
               date: contextMenu.date,
               mesai_shift_type_id: value || null
             })
           }
        }
      } else {
        // --- EMPLOYEES LOGIC ---
        if (contextMenu.rowType === 'shift') {
           // GÖZETİM / SHIFT TYPE ROW
           if (type === 'shift') {
             await api.updateWorkSchedule({
               project_id: projectId,
               employee_id: contextMenu.employeeId,
               date: contextMenu.date,
               shift_type_id: value,
               leave_type: null
             })
           } else {
             // Leave
             await api.setLeaveType({
               project_id: projectId,
               employee_id: contextMenu.employeeId,
               date: contextMenu.date,
               leave_type: value
             })
           }
        } else {
           // MESAI / OVERTIME ROW
           // value here is a shift_type_id (if type=='shift')
           if (type === 'shift') {
              // We need to keep existing shift_type_id/gozetim, only update mesai
              const current = getCellData(contextMenu.employeeId, contextMenu.date)
              
              await api.updateWorkSchedule({
                project_id: projectId,
                employee_id: contextMenu.employeeId,
                date: contextMenu.date,
                shift_type_id: current.shift_type_id,
                gozetim_hours: current.gozetim_hours,
                leave_type: current.leave_type,
                mesai_shift_type_id: value || null,
                notes: current.notes
              })
           }
         }
      }
      loadSchedule()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
    } finally {
      setSaving(false)
      setContextMenu(null)
    }
  }

  // ... (Keep existing Navigation & Utils) ...
  const goToPrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); } 
    else { setSelectedMonth(selectedMonth - 1); }
  }
  const goToNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); } 
    else { setSelectedMonth(selectedMonth + 1); }
  }
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const getJokerForDate = (date) => data.jokers.find(j => j.date === date)

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (loading && !data.project) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ... (Keep existing Header) ... */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={goToPrevMonth} className="p-2 rounded-lg bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-secondary transition-colors"><ChevronLeft size={20} /></button>
          <div className="text-lg font-semibold text-theme-text-primary min-w-[180px] text-center">{monthNames[selectedMonth - 1]} {selectedYear}</div>
          <button onClick={goToNextMonth} className="p-2 rounded-lg bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-secondary transition-colors"><ChevronRight size={20} /></button>
        </div>
        <div className="flex items-center gap-4 text-xs flex-wrap">
           {saving && <span className="flex items-center gap-1 text-accent"><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</span>}
           <div className="flex items-center gap-2">
             <div className="px-2 py-1 rounded bg-gray-500/30 text-gray-400">-</div>
             {data.shiftTypes?.map(type => (
               <div key={type.id} className="px-2 py-1 rounded font-medium flex items-center gap-1" style={type.color.startsWith('#') ? { backgroundColor: type.color, color: '#fff' } : {}}>
                 <span>{type.short_code}</span>
                 <span className="opacity-90 text-[10px] ml-1">{type.start_time?.slice(0,5)}-{type.end_time?.slice(0,5)}</span>
                 <span className="opacity-75 text-[10px] ml-1">({type.hours}s)</span>
               </div>
             ))}
             <button onClick={() => setShowShiftManager(true)} className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"><Settings size={14} /> Vardiya Tipleri</button>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-theme-bg-tertiary rounded-lg flex-wrap">
         <span className="text-sm font-medium text-theme-text-secondary mr-2"><Coffee size={16} className="inline mr-1" /> İzin Türü Seç:</span>
         <button onClick={() => setSelectedLeaveType(null)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!selectedLeaveType ? 'bg-accent text-white' : 'bg-theme-bg-hover text-theme-text-tertiary hover:bg-theme-bg-elevated'}`}>Vardiya Modu</button>
         {Object.entries(LEAVE_TYPES).map(([key, val]) => (
           <button key={key} onClick={() => setSelectedLeaveType(selectedLeaveType === key ? null : key)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${selectedLeaveType === key ? val.color + ' ring-2 ring-white/50' : 'bg-theme-bg-hover text-theme-text-tertiary hover:bg-theme-bg-elevated'}`}>
             <span className="font-bold">{val.label}</span>
             <span className="hidden sm:inline opacity-75 ml-1">- {val.name}</span>
           </button>
         ))}
      </div>

      <div className="border border-theme-border-primary rounded-xl overflow-hidden bg-theme-bg-secondary shadow-lg">
        <div className="overflow-auto max-h-[calc(100vh-400px)]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-theme-bg-hover shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-theme-bg-hover min-w-[200px] px-3 py-2 text-left font-semibold text-theme-text-muted uppercase tracking-wider border-b border-r border-theme-border-primary">
                  <div className="flex items-center gap-2 pl-2">
                     <Users size={14} /> 
                     <span>Personel Listesi</span>
                  </div>
                </th>
                <th className="w-12 px-1 py-3 text-center font-bold text-theme-text-muted border-b border-r border-theme-border-primary bg-theme-bg-tertiary/50">Tip</th>
                {data.days.map(day => (
                  <th key={day.date} className={`w-10 min-w-[40px] px-0 py-2 text-center border-b border-theme-border-primary ${day.isWeekend ? 'bg-red-500/10' : ''}`}>
                    <div className="flex flex-col items-center justify-center">
                        <span className={`text-base font-bold ${day.isWeekend ? 'text-red-400' : 'text-theme-text-primary'}`}>{day.day}</span>
                        <span className="text-[10px] text-theme-text-muted uppercase tracking-tighter">{day.dayName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.employees.map((employee, idx) => {
                const totals = data.employeeTotals[employee.id] || { gozetim: 0, mesai: 0 }
                return (
                  <React.Fragment key={employee.id}>
                    {/* Row 1: Gözetim (Shift) */}
                    <tr className="group">
                      {/* Name Cell - Spans 2 Rows */}
                      <td rowSpan={2} className={`sticky left-0 z-10 px-4 py-3 border-r border-theme-border-primary border-b bg-theme-bg-secondary group-hover:bg-theme-bg-hover/20 transition-colors`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xs font-bold text-accent border border-accent/10 shadow-sm">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-theme-text-primary truncate max-w-[130px]">{employee.first_name} {employee.last_name}</p>
                            <p className="text-[10px] text-theme-text-muted truncate max-w-[130px] uppercase tracking-wide">{employee.title || 'Personel'}</p>
                            <div className="flex gap-2 mt-1.5 text-[9px]">
                               <span className="bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20 font-bold">{totals.gozetim}s</span>
                               <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 font-bold">{totals.mesai}s</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Gözetim Label */}
                      <td className="w-12 h-10 text-center border-b border-t border-r border-theme-border-primary text-[10px] font-bold text-emerald-400 bg-emerald-500/5 tracking-wider">
                        GÖZETİM
                      </td>

                      {/* Gözetim Cells */}
                      {data.days.map(day => {
                         const cellData = getCellData(employee.id, day.date)
                         const shiftInfo = getShiftTypeDetails(cellData.shift_type_id)
                         const leaveInfo = cellData.leave_type ? LEAVE_TYPES[cellData.leave_type] : null
                         
                         return (
                           <td 
                             key={`gozetim-${employee.id}-${day.date}`}
                             onClick={(e) => handleCellClick(employee.id, day.date, 'shift')}
                             onContextMenu={(e) => handleCellRightClick(e, employee.id, day.date, 'shift')}
                             className={`w-10 h-10 p-0.5 border-b border-r border-theme-border-primary cursor-pointer select-none relative group/cell ${day.isWeekend && !leaveInfo ? 'bg-theme-bg-tertiary/10' : ''}`}
                           >
                              <div className={`w-full h-full flex items-center justify-center rounded-md font-bold text-xs transition-all duration-200 
                                  ${leaveInfo ? leaveInfo.color + ' border border-current shadow-sm' : ''}
                                  ${!leaveInfo && !shiftInfo.isHex && !cellData.shift_type_id ? 'group-hover/cell:bg-theme-bg-hover text-theme-text-placeholder' : ''}
                                  ${!leaveInfo && !shiftInfo.isHex && cellData.shift_type_id ? shiftInfo.color : ''}
                              `}
                              style={!leaveInfo && shiftInfo.isHex ? { backgroundColor: shiftInfo.color, color: '#fff' } : {}}
                              >
                                 {leaveInfo ? leaveInfo.label : shiftInfo.label}
                              </div>
                           </td>
                         )
                      })}
                    </tr>

                    {/* Row 2: Mesai (Overtime) */}
                    <tr className="group">
                      {/* Mesai Label */}
                      <td className="w-12 h-10 text-center border-b border-r border-theme-border-primary text-[10px] font-bold text-orange-400 bg-orange-500/5 tracking-wider">
                        MESAİ
                      </td>

                      {/* Mesai Cells */}
                      {data.days.map(day => {
                         const cellData = getCellData(employee.id, day.date)
                         const mesaiShiftInfo = getShiftTypeDetails(cellData.mesai_shift_type_id)
                         const hasMesai = cellData.mesai_shift_type_id

                         return (
                           <td 
                             key={`mesai-${employee.id}-${day.date}`}
                             onClick={(e) => handleCellClick(employee.id, day.date, 'overtime')}
                             onContextMenu={(e) => handleCellRightClick(e, employee.id, day.date, 'overtime')}
                             className={`w-10 h-10 p-0.5 border-b border-r border-theme-border-primary cursor-pointer select-none group/cell ${day.isWeekend ? 'bg-theme-bg-tertiary/10' : ''}`}
                           >
                              <div className={`w-full h-full flex items-center justify-center rounded-md transition-all duration-200
                                  ${hasMesai && !mesaiShiftInfo.isHex ? mesaiShiftInfo.color + ' border border-white/10 shadow-sm' : ''}
                                  ${!hasMesai ? 'hover:bg-orange-500/10' : ''}
                              `}
                              style={hasMesai && mesaiShiftInfo.isHex ? { backgroundColor: mesaiShiftInfo.color, color: '#fff' } : {}}
                              >
                               {hasMesai ? (
                                   <span className="font-bold text-xs">{mesaiShiftInfo.label}</span>
                               ) : (
                                 <span className="text-transparent group-hover/cell:text-orange-500/40 text-[16px] leading-none">+</span>
                               )}
                              </div>
                           </td>
                         )
                      })}
                    </tr>
                  </React.Fragment>
                )
              })}

              {/* JOKER SECTION */}
               {data.employees.length > 0 && (
                <>
                  <tr className="h-4"></tr> {/* Spacer */}
                  
                   {/* Joker Row 1: Gözetim */}
                   <tr className="group">
                      <td rowSpan={2} className="sticky left-0 z-10 px-4 py-3 border-r border-theme-border-primary border-b bg-yellow-500/5 border-l-4 border-l-yellow-500/50">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center font-bold text-yellow-500 text-lg shadow-[0_0_10px_rgba(234,179,8,0.2)]">J</div>
                           <div>
                              <p className="font-bold text-yellow-500 text-sm">Joker Slot</p>
                              <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest">Ekstra</p>
                           </div>
                        </div>
                      </td>
                      <td className="w-12 h-10 text-center border-b border-t border-r border-theme-border-primary text-[10px] font-bold text-yellow-600 bg-yellow-500/10 tracking-wider">GÖZETİM</td>
                      {data.days.map(day => {
                        const joker = getJokerForDate(day.date)
                        const shiftInfo = getShiftTypeDetails(joker?.shift_type_id)
                        return (
                          <td 
                             key={`joker-gozetim-${day.date}`}
                             onClick={() => handleCellClick(null, day.date, 'shift', true)}
                             onContextMenu={(e) => handleCellRightClick(e, null, day.date, 'shift', true)}
                             className="w-10 h-10 p-0.5 border-b border-r border-theme-border-primary cursor-pointer select-none group/cell bg-yellow-500/5"
                           >
                              <div className={`w-full h-full flex items-center justify-center rounded-md transition-all duration-200
                                  ${joker?.shift_type_id && !shiftInfo.isHex ? shiftInfo.color + ' border border-current' : ''}
                                  ${!joker?.shift_type_id ? 'hover:bg-yellow-500/10' : ''}
                              `}
                              style={joker?.shift_type_id && shiftInfo.isHex ? { backgroundColor: shiftInfo.color, color: '#fff', opacity: 0.95 } : {}}
                              >
                                {joker?.shift_type_id ? (
                                    <span className="font-bold text-xs">{shiftInfo.label}</span>
                                ) : (
                                    <span className="text-yellow-500/20 group-hover/cell:text-yellow-500/50 text-xs">○</span>
                                )}
                              </div>
                          </td>
                        )
                      })}
                   </tr>
                   {/* Joker Row 2: Mesai */}
                   <tr className="group">
                      <td className="w-12 h-10 text-center border-b border-r border-theme-border-primary text-[10px] font-bold text-yellow-600/70 bg-yellow-500/10 tracking-wider">MESAİ</td>
                      {data.days.map(day => {
                         const joker = getJokerForDate(day.date)
                         const hasMesai = joker?.mesai_shift_type_id
                         const mesaiShiftInfo = getShiftTypeDetails(joker?.mesai_shift_type_id)

                         return (
                            <td 
                               key={`joker-mesai-${day.date}`} 
                               onClick={() => handleCellClick(null, day.date, 'overtime', true)}
                               onContextMenu={(e) => handleCellRightClick(e, null, day.date, 'overtime', true)}
                               className="w-10 h-10 p-0.5 border-b border-r border-theme-border-primary cursor-pointer select-none group/cell bg-yellow-500/5"
                            >
                               <div className={`w-full h-full flex items-center justify-center rounded-md transition-all duration-200
                                  ${hasMesai && !mesaiShiftInfo.isHex ? mesaiShiftInfo.color + ' border border-current' : ''}
                                  ${!hasMesai ? 'hover:bg-orange-500/10' : ''}
                               `}
                               style={hasMesai && mesaiShiftInfo.isHex ? { backgroundColor: mesaiShiftInfo.color, color: '#fff' } : {}}
                               >
                               {hasMesai ? (
                                   <span className="font-bold text-xs">{mesaiShiftInfo.label}</span>
                               ) : (
                                  <span className="text-transparent group-hover/cell:text-orange-500/40 text-[16px] leading-none">+</span>
                               )}
                               </div>
                            </td>
                         )
                      })}
                   </tr>
                </>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== ATTENDANCE SECTION ==================== */}
      {(() => {
        // Calculate project-wide statistics
        let totalPresent = 0
        let totalLate = 0
        let totalAbsent = 0
        
        // Gözetim (Shift) calculations - planned vs actual
        let totalPlannedGozetimHours = 0
        let totalActualGozetimHours = 0
        let totalMissedGozetimHours = 0
        
        // Mesai (Overtime) calculations - planned vs actual
        let totalPlannedMesaiHours = 0
        let totalActualMesaiHours = 0
        let totalMissedMesaiHours = 0
        
        let totalLeaveDays = { hafta_tatili: 0, resmi_tatil: 0, ucretsiz_izin: 0, yillik_izin: 0, raporlu: 0, dogum_izni: 0 }
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // Calculate per-employee stats
        const employeeStats = {}
        data.employees.forEach(emp => {
          const stats = {
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            totalWorkHours: 0,
            plannedGozetim: 0,
            actualGozetim: 0,
            missedGozetim: 0,
            plannedMesai: 0,
            actualMesai: 0,
            missedMesai: 0,
            leaveCount: 0
          }
          
          data.days.forEach(day => {
            const cellData = getCellData(emp.id, day.date)
            const attendance = getAttendanceData(emp.id, day.date)
            const dayDate = new Date(day.date)
            
            // Calculate planned gözetim hours from shift type
            if (cellData.shift_type_id && !cellData.leave_type) {
              const gozetimShiftInfo = getShiftTypeDetails(cellData.shift_type_id)
              stats.plannedGozetim += gozetimShiftInfo.hours || 0
              totalPlannedGozetimHours += gozetimShiftInfo.hours || 0
            }
            
            // Calculate planned mesai hours
            if (cellData.mesai_shift_type_id) {
              const mesaiShiftInfo = getShiftTypeDetails(cellData.mesai_shift_type_id)
              stats.plannedMesai += mesaiShiftInfo.hours || 0
              totalPlannedMesaiHours += mesaiShiftInfo.hours || 0
            }
            
            if (cellData.leave_type) {
              totalLeaveDays[cellData.leave_type] = (totalLeaveDays[cellData.leave_type] || 0) + 1
              stats.leaveCount++
            } else if (cellData.shift_type_id) {
              if (attendance) {
                // Has attendance record
                if (attendance.status === 'present') { stats.presentCount++; totalPresent++ }
                else if (attendance.status === 'late') { stats.presentCount++; stats.lateCount++; totalPresent++; totalLate++ }
                else if (attendance.status === 'absent') { stats.absentCount++; totalAbsent++ }
                
                // Actual gözetim hours worked
                if (attendance.actual_hours) {
                  const actualHours = parseFloat(attendance.actual_hours)
                  stats.actualGozetim += actualHours
                  stats.totalWorkHours += actualHours
                  totalActualGozetimHours += actualHours
                }
                
                // Actual mesai hours worked
                if (attendance.overtime_hours) {
                  const overtimeHours = parseFloat(attendance.overtime_hours)
                  stats.actualMesai += overtimeHours
                  totalActualMesaiHours += overtimeHours
                }
                
                // Check for missed gözetim on past days
                if (dayDate < today && cellData.shift_type_id) {
                  const plannedGozetim = getShiftTypeDetails(cellData.shift_type_id).hours || 0
                  const actualGozetim = attendance.actual_hours ? parseFloat(attendance.actual_hours) : 0
                  if (actualGozetim < plannedGozetim) {
                    const missed = plannedGozetim - actualGozetim
                    stats.missedGozetim += missed
                    totalMissedGozetimHours += missed
                  }
                }
                
                // Check for missed mesai on past days
                if (dayDate < today && cellData.mesai_shift_type_id) {
                  const plannedMesai = getShiftTypeDetails(cellData.mesai_shift_type_id).hours || 0
                  const actualMesai = attendance.overtime_hours ? parseFloat(attendance.overtime_hours) : 0
                  if (actualMesai < plannedMesai) {
                    const missed = plannedMesai - actualMesai
                    stats.missedMesai += missed
                    totalMissedMesaiHours += missed
                  }
                }
              } else if (dayDate < today) {
                // No attendance record for past day = absent
                stats.absentCount++
                totalAbsent++
                
                // All planned gözetim is missed
                const plannedGozetim = getShiftTypeDetails(cellData.shift_type_id).hours || 0
                stats.missedGozetim += plannedGozetim
                totalMissedGozetimHours += plannedGozetim
                
                // If had planned mesai, count as missed
                if (cellData.mesai_shift_type_id) {
                  const plannedMesai = getShiftTypeDetails(cellData.mesai_shift_type_id).hours || 0
                  stats.missedMesai += plannedMesai
                  totalMissedMesaiHours += plannedMesai
                }
              }
            }
          })
          
          employeeStats[emp.id] = stats
        })

        return (
          <div className="mt-6 space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} className="text-green-400" />
                <h3 className="text-base font-semibold text-theme-text-primary">Aylık Yoklama Detayı</h3>
                <span className="text-sm text-theme-text-muted">({monthNames[selectedMonth - 1]} {selectedYear})</span>
                {loadingAttendance && <Loader2 size={14} className="animate-spin text-accent" />}
              </div>
            </div>

            {/* Summary Cards - Two Sections Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gözetim Summary */}
              <div className="bg-theme-bg-tertiary/30 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Gözetim Özeti (Vardiya Çalışması)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Planlanan</p>
                    <p className="text-xl font-bold text-green-400">{formatDuration(totalPlannedGozetimHours, 'card')}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Yapılan</p>
                    <p className="text-xl font-bold text-emerald-400">{formatDuration(totalActualGozetimHours, 'card')}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Kaçırılan</p>
                    <p className="text-xl font-bold text-red-400">{formatDuration(totalMissedGozetimHours, 'card')}</p>
                  </div>
                </div>
              </div>

              {/* Mesai Summary */}
              <div className="bg-theme-bg-tertiary/30 border border-orange-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <Clock size={16} />
                  Mesai Özeti (Fazla Çalışma)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Planlanan</p>
                    <p className="text-xl font-bold text-orange-400">{formatDuration(totalPlannedMesaiHours, 'card')}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Yapılan</p>
                    <p className="text-xl font-bold text-emerald-400">{formatDuration(totalActualMesaiHours, 'card')}</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-theme-text-muted mb-1">Kaçırılan</p>
                    <p className="text-xl font-bold text-rose-400">{formatDuration(totalMissedMesaiHours, 'card')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Grid Table - Like Work Schedule */}
            <div className="border border-theme-border-primary rounded-xl overflow-hidden bg-theme-bg-secondary">
              <div className="overflow-auto max-h-[calc(100vh-400px)]">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-theme-bg-hover shadow-sm">
                    <tr>
                      <th className="sticky left-0 z-30 bg-theme-bg-hover w-[150px] px-2 py-1 text-left font-semibold text-theme-text-muted uppercase tracking-wider border-b border-r border-theme-border-primary text-[10px]">
                        <Users size={12} className="inline mr-1" /> Personel
                      </th>
                      <th className="w-[50px] px-1 py-1 text-center font-semibold text-theme-text-muted border-b border-theme-border-primary bg-theme-bg-tertiary/50 text-[9px]">
                        Top.<br/><span className="text-[8px]">(s)</span>
                      </th>
                      {data.days.map(day => (
                        <th key={day.date} className={`min-w-[28px] w-[28px] px-0 py-1 text-center border-b border-theme-border-primary ${day.isWeekend ? 'bg-red-500/10' : ''}`}>
                          <div className="font-bold text-theme-text-primary text-[10px]">{day.day}</div>
                          <div className="text-[7px] text-theme-text-muted">{day.dayName.charAt(0)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.employees.map((employee, idx) => {
                      const stats = employeeStats[employee.id]
                      
                      // Calculate planned gözetim hours for this employee
                      let plannedGozetimHours = 0
                      let actualGozetimHours = stats.totalWorkHours
                      let missedGozetimHours = 0
                      
                      data.days.forEach(day => {
                        const cellData = getCellData(employee.id, day.date)
                        if (cellData.shift_type_id && !cellData.leave_type) {
                          const shiftInfo = getShiftTypeDetails(cellData.shift_type_id)
                          plannedGozetimHours += shiftInfo.hours || 0
                        }
                      })
                      
                      // Calculate missed (for past days with no attendance)
                      const dayDate = new Date()
                      data.days.forEach(day => {
                        const cellData = getCellData(employee.id, day.date)
                        const attendance = getAttendanceData(employee.id, day.date)
                        const thisDay = new Date(day.date)
                        if (cellData.shift_type_id && !cellData.leave_type && thisDay < today && !attendance) {
                          const shiftInfo = getShiftTypeDetails(cellData.shift_type_id)
                          missedGozetimHours += shiftInfo.hours || 0
                        }
                      })
                      
                      return (
                        <React.Fragment key={employee.id}>
                          {/* Row 1: Gözetim (Vardiya Çalışması) */}
                          <tr className={idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}>
                            {/* Name Cell - Spans 2 Rows */}
                            <td rowSpan={2} className={`sticky left-0 z-10 px-2 py-1 border-r border-theme-border-primary border-b ${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
                                  {employee.first_name?.[0]}{employee.last_name?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-theme-text-primary truncate max-w-[100px] text-[10px]">{employee.first_name} {employee.last_name}</p>
                                  <p className="text-[8px] text-theme-text-muted truncate max-w-[100px]">{employee.title || 'Personel'}</p>
                                  <div className="flex gap-2 mt-1 text-[9px]">
                                    <span className="text-green-400 font-bold" title="Gözetim Saati">{actualGozetimHours.toFixed(0)}s</span>
                                    <span className="text-orange-400 font-bold" title="Mesai Saati">{stats.actualMesai.toFixed(0)}s</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Gözetim Totals */}
                            <td className="text-center border-r border-theme-border-primary bg-green-500/5 px-0">
                              <div className="flex flex-col items-center text-[8px] leading-tight">
                                <span className="text-green-400 font-bold">{plannedGozetimHours.toFixed(0)}</span>
                                <span className="text-emerald-400">{actualGozetimHours.toFixed(0)}</span>
                                {missedGozetimHours > 0 && <span className="text-red-400">-{missedGozetimHours.toFixed(0)}</span>}
                              </div>
                            </td>

                            {/* Gözetim Daily Cells */}
                            {data.days.map(day => {
                              const cellData = getCellData(employee.id, day.date)
                              const attendance = getAttendanceData(employee.id, day.date)
                              const leaveInfo = cellData.leave_type ? LEAVE_TYPES[cellData.leave_type] : null
                              const hasShift = cellData.shift_type_id && !cellData.leave_type
                              const shiftInfo = hasShift ? getShiftTypeDetails(cellData.shift_type_id) : null
                              const dayDate = new Date(day.date)
                              
                              let cellBg = ''
                              let cellText = '-'
                              let cellColor = 'text-gray-500'
                              let tooltip = ''
                              
                              if (leaveInfo) {
                                cellBg = leaveInfo.color
                                cellText = leaveInfo.label
                                tooltip = leaveInfo.name
                              } else if (!hasShift) {
                                tooltip = 'Vardiya yok'
                              } else if (attendance) {
                                const status = ATTENDANCE_STATUS[attendance.status] || ATTENDANCE_STATUS.incomplete
                                const actualHours = parseFloat(attendance.actual_hours) || 0
                                
                                cellText = actualHours > 0 ? formatDuration(actualHours, 'cell') : status.label
                                cellBg = status.color
                                
                                let tooltipParts = [status.name, `Planlanan: ${shiftInfo?.hours || 0} saat`, `Çalışılan: ${formatDuration(actualHours, 'card')}`]
                                if (attendance.check_in_time) tooltipParts.push(`Giriş: ${new Date(attendance.check_in_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`)
                                if (attendance.check_out_time) tooltipParts.push(`Çıkış: ${new Date(attendance.check_out_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`)
                                tooltip = tooltipParts.join('\n')
                              } else {
                                if (dayDate < today) {
                                  cellBg = 'bg-red-500/30 text-red-400'
                                  cellText = '0'
                                  tooltip = `Gelmedi\nPlanlanan: ${shiftInfo?.hours || 0} saat\nÇalışılan: 0 saat`
                                } else if (dayDate.getTime() === today.getTime()) {
                                  cellBg = 'bg-blue-500/10'
                                  cellText = '...'
                                  cellColor = 'text-blue-400'
                                  tooltip = `Bugün - Bekleniyor\nPlanlanan: ${shiftInfo?.hours || 0} saat`
                                } else {
                                  cellText = `${shiftInfo?.hours || 0}`
                                  cellColor = 'text-gray-400'
                                  tooltip = `Planlı\nPlanlanan: ${shiftInfo?.hours || 0} saat`
                                }
                              }

                              return (
                                <td 
                                  key={`gozetim-${employee.id}-${day.date}`}
                                  title={tooltip}
                                  className={`min-w-[40px] w-[40px] h-7 text-center border-l border-theme-border-primary ${cellBg} ${cellColor} ${day.isWeekend && !leaveInfo ? 'opacity-80' : ''}`}
                                >
                                  <div className="w-full h-full flex items-center justify-center font-bold text-[9px] tracking-tight">
                                    {cellText}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>

                          {/* Row 2: Mesai (Fazla Çalışma) */}
                          <tr className={`border-b border-theme-border-primary ${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}`}>
                            {/* Mesai Totals */}
                            <td className="text-center border-r border-theme-border-primary bg-orange-500/5 px-0">
                              <div className="flex flex-col items-center text-[8px] leading-tight">
                                <span className="text-orange-400 font-bold">{stats.plannedMesai.toFixed(0)}</span>
                                <span className="text-emerald-400">{stats.actualMesai.toFixed(0)}</span>
                                {stats.missedMesai > 0 && <span className="text-rose-400">-{stats.missedMesai.toFixed(0)}</span>}
                              </div>
                            </td>

                            {/* Mesai Daily Cells */}
                            {data.days.map(day => {
                              const cellData = getCellData(employee.id, day.date)
                              const attendance = getAttendanceData(employee.id, day.date)
                              const hasMesai = cellData.mesai_shift_type_id
                              const mesaiShiftInfo = hasMesai ? getShiftTypeDetails(cellData.mesai_shift_type_id) : null
                              const plannedMesaiHours = mesaiShiftInfo?.hours || 0
                              const actualMesaiHours = attendance?.overtime_hours || 0
                              const dayDate = new Date(day.date)
                              
                              let cellBg = ''
                              let cellText = '-'
                              let cellColor = 'text-gray-500'
                              let tooltip = ''
                              
                              if (!hasMesai && actualMesaiHours === 0) {
                                tooltip = 'Mesai planlanmadı'
                              } else if (attendance) {
                                if (actualMesaiHours >= plannedMesaiHours && plannedMesaiHours > 0) {
                                  cellBg = 'bg-emerald-500/30'
                                  cellText = `+${formatDuration(actualMesaiHours, 'cell')}`
                                  cellColor = 'text-emerald-400'
                                  tooltip = `Mesai Tamamlandı\nPlanlanan: ${plannedMesaiHours} saat\nYapılan: ${formatDuration(actualMesaiHours, 'card')}`
                                } else if (dayDate < today && plannedMesaiHours > 0) {
                                  cellBg = 'bg-rose-500/30'
                                  cellText = `${actualMesaiHours}/${plannedMesaiHours}`
                                  cellColor = 'text-rose-400'
                                  tooltip = `Mesai Eksik\nPlanlanan: ${plannedMesaiHours} saat\nYapılan: ${actualMesaiHours} saat\nKaçırılan: ${plannedMesaiHours - actualMesaiHours} saat`
                                } else if (actualMesaiHours > 0) {
                                  cellBg = 'bg-emerald-500/30'
                                  cellText = `+${formatDuration(actualMesaiHours, 'cell')}`
                                  cellColor = 'text-emerald-400'
                                  tooltip = `Mesai Yapıldı\nYapılan: ${formatDuration(actualMesaiHours, 'card')}`
                                } else if (plannedMesaiHours > 0) {
                                  cellBg = 'bg-orange-500/10'
                                  cellText = `${formatDuration(plannedMesaiHours, 'cell')}`
                                  cellColor = 'text-orange-400'
                                  tooltip = `Mesai Planlandı\nPlanlanan: ${formatDuration(plannedMesaiHours, 'card')}`
                                }
                              } else {
                                if (dayDate < today && plannedMesaiHours > 0) {
                                  cellBg = 'bg-rose-500/30'
                                  cellText = `0/${plannedMesaiHours}`
                                  cellColor = 'text-rose-400'
                                  tooltip = `Mesai Kaçırıldı\nPlanlanan: ${plannedMesaiHours} saat\nYapılan: 0 saat`
                                } else if (dayDate.getTime() === today.getTime() && plannedMesaiHours > 0) {
                                  cellBg = 'bg-orange-500/10'
                                  cellText = `${plannedMesaiHours}`
                                  cellColor = 'text-orange-400'
                                  tooltip = `Bugün Mesai Planlandı\nPlanlanan: ${plannedMesaiHours} saat`
                                } else if (plannedMesaiHours > 0) {
                                  cellBg = 'bg-orange-500/5'
                                  cellText = `${plannedMesaiHours}`
                                  cellColor = 'text-orange-400/70'
                                  tooltip = `Gelecek Mesai\nPlanlanan: ${plannedMesaiHours} saat`
                                }
                              }

                              return (
                                <td 
                                  key={`mesai-${employee.id}-${day.date}`}
                                  title={tooltip}
                                  className={`min-w-[28px] w-[28px] h-7 text-center border-l border-theme-border-primary ${cellBg} ${cellColor} ${day.isWeekend ? 'opacity-80' : ''}`}
                                >
                                  <div className="w-full h-full flex items-center justify-center font-bold text-[8px]">
                                    {cellText}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-theme-text-muted px-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/30"></div>
                <span><strong>Gözetim:</strong> Normal vardiya saatlerinde çalışılan süre (saat)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500/30"></div>
                <span><strong>Mesai:</strong> Fazla çalışma saatleri (planlanan/yapılan)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/30"></div>
                <span><strong>Tamamlandı:</strong> Planlanan saat başarıyla tamamlandı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500/30"></div>
                <span><strong>Kaçırıldı:</strong> Planlanan saatin altında çalışıldı</span>
              </div>
            </div>
          </div>
        )
      })()}

       {/* Context Menu */}
       {contextMenu && (() => {
         // Menü boyutları
         const menuWidth = 200;
         const menuHeight = 350;
         
         // Mouse pozisyonundan başla (tam tıklanan yerde)
         let left = contextMenu.x;
         let top = contextMenu.y;
         
         // Sağ kenardan taşarsa, menüyü sola aç
         if (left + menuWidth > window.innerWidth) {
           left = contextMenu.x - menuWidth;
         }
         
         // Alt kenardan taşarsa, menüyü yukarı aç
         if (top + menuHeight > window.innerHeight) {
           top = contextMenu.y - menuHeight;
         }
         
         // Negatif değerleri önle (ekranın sol/üst kenarından taşmasın)
         left = Math.max(5, left);
         top = Math.max(5, top);
         
         return (
        <div 
          className="fixed bg-theme-bg-elevated border border-theme-border-primary rounded-lg shadow-xl py-2 z-[100] min-w-[180px]"
          style={{ left, top }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-theme-text-muted border-b border-theme-border-secondary mb-1">
             {contextMenu.rowType === 'shift' ? 'Vardiya Seç' : 'Mesai Ekle (Saat)'}
          </div>
          
          <button onClick={() => handleMenuAction('shift', null)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-theme-bg-hover text-gray-400">
             {contextMenu.rowType === 'shift' ? '- Temizle / Off' : '- Mesai Sil'}
          </button>
          
          {data.shiftTypes?.map(type => (
            <button 
              key={type.id} 
              onClick={() => handleMenuAction('shift', type.id)} 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-theme-bg-hover flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }}></div>
              <span className={contextMenu.rowType === 'overtime' ? 'text-theme-text-primary' : ''}>
                 {type.name} 
                 {contextMenu.rowType === 'overtime' ? ` (+${type.hours}s)` : ` (${type.short_code})`}
              </span>
            </button>
          ))}
          
          {/* Leave types only for standard shift row */}
          {contextMenu.rowType === 'shift' && !contextMenu.isJoker && (
            <>
              <div className="px-3 py-1 text-xs text-theme-text-muted border-b border-t border-theme-border-secondary my-1">İzin</div>
              {Object.entries(LEAVE_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => handleMenuAction('leave', key)} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-theme-bg-hover ${val.color}`}>
                  {val.label} - {val.name}
                </button>
              ))}
            </>
          )}
        </div>
        )
       })()}

      {showShiftManager && <ShiftTypeManager projectId={projectId} onClose={() => setShowShiftManager(false)} onUpdate={() => loadSchedule()} />}
    </div>
  )
}

