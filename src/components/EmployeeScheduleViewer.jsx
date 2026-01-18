import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Calendar, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react'

export default function EmployeeScheduleViewer({ employeeId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadSchedule()
  }, [employeeId, year, month])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const result = await api.getEmployeeWorkSchedule(employeeId, year, month)
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
    <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-theme-bg-hover border-b border-theme-border-secondary flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Calendar size={18} className="text-accent" />
           <h3 className="font-semibold text-theme-text-primary">Aylık Çalışma Çizelgesi</h3>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-theme-bg-tertiary rounded">
            <ChevronLeft size={20} className="text-theme-text-secondary" />
          </button>
          <span className="font-medium text-theme-text-primary min-w-[120px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-theme-bg-tertiary rounded">
            <ChevronRight size={20} className="text-theme-text-secondary" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-4 border-b border-theme-border-secondary bg-theme-bg-tertiary/30">
         <div className="text-center">
            <div className="text-xs text-theme-text-muted">Toplam Gözetim</div>
            <div className="text-lg font-bold text-green-400">{data?.stats?.totalGozetim || 0} Saat</div>
         </div>
         <div className="text-center">
            <div className="text-xs text-theme-text-muted">Toplam Mesai</div>
            <div className="text-lg font-bold text-orange-400">{data?.stats?.totalMesai || 0} Saat</div>
         </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          <div className="grid grid-cols-7 gap-2">
             {/* Do a calendar grid logic: Need to offset start day */}
             {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-theme-text-muted py-2">{d}</div>
             ))}
             
             {/* Blanks for start of month */}
             {Array.from({ length: (new Date(year, month - 1, 1).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`blank-${i}`} className="h-24 bg-theme-bg-tertiary/20 rounded-lg"></div>
             ))}

             {days.map(day => {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const daySchedules = data?.scheduleMap?.[dateStr] || []
                const isWeekend = new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6
                
                // Calculate date status for color coding
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const cellDate = new Date(year, month - 1, day)
                cellDate.setHours(0, 0, 0, 0)
                const isFuture = cellDate > today
                const isPast = cellDate < today
                const isToday = cellDate.getTime() === today.getTime()

                // Check if there's any overtime on this day
                const hasMesai = daySchedules.some(sch => parseFloat(sch.mesai_hours) > 0)
                const totalMesaiHours = daySchedules.reduce((sum, sch) => sum + (parseFloat(sch.mesai_hours) || 0), 0)
                
                return (
                  <div 
                    key={day} 
                    className={`h-24 p-2 rounded-lg border relative ${
                       isToday ? 'border-accent border-2' : 'border-theme-border-secondary'
                    } ${
                       isWeekend ? 'bg-theme-bg-tertiary/30' : 'bg-theme-bg-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs text-theme-text-muted">{day}</div>
                      {hasMesai && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold" title={`Mesai: ${totalMesaiHours} saat`}>
                          +M
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                       {daySchedules.length > 0 ? daySchedules.map((sch, i) => {
                           // Determine status color
                           let statusColorClass = ''
                           let borderColorClass = ''
                           
                           if (sch.leave_type) {
                             // Leave days - red
                             statusColorClass = 'bg-red-500/20'
                             borderColorClass = 'border-red-500/50'
                           } else if (isFuture) {
                             // Future shifts - orange
                             statusColorClass = 'bg-orange-500/20'
                             borderColorClass = 'border-orange-500/50'
                           } else if (isPast || isToday) {
                             // Past/today with completed shift - green if shift assigned
                             if (sch.shift_type_id && sch.gozetim_hours > 0) {
                               statusColorClass = 'bg-green-500/20'
                               borderColorClass = 'border-green-500/50'
                             } else {
                               // Missed/incomplete - red
                               statusColorClass = 'bg-red-500/20'
                               borderColorClass = 'border-red-500/50'
                             }
                           }
                           
                           return (
                           <div 
                             key={i} 
                             className={`text-[10px] p-1 rounded border ${statusColorClass} ${borderColorClass}`}
                             title={`${sch.project?.name || 'Proje'} - ${sch.shiftType?.name || 'Vardiya'}${parseFloat(sch.mesai_hours) > 0 ? ` (+${sch.mesai_hours}h mesai)` : ''}`}
                           >
                              {sch.leave_type ? (
                                <span className="text-red-400 font-bold block text-center">{sch.leave_type}</span>
                              ) : (
                                <>
                                  <div className={`font-bold truncate ${isFuture ? 'text-orange-400' : (isPast || isToday) && sch.shift_type_id ? 'text-green-400' : 'text-red-400'}`}>
                                    {sch.shiftType?.short_code || sch.shiftType?.name || '-'}
                                  </div>
                                  <div className="text-theme-text-muted truncate text-[9px]">{sch.project?.name}</div>
                                  <div className="text-theme-text-tertiary text-[9px]">
                                    {sch.shiftType?.start_time ? `${sch.shiftType.start_time.slice(0,5)}-${sch.shiftType.end_time.slice(0,5)}` : (sch.gozetim_hours + 'h')}
                                  </div>
                                </>
                              )}
                           </div>
                       )}) : (
                          <div className="text-center text-theme-text-placeholder text-[10px] mt-2">-</div>
                       )}
                    </div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  )
}
