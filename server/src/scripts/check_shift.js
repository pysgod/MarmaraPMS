
const { sequelize, Employee, WorkSchedule, Attendance } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');

async function checkEnsarShift() {
  let output = '';
  const log = (msg) => {
      console.log(msg);
      output += msg + '\n';
  };

  try {
    await sequelize.authenticate();
    
    // 1. Find Ensar
    const employee = await Employee.findOne({
      where: { name: { [Op.iLike]: '%Ensar Bildik%' } }
    });

    if (!employee) {
      log('Employee not found');
      fs.writeFileSync('check_output.txt', output);
      return;
    }

    const date = '2026-01-23';

    // 2. Check WorkSchedule
    const ws = await WorkSchedule.findOne({
      where: { employee_id: employee.id, date }
    });
    
    // 3. Check Attendance
    const att = await Attendance.findOne({
      where: { employee_id: employee.id, date }
    });

    log('--- RESULT ---');
    log(`WorkSchedule Mesai: ${ws ? ws.mesai_hours : 'None'}`);
    
    if (att) {
        log(`Attendance In: ${att.check_in_time}`);
        log(`Attendance Out: ${att.check_out_time}`);
        
        if (att.check_in_time) {
            const start = new Date(att.check_in_time);
            const end = att.check_out_time ? new Date(att.check_out_time) : new Date(); 
            
            const diffMs = end - start;
            const diffMins = Math.floor(diffMs / 60000);
            
            log(`Duration (Calculated): ${diffMins} minutes (from check-in to ${att.check_out_time ? 'check-out' : 'NOW'})`);
        }
    } else {
        log('No Attendance record found.');
    }

    fs.writeFileSync('check_output.txt', output);

  } catch (error) {
    console.error(error);
    fs.writeFileSync('check_output.txt', output + '\nERROR: ' + error.message);
  } finally {
    await sequelize.close();
  }
}

checkEnsarShift();
