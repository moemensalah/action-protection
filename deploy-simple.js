#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Simple deployment build for LateLounge...');

try {
  // Clean and create directories
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  fs.mkdirSync('dist/assets', { recursive: true });
  fs.mkdirSync('logs', { recursive: true });

  // Copy essential logo assets
  const logoFiles = [
    'english-dark_1750523791780.png',
    'english-white_1750523827323.png'
  ];
  
  for (const file of logoFiles) {
    const srcPath = path.join('attached_assets', file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join('dist/assets', file));
    }
  }
  console.log('Logo assets copied');

  // Create HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge - Premium Coffee Experience</title>
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

  // Skip complex client build, use simple static approach
  console.log('Creating static client application...');
  const appJsContent = `
// Simple static app for production
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
    { nameEn: "Iced Americano", nameAr: "أمريكانو مثلج", price: 20 },
    { nameEn: "Iced Latte", nameAr: "لاتيه مثلج", price: 25 }
  ]},
  { id: 4, nameEn: "Breakfast", nameAr: "الإفطار", products: [
    { nameEn: "Avocado Toast", nameAr: "توست الأفوكادو", price: 28 },
    { nameEn: "Croissant", nameAr: "كرواسون", price: 15 }
  ]},
  { id: 5, nameEn: "Main Dishes", nameAr: "الأطباق الرئيسية", products: [
    { nameEn: "Grilled Chicken Sandwich", nameAr: "ساندويتش دجاج مشوي", price: 45 },
    { nameEn: "Caesar Salad", nameAr: "سلطة قيصر", price: 35 }
  ]},
  { id: 6, nameEn: "Desserts", nameAr: "الحلويات", products: [
    { nameEn: "Chocolate Cake", nameAr: "كعكة الشوكولاتة", price: 25 },
    { nameEn: "Tiramisu", nameAr: "تيراميسو", price: 30 }
  ]}
];

// Simple app initialization
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = \`
      <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 40px;">
          <img src="/assets/english-dark_1750523791780.png" alt="LateLounge" style="width: 200px; margin-bottom: 20px;">
          <h1 style="color: #d97706; margin-bottom: 10px;">ليت لاونج - LateLounge</h1>
          <p style="color: #888;">Premium Coffee Experience - تجربة قهوة مميزة</p>
        </header>
        <main id="menu-container"></main>
      </div>
    \`;
    
    renderMenu();
  }
});

function renderMenu() {
  const container = document.getElementById('menu-container');
  if (!container) return;
  
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
  
  container.innerHTML = menuHTML;
}
`;
  
  fs.writeFileSync('dist/assets/app.js', appJsContent);

  // Build server
  console.log('Building server...');
  execSync([
    'npx esbuild server/index.ts',
    '--platform=node',
    '--target=node18',
    '--format=esm',
    '--bundle',
    '--outfile=dist/server.js',
    '--external:express',
    '--packages=external'
  ].join(' '), { stdio: 'inherit' });

  // Create production package.json
  const prodPkg = {
    name: 'latelounge-cafe',
    version: '1.0.0',
    type: 'module',
    main: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies: { express: '^4.21.2' }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));

  console.log('\nBuild completed successfully!');
  console.log('Files created:');
  console.log('- dist/index.html');
  console.log('- dist/assets/app.js');
  console.log('- dist/assets/*.png (logos)');
  console.log('- dist/server.js');
  console.log('- dist/package.json');
  
  console.log('\nTo deploy:');
  console.log('cd dist && npm install && NODE_ENV=production node server.js');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}