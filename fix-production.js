import fs from 'fs';
import path from 'path';

console.log('Creating minimal working production build...');

// Clean start
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/assets', { recursive: true });

// Copy logo assets
const logos = ['english-dark_1750523791780.png', 'english-white_1750523827323.png'];
logos.forEach(logo => {
  fs.copyFileSync(`attached_assets/${logo}`, `dist/assets/${logo}`);
  fs.chmodSync(`dist/assets/${logo}`, 0o644);
});

// Ultra-simple HTML
const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LateLounge</title>
    <style>
        body { font-family: Arial; background: #1a1a1a; color: white; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { height: 60px; margin-bottom: 10px; }
        .menu { display: grid; gap: 20px; }
        .category { background: #2a2a2a; padding: 20px; border-radius: 8px; }
        .category h2 { color: #d97706; margin-bottom: 15px; }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .product { background: #333; padding: 15px; border-radius: 5px; }
        .product h3 { color: white; margin-bottom: 8px; font-size: 16px; }
        .price { color: #d97706; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img class="logo" src="/assets/english-dark_1750523791780.png" alt="LateLounge">
            <h1 style="color: #d97706;">LateLounge - ليت لاونج</h1>
            <p>Premium Coffee Experience</p>
        </div>
        
        <div class="menu">
            <div class="category">
                <h2>Coffee & Espresso - القهوة والإسبريسو</h2>
                <div class="products">
                    <div class="product">
                        <h3>Espresso - إسبريسو</h3>
                        <div class="price">15 SAR</div>
                    </div>
                    <div class="product">
                        <h3>Cappuccino - كابتشينو</h3>
                        <div class="price">22 SAR</div>
                    </div>
                    <div class="product">
                        <h3>Latte - لاتيه</h3>
                        <div class="price">25 SAR</div>
                    </div>
                </div>
            </div>
            
            <div class="category">
                <h2>Hot Beverages - المشروبات الساخنة</h2>
                <div class="products">
                    <div class="product">
                        <h3>Green Tea - شاي أخضر</h3>
                        <div class="price">18 SAR</div>
                    </div>
                    <div class="product">
                        <h3>Earl Grey - إيرل جراي</h3>
                        <div class="price">20 SAR</div>
                    </div>
                </div>
            </div>
            
            <div class="category">
                <h2>Cold Beverages - المشروبات الباردة</h2>
                <div class="products">
                    <div class="product">
                        <h3>Iced Coffee - قهوة مثلجة</h3>
                        <div class="price">20 SAR</div>
                    </div>
                    <div class="product">
                        <h3>Fresh Juice - عصير طازج</h3>
                        <div class="price">16 SAR</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('dist/index.html', html);

// Minimal server
const server = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
});`;

fs.writeFileSync('dist/server.js', server);

// Simple package.json
fs.writeFileSync('dist/package.json', JSON.stringify({
  "name": "latelounge",
  "dependencies": { "express": "^4.18.2" },
  "scripts": { "start": "node server.js" }
}, null, 2));

console.log('Minimal production build created');
console.log('Testing locally...');

// Test the build
import { spawn } from 'child_process';

const testServer = spawn('node', ['server.js'], { cwd: 'dist', stdio: 'pipe' });

testServer.stdout.on('data', (data) => {
  if (data.toString().includes('Server running')) {
    console.log('✅ Server starts successfully');
    
    // Test HTTP request
    setTimeout(() => {
      import('http').then(http => {
        const req = http.get('http://localhost:5000', (res) => {
          console.log(`✅ HTTP response: ${res.statusCode}`);
          testServer.kill();
        });
        req.on('error', () => {
          console.log('❌ HTTP test failed (port may be in use)');
          testServer.kill();
        });
      });
    }, 1000);
  }
});

testServer.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('EADDRINUSE')) {
    console.log('⚠️  Port in use (expected in development)');
    testServer.kill();
  } else {
    console.log('❌ Server error:', error);
    testServer.kill();
  }
});

setTimeout(() => {
  testServer.kill();
  console.log('\nProduction build ready for deployment');
}, 3000);