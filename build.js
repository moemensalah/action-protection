#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Building LateLounge for production...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Cleaned previous build');
  }

  // Build client
  console.log('📦 Building client...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build server
  console.log('🚀 Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/server.js', { stdio: 'inherit' });

  // Copy package.json for production dependencies
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: 'module',
    scripts: {
      start: 'node server.js'
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackageJson, null, 2));
  console.log('✅ Created production package.json');

  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });
  console.log('✅ Created logs directory');

  console.log('🎉 Build completed successfully!');
  console.log('📋 Next steps for PM2 deployment:');
  console.log('   1. cd dist && npm install --production');
  console.log('   2. pm2 start ../ecosystem.config.js --env production');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}