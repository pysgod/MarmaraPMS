const { Company, Project, Employee, User, Patrol, ReportType, DocumentCategory, FaqItem, HelpCategory, sequelize } = require('../models');

async function checkDataView() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected.');

    console.log('Fetching Companies...');
    const companies = await Company.findAll();
    console.log(`Companies: ${companies.length}`);

    console.log('Fetching Projects...');
    const projects = await Project.findAll();
    console.log(`Projects: ${projects.length}`);

    console.log('Fetching Employees...');
    const employees = await Employee.findAll();
    console.log(`Employees: ${employees.length}`);

    console.log('Fetching Users...');
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    console.log(`Users: ${users.length}`);

    console.log('Fetching Patrols...');
    const patrols = await Patrol.findAll();
    console.log(`Patrols: ${patrols.length}`);

    console.log('Fetching ReportTypes...');
    const reportTypes = await ReportType.findAll();
    console.log(`ReportTypes: ${reportTypes.length}`);

    console.log('Fetching DocumentCategory...');
    const docCategories = await DocumentCategory.findAll();
    console.log(`DocumentCategory: ${docCategories.length}`);

    console.log('Fetching FaqItem...');
    const faqItems = await FaqItem.findAll({ order: [['order', 'ASC']] });
    console.log(`FaqItem: ${faqItems.length}`);

    console.log('Fetching HelpCategory...');
    const helpCategories = await HelpCategory.findAll({ order: [['order', 'ASC']] });
    console.log(`HelpCategory: ${helpCategories.length}`);

    console.log('✅ All data fetched successfully.');
  } catch (error) {
    console.error('❌ Data View Error:', error);
  } finally {
    process.exit();
  }
}

checkDataView();
