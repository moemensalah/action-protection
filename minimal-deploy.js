import fs from 'fs';

// Create absolute minimal working deployment
console.log('Creating ultra-minimal deployment...');

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/public/assets', { recursive: true });

// Copy only essential assets to correct location
fs.copyFileSync('attached_assets/english-dark_1750523791780.png', 'dist/public/assets/english-dark_1750523791780.png');
fs.copyFileSync('attached_assets/english-white_1750523827323.png', 'dist/public/assets/english-white_1750523827323.png');
fs.chmodSync('dist/public/assets/english-dark_1750523791780.png', 0o644);
fs.chmodSync('dist/public/assets/english-white_1750523827323.png', 0o644);

// Minimal HTML with embedded styles and no external dependencies
fs.writeFileSync('dist/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LateLounge - Premium Coffee Experience</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#1a1a1a;color:#fff;padding:20px}
.container{max-width:1200px;margin:0 auto}
.header{text-align:center;margin-bottom:40px}
.logo{height:60px;margin-bottom:15px}
.category{background:#2a2a2a;margin-bottom:25px;padding:25px;border-radius:8px}
.category h2{color:#d97706;margin-bottom:20px;font-size:22px}
.products{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:15px}
.product{background:#333;padding:18px;border-radius:6px}
.product h3{color:#fff;margin-bottom:8px;font-size:16px}
.price{color:#d97706;font-weight:bold;font-size:15px}
</style>
</head>
<body>
<div class="container">
<div class="header">
<img src="/assets/english-dark_1750523791780.png" alt="LateLounge" class="logo">
<h1 style="color:#d97706;margin-bottom:8px">LateLounge - ليت لاونج</h1>
<p style="color:#999">Premium Coffee Experience</p>
</div>
<div class="category">
<h2>Coffee & Espresso - القهوة والإسبريسو</h2>
<div class="products">
<div class="product"><h3>Espresso - إسبريسو</h3><div class="price">15 SAR</div></div>
<div class="product"><h3>Cappuccino - كابتشينو</h3><div class="price">22 SAR</div></div>
<div class="product"><h3>Latte - لاتيه</h3><div class="price">25 SAR</div></div>
<div class="product"><h3>Americano - أمريكانو</h3><div class="price">18 SAR</div></div>
</div>
</div>
<div class="category">
<h2>Hot Beverages - المشروبات الساخنة</h2>
<div class="products">
<div class="product"><h3>Green Tea - شاي أخضر</h3><div class="price">18 SAR</div></div>
<div class="product"><h3>Earl Grey - إيرل جراي</h3><div class="price">20 SAR</div></div>
<div class="product"><h3>Hot Chocolate - شوكولاتة ساخنة</h3><div class="price">24 SAR</div></div>
</div>
</div>
<div class="category">
<h2>Cold Beverages - المشروبات الباردة</h2>
<div class="products">
<div class="product"><h3>Iced Coffee - قهوة مثلجة</h3><div class="price">20 SAR</div></div>
<div class="product"><h3>Fresh Juice - عصير طازج</h3><div class="price">16 SAR</div></div>
<div class="product"><h3>Iced Tea - شاي مثلج</h3><div class="price">15 SAR</div></div>
</div>
</div>
</div>
</body>
</html>`);

// Ultra-simple server serving from public directory
fs.writeFileSync('dist/server.js', `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('LateLounge server running on port', PORT);
});`);

// Minimal package.json
fs.writeFileSync('dist/package.json', `{
  "name": "latelounge-prod",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}`);

console.log('✅ Ultra-minimal deployment created');
console.log('Files:');
console.log('- dist/index.html (self-contained)');
console.log('- dist/server.js (minimal Express)'); 
console.log('- dist/package.json');
console.log('- dist/assets/english-dark_1750523791780.png');
console.log('- dist/assets/english-white_1750523827323.png');
console.log('');
console.log('This deployment has no complex routing, no React dependencies,');
console.log('no manifest complications - just a simple static site.');
console.log('');
console.log('Deploy with: cd dist && npm install && node server.js');