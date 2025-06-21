#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building LateLounge for production...');

const runCommand = (command, description) => {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`${description} completed`);
  } catch (error) {
    console.error(`${description} failed:`, error.message);
    throw error;
  }
};

try {
  // Ensure all dependencies are installed
  console.log('Checking dependencies...');
  if (!fs.existsSync('node_modules/vite') || !fs.existsSync('node_modules/esbuild')) {
    runCommand('npm install', 'Installing all dependencies');
  }

  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned previous build');
  }

  // Build client with explicit dependency check
  if (!fs.existsSync('node_modules/vite')) {
    runCommand('npm install vite --save-dev', 'Installing Vite');
  }
  runCommand('npx vite build', 'Building client');

  // Build server with explicit dependency check
  if (!fs.existsSync('node_modules/esbuild')) {
    runCommand('npm install esbuild --save-dev', 'Installing esbuild');
  }
  runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/server.js', 'Building server');

  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });
  console.log('Created logs directory');

  console.log('Build completed successfully!');
  console.log('Ready for PM2 deployment');

} catch (error) {
  console.error('Build process failed:', error.message);
  console.log('');
  console.log('Troubleshooting steps:');
  console.log('1. Run: npm install');
  console.log('2. Ensure vite and esbuild are in devDependencies');
  console.log('3. Check Node.js version (requires Node 16+)');
  process.exit(1);
}