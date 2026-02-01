import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock, 
  CalendarDays,
  Coffee,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRightCircle,
  X
} from 'lucide-react'

export default function EmployeePuantaj({ employee }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(null)

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
      console.error('Puantaj yüklenirken hata:', error)
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
    setSelectedDay(null)
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDay(null)
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate()
  const getFirstDayOfMonth = (y, m) => {
    const day = new Date(y, m - 1, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert Sunday=0 to Monday-first format
  }

  // Calculate statistics
  const calculateStats = () => {
    if (!data?.scheduleMap) return { totalHours: 0, workDays: 0, leaveDays: 0, mesaiHours: 0, actualHours: 0 }
    
    let totalPlannedHours = 0
    let totalActualHours = 0
    let workDays = 0
    let leaveDays = 0
    let mesaiHours = 0

    Object.entries(data.scheduleMap).forEach(([date, schedules]) => {
      schedules.forEach(sch => {
        if (sch.leave_type) {
          leaveDays++
        } else if (sch.gozetim_hours > 0 || sch.shift_type_id) {
          workDays++
          totalPlannedHours += parseFloat(sch.gozetim_hours) || 0
          mesaiHours += parseFloat(sch.mesai_hours) || 0
        }
      })
    })

    // Actual hours from attendance
    Object.values(data.attendanceMap || {}).forEach(att => {
      totalActualHours += parseFloat(att.actual_hours) || 0
    })

    return { 
      totalPlannedHours: totalPlannedHours, 
      totalActualHours: totalActualHours,
      workDays, 
      leaveDays, 
      mesaiHours: mesaiHours 
    }
  }

  // Get day data
  const getDayData = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const schedules = data?.scheduleMap?.[dateStr] || []
    const attendance = data?.attendanceMap?.[dateStr] || null
    const sch = schedules[0] || null
    
    const today = new Date()
    const cellDate = new Date(year, month - 1, day)
    const isToday = cellDate.toDateString() === today.toDateString()
    const isFuture = cellDate > today
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6

    let status = 'empty'
    let statusColor = 'bg-theme-bg-tertiary/30'
    let statusText = ''
    let planned = 0
    let actual = 0

    if (sch?.leave_type) {
      status = 'leave'
      statusColor = 'bg-blue-500/20 border-blue-500/30'
      statusText = getLeaveTypeName(sch.leave_type)
    } else if (sch?.gozetim_hours > 0 || sch?.shift_type_id) {
      planned = parseFloat(sch.gozetim_hours) || 0
      
      if (isFuture) {
        status = 'future'
        statusColor = 'bg-orange-500/20 border-orange-500/30'
        statusText = 'Planlandı'
      } else if (attendance) {
        actual = parseFloat(attendance.actual_hours) || 0
        
        if (actual >= planned * 0.95) {
          status = 'complete'
          statusColor = 'bg-emerald-500/20 border-emerald-500/30'
          statusText = 'Tamamlandı'
        } else if (actual > 0) {
          status = 'partial'
          statusColor = 'bg-amber-500/20 border-amber-500/30'
          statusText = 'Eksik'
        } else {
          status = 'absent'
          statusColor = 'bg-red-500/20 border-red-500/30'
          statusText = 'Gelmedi'
        }
      } else {
        // Past day, no attendance
        status = 'absent'
        statusColor = 'bg-red-500/20 border-red-500/30'
        statusText = 'Gelmedi'
      }
    }

    return { 
      dateStr, 
      sch, 
      attendance, 
      status, 
      statusColor, 
      statusText, 
      planned, 
      actual, 
      isToday, 
      isFuture, 
      isWeekend 
    }
  }

  const getLeaveTypeName = (type) => {
    const types = {
      'annual': 'Yıllık İzin',
      'sick': 'Hastalık',
      'unpaid': 'Ücretsiz',
      'marriage': 'Evlilik',
      'death': 'Vefat',
      'maternity': 'Doğum',
      'other': 'Diğer'
    }
    return types[type] || type
  }

  const formatTime = (hours) => {
    if (!hours || isNaN(hours)) return '0s'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h > 0 && m > 0) return `${h}s ${m}dk`
    if (h > 0) return `${h}s`
    return `${m}dk`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16 bg-theme-bg-secondary rounded-xl border border-theme-border-primary">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    )
  }

  const stats = calculateStats()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOffset }, (_, i) => i)

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Calendar size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-text-primary">Aylık Puantaj</h3>
            <p className="text-sm text-theme-text-muted">Çalışma ve yoklama takibi</p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-theme-bg-tertiary p-1.5 rounded-xl border border-theme-border-secondary shadow-sm">
          <button 
            onClick={handlePrevMonth} 
            className="p-2.5 hover:bg-theme-bg-elevated rounded-lg transition-all text-theme-text-secondary hover:text-theme-text-primary"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 font-bold text-theme-text-primary min-w-[160px] text-center select-none">
            {monthNames[month - 1]} {year}
          </div>
          <button 
            onClick={handleNextMonth} 
            className="p-2.5 hover:bg-theme-bg-elevated rounded-lg transition-all text-theme-text-secondary hover:text-theme-text-primary"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Actual Hours */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-5 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Clock size={20} className="text-emerald-400" />
            </div>
            <span className="text-sm text-theme-text-secondary font-medium">Çalışılan</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{formatTime(stats.totalActualHours)}</p>
          <p className="text-xs text-theme-text-muted mt-1">Planlanan: {formatTime(stats.totalPlannedHours)}</p>
        </div>

        {/* Work Days */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-5 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CalendarDays size={20} className="text-blue-400" />
            </div>
            <span className="text-sm text-theme-text-secondary font-medium">Çalışma Günü</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.workDays} <span className="text-lg font-medium">gün</span></p>
          <p className="text-xs text-theme-text-muted mt-1">Bu ay planlanan vardiya</p>
        </div>

        {/* Leave Days */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-5 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Coffee size={20} className="text-purple-400" />
            </div>
            <span className="text-sm text-theme-text-secondary font-medium">İzin Günü</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats.leaveDays} <span className="text-lg font-medium">gün</span></p>
          <p className="text-xs text-theme-text-muted mt-1">Kullanılan izin</p>
        </div>

        {/* Overtime Hours */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-5 border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Timer size={20} className="text-amber-400" />
            </div>
            <span className="text-sm text-theme-text-secondary font-medium">Mesai</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{formatTime(stats.mesaiHours)}</p>
          <p className="text-xs text-theme-text-muted mt-1">Planlanan mesai</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-theme-bg-tertiary/50 border-b border-theme-border-primary">
          {weekDays.map((day, i) => (
            <div 
              key={day} 
              className={`py-3 text-center text-sm font-semibold ${
                i >= 5 ? 'text-amber-500/80' : 'text-theme-text-secondary'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-theme-border-primary/30">
          {/* Empty cells for offset */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="bg-theme-bg-secondary aspect-square min-h-[80px] md:min-h-[100px]" />
          ))}

          {/* Day cells */}
          {days.map(day => {
            const dayData = getDayData(day)
            const isSelected = selectedDay === day
            const hasData = dayData.status !== 'empty'
            
            return (
              <button
                key={day}
                onClick={() => hasData && setSelectedDay(isSelected ? null : day)}
                disabled={!hasData}
                className={`
                  bg-theme-bg-secondary aspect-square min-h-[80px] md:min-h-[100px] p-2 md:p-3
                  flex flex-col items-center justify-start gap-1 text-left
                  transition-all relative group
                  ${hasData ? 'cursor-pointer hover:bg-theme-bg-hover' : 'cursor-default'}
                  ${isSelected ? 'ring-2 ring-accent ring-inset' : ''}
                  ${dayData.isToday ? 'bg-accent/5' : ''}
                `}
              >
                {/* Day Number */}
                <div className={`
                  w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${dayData.isToday ? 'bg-accent text-white' : ''}
                  ${dayData.isWeekend && !dayData.isToday ? 'text-amber-500/80' : 'text-theme-text-primary'}
                `}>
                  {day}
                </div>

                {/* Status Indicator */}
                {hasData && (
                  <div className={`
                    w-full flex-1 rounded-lg border p-1.5 md:p-2 flex flex-col items-center justify-center gap-0.5
                    ${dayData.statusColor}
                  `}>
                    {/* Progress bar for work days */}
                    {dayData.planned > 0 && dayData.status !== 'future' && (
                      <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            dayData.status === 'complete' ? 'bg-emerald-500' :
                            dayData.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (dayData.actual / dayData.planned) * 100)}%` }}
                        />
                      </div>
                    )}

                    {/* Hours display */}
                    {dayData.planned > 0 && (
                      <div className="text-[10px] md:text-xs font-semibold text-center leading-tight">
                        {dayData.status !== 'future' ? (
                          <span className={
                            dayData.status === 'complete' ? 'text-emerald-600' :
                            dayData.status === 'partial' ? 'text-amber-600' : 'text-red-600'
                          }>
                            {formatTime(dayData.actual)}
                          </span>
                        ) : (
                          <span className="text-orange-600">{formatTime(dayData.planned)}</span>
                        )}
                      </div>
                    )}

                    {/* Leave label */}
                    {dayData.status === 'leave' && (
                      <div className="text-[9px] md:text-[10px] font-medium text-blue-600 text-center">
                        İZİN
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-theme-border-primary bg-theme-bg-tertiary/30">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-theme-text-secondary">Tamamlandı</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-theme-text-secondary">Eksik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-theme-text-secondary">Gelmedi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-theme-text-secondary">İzinli</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-theme-text-secondary">Planlandı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDayData && (
        <div className="bg-theme-bg-secondary rounded-xl border border-theme-border-primary p-6 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDayData.statusColor}`}>
                {selectedDayData.status === 'complete' && <CheckCircle className="text-emerald-400" size={24} />}
                {selectedDayData.status === 'partial' && <AlertCircle className="text-amber-400" size={24} />}
                {selectedDayData.status === 'absent' && <XCircle className="text-red-400" size={24} />}
                {selectedDayData.status === 'leave' && <Coffee className="text-blue-400" size={24} />}
                {selectedDayData.status === 'future' && <ArrowRightCircle className="text-orange-400" size={24} />}
              </div>
              <div>
                <h4 className="font-bold text-theme-text-primary text-lg">
                  {selectedDay} {monthNames[month - 1]} {year}
                </h4>
                <p className={`text-sm font-medium ${
                  selectedDayData.status === 'complete' ? 'text-emerald-400' :
                  selectedDayData.status === 'partial' ? 'text-amber-400' :
                  selectedDayData.status === 'absent' ? 'text-red-400' :
                  selectedDayData.status === 'leave' ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {selectedDayData.statusText}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
            >
              <X size={18} className="text-theme-text-muted" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Time Info */}
            <div className="space-y-3">
              {selectedDayData.sch?.shiftType && (
                <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                  <span className="text-theme-text-muted text-sm">Vardiya Tipi</span>
                  <span className="font-medium text-theme-text-primary">
                    {selectedDayData.sch.shiftType.name}
                    <span className="text-theme-text-muted ml-2 text-sm">
                      ({selectedDayData.sch.shiftType.start_time?.slice(0,5)} - {selectedDayData.sch.shiftType.end_time?.slice(0,5)})
                    </span>
                  </span>
                </div>
              )}
              
              {selectedDayData.planned > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                  <span className="text-theme-text-muted text-sm">Planlanan Süre</span>
                  <span className="font-medium text-theme-text-primary">{formatTime(selectedDayData.planned)}</span>
                </div>
              )}

              {selectedDayData.attendance && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                    <span className="text-theme-text-muted text-sm">Gerçekleşen Süre</span>
                    <span className={`font-bold ${
                      selectedDayData.status === 'complete' ? 'text-emerald-400' : 
                      selectedDayData.status === 'partial' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {formatTime(selectedDayData.actual)}
                    </span>
                  </div>
                  
                  {selectedDayData.attendance.check_in_time && (
                    <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                      <span className="text-theme-text-muted text-sm">Giriş Saati</span>
                      <span className="font-medium text-theme-text-primary">
                        {new Date(selectedDayData.attendance.check_in_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {selectedDayData.attendance.check_out_time && (
                    <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                      <span className="text-theme-text-muted text-sm">Çıkış Saati</span>
                      <span className="font-medium text-theme-text-primary">
                        {new Date(selectedDayData.attendance.check_out_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </>
              )}

              {selectedDayData.status === 'leave' && (
                <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                  <span className="text-theme-text-muted text-sm">İzin Türü</span>
                  <span className="font-medium text-blue-400">{selectedDayData.statusText}</span>
                </div>
              )}
            </div>

            {/* Right: Project Info */}
            <div className="space-y-3">
              {selectedDayData.sch?.project && (
                <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                  <span className="text-theme-text-muted text-sm">Proje</span>
                  <span className="font-medium text-accent">{selectedDayData.sch.project.name}</span>
                </div>
              )}

              {selectedDayData.sch?.mesai_hours > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-theme-border-primary">
                  <span className="text-theme-text-muted text-sm">Mesai</span>
                  <span className="font-medium text-amber-400">{formatTime(selectedDayData.sch.mesai_hours)}</span>
                </div>
              )}

              {selectedDayData.sch?.notes && (
                <div className="py-2">
                  <span className="text-theme-text-muted text-sm block mb-1">Notlar</span>
                  <p className="text-theme-text-primary text-sm bg-theme-bg-tertiary/50 rounded-lg p-3">
                    {selectedDayData.sch.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
