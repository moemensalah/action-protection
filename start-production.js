import { spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting production server...');

// Ensure logo assets are copied
if (!fs.existsSync('client/public/assets')) {
  fs.mkdirSync('client/public/assets', { recursive: true });
}

// Copy logo files
if (fs.existsSync('attached_assets/english-dark_1750523791780.png')) {
  fs.copyFileSync('attached_assets/english-dark_1750523791780.png', 'client/public/assets/english-dark_1750523791780.png');
}
if (fs.existsSync('attached_assets/english-white_1750523827323.png')) {
  fs.copyFileSync('attached_assets/english-white_1750523827323.png', 'client/public/assets/english-white_1750523827323.png');
}

// Build first
console.log('📦 Building application...');
const buildProcess = spawn('npm', ['run', 'build'], { 
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed');
    
    // Copy logos to build output
    if (fs.existsSync('dist/public')) {
      if (!fs.existsSync('dist/public/assets')) {
        fs.mkdirSync('dist/public/assets', { recursive: true });
      }
      if (fs.existsSync('client/public/assets/english-dark_1750523791780.png')) {
        fs.copyFileSync('client/public/assets/english-dark_1750523791780.png', 'dist/public/assets/english-dark_1750523791780.png');
      }
      if (fs.existsSync('client/public/assets/english-white_1750523827323.png')) {
        fs.copyFileSync('client/public/assets/english-white_1750523827323.png', 'dist/public/assets/english-white_1750523827323.png');
      }
      console.log('✅ Logo assets copied to build output');
    }
    
    // Start production server
    console.log('🌐 Starting production server...');
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: '3000'
      }
    });
    
    serverProcess.on('error', (err) => {
      console.error('❌ Server error:', err);
    });
    
  } else {
    console.error('❌ Build failed');
    process.exit(1);
  }
});

buildProcess.on('error', (err) => {
  console.error('❌ Build process error:', err);
  process.exit(1);
});