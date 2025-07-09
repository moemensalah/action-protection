#!/usr/bin/env node

// Create Admin User Script
// This script creates a proper admin user with bcrypt password hashing

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdminUser() {
    const client = new Client({
        connectionString: 'postgresql://actionprotection:ajHQGHgwqhg3ggagdg@localhost:5432/actionprotection_db'
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Admin user details
        const adminEmail = 'admin@actionprotection.com';
        const adminPassword = 'ActionProtection2024!';
        const adminUsername = 'admin';

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        console.log('Password hashed successfully');

        // Delete existing admin users
        await client.query("DELETE FROM users WHERE role = 'administrator'");
        console.log('Cleared existing admin users');

        // Create new admin user
        const result = await client.query(`
            INSERT INTO users (
                id, 
                email, 
                username, 
                password, 
                first_name, 
                last_name, 
                role, 
                is_active, 
                created_at, 
                updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
            ) RETURNING id, email, username, role
        `, [
            'admin_user_2025',
            adminEmail,
            adminUsername,
            hashedPassword,
            'Admin',
            'User',
            'administrator',
            true
        ]);

        console.log('Admin user created successfully:', result.rows[0]);

        // Verify the user can be retrieved
        const verifyResult = await client.query(
            "SELECT id, email, username, first_name, last_name, role, is_active FROM users WHERE role = 'administrator'"
        );
        
        console.log('\nVerification - Admin users in database:');
        verifyResult.rows.forEach(user => {
            console.log(`- ${user.email} (${user.username}) - ${user.role}`);
        });

        console.log('\n🎉 Admin user creation completed!');
        console.log('================================');
        console.log('Login credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('URL: http://demox.actionprotectionkw.com/admin');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await client.end();
    }
}

// Run the script
createAdminUser();