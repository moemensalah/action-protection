const { execSync } = require('child_process');

async function runSeeder() {
  try {
    console.log('Running Action Protection seeder...');
    
    // Import and run the seeder
    const { seedActionProtectionData } = require('./server/actionProtectionSeeder.ts');
    await seedActionProtectionData();
    
    console.log('Seeder completed successfully!');
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
}

runSeeder();