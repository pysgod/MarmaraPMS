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
      attendances.forEach(a => {
        map[`${a.employee_id}-${a.date}`] = a
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
    return data.scheduleMap[key] || { shift_type_id: null, leave_type: null, mesai_hours: 0, gozetim_hours: 0 }
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
          ? (data.jokers.find(j => j.date === date) || { mesai_hours: 0 }) 
          : (getCellData(employeeId, date) || { mesai_hours: 0 })
          
       const currentHours = parseFloat(currentData.mesai_hours || 0)
       
       // Cycle through defined Shift Types to mimic "Shift" row behavior
       // Find "current" shift type index based on hours
       // Note: If multiple shifts have same hours, we might jump, but it's acceptable for "hours-only" storage.
       // We'll try to find the match that effectively "looks" like the current one, or just the first match.
       
       const sortedShifts = [...(data.shiftTypes || [])].sort((a,b) => a.order - b.order || a.id - b.id)
       
       let nextHours = 0
       
       if (currentHours === 0 && sortedShifts.length > 0) {
          // Off -> First Shift
          nextHours = parseFloat(sortedShifts[0].hours)
       } else {
          // Find current index
          const currentIndex = sortedShifts.findIndex(t => Math.abs(parseFloat(t.hours) - currentHours) < 0.1)
          
          if (currentIndex !== -1 && currentIndex < sortedShifts.length - 1) {
             // Go to Next Shift
             nextHours = parseFloat(sortedShifts[currentIndex + 1].hours)
          } else {
             // Last Shift or Unknown -> Off (0)
             nextHours = 0
          }
       }

       setSaving(true)
       try {
         if (isJoker) {
           await api.toggleJoker({ 
             project_id: projectId, 
             date, 
             mesai_hours: nextHours 
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
              mesai_hours: nextHours,
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
    setContextMenu({ x: e.clientX, y: e.clientY, employeeId, date, rowType, isJoker })
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
             const shift = data.shiftTypes.find(t => t.id === value)
             const hours = shift ? parseFloat(shift.hours) : 0
             
             await api.toggleJoker({
               project_id: projectId,
               date: contextMenu.date,
               mesai_hours: hours
             })
           } else {
             if (!value) {
                await api.toggleJoker({
                   project_id: projectId,
                   date: contextMenu.date,
                   mesai_hours: 0
                 })
             }
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
           if (type === 'shift' && value) {
              const shift = data.shiftTypes.find(t => t.id === value)
              const hours = shift ? parseFloat(shift.hours) : 0
              
              // We need to keep existing shift_type_id/gozetim, only update mesai_hours
              const current = getCellData(contextMenu.employeeId, contextMenu.date)
              
              await api.updateWorkSchedule({
                project_id: projectId,
                employee_id: contextMenu.employeeId,
                date: contextMenu.date,
                shift_type_id: current.shift_type_id,
                gozetim_hours: current.gozetim_hours,
                leave_type: current.leave_type,
                mesai_hours: hours,
                notes: current.notes
              })
           } else if (type === 'shift' && !value) {
              // Clear Overtime
              const current = getCellData(contextMenu.employeeId, contextMenu.date)
              await api.updateWorkSchedule({
                project_id: projectId,
                employee_id: contextMenu.employeeId,
                date: contextMenu.date,
                shift_type_id: current.shift_type_id,
                gozetim_hours: current.gozetim_hours,
                leave_type: current.leave_type,
                mesai_hours: 0
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

      <div className="border border-theme-border-primary rounded-xl overflow-hidden bg-theme-bg-secondary">
        <div className="overflow-auto max-h-[calc(100vh-400px)]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-theme-bg-hover shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-theme-bg-hover min-w-[200px] px-3 py-2 text-left font-semibold text-theme-text-muted uppercase tracking-wider border-b border-r border-theme-border-primary">
                  <Users size={14} className="inline mr-1" /> Personel
                </th>
                <th className="min-w-[60px] px-2 py-2 text-center font-semibold text-theme-text-muted border-b border-theme-border-primary bg-theme-bg-tertiary/50">Plan</th>
                {data.days.map(day => (
                  <th key={day.date} className={`min-w-[40px] px-1 py-2 text-center border-b border-theme-border-primary ${day.isWeekend ? 'bg-red-500/10' : ''}`}>
                    <div className="font-bold text-theme-text-primary">{day.day}</div>
                    <div className="text-[9px] text-theme-text-muted">{day.dayName}</div>
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
                    <tr className={idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}>
                      {/* Name Cell - Spans 2 Rows */}
                      <td rowSpan={2} className={`sticky left-0 z-10 px-3 py-2 border-r border-theme-border-primary border-b ${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-theme-text-primary truncate max-w-[140px]">{employee.first_name} {employee.last_name}</p>
                            <p className="text-sm text-theme-text-muted truncate max-w-[140px]">{employee.title || 'Personel'}</p>
                            <div className="flex gap-2 mt-1 text-[9px]">
                               <span className="text-green-400 font-bold">{totals.gozetim}s</span>
                               <span className="text-orange-400 font-bold">{totals.mesai}s</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Gözetim Label */}
                      <td className="text-center border-r border-theme-border-secondary/30 text-[10px] font-bold text-green-500 bg-green-500/5">
                        Gözetim
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
                             className={`min-w-[40px] h-9 text-center cursor-pointer select-none border-l border-theme-border-secondary/30 hover:ring-2 hover:ring-white/30 hover:z-10 ${day.isWeekend && !leaveInfo ? 'opacity-80' : ''} ${leaveInfo ? leaveInfo.color : ''}`}
                             style={!leaveInfo && shiftInfo.isHex ? { backgroundColor: shiftInfo.color, color: '#fff' } : {}}
                           >
                              <div className={`w-full h-full flex items-center justify-center font-bold ${!leaveInfo && !shiftInfo.isHex ? shiftInfo.color : ''}`}>
                                 {leaveInfo ? leaveInfo.label : shiftInfo.label}
                              </div>
                           </td>
                         )
                      })}
                    </tr>

                    {/* Row 2: Mesai (Overtime) */}
                    <tr className={`border-b border-theme-border-primary ${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}`}>
                      {/* Mesai Label */}
                      <td className="text-center border-r border-theme-border-secondary/30 text-[10px] font-bold text-orange-500 bg-orange-500/5">
                        Mesai
                      </td>

                      {/* Mesai Cells */}
                      {data.days.map(day => {
                         const cellData = getCellData(employee.id, day.date)
                         const hasOvertime = cellData.mesai_hours > 0
                         
                         // Try to find matching shift type using hours logic only
                         let matchShift = null
                         if (hasOvertime) {
                           matchShift = data.shiftTypes.find(t => Math.abs(parseFloat(t.hours) - parseFloat(cellData.mesai_hours)) < 0.1)
                         }
                         const matchInfo = matchShift ? getShiftTypeDetails(matchShift.id) : null

                         return (
                           <td 
                             key={`mesai-${employee.id}-${day.date}`}
                             onClick={(e) => handleCellClick(employee.id, day.date, 'overtime')}
                             onContextMenu={(e) => handleCellRightClick(e, employee.id, day.date, 'overtime')}
                             className={`min-w-[40px] h-9 text-center cursor-pointer select-none border-l border-theme-border-secondary/30 hover:ring-2 hover:ring-white/30 hover:z-10 transition-all ${!matchInfo ? 'hover:bg-orange-500/10' : ''}`}
                             style={matchInfo && matchInfo.isHex ? { backgroundColor: matchInfo.color, color: '#fff' } : {}}
                           >
                              {hasOvertime ? (
                                matchInfo ? (
                                  <div className={`w-full h-full flex items-center justify-center font-bold ${!matchInfo.isHex ? matchInfo.color : ''}`}>
                                     {matchInfo.label}
                                  </div>
                                ) : (
                                  <span className="text-orange-400 font-bold">{cellData.mesai_hours}</span>
                                )
                              ) : (
                                <span className="text-transparent hover:text-gray-500/50 text-[10px]">+</span>
                              )}
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
                  <tr className="border-t-4 border-theme-border-primary"><td colSpan={data.days.length + 2} className="h-2"></td></tr>
                  
                   {/* Joker Row 1: Gözetim */}
                   <tr className="bg-yellow-500/5">
                      <td rowSpan={2} className="sticky left-0 z-10 px-3 py-2 border-r border-theme-border-primary border-b bg-yellow-500/10">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center font-bold text-yellow-500">J</div>
                           <span className="font-medium text-yellow-500">Joker Slot</span>
                        </div>
                      </td>
                      <td className="text-center border-r border-theme-border-secondary/30 text-[10px] font-bold text-yellow-600 bg-yellow-500/10">Gözetim</td>
                      {data.days.map(day => {
                        const joker = getJokerForDate(day.date)
                        const shiftInfo = getShiftTypeDetails(joker?.shift_type_id)
                        return (
                          <td 
                             key={`joker-gozetim-${day.date}`}
                             onClick={() => handleCellClick(null, day.date, 'shift', true)}
                             onContextMenu={(e) => handleCellRightClick(e, null, day.date, 'shift', true)}
                             className="min-w-[40px] h-9 text-center cursor-pointer select-none border-l border-theme-border-secondary/30 hover:ring-2 hover:ring-yellow-400/50"
                             style={joker?.shift_type_id && shiftInfo.isHex ? { backgroundColor: shiftInfo.color, color: '#fff', opacity: 0.9 } : {}}
                           >
                              <div className={`w-full h-full flex items-center justify-center font-bold ${!shiftInfo.isHex ? shiftInfo.color : ''}`}>
                                {joker?.shift_type_id ? shiftInfo.label : '○'}
                              </div>
                          </td>
                        )
                      })}
                   </tr>
                   {/* Joker Row 2: Mesai */}
                   <tr className="bg-yellow-500/5 border-b border-theme-border-primary">
                      <td className="text-center border-r border-theme-border-secondary/30 text-[10px] font-bold text-yellow-600/70 bg-yellow-500/10">Mesai</td>
                      {data.days.map(day => {
                         const joker = getJokerForDate(day.date)
                         const hasOvertime = joker && joker.mesai_hours > 0
                         
                         // Try to find matching shift type
                         let matchShift = null
                         if (hasOvertime) {
                           matchShift = data.shiftTypes.find(t => Math.abs(parseFloat(t.hours) - parseFloat(joker.mesai_hours)) < 0.1)
                         }
                         const matchInfo = matchShift ? getShiftTypeDetails(matchShift.id) : null

                         return (
                            <td 
                               key={`joker-mesai-${day.date}`} 
                               onClick={() => handleCellClick(null, day.date, 'overtime', true)}
                               onContextMenu={(e) => handleCellRightClick(e, null, day.date, 'overtime', true)}
                               className={`min-w-[40px] h-9 text-center cursor-pointer select-none border-l border-theme-border-secondary/30 hover:ring-2 hover:ring-yellow-400/50 transition-all ${!matchInfo ? 'hover:bg-yellow-500/20' : ''}`}
                               style={matchInfo && matchInfo.isHex ? { backgroundColor: matchInfo.color, color: '#fff' } : {}}
                            >
                               {hasOvertime ? (
                                  matchInfo ? (
                                    <div className={`w-full h-full flex items-center justify-center font-bold ${!matchInfo.isHex ? matchInfo.color : ''}`}>
                                       {matchInfo.label}
                                    </div>
                                  ) : (
                                    <span className="text-orange-400 font-bold">{joker.mesai_hours}</span>
                                  )
                               ) : (
                                  <span className="text-transparent hover:text-yellow-600/50 text-[10px]">+</span>
                               )}
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
      <div className="mt-8 border border-theme-border-primary rounded-xl overflow-hidden bg-theme-bg-secondary">
        <div className="bg-theme-bg-hover px-4 py-3 border-b border-theme-border-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            <h3 className="text-sm font-semibold text-theme-text-primary">Aylık Yoklama Durumu</h3>
            <span className="text-xs text-theme-text-muted">({monthNames[selectedMonth - 1]} {selectedYear})</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {loadingAttendance && <Loader2 size={14} className="animate-spin text-accent" />}
            <div className="flex items-center gap-2">
              {Object.entries(ATTENDANCE_STATUS).slice(0, 4).map(([key, val]) => (
                <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded ${val.color}`}>
                  <span className="font-bold">{val.label}</span>
                  <span className="hidden sm:inline">{val.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[350px]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-theme-bg-hover shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-theme-bg-hover min-w-[200px] px-3 py-2 text-left font-semibold text-theme-text-muted uppercase tracking-wider border-b border-r border-theme-border-primary">
                  <Users size={14} className="inline mr-1" /> Personel
                </th>
                <th className="min-w-[50px] px-2 py-2 text-center font-semibold text-theme-text-muted border-b border-theme-border-primary bg-green-500/10">Geldi</th>
                <th className="min-w-[50px] px-2 py-2 text-center font-semibold text-theme-text-muted border-b border-theme-border-primary bg-red-500/10">Gelmedi</th>
                <th className="min-w-[60px] px-2 py-2 text-center font-semibold text-theme-text-muted border-b border-theme-border-primary bg-orange-500/10">Mesai (s)</th>
                {data.days.map(day => (
                  <th key={day.date} className={`min-w-[36px] px-1 py-2 text-center border-b border-theme-border-primary ${day.isWeekend ? 'bg-red-500/10' : ''}`}>
                    <div className="font-bold text-theme-text-primary">{day.day}</div>
                    <div className="text-[9px] text-theme-text-muted">{day.dayName}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.employees.map((employee, idx) => {
                // Calculate attendance stats
                let presentCount = 0
                let absentCount = 0
                let totalOvertime = 0
                
                data.days.forEach(day => {
                  const cellData = getCellData(employee.id, day.date)
                  const attendance = getAttendanceData(employee.id, day.date)
                  
                  // Calculate overtime from attendance records
                  if (attendance && attendance.overtime_hours) {
                    totalOvertime += parseFloat(attendance.overtime_hours)
                  }
                  
                  // Only count days where a shift was assigned
                  if (cellData.shift_type_id && !cellData.leave_type) {
                    if (attendance && (attendance.status === 'present' || attendance.status === 'late')) {
                      presentCount++
                    } else if (!attendance || attendance.status === 'absent' || attendance.status === 'incomplete') {
                      // If date is in the past and no attendance record, count as absent
                      const dayDate = new Date(day.date)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      if (dayDate < today) {
                        absentCount++
                      }
                    }
                  }
                })

                return (
                  <tr key={employee.id} className={`${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'} border-b border-theme-border-secondary/50`}>
                    {/* Employee Name */}
                    <td className={`sticky left-0 z-10 px-3 py-2 border-r border-theme-border-primary ${idx % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg-tertiary/20'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </div>
                        <span className="font-medium text-theme-text-primary truncate max-w-[140px]">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </div>
                    </td>

                    {/* Stats: Present Count */}
                    <td className="text-center font-bold text-green-400 bg-green-500/5">{presentCount}</td>
                    
                    {/* Stats: Absent Count */}
                    <td className="text-center font-bold text-red-400 bg-red-500/5">{absentCount}</td>
                    
                    {/* Stats: Total Overtime */}
                    <td className="text-center font-bold text-orange-400 bg-orange-500/5">
                      {totalOvertime > 0 ? `+${totalOvertime.toFixed(1)}` : '-'}
                    </td>

                    {/* Daily Attendance Cells */}
                    {data.days.map(day => {
                      const cellData = getCellData(employee.id, day.date)
                      const attendance = getAttendanceData(employee.id, day.date)
                      const leaveInfo = cellData.leave_type ? LEAVE_TYPES[cellData.leave_type] : null
                      const hasShift = cellData.shift_type_id && !cellData.leave_type
                      
                      // Determine cell display
                      let cellContent = ''
                      let cellClass = ''
                      let tooltip = ''
                      
                      if (leaveInfo) {
                        // On leave - show leave type
                        cellContent = leaveInfo.label
                        cellClass = leaveInfo.color
                        tooltip = leaveInfo.name
                      } else if (!hasShift) {
                        // No shift assigned
                        cellContent = '-'
                        cellClass = 'text-gray-500'
                        tooltip = 'Vardiya yok'
                      } else if (attendance) {
                        // Has attendance record
                        const status = ATTENDANCE_STATUS[attendance.status] || ATTENDANCE_STATUS.incomplete
                        cellContent = status.label
                        cellClass = status.color
                        
                        // Build tooltip with overtime info
                        let tooltipParts = [status.name]
                        tooltipParts.push(`Giriş: ${attendance.check_in_time ? new Date(attendance.check_in_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}`)
                        tooltipParts.push(`Çıkış: ${attendance.check_out_time ? new Date(attendance.check_out_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-'}`)
                        if (attendance.actual_hours) tooltipParts.push(`Çalışma: ${attendance.actual_hours}s`)
                        if (attendance.overtime_hours > 0) tooltipParts.push(`Mesai: +${attendance.overtime_hours}s`)
                        tooltip = tooltipParts.join('\n')
                      } else {
                        // No attendance record but shift exists
                        const dayDate = new Date(day.date)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        
                        if (dayDate < today) {
                          // Past day - absent
                          cellContent = '✗'
                          cellClass = 'bg-red-500/30 text-red-400'
                          tooltip = 'Gelmedi'
                        } else if (dayDate.getTime() === today.getTime()) {
                          // Today - pending
                          cellContent = '...'
                          cellClass = 'bg-blue-500/20 text-blue-400'
                          tooltip = 'Bugün'
                        } else {
                          // Future day
                          cellContent = '○'
                          cellClass = 'text-gray-400'
                          tooltip = 'Planlı'
                        }
                      }

                      return (
                        <td 
                          key={`att-${employee.id}-${day.date}`}
                          title={tooltip}
                          className={`min-w-[36px] h-8 text-center border-l border-theme-border-secondary/30 ${cellClass} ${day.isWeekend ? 'opacity-80' : ''}`}
                        >
                          <div className="w-full h-full flex items-center justify-center font-bold text-[11px]">
                            {cellContent}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

       {/* Context Menu */}
       {contextMenu && (
        <div 
          className="fixed bg-theme-bg-elevated border border-theme-border-primary rounded-lg shadow-xl py-2 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
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
      )}

      {showShiftManager && <ShiftTypeManager projectId={projectId} onClose={() => setShowShiftManager(false)} onUpdate={() => loadSchedule()} />}
    </div>
  )
}

