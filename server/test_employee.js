const { sequelize, Company, Employee } = require('./src/models');

async function testCreate() {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('Connected.');

    // 1. Get a company
    const company = await Company.findOne();
    if (!company) {
      console.error('No company found to test with.');
      return;
    }
    console.log(`Using Company: ${company.name} (ID: ${company.id})`);

    // 2. Prepare Payload (Mimic Frontend)
    const payload = {
      company_id: company.id,
      tc_no: '22222222222', 
      type: 'blue_collar',
      first_name: 'Test',
      last_name: 'EmptyFields', // Required
      title: 'Güvenlik Görevlisi', // Required
      birth_place: 'Test Place', // Required
      birth_date: '1990-01-01', // Required
      marital_status: 'Bekar', // Required
      gender: 'male', // Required
      education_level: 'Lise', // Required
      start_date: '2023-01-01', // Required
      status: 'active',
      
      // Optional fields as empty string/objects
      father_name: '',
      mother_name: '',
      blood_type: '',
      military_status: '',
      height: '',
      weight: '',
      children_count: '', // Should be handled by backend
      phone: '05554443322', // Required by tab 2 logic? No, only phone.
      home_phone: '',
      email: '',
      address: '',
      emergency_contact_phone: '',
      emergency_contact_name: '',
      
      // Certificate
      has_certificate: false,
      certificate_city: '',
      certificate_no: '',
      certificate_date: '',
      certificate_expiry: '',
      weapon_status: '',
      
      // Clothing
      clothing_sizes: {},
      
      // Bank
      bank_name: '',
      bank_branch_name: '',
      bank_branch_code: '',
      bank_account_no: '',
      iban: '',
      
      // Card
      card_type: '',
      card_no: ''
    };

    console.log('Attempting to create employee with payload:', payload);

    try {
      const emp = await Employee.create(payload);
      console.log('✅ Success! Employee created:', emp.id);
      
      // Cleanup
      await emp.destroy();
      console.log('Cleanup: Test employee deleted.');
      
    } catch (createError) {
      console.error('❌ Creation Failed:', createError.message);
      if (createError.errors) {
        createError.errors.forEach(e => console.error(` - ${e.path}: ${e.message} (${e.validationKey})`));
      }
      console.error('Full Error:', createError);
    }

  } catch (err) {
    console.error('General Error:', err);
  } finally {
    await sequelize.close();
  }
}

testCreate();
