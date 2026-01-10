const { User } = require('./models');

async function checkAdmin() {
  try {
    const admin = await User.findOne({ where: { email: 'admin@marmara.com' } });
    if (admin) {
      console.log('------------------------------------------------');
      console.log('✅ Admin Kullanıcısı BULUNDU:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   İsim: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rol: ${admin.role}`);
      console.log(`   Oluşturulma: ${admin.createdAt}`);
      console.log('------------------------------------------------');
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı!');
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkAdmin();
