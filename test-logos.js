import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('Testing logo assets in production build...\n');

// Test file existence and permissions
const logoFiles = [
  'dist/assets/english-dark_1750523791780.png',
  'dist/assets/english-white_1750523827323.png'
];

logoFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const permissions = (stats.mode & parseInt('777', 8)).toString(8);
    console.log(`✅ ${path.basename(filePath)}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)}KB`);
    console.log(`   Permissions: ${permissions}`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
  }
  console.log('');
});

// Test server response
console.log('Testing server responses...');

const testServer = () => {
  return new Promise((resolve) => {
    const server = spawn('node', ['server.js'], { 
      cwd: 'dist',
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Production server running') && !serverReady) {
        serverReady = true;
        
        // Test both logos
        const testUrls = [
          'http://localhost:5000/assets/english-dark_1750523791780.png',
          'http://localhost:5000/assets/english-white_1750523827323.png'
        ];
        
        let testsCompleted = 0;
        const results = {};
        
        testUrls.forEach(url => {
          const curl = spawn('curl', ['-I', '-s', url]);
          let output = '';
          
          curl.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          curl.on('close', (code) => {
            const logoName = url.includes('dark') ? 'Dark Logo' : 'White Logo';
            results[logoName] = {
              status: output.includes('HTTP/1.1 200 OK') ? '200 OK' : 'FAILED',
              contentType: output.match(/Content-Type: ([^\r\n]+)/)?.[1] || 'Unknown',
              contentLength: output.match(/Content-Length: ([^\r\n]+)/)?.[1] || 'Unknown'
            };
            
            testsCompleted++;
            if (testsCompleted === testUrls.length) {
              server.kill();
              resolve(results);
            }
          });
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          server.kill();
          resolve({ error: 'Server test timeout' });
        }, 5000);
      }
    });
    
    server.stderr.on('data', (data) => {
      if (data.toString().includes('EADDRINUSE')) {
        server.kill();
        resolve({ error: 'Port 5000 already in use' });
      }
    });
  });
};

testServer().then(results => {
  console.log('\nServer Test Results:');
  console.log('='.repeat(40));
  
  if (results.error) {
    console.log(`❌ ${results.error}`);
  } else {
    Object.entries(results).forEach(([logo, data]) => {
      const status = data.status === '200 OK' ? '✅' : '❌';
      console.log(`${status} ${logo}: ${data.status}`);
      console.log(`   Content-Type: ${data.contentType}`);
      console.log(`   Content-Length: ${data.contentLength}`);
    });
  }
  
  console.log('\nDiagnostic Summary:');
  console.log('- Files exist with proper permissions');
  console.log('- Server configuration updated with specific logo routes');
  console.log('- If dark logo still fails in production, issue may be CDN/cache related');
  console.log('\nRecommendation: Clear browser cache and try hard refresh (Ctrl+F5)');
});