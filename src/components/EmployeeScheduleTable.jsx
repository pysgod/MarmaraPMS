import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Calendar, ChevronLeft, ChevronRight, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function EmployeeScheduleTable({ employee }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

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
    <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-accent" />
    </div>
  )

  return (
    <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden animate-fadeIn">
      {/* Header Controls */}
      <div className="p-4 bg-theme-bg-hover border-b border-theme-border-secondary flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
           <Calendar size={18} className="text-accent" />
           <h3 className="font-semibold text-theme-text-primary">Aylık Puantaj Çizelgesi</h3>
        </div>
        
        {/* Month Selector */}
        <div className="flex items-center gap-4 bg-theme-bg-tertiary rounded-lg p-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-theme-bg-elevated rounded transition-colors">
            <ChevronLeft size={20} className="text-theme-text-secondary" />
          </button>
          <span className="font-medium text-theme-text-primary min-w-[120px] text-center select-none">
            {monthNames[month - 1]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-theme-bg-elevated rounded transition-colors">
            <ChevronRight size={20} className="text-theme-text-secondary" />
          </button>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] text-theme-text-muted">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>Tamamlandı</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span>Tutulmadı</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span>Planlanan</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"></div><span>Mesai</span></div>
        </div>
      </div>

      {/* Horizontal Scrollable Table */}
      <div className="overflow-x-auto relative">
        <table className="w-auto border-collapse text-sm text-left">
            <thead className="text-xs text-theme-text-muted uppercase bg-theme-bg-tertiary/50 border-b border-theme-border-secondary">
                <tr>
                    {/* Sticky Employee Column Header */}
                    <th className="sticky left-0 z-20 bg-theme-bg-tertiary px-6 py-3 font-medium border-r border-theme-border-secondary min-w-[200px]">
                        Personel / Veri Türü
                    </th>
                    {/* Date Columns */}
                    {days.map(day => {
                         const dateObj = new Date(year, month - 1, day);
                         const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
                         const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                         
                         return (
                            <th key={day} className={`px-1 py-2 font-medium text-center min-w-[42px] border-r border-theme-border-secondary/30 ${isWeekend ? 'bg-theme-bg-tertiary/30 text-amber-500' : ''}`}>
                                <div className="flex flex-col items-center">
                                    <span className="text-lg leading-none">{day}</span>
                                    <span className="text-[9px] opacity-70 mt-0.5">{dayName}</span>
                                </div>
                            </th>
                         )
                    })}
                    <th className="px-4 py-3 font-medium text-center min-w-[80px]">Toplam</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-theme-border-secondary">
                {/* 
                  ROW 1: GÖZETİM (SHIFTS) 
                  This row contains the sticky employee info cell with rowSpan=2 
                */}
                <tr className="hover:bg-theme-bg-hover/30 transition-colors">
                    <td rowSpan={2} className="sticky left-0 z-10 bg-theme-bg-secondary px-4 py-3 border-r border-theme-border-secondary align-top">
                        <div className="flex items-start gap-3 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-accent">
                                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-theme-text-primary text-sm truncate max-w-[140px]">
                                    {employee.first_name} {employee.last_name}
                                </p>
                                <p className="text-[10px] text-theme-text-muted truncate max-w-[140px] mb-2">
                                    {employee.title || 'Personel'}
                                </p>
                                {/* Row Labels */}
                                <div className="flex flex-col gap-6 text-[10px] font-medium text-theme-text-tertiary">
                                     <div className="flex items-center gap-1.5 pt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                                        GÖZETİM
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        MESAİ
                                     </div>
                                </div>
                            </div>
                        </div>
                    </td>

                    {/* Day Cells for GÖZETİM */}
                    {days.map(day => {
                        const { sch, att, isFuture, isWeekend, isToday } = getDayData(year, month, day, data);

                        // Gözetim Logic
                        const hasShift = !!sch && !!sch.shift_type_id;
                        const hasHours = !!sch && parseFloat(sch.gozetim_hours) > 0;
                        const isLeave = !!sch && !!sch.leave_type;
                        
                        // Attendance Status
                        const isPresent = att && (att.status === 'present' || att.status === 'late' || att.status === 'off_day_work');
                        const isAbsent = att && att.status === 'absent';
                        
                        let cellClass = '';
                        let cellContent = null;
                        
                        if (isLeave) {
                             cellClass = 'bg-blue-500/10 text-blue-400';
                             cellContent = <span className="text-[9px] font-bold rotate-[-45deg] block">İZİN</span>;
                        } else if (isFuture && hasShift) {
                              // Planned (Future)
                              cellClass = 'bg-amber-500/10 text-amber-500';
                              cellContent = sch.shiftType?.short_code || 'V';
                        } else if (hasShift) {
                             if (isPresent) {
                                // Confirmed Present -> Green
                                cellClass = 'bg-green-500/10 text-green-500 font-bold';
                                cellContent = parseFloat(sch.gozetim_hours);
                             } else if (isAbsent) {
                                // Confirmed Absent -> Red
                                cellClass = 'bg-red-500/10 text-red-500';
                                cellContent = <XCircle size={14} className="mx-auto" />;
                             } else if (!hasHours) {
                                // Assigned but 0 hours (and not present) -> Red (Missed)
                                cellClass = 'bg-red-500/10 text-red-500';
                                cellContent = <XCircle size={14} className="mx-auto" />;
                             } else {
                                // Has Hours but No Attendance Record (Pending) -> Gray
                                cellClass = 'bg-gray-500/10 text-gray-400';
                                cellContent = parseFloat(sch.gozetim_hours);
                             }
                        } else {
                             // Empty / Weekend / Future Empty
                             cellClass = isWeekend ? 'bg-theme-bg-tertiary/30' : '';
                        }
                        
                        if (isToday) cellClass += ' ring-1 ring-inset ring-accent';

                        return (
                            <td key={`g-${day}`} className={`px-1 py-2 text-center border-r border-theme-border-secondary/30 h-[45px] text-xs ${cellClass}`}>
                                {cellContent}
                            </td>
                        )
                    })}
                    
                    {/* Total Gözetim */}
                    <td className="px-2 py-2 text-center border-l border-theme-border-secondary font-bold text-theme-text-primary text-xs">
                        {data?.stats?.totalGozetim || 0}
                    </td>
                </tr>

                {/* 
                  ROW 2: MESAİ (OVERTIME)
                  No sticky first cell here because of rowSpan above
                */}
                <tr className="hover:bg-theme-bg-hover/30 transition-colors">
                    {/* Day Cells for MESAİ */}
                    {days.map(day => {
                        const { sch, isToday, isWeekend } = getDayData(year, month, day, data);
                        
                        // Mesai Logic
                        const hasMesai = !!sch && parseFloat(sch.mesai_hours) > 0;
                        
                        let cellClass = isWeekend ? 'bg-theme-bg-tertiary/10' : '';
                        if (isToday) cellClass += ' ring-1 ring-inset ring-accent/50';
                        if (hasMesai) cellClass = 'bg-purple-500/10 text-purple-500 font-bold';

                        return (
                            <td key={`m-${day}`} className={`px-1 py-1 text-center border-r border-theme-border-secondary/30 h-[35px] text-xs ${cellClass}`}>
                                {hasMesai ? parseFloat(sch.mesai_hours) : ''}
                            </td>
                        )
                    })}
                    
                     {/* Total Mesai */}
                    <td className="px-2 py-1 text-center border-l border-theme-border-secondary font-bold text-purple-500 text-xs">
                        {data?.stats?.totalMesai > 0 ? data.stats.totalMesai : '-'}
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
      
      {/* Monthly Summary Footer - Enhanced UI */}
      <div className="border-t border-theme-border-secondary p-6 bg-theme-bg-secondary">
          {(() => {
                 let targetGozetim = 0;
                 let actualGozetim = 0;
                 let missedGozetim = 0;
                 
                 let targetMesai = 0; 
                 let actualMesai = 0;
                 let missedMesai = 0; 
                 
                 days.forEach(day => {
                     const { sch, att, isFuture } = getDayData(year, month, day, data);
                     const hasShift = !!sch && !!sch.shift_type_id;
                     
                     // Hours
                     const dbHours = sch ? parseFloat(sch.gozetim_hours) || 0 : 0;
                     const plannedHours = sch?.shiftType ? parseFloat(sch.shiftType.hours) || 0 : 0;
                     const mesai = sch ? parseFloat(sch.mesai_hours) || 0 : 0;
                     
                     const isPresent = att && (att.status === 'present' || att.status === 'late' || att.status === 'off_day_work');
                     const isAbsent = att && att.status === 'absent';

                     // Gözetim Stats
                     if (hasShift) {
                        targetGozetim += plannedHours > 0 ? plannedHours : dbHours;
                        
                        if (isPresent) {
                            actualGozetim += dbHours;
                        } else if (isAbsent || (!isFuture && dbHours === 0)) {
                            // Missed
                             missedGozetim += plannedHours > 0 ? plannedHours : dbHours; 
                        }
                     }
                     
                     // Mesai Stats
                     // Defined Plan: WorkSchedule.mesai_hours
                     const plannedMesai = sch ? parseFloat(sch.mesai_hours) || 0 : 0;
                     
                     // Actual Realized: Attendance.overtime_hours
                     const actualRealizedMesai = (att && isPresent) ? parseFloat(att.overtime_hours) || 0 : 0;
                     
                     if (plannedMesai > 0) {
                         targetMesai += plannedMesai;
                         
                         if (isPresent) {
                             // If present, add actuals
                             actualMesai += actualRealizedMesai;
                             
                             if (actualRealizedMesai < plannedMesai) {
                                 missedMesai += (plannedMesai - actualRealizedMesai);
                             }
                         } else if (isAbsent || (!isFuture && !isPresent)) {
                             missedMesai += plannedMesai;
                         }
                     } else {
                         // Unplanned overtime
                         if (actualRealizedMesai > 0) {
                             actualMesai += actualRealizedMesai;
                         }
                     }
                 });

                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gözetim Section */}
                        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <Clock size={20} />
                                <h4 className="font-semibold text-base">Gözetim Özeti (Vardiya Çalışması)</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-theme-bg-tertiary/50 border border-theme-border-secondary rounded-lg p-3 text-center">
                                    <div className="text-xs text-theme-text-muted mb-1">Planlanan</div>
                                    <div className="text-2xl font-bold text-emerald-400">{targetGozetim}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                                <div className="bg-theme-bg-tertiary/50 border border-theme-border-secondary rounded-lg p-3 text-center">
                                    <div className="text-xs text-theme-text-muted mb-1">Yapılan</div>
                                    <div className="text-2xl font-bold text-emerald-500">{actualGozetim}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-center">
                                    <div className="text-xs text-red-300 mb-1">Kaçırılan</div>
                                    <div className="text-2xl font-bold text-red-500">{missedGozetim}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                            </div>
                        </div>

                        {/* Mesai Section */}
                        <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-4 text-orange-500">
                                <Clock size={20} />
                                <h4 className="font-semibold text-base">Mesai Özeti (Fazla Çalışma)</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-theme-bg-tertiary/50 border border-theme-border-secondary rounded-lg p-3 text-center">
                                    <div className="text-xs text-theme-text-muted mb-1">Planlanan</div>
                                    <div className="text-2xl font-bold text-orange-300">{targetMesai}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                                <div className="bg-theme-bg-tertiary/50 border border-theme-border-secondary rounded-lg p-3 text-center">
                                    <div className="text-xs text-theme-text-muted mb-1">Yapılan</div>
                                    <div className="text-2xl font-bold text-orange-500">{actualMesai}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-center">
                                    <div className="text-xs text-red-300 mb-1">Kaçırılan</div>
                                    <div className="text-2xl font-bold text-red-400">{missedMesai}</div>
                                    <div className="text-[10px] text-theme-text-muted/70">saat</div>
                                </div>
                            </div>
                        </div>
                     </div>
                 )
             })()}
      </div>
    </div>
  )
}

// Helper to extract day data cleanly
function getDayData(year, month, day, data) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySchedules = data?.scheduleMap?.[dateStr] || [];
    const sch = daySchedules.length > 0 ? daySchedules[0] : null;
    const att = data?.attendanceMap?.[dateStr] || null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(year, month - 1, day);
    cellDate.setHours(0, 0, 0, 0);
    
    const isFuture = cellDate > today;
    const isToday = cellDate.getTime() === today.getTime();
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

    return { sch, att, isFuture, isToday, isWeekend };
}
