
const { sequelize, Employee, Project, WorkSchedule, ProjectEmployee, ShiftType } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');

async function debugEnsarData() {
  const logBuffer = [];
  const log = (msg) => {
      console.log(msg);
      logBuffer.push(msg);
  };

  try {
    log('Connecting to database...');
    await sequelize.authenticate();
    log('Connection established successfully.');

    // 1. Find Ensar Bildik
    const employee = await Employee.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%Ensar Bildik%' } },
          { first_name: { [Op.iLike]: '%Ensar%' }, last_name: { [Op.iLike]: '%Bildik%' } }
        ]
      }
    });

    if (!employee) {
      log('Employee "Ensar Bildik" not found.');
      fs.writeFileSync('debug_output.txt', logBuffer.join('\n'));
      return;
    }

    log(`Found Employee: ${employee.name} (ID: ${employee.id})`);

    // 2. Find Active Assignments
    const assignments = await ProjectEmployee.findAll({
      where: { employee_id: employee.id },
      include: [{ model: Project, as: 'project' }]
    });

    log('\n--- Active Project Assignments ---');
    const assignedProjectIds = assignments.map(a => a.project_id);
    if (assignments.length === 0) {
      log('No active project assignments found.');
    } else {
      assignments.forEach(a => {
        log(`- Project ID: ${a.project_id}, Name: ${a.project ? a.project.name : 'Unknown'}, Status: ${a.status}`);
      });
    }

    // 3. Fetch Work Schedules
    const schedules = await WorkSchedule.findAll({
      where: { employee_id: employee.id },
      include: [
        { model: Project, as: 'project' }
      ],
      order: [['date', 'DESC']]
    });

    log(`\n--- Work Schedules (Total: ${schedules.length}) ---`);
    
    let phantomCount = 0;
    
    // Group by Project
    const schedulesByProject = {};
    
    schedules.forEach(s => {
      const pid = s.project_id;
      if (!schedulesByProject[pid]) {
        schedulesByProject[pid] = {
          projectName: s.project ? s.project.name : 'Unknown Project',
          count: 0,
          mesaiDetails: []
        };
      }
      schedulesByProject[pid].count++;
      
      // Check for Mesai
      if (s.mesai_hours > 0 || s.mesai_shift_type_id) {
          schedulesByProject[pid].mesaiDetails.push({
              date: s.date,
              mesai_hours: s.mesai_hours,
              mesai_shift_type_id: s.mesai_shift_type_id
          });
      }

      // Check for Phantom (Project not assigned)
      const isAssigned = assignedProjectIds.includes(pid);
      if (!isAssigned) {
         // It might be past assignments
      }
    });

    for (const [pid, data] of Object.entries(schedulesByProject)) {
      const isAssigned = assignedProjectIds.includes(parseInt(pid));
      const statusStr = isAssigned ? 'ACTIVE ASSIGNMENT' : 'NOT ASSIGNED (Potential Phantom/History)';
      
      log(`\nProject ID: ${pid} (${data.projectName}) - ${statusStr}`);
      log(`Total Schedules: ${data.count}`);
      if (data.mesaiDetails.length > 0) {
          log(`Overtime Records (${data.mesaiDetails.length}):`);
          data.mesaiDetails.slice(0, 5).forEach(m => {
              log(`  Date: ${m.date}, Hours: ${m.mesai_hours}, TypeID: ${m.mesai_shift_type_id}`);
          });
          if (data.mesaiDetails.length > 5) log(`  ... and ${data.mesaiDetails.length - 5} more`);
      } else {
          log(`No overtime records for this project.`);
      }
      
      if (!isAssigned) {
          phantomCount++;
      }
    }
    
    // Specific detailed check for duplicates (composite key violation check manually mostly)
    log('\n--- Duplicate Check ---');
    const keyMap = new Map();
    let duplicateFound = false;
    for (const s of schedules) {
        const key = `${s.project_id}-${s.date}`;
        if (keyMap.has(key)) {
            log(`DUPLICATE FOUND: Project ${s.project_id} Date ${s.date} (Ids: ${keyMap.get(key)} and ${s.id})`);
            duplicateFound = true;
        } else {
            keyMap.set(key, s.id);
        }
    }
    if (!duplicateFound) log('No duplicates found for (Project + Date).');

    // ... (previous logic)

    // 4. Fetch Attendance Records
    const Attendance = require('../models/Attendance'); // Ensure it is required if not already
    
    // Actually Attendance is in models/index.js export, so we can use existing destructuring if we added it
    // But I need to check if I added it to the destructuring at the top. 
    // I will assume I need to update the require at the top or just require it here?
    // Let's just use sequelize.models.Attendance to be safe and easy.
    
    const AttendanceModel = sequelize.models.Attendance;
    
    // ... (previous logic)
    
    log('\n--- Attendance Records ---');
    if (AttendanceModel) {
        const attendances = await AttendanceModel.findAll({
            where: { employee_id: employee.id },
            order: [['date', 'DESC']]
        });
        
        log(`Total Attendance Records: ${attendances.length}`);
        attendances.forEach(att => {
            log(`- Date: ${att.date}, Status: ${att.status}`);
            log(`  In: ${att.check_in_time}, Out: ${att.check_out_time} (Method: ${att.verification_method})`);
            log(`  Planned: ${att.planned_hours}, Actual: ${att.actual_hours}, Overtime: ${att.overtime_hours}`);
        });
    } else {
        log('Attendance model not found in sequelize.models');
    }

    fs.writeFileSync('debug_output.txt', logBuffer.join('\n'));
    
    // ... (catch block)

  } catch (error) {
    console.error('Error:', error);
    fs.writeFileSync('debug_output.txt', logBuffer.join('\n') + '\nERROR: ' + error.message);
  } finally {
    await sequelize.close();
  }
}

debugEnsarData();
