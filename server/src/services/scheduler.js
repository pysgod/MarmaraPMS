const cron = require('node-cron');
const { Op } = require('sequelize');
const { Attendance, WorkSchedule, ShiftType, EmployeeHistory } = require('../models');

// Helper for duration
const formatDuration = (hours) => {
    const val = parseFloat(hours) || 0;
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    if (h > 0 && m > 0) return `${h} sa ${m} dk`;
    if (h > 0) return `${h} saat`;
    return `${m} dk`;
};

// Run every 5 minutes for responsive auto-checkout
const task = cron.schedule('*/5 * * * *', async () => {
    console.log('Running auto-checkout scheduler...');
    
    try {
        const now = new Date();
        const todayStr = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('-');

        // 1. Get ALL active attendances (checked in, not checked out) - including past days
        const activeAttendances = await Attendance.findAll({
            where: {
                check_in_time: { [Op.ne]: null },
                check_out_time: null
                // Removed date filter to catch past days' unclosed sessions
            }
        });

        console.log(`Found ${activeAttendances.length} unclosed attendance records`);


        for (const attendance of activeAttendances) {
             const attendanceDate = attendance.date; // e.g., "2026-01-23"
             const isPastDay = attendanceDate < todayStr;
             
             // 2. Find corresponding WorkSchedule to get Shift End Time
             const schedule = await WorkSchedule.findOne({
                 where: {
                     employee_id: attendance.employee_id,
                     date: attendanceDate, // Use the attendance's own date
                     project_id: attendance.project_id
                 },
                 include: [{ model: ShiftType, as: 'shiftType' }]
             });

             // For past days without schedule, close immediately
             if (isPastDay && (!schedule || !schedule.shiftType)) {
                 console.log(`Closing past day attendance for Employee ${attendance.employee_id} (no schedule found)`);
                 const checkInTime = new Date(attendance.check_in_time);
                 // Default 8 hours if no schedule
                 const defaultCheckout = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000);
                 await attendance.update({
                     check_out_time: defaultCheckout,
                     status: 'present',
                     actual_hours: 8,
                     notes: (attendance.notes || '') + ' [Sistem: Geçmiş Gün Otomatik Çıkış]'
                 });
                 
                 // Log to archive
                 try {
                     await EmployeeHistory.create({
                         employee_id: attendance.employee_id,
                         project_id: attendance.project_id,
                         action: 'auto_checkout',
                         notes: `Geçmiş gün otomatik çıkış (program bulunamadı). Tarih: ${attendanceDate}, Çalışılan: 8 saat (varsayılan)`
                     });
                 } catch (historyError) {
                     console.error('Failed to log auto-checkout to history:', historyError);
                 }
                 
                 continue;
             }

             if (!schedule || !schedule.shiftType) continue;

             const shiftEndStr = schedule.shiftType.end_time; // "18:00:00"
             
             // Convert shift end to Date object for the attendance's date
             const [h, m] = shiftEndStr.split(':');
             const shiftEndDate = new Date(attendanceDate + 'T00:00:00');
             shiftEndDate.setHours(parseInt(h), parseInt(m), 0, 0);
             
             // Check if employee has overtime assigned
             const mesaiHours = parseFloat(schedule.mesai_hours) || 0;
             
             let effectiveEndDate = shiftEndDate;
             if (mesaiHours > 0) {
                 // Add overtime hours to shift end
                 effectiveEndDate = new Date(shiftEndDate.getTime() + mesaiHours * 60 * 60 * 1000);
                 console.log(`Employee ${attendance.employee_id} has ${mesaiHours}h overtime. Effective end: ${effectiveEndDate.toLocaleTimeString()}`);
             }
             
             // For past days, close immediately since day has already ended
             if (isPastDay) {
                 console.log(`Closing past day attendance for Employee ${attendance.employee_id} on ${attendanceDate}`);
                 const checkInTime = new Date(attendance.check_in_time);
                 const durationMs = effectiveEndDate - checkInTime;
                 const actualHours = (durationMs > 0) ? (durationMs / (1000 * 60 * 60)).toFixed(2) : 0;
                 const plannedShiftHours = parseFloat(schedule.shiftType.hours) || 0;
                 const overtimeWorked = Math.max(0, parseFloat(actualHours) - plannedShiftHours).toFixed(2);

                 await attendance.update({
                     check_out_time: effectiveEndDate,
                     status: 'present',
                     actual_hours: actualHours,
                     overtime_hours: overtimeWorked,
                     notes: (attendance.notes || '') + ' [Sistem: Geçmiş Gün Otomatik Çıkış]'
                 });
                 
                 // Log to archive
                 try {
                     await EmployeeHistory.create({
                         employee_id: attendance.employee_id,
                         project_id: attendance.project_id,
                         action: 'auto_checkout',
                         notes: `Geçmiş gün otomatik çıkış. Tarih: ${attendanceDate}, Çalışılan: ${formatDuration(actualHours)}, Mesai: ${formatDuration(overtimeWorked)}`
                     });
                 } catch (historyError) {
                     console.error('Failed to log auto-checkout to history:', historyError);
                 }
                 
                 continue;
             }
             
             // For today: Add 10 mins buffer
             const autoCheckoutThreshold = new Date(effectiveEndDate.getTime() + 10 * 60000);

             // 3. Check if current time > Effective End + 10 mins
             if (now > autoCheckoutThreshold) {
                 console.log(`Auto-checking out Employee ${attendance.employee_id}...`);
                 
                 // Calculate hours based on Effective End Time (shift end + overtime)
                 const checkInTime = new Date(attendance.check_in_time);
                 const durationMs = effectiveEndDate - checkInTime;
                 const actualHours = (durationMs > 0) ? (durationMs / (1000 * 60 * 60)).toFixed(2) : 0;
                 
                 // Calculate overtime worked (actual - planned shift hours)
                 const plannedShiftHours = parseFloat(schedule.shiftType.hours) || 0;
                 const overtimeWorked = Math.max(0, parseFloat(actualHours) - plannedShiftHours).toFixed(2);

                 await attendance.update({
                     check_out_time: effectiveEndDate, // Set to effective end time (shift end + overtime)
                     status: mesaiHours > 0 ? 'present' : 'early_leave', // If had overtime, mark as present
                     actual_hours: actualHours,
                     overtime_hours: overtimeWorked,
                     notes: (attendance.notes || '') + ` [Sistem: Otomatik Çıkış${mesaiHours > 0 ? ' (Mesai Dahil)' : ''}]`
                 });
                 
                 // Log to archive
                 try {
                     await EmployeeHistory.create({
                         employee_id: attendance.employee_id,
                         project_id: attendance.project_id,
                         action: 'auto_checkout',
                         notes: `Otomatik çıkış (vardiya sonu + ${mesaiHours > 0 ? formatDuration(mesaiHours) + ' mesai + ' : ''}10 dk). Çalışılan: ${formatDuration(actualHours)}, Mesai: ${formatDuration(overtimeWorked)}`
                     });
                 } catch (historyError) {
                     console.error('Failed to log auto-checkout to history:', historyError);
                 }
             }
        }


    } catch (error) {
        console.error('Scheduler error:', error);
    }
});

module.exports = task;
