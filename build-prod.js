#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building LateLounge for production...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('Cleaned previous build');
  }

  // Build client
  console.log('Building client...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build server
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/server.js', { stdio: 'inherit' });

  // Create logs directory
  fs.mkdirSync('logs', { recursive: true });

  console.log('Build completed successfully!');
  console.log('Run: NODE_ENV=production pm2 start ecosystem.config.js');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}