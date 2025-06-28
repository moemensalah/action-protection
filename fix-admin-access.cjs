const { Pool } = require('@neondatabase/serverless');

async function updateAdminRole() {
  try {
    console.log('Updating admin user role to administrator...');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Update the newly created admin user to administrator role
    const result = await pool.query(
      "UPDATE users SET role = 'administrator', updated_at = NOW() WHERE email = 'admin@actionprotection.kw' RETURNING email, role, first_name, last_name"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user role updated successfully:');
      console.log(`Email: ${result.rows[0].email}`);
      console.log(`Role: ${result.rows[0].role}`);
      console.log(`Name: ${result.rows[0].first_name} ${result.rows[0].last_name}`);
      console.log('\n🔑 Admin Login Credentials:');
      console.log('Email: admin@actionprotection.kw');
      console.log('Password: admin123456');
    } else {
      console.log('❌ No admin user found with email admin@actionprotection.kw');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
  
  process.exit(0);
}

updateAdminRole();