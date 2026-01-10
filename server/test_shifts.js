const { sequelize, Project, Employee, ProjectEmployee, ShiftAssignment, ShiftDefinition, Company } = require('./src/models');

async function testProjectShifts() {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('Connected.');

    // 1. Find a project that has employees
    // Let's first look for any project employee
    const pe = await ProjectEmployee.findOne();
    if (!pe) {
        console.error('No ProjectEmployee records found. Cannot test.');
        return;
    }

    const projectId = pe.project_id;
    console.log(`Testing with Project ID: ${projectId}`);

    // 2. Logic from Controller
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Company,
          as: 'company',
          include: [{ model: ShiftDefinition, as: 'shiftDefinitions' }]
        }
      ]
    });

    if (!project) {
        console.error('Project not found via findByPk');
        return;
    }
    console.log(`Project Found: ${project.name}`);

    // 3. Test getEmployees
    console.log('Fetching employees via getEmployees()...');
    const allEmployees = await project.getEmployees();
    console.log(`Employees Found: ${allEmployees.length}`);
    allEmployees.forEach(e => console.log(` - ${e.first_name} ${e.last_name} (${e.id})`));

    // 4. Check assignments
    const assignments = await ShiftAssignment.findAll({
      where: { project_id: projectId },
      include: [
        { model: Employee, as: 'employee' }
      ]
    });
    console.log(`Assignments Found: ${assignments.length}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

testProjectShifts();
