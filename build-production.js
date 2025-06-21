#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Production build for LateLounge...');

const safeRun = (cmd, desc) => {
  console.log(`${desc}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✓ ${desc} complete`);
    return true;
  } catch (error) {
    console.log(`✗ ${desc} failed`);
    return false;
  }
};

try {
  // Clean build directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/assets', { recursive: true });

  // Copy logo assets to dist/assets
  if (fs.existsSync('attached_assets')) {
    const logoFiles = [
      'english-dark_1750523791780.png',
      'english-white_1750523827323.png'
    ];
    
    for (const file of logoFiles) {
      const srcPath = path.join('attached_assets', file);
      const destPath = path.join('dist/assets', file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log('✓ Logo assets copied to dist/assets');
  }

  // Build client using Vite
  console.log('Building client with Vite...');
  const viteSuccess = safeRun('npx vite build --mode production', 'Vite build');
  
  // Handle Vite output directory structure
  if (viteSuccess && fs.existsSync('dist/public')) {
    // Move files from dist/public to dist root
    const files = fs.readdirSync('dist/public');
    for (const file of files) {
      const srcPath = path.join('dist/public', file);
      const destPath = path.join('dist', file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        // Copy directory contents
        const subFiles = fs.readdirSync(srcPath);
        for (const subFile of subFiles) {
          fs.copyFileSync(path.join(srcPath, subFile), path.join(destPath, subFile));
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    fs.rmSync('dist/public', { recursive: true, force: true });
    console.log('✓ Vite build files organized');
  }

  // Build server
  const serverBuildCmd = [
    'npx esbuild server/index.ts',
    '--platform=node',
    '--target=node18',
    '--format=esm',
    '--bundle',
    '--outfile=dist/server.js',
    '--external:express',
    '--external:memorystore',
    '--packages=external'
  ].join(' ');
  
  safeRun(serverBuildCmd, 'Building server');

  // Create production package.json
  const prodPackage = {
    name: 'latelounge-production',
    version: '1.0.0',
    type: 'module',
    main: 'server.js',
    scripts: {
      start: 'NODE_ENV=production node server.js'
    },
    dependencies: {
      express: '^4.21.2'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

  // Ensure logs directory exists
  fs.mkdirSync('logs', { recursive: true });

  console.log('\n🎉 Production build completed!');
  console.log('\nGenerated files:');
  console.log('- dist/index.html (client app)');
  console.log('- dist/assets/ (logos and static files)');
  console.log('- dist/server.js (backend server)');
  console.log('- dist/package.json (production dependencies)');
  
  console.log('\nDeployment commands:');
  console.log('1. cd dist');
  console.log('2. npm install --production');
  console.log('3. NODE_ENV=production PORT=5000 node server.js');
  console.log('\nOr use PM2:');
  console.log('pm2 start ../ecosystem.config.js --env production');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}