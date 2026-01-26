
const { Sequelize, DataTypes, Op } = require('sequelize');

// Database configuration
const sequelize = new Sequelize('marmara_pms', 'postgres', 'postgres123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

// Models definitions
const Employee = sequelize.define('Employee', {
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  activation_code: DataTypes.STRING
}, { tableName: 'employees', timestamps: true, underscored: true });

const WorkSchedule = sequelize.define('WorkSchedule', {
  date: DataTypes.DATEONLY,
  status: DataTypes.STRING,
  project_id: DataTypes.INTEGER,
  employee_id: DataTypes.INTEGER,
  shift_type_id: DataTypes.INTEGER,
  mesai_hours: DataTypes.DECIMAL
}, { tableName: 'work_schedules', timestamps: true, underscored: true });

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Find Employee
    const searchTerm = 'Esman'; 
    const employees = await Employee.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${searchTerm}%` } },
          { last_name: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      }
    });

    if (employees.length === 0) {
      console.log('Employee not found!');
      return;
    }

    const employee = employees[0];
    console.log(`Checking shifts for: ${employee.first_name} ${employee.last_name} (ID: ${employee.id})`);

    // 2. Find Schedules
    const schedules = await WorkSchedule.findAll({
      where: {
        employee_id: employee.id
      },
      order: [['date', 'ASC']]
    });

    console.log(`Found ${schedules.length} total schedules.`);
    
    const today = new Date();
    // Use manual formatting to avoid UTC issues if running locally
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    
    console.log(`Server Today Date: ${todayStr}`);

    schedules.forEach(s => {
      console.log(`---`);
      console.log(`Date: ${s.date}`);
      console.log(`Project ID: ${s.project_id}`);
      console.log(`Shift Type ID: ${s.shift_type_id}`);
      
      if (s.date === todayStr) {
          console.log(">>> MATCHES TODAY <<<");
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

run();
