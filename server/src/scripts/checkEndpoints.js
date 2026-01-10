const { Activity, Company, Employee, Project, Patrol, PatrolLog, sequelize } = require('../models');

async function checkEndpoints() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected.');

    // Check Activities
    try {
      console.log('Fetching Activities...');
      const activities = await Activity.findAll({ limit: 1 });
      console.log(`✅ Activities: ${activities.length}`);
    } catch (e) {
      console.error('❌ Activities Error:', e.message);
    }

    // Check Stats
    try {
      console.log('Fetching Stats...');
      const totalCompanies = await Company.count();
      console.log(`✅ Stats (Companies): ${totalCompanies}`);
    } catch (e) {
      console.error('❌ Stats Error:', e.message);
    }

  } catch (error) {
    console.error('❌ DB Fatal:', error);
  } finally {
    process.exit();
  }
}

checkEndpoints();
