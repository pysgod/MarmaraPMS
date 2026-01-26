import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Calendar, ChevronLeft, ChevronRight, Loader2, Clock, Info } from 'lucide-react'

export default function EmployeeScheduleTable({ employee }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [uniqueShiftTypes, setUniqueShiftTypes] = useState([])

  useEffect(() => {
    if (employee?.id) {
        loadSchedule()
    }
  }, [employee?.id, year, month])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const result = await api.getEmployeeWorkSchedule(employee.id, year, month)
      setData(result)
      
      // Extract unique shift types for Legend
      const types = new Map()
      Object.values(result.scheduleMap || {}).forEach(arr => {
          arr.forEach(s => {
              if (s.shiftType) {
                  const key = s.shiftType.id
                  if (!types.has(key)) {
                      types.set(key, s.shiftType)
                  }
              }
          })
      })
      setUniqueShiftTypes(Array.from(types.values()))
      
    } catch (error) {
      console.error('Program yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  if (loading) return (
    <div className="flex justify-center p-12 bg-theme-bg-secondary rounded-xl border border-theme-border-primary">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  )

  return (
    <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden shadow-sm animate-fadeIn">
      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-theme-border-secondary bg-theme-bg-hover/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-accent/10 rounded-lg">
                 <Calendar size={20} className="text-accent" />
               </div>
               <div>
                  <h3 className="font-bold text-theme-text-primary text-lg">Aylık Puantaj</h3>
                  <p className="text-xs text-theme-text-muted">Personel vardiya ve mesai takibi</p>
               </div>
            </div>
            
            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-theme-bg-tertiary p-1 rounded-xl border border-theme-border-secondary shadow-sm">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-theme-bg-elevated rounded-lg transition-all text-theme-text-secondary hover:text-theme-text-primary">
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 font-semibold text-theme-text-primary min-w-[140px] text-center select-none text-sm">
                {monthNames[month - 1]} {year}
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-theme-bg-elevated rounded-lg transition-all text-theme-text-secondary hover:text-theme-text-primary">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-t border-theme-border-primary pt-4">
              {/* Shift Types Legend */}
              <div className="flex flex-wrap items-center gap-2">
                 {uniqueShiftTypes.length > 0 ? (
                    uniqueShiftTypes.map(st => (
                        <div key={st.id} className="flex items-center gap-1.5 text-[10px] bg-theme-bg-tertiary px-2.5 py-1 rounded-full border border-theme-border-primary text-theme-text-secondary">
                            <span className="font-bold text-accent">{st.short_code}</span>
                            <span className="text-theme-text-muted/50">|</span>
                            <span>{st.name} ({st.start_time?.slice(0,5)}-{st.end_time?.slice(0,5)})</span>
                        </div>
                    ))
                 ) : (
                    <span className="text-xs text-theme-text-placeholder italic flex items-center gap-1"><Info size={12}/> Bu ay planlanmış vardiya yok</span>
                 )}
              </div>

              {/* Status Color Legend */}
              <div className="flex items-center gap-3 text-[10px] font-medium bg-theme-bg-tertiary/30 px-3 py-1.5 rounded-full border border-theme-border-primary self-start xl:self-auto">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div><span className="text-theme-text-secondary">Gelecek</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div><span className="text-theme-text-secondary">Tam</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div><span className="text-theme-text-secondary">Eksik</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div><span className="text-theme-text-secondary">Hiç</span></div>
              </div>
          </div>
      </div>

      {/* Horizontal Scrollable Table */}
      <div className="overflow-x-auto custom-scrollbar relative border-b border-theme-border-primary">
        <table className="w-full border-separate border-spacing-0 text-sm text-left">
            <thead className="text-[10px] text-theme-text-muted uppercase tracking-wider bg-theme-bg-tertiary/50">
                <tr>
                    {/* Sticky Employee Column Header */}
                    <th className="sticky left-0 z-30 bg-theme-bg-hover backdrop-blur-sm px-2 py-3 font-semibold border-b border-r border-theme-border-primary  shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                        Personel
                    </th>
                    {/* Date Columns */}
                    {days.map(day => {
                         const dateObj = new Date(year, month - 1, day);
                         const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
                         const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                         const today = new Date();
                         const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                         
                         return (
                            <th key={day} className={`px-0 py-2 font-medium text-center border-b border-r border-theme-border-primary min-w-[36px] w-[36px] relative group ${isWeekend ? 'bg-theme-bg-tertiary/20' : ''} ${isToday ? 'bg-accent/5' : ''}`}>
                                <div className={`flex flex-col items-center justify-center w-full h-full ${isToday ? 'text-accent' : isWeekend ? 'text-amber-500/80' : 'text-theme-text-secondary'}`}>
                                    <span className="text-base font-bold leading-none">{day}</span>
                                    <span className="text-[9px] font-normal uppercase mt-0.5 opacity-70">{dayName}</span>
                                    {isToday && <div className="absolute top-0 left-0 w-full h-0.5 bg-accent"></div>}
                                </div>
                            </th>
                         )
                    })}
                </tr>
            </thead>
            <tbody className="bg-theme-bg-secondary">
                {/* 
                  ROW 1: GÖZETİM (SHIFTS) 
                */}
                <tr className="group ">
                    <td rowSpan={2} className="sticky w-[100px]  left-0 z-20 bg-theme-bg-secondary group-hover:bg-theme-bg-hover/20 px-3 py-4 border-r border-b border-theme-border-primary align-top shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="flex  gap-5 h-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark shadow-lg shadow-accent/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-theme-text-primary text-sm truncate w-[50px] leading-tight">
                                        {employee.first_name}
                                    </p>
                                    <p className="text-sm text-theme-text-secondary truncate w-[50px]">
                                        {employee.last_name}
                                    </p>
                                </div>
                            </div>

                            {/* Row Indicators */}
                            <div className="flex flex-col gap-0 mt-auto pb-2">
                                 <div className="flex items-center gap-2 w- h-[40px] border-b border-theme-border-primary/30 border-dashed">
                                    <div className="w-1 h-8 rounded-full bg-accent/80"></div>
                                    <span className="text-[10px] font-bold text-theme-text-tertiary tracking-wide uppercase">Vardiya</span>
                                 </div>
                                 <div className="flex items-center gap-2 h-[40px] pt-1">
                                    <div className="w-1 h-8 rounded-full bg-purple-500/80"></div>
                                    <span className="text-[10px] font-bold text-theme-text-tertiary tracking-wide uppercase">Mesai</span>
                                 </div>
                            </div>
                        </div>
                    </td>

                    {/* Day Cells for GÖZETİM */}
                    {days.map(day => {
                        const { status, cellClass, label, planned, actual, pStr, aStr } = getShiftDisplayData(year, month, day, data, 'gozetim');
                        
                        return (
                            <td key={`g-${day}`} className={`p-0 text-center border-r border-b border-theme-border-primary w-[36px] h-14 align-middle hover:bg-theme-bg-hover/40 transition-colors`}>
                                <div className={`flex flex-col items-center justify-center w-full h-full ${cellClass} transition-all`}>
                                    {/* Status Label (Top) */}
                                    {label && (
                                        <div className="mb-0.5">
                                            <span className="text-[7px] font-extrabold uppercase tracking-widest px-1 py-px rounded-full bg-white/10 backdrop-blur-sm">
                                                {label}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Ratio (Middle) */}
                                    {(planned > 0 || actual > 0) && (
                                        <div className="flex flex-col items-center leading-none">
                                           <span className={`text-[10px] font-bold ${actual < planned ? 'opacity-90' : ''} leading-tight`}>{aStr}</span>
                                           <div className="w-full h-px bg-current opacity-20 my-0.5"></div>
                                           <span className="text-[9px] opacity-60 font-medium leading-tight">{pStr}</span>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!label && !planned && (
                                        <div className="w-1 h-1 rounded-full bg-theme-text-muted/10"></div>
                                    )}
                                </div>
                            </td>
                        )
                    })}
                </tr>

                {/* 
                  ROW 2: MESAİ (OVERTIME)
                */}
                <tr className="group">
                    {/* Day Cells for MESAİ */}
                    {days.map(day => {
                        const { status, cellClass, label, planned, actual, pStr, aStr } = getShiftDisplayData(year, month, day, data, 'mesai');
                        
                        return (
                           <td key={`m-${day}`} className={`p-0 text-center border-r border-b border-theme-border-primary w-[36px] h-14 align-middle hover:bg-theme-bg-hover/40 transition-colors`}>
                                <div className={`flex flex-col items-center justify-center w-full h-full ${cellClass}`}>
                                    {/* Status Label */}
                                    {label && (
                                        <div className="mb-0.5">
                                            <span className="text-[7px] font-extrabold uppercase tracking-widest px-1 py-px rounded-full bg-white/10 backdrop-blur-sm">
                                                {label}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Ratio */}
                                    {(planned > 0 || actual > 0) && (
                                        <div className="flex flex-col items-center leading-none">
                                           <span className={`text-[10px] font-bold ${actual < planned ? 'opacity-90' : ''} leading-tight`}>{aStr}</span>
                                           <div className="w-full h-px bg-current opacity-20 my-0.5"></div>
                                           <span className="text-[9px] opacity-60 font-medium leading-tight">{pStr}</span>
                                        </div>
                                    )}
                                    
                                    {/* Empty State */}
                                    {!label && !planned && (
                                        <div className="w-1 h-1 rounded-full bg-theme-text-muted/10"></div>
                                    )}
                                </div>
                           </td>
                        )
                    })}
                </tr>
            </tbody>
        </table>
      </div>
      
      {/* Footer / Summary omitted for brevity as per user request to update table design mainly */}
    </div>
  )
}

// --- HELPER LOGIC ---



function formatTime(hours) {
    if (!hours || isNaN(hours)) return '0dk';
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h > 0 && m > 0) return `${h}s ${m}dk`;
    if (h > 0) return `${h}s`;
    return `${m}dk`;
}

function getShiftDisplayData(year, month, day, data, type = 'gozetim') {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySchedules = data?.scheduleMap?.[dateStr] || [];
    const sch = daySchedules.length > 0 ? daySchedules[0] : null;
    const att = data?.attendanceMap?.[dateStr] || null;

    // Time Logic
    const now = new Date();
    const cellDate = new Date(year, month - 1, day);
    
    // Check precise shift start time for "Future" status
    let shiftStartDateTime = new Date(year, month - 1, day);
    if (sch?.shiftType?.start_time) {
        const [h, m] = sch.shiftType.start_time.split(':');
        shiftStartDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
    } else {
        shiftStartDateTime.setHours(23, 59, 59, 999);
    }
    
    // FUTURE check: 
    const isDateFuture = cellDate.setHours(0,0,0,0) > now.setHours(0,0,0,0);
    const isToday = cellDate.getDate() === now.getDate() && cellDate.getMonth() === now.getMonth() && cellDate.getFullYear() === now.getFullYear();
    const isTimeFuture = isToday && (new Date() < shiftStartDateTime);
    
    const isFuture = isDateFuture || isTimeFuture;

    // Determine Hours
    let planned = 0;
    let actual = 0;
    
    if (type === 'gozetim') {
        planned = sch ? parseFloat(sch.gozetim_hours) || 0 : 0;
        // Use confirmed attendance hours if present
        if (att && (att.status === 'present' || att.status === 'late' || att.status === 'early_leave')) {
             if (att.actual_hours) {
                 actual = parseFloat(att.actual_hours);
             } else if (att.check_in_time && att.check_out_time) {
                 const diff = new Date(att.check_out_time) - new Date(att.check_in_time);
                 actual = (diff / (1000 * 60 * 60));
             }
        }
    } else {
        // Mesai
        planned = sch ? parseFloat(sch.mesai_hours) || 0 : 0;
        actual = (att && att.overtime_hours) ? parseFloat(att.overtime_hours) : 0;
    }
    
    // Format Display
    const pStr = formatTime(planned);
    const aStr = formatTime(actual);

    // Determine Status Label & Class
    let label = '';
    let cellClass = '';
    
    const hasAssignment = planned > 0;
    
    if (!hasAssignment) {
        // No Shift
        if (sch?.leave_type) {
             label = 'İZİN';
             cellClass = 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
        } else {
             // Empty / Weekend
             const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
             // Lighter background for empty weekend cells
             cellClass = isWeekend ? 'bg-theme-bg-tertiary/30' : 'bg-transparent';
        }
        return { label, cellClass, planned: 0, actual: 0, pStr: '', aStr: '' };
    }

    // Has Assignment
    if (isFuture) {
        label = 'GEL'; 
        cellClass = 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 text-orange-500 border border-orange-500/20 shadow-sm'; 
    } else {
        // Past (or Started Today)
        if (actual >= planned && planned > 0) {
            label = 'TAM';
            cellClass = 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-500 border border-emerald-500/20 shadow-sm';
        } else if (actual > 0 && actual < planned) {
            label = 'EKS'; 
            cellClass = 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-500 border border-amber-500/20 shadow-sm';
        } else {
            label = 'HİÇ';
            cellClass = 'bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-500 border border-red-500/20 shadow-sm';
        }
    }

    return { label, cellClass, planned, actual, pStr, aStr };
}
