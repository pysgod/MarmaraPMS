
const { sequelize, Employee, WorkSchedule } = require('../models');
const { Op } = require('sequelize');

async function fixEnsarData() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

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
      console.log('Employee "Ensar Bildik" not found.');
      return;
    }

    console.log(`Found Employee: ${employee.name} (ID: ${employee.id})`);

    // 2. Find the specific WorkSchedule for 2026-01-23
    const targetDate = '2026-01-23';
    
    // We want to find any schedule on this date with mesai_hours > 0
    const schedules = await WorkSchedule.findAll({
      where: { 
        employee_id: employee.id,
        date: targetDate,
        mesai_hours: { [Op.gt]: 0 }
      }
    });

    if (schedules.length === 0) {
      console.log(`No overtime records found for ${targetDate} to fix.`);
    } else {
      console.log(`Found ${schedules.length} record(s) to fix on ${targetDate}.`);
      
      for (const schedule of schedules) {
        console.log(`Updating Schedule ID: ${schedule.id} (Current Mesai: ${schedule.mesai_hours}) -> Setting to 0.00`);
        schedule.mesai_hours = 0;
        await schedule.save();
        console.log(`Schedule ID: ${schedule.id} updated successfully.`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixEnsarData();
