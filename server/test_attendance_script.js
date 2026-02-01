const { sequelize, Employee, Attendance, Project, WorkSchedule } = require('./src/models');
const { Op } = require('sequelize');

async function run() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Find Employee Ensar Bildik
    const employee = await Employee.findOne({
      where: {
        first_name: 'Ensar',
        last_name: 'Bildik'
      }
    });

    if (!employee) {
      console.error('Employee "Ensar Bildik" not found!');
      process.exit(1);
    }

    console.log(`Found Employee: ${employee.first_name} ${employee.last_name} (ID: ${employee.id})`);

    // 2. Find a Project (Try to find one where he has a schedule today, or just any assigned project)
    // First check if there is a schedule for today to get the project
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let projectId = null;
    
    const schedule = await WorkSchedule.findOne({
      where: {
        employee_id: employee.id,
        date: todayStr
      }
    });

    if (schedule) {
        projectId = schedule.project_id;
        console.log(`Found schedule for today. Using Project ID: ${projectId}`);
    } else {
        // Fallback: Find any project he is assigned to via ProjectEmployee? 
        // Or just pick the first project in system?
        // Let's try to search via user relations if possible, but simplest is just pick a project.
        // Assuming there is at least one project.
        const project = await Project.findOne();
        if (project) {
            projectId = project.id;
            console.log(`No specific schedule found. Using first available Project ID: ${projectId}`);
        }
    }

    if (!projectId) {
        console.error('No project found to assign attendance to.');
        process.exit(1);
    }

    // 3. Create/Update Attendance
    // Times
    // We construct Date objects for today
    const dateBase = todayStr; // YYYY-MM-DD
    
    // Helper to create date time
    const mkTime = (timeStr) => new Date(`${dateBase}T${timeStr}`);

    const checkIn = mkTime('08:00:00');
    const breakStart = mkTime('12:00:00');
    const breakEnd = mkTime('13:00:00');
    const checkOut = mkTime('23:30:00'); // "23:00 dan sonra" -> 23:30

    // Calculate actual hours: (CheckOut - CheckIn) - (BreakEnd - BreakStart)
    const totalDurationMs = checkOut - checkIn;
    const breakDurationMs = breakEnd - breakStart;
    const workDurationMs = totalDurationMs - breakDurationMs;
    const actualHours = workDurationMs / (1000 * 60 * 60); // Hours

    console.log(`Creating Attendance:
      Date: ${todayStr}
      In: 08:00
      Break: 12:00 - 13:00
      Out: 23:30
      Actual Hours: ${actualHours}
    `);

    // Check if record exists
    let attendance = await Attendance.findOne({
        where: {
            employee_id: employee.id,
            project_id: projectId,
            date: todayStr
        }
    });

    if (attendance) {
        console.log('Updating existing attendance record...');
        await attendance.update({
            check_in_time: checkIn,
            check_out_time: checkOut,
            break_start_time: breakStart,
            break_end_time: breakEnd,
            actual_hours: actualHours,
            status: 'present',
            verification_method: 'manual' // Since we are injecting it
        });
    } else {
        console.log('Creating new attendance record...');
        attendance = await Attendance.create({
            employee_id: employee.id,
            project_id: projectId,
            date: todayStr,
            check_in_time: checkIn,
            check_out_time: checkOut,
            break_start_time: breakStart,
            break_end_time: breakEnd,
            actual_hours: actualHours,
            status: 'present',
            verification_method: 'manual'
        });
    }

    console.log('Attendance successfully saved!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
