import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateAdminRole() {
  try {
    console.log('Updating admin user role to administrator...');
    
    // Update the newly created admin user to administrator role
    const result = await db.update(users)
      .set({ role: 'administrator' })
      .where(eq(users.email, 'admin@actionprotection.kw'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Admin user role updated successfully:');
      console.log(`Email: ${result[0].email}`);
      console.log(`Role: ${result[0].role}`);
      console.log(`Name: ${result[0].firstName} ${result[0].lastName}`);
      console.log('\n🔑 Admin Login Credentials:');
      console.log('Email: admin@actionprotection.kw');
      console.log('Password: admin123456');
    } else {
      console.log('❌ No admin user found with email admin@actionprotection.kw');
    }
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
  
  process.exit(0);
}

updateAdminRole();