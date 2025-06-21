import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Creating clean production build...');

// Clean and create directories
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/assets', { recursive: true });

// Copy logo assets with proper permissions
const logoFiles = [
  'english-dark_1750523791780.png',
  'english-white_1750523827323.png'
];

for (const file of logoFiles) {
  const srcPath = path.join('attached_assets', file);
  const destPath = path.join('dist/assets', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    fs.chmodSync(destPath, 0o644);
    console.log(`Copied ${file}`);
  }
}

// Create simple HTML with cache-busting
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge - Premium Coffee Experience</title>
    <meta name="description" content="Premium bilingual cafe experience with Arabic and English menus" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#d4af37" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: #1a1a1a; color: white; min-height: 100vh; }
      #root { min-height: 100vh; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 18px; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">Loading LateLounge...</div>
    </div>
    <script type="module" src="/assets/app.js"></script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', htmlContent);

// Create manifest
const manifestContent = {
  "name": "LateLounge - Premium Coffee Experience",
  "short_name": "LateLounge",
  "description": "Bilingual cafe website featuring premium coffee and menu items",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#d4af37",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/assets/english-dark_1750523791780.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/english-white_1750523827323.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
};

fs.writeFileSync('dist/manifest.json', JSON.stringify(manifestContent, null, 2));

// Create working app.js
const appJsContent = `
const categories = [
  { id: 1, nameEn: "Coffee & Espresso", nameAr: "القهوة والإسبريسو", products: [
    { nameEn: "Espresso", nameAr: "إسبريسو", price: 15 },
    { nameEn: "Cappuccino", nameAr: "كابتشينو", price: 22 },
    { nameEn: "Latte", nameAr: "لاتيه", price: 25 }
  ]},
  { id: 2, nameEn: "Hot Beverages", nameAr: "المشروبات الساخنة", products: [
    { nameEn: "Green Tea", nameAr: "شاي أخضر", price: 18 },
    { nameEn: "Earl Grey", nameAr: "إيرل جراي", price: 20 }
  ]},
  { id: 3, nameEn: "Cold Beverages", nameAr: "المشروبات الباردة", products: [
    { nameEn: "Iced Coffee", nameAr: "قهوة مثلجة", price: 20 },
    { nameEn: "Fresh Juice", nameAr: "عصير طازج", price: 16 }
  ]}
];

document.addEventListener('DOMContentLoaded', function() {
  const appHTML = \`
    <div style="min-height: 100vh; background: #1a1a1a; color: white;">
      <header style="padding: 20px; text-align: center; border-bottom: 1px solid #333;">
        <img src="/assets/english-dark_1750523791780.png?v=1.1" alt="LateLounge" style="height: 60px; width: auto;" />
        <p style="margin-top: 10px; color: #888;">Premium Coffee Experience</p>
      </header>
      
      <div id="menu-container" style="padding: 40px 20px; max-width: 1200px; margin: 0 auto;">
        <h1 style="text-align: center; color: #d97706; margin-bottom: 40px; font-size: 36px;">
          Our Menu - قائمتنا
        </h1>
      </div>
    </div>
  \`;
  
  document.getElementById('root').innerHTML = appHTML;
  renderMenu();
});

function renderMenu() {
  const container = document.getElementById('menu-container');
  if (!container) return;
  
  const existingTitle = container.querySelector('h1');
  const menuHTML = categories.map(category => \`
    <div style="background: #2a2a2a; margin-bottom: 30px; padding: 25px; border-radius: 10px;">
      <h2 style="color: #d97706; margin-bottom: 20px; font-size: 24px;">
        \${category.nameEn} - \${category.nameAr}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
        \${category.products.map(product => \`
          <div style="background: #333; padding: 20px; border-radius: 8px;">
            <h3 style="color: white; margin-bottom: 8px; font-size: 18px;">
              \${product.nameEn} - \${product.nameAr}
            </h3>
            <div style="color: #d97706; font-weight: bold; font-size: 16px;">
              \${product.price} SAR
            </div>
          </div>
        \`).join('')}
      </div>
    </div>
  \`).join('');
  
  container.innerHTML = existingTitle.outerHTML + menuHTML;
}
`;

fs.writeFileSync('dist/assets/app.js', appJsContent);

// Create simple production server
const serverContent = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(__dirname));

// Handle manifest with proper MIME type
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Handle SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`LateLounge production server running on port \${PORT}\`);
});`;

fs.writeFileSync('dist/server.js', serverContent);

// Create package.json
const packageJson = {
  "name": "latelounge-production",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('Clean production build completed successfully!');
console.log('Files created:');
console.log('- dist/index.html');
console.log('- dist/manifest.json');
console.log('- dist/assets/app.js');
console.log('- dist/assets/*.png (logos)');
console.log('- dist/server.js');
console.log('- dist/package.json');
console.log('');
console.log('To deploy: cd dist && npm install && node server.js');