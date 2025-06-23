#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting production server...');

// Set environment to production
process.env.NODE_ENV = 'production';

// Build the application first
console.log('Building application...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  cwd: __dirname
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build completed successfully');
    
    // Start production server
    console.log('Starting production server...');
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3000'
      }
    });

    serverProcess.on('error', (err) => {
      console.error('Server error:', err);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server exited with code ${code}`);
    });

  } else {
    console.error('Build failed with code:', code);
    process.exit(1);
  }
});