const bcrypt = require('bcryptjs');
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('./shared/schema');
const { eq } = require('drizzle-orm');

async function fixAdminUser() {
  console.log('🔧 Fixing admin user in production database...');
  
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  // Check current admin user
  console.log('1. Checking current admin user...');
  const currentAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.com'))
    .limit(1);
  
  if (currentAdmin.length > 0) {
    console.log('Current admin user:', {
      id: currentAdmin[0].id,
      email: currentAdmin[0].email,
      username: currentAdmin[0].username,
      role: currentAdmin[0].role,
      isActive: currentAdmin[0].isActive,
      hasPassword: currentAdmin[0].password ? 'YES' : 'NO'
    });
  } else {
    console.log('No admin user found with email admin@actionprotection.com');
  }
  
  // Create fresh password hash
  console.log('2. Creating fresh password hash...');
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  console.log('Password hash created successfully');
  
  // Update or create admin user
  console.log('3. Updating/creating admin user...');
  
  try {
    if (currentAdmin.length > 0) {
      // Update existing admin
      const [updatedAdmin] = await db
        .update(users)
        .set({
          email: 'admin@actionprotection.com',
          username: 'admin',
          password: hashedPassword,
          role: 'administrator',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, currentAdmin[0].id))
        .returning();
      
      console.log('✅ Admin user updated:', {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      });
    } else {
      // Create new admin
      const [newAdmin] = await db
        .insert(users)
        .values({
          id: 'admin_user_' + Date.now(),
          email: 'admin@actionprotection.com',
          username: 'admin',
          password: hashedPassword,
          role: 'administrator',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log('✅ Admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive
      });
    }
  } catch (error) {
    console.error('❌ Database operation failed:', error);
    process.exit(1);
  }
  
  // Verify the fix
  console.log('4. Verifying admin user...');
  const verifiedAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@actionprotection.com'))
    .limit(1);
  
  if (verifiedAdmin.length > 0) {
    const admin = verifiedAdmin[0];
    console.log('✅ Verification successful:', {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive
    });
    
    // Test password
    const passwordTest = await bcrypt.compare('admin123456', admin.password);
    console.log('✅ Password test:', passwordTest ? 'VALID' : 'INVALID');
    
    if (passwordTest) {
      console.log('🎉 Admin user is ready for login!');
    } else {
      console.log('❌ Password test failed - there may be an issue with the password hash');
    }
  } else {
    console.log('❌ Admin user verification failed');
  }
  
  console.log('\n📋 Admin Login Credentials:');
  console.log('   Email: admin@actionprotection.com');
  console.log('   Password: admin123456');
  console.log('   URL: https://demox.actionprotectionkw.com/admin');
}

fixAdminUser().catch(console.error);