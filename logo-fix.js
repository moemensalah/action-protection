import fs from 'fs';
import path from 'path';

console.log('LateLounge Logo Fix - Comprehensive Solution\n');

// Step 1: Verify source assets
const sourceAssets = [
  'attached_assets/english-dark_1750523791780.png',
  'attached_assets/english-white_1750523827323.png'
];

console.log('1. Checking source assets...');
sourceAssets.forEach(asset => {
  if (fs.existsSync(asset)) {
    const stats = fs.statSync(asset);
    console.log(`✅ ${path.basename(asset)} - ${(stats.size / 1024).toFixed(1)}KB`);
  } else {
    console.log(`❌ Missing: ${asset}`);
  }
});

// Step 2: Create production directories
console.log('\n2. Setting up production directories...');
['dist', 'dist/assets'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

// Step 3: Copy logo assets with specific fixes
console.log('\n3. Copying logo assets with enhanced permissions...');
const logoFiles = [
  { src: 'attached_assets/english-dark_1750523791780.png', dest: 'dist/assets/english-dark_1750523791780.png' },
  { src: 'attached_assets/english-white_1750523827323.png', dest: 'dist/assets/english-white_1750523827323.png' }
];

logoFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    // Copy file
    fs.copyFileSync(src, dest);
    
    // Set explicit permissions (readable by web server)
    fs.chmodSync(dest, 0o644);
    
    // Verify copy
    const srcStats = fs.statSync(src);
    const destStats = fs.statSync(dest);
    
    if (srcStats.size === destStats.size) {
      console.log(`✅ ${path.basename(dest)} - Copied successfully`);
      console.log(`   Size: ${(destStats.size / 1024).toFixed(1)}KB`);
      console.log(`   Permissions: ${(destStats.mode & parseInt('777', 8)).toString(8)}`);
    } else {
      console.log(`❌ ${path.basename(dest)} - Size mismatch`);
    }
  }
});

// Step 4: Create enhanced production HTML with better logo handling
console.log('\n4. Creating production HTML with logo preloading...');
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LateLounge - Premium Coffee Experience</title>
    <meta name="description" content="Premium bilingual cafe experience with Arabic and English menus, dark theme, and exquisite coffee selections" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#d4af37" />
    
    <!-- Preload critical logo assets -->
    <link rel="preload" href="/assets/english-dark_1750523791780.png?v=1.1" as="image" type="image/png" />
    <link rel="preload" href="/assets/english-white_1750523827323.png?v=1.1" as="image" type="image/png" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; background: #1a1a1a; color: white; min-height: 100vh; }
      #root { min-height: 100vh; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 18px; }
      /* Ensure logo images load correctly */
      img[src*="english-dark"], img[src*="english-white"] {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
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
console.log('✅ Enhanced HTML created with logo preloading');

// Step 5: Create manifest with correct logo references
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
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/english-white_1750523827323.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
};

fs.writeFileSync('dist/manifest.json', JSON.stringify(manifestContent, null, 2));
console.log('✅ Enhanced manifest created');

// Step 6: Enhanced app.js with logo error handling
console.log('\n5. Creating enhanced app.js with logo fallbacks...');
const appJsContent = `
// Enhanced LateLounge app with logo error handling
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

// Logo paths with cache busting and fallbacks
const LOGO_PATHS = {
  dark: '/assets/english-dark_1750523791780.png?v=1.1',
  white: '/assets/english-white_1750523827323.png?v=1.1'
};

// Test logo availability
function testLogoAvailability(callback) {
  let loadedCount = 0;
  const results = {};
  
  Object.entries(LOGO_PATHS).forEach(([theme, path]) => {
    const img = new Image();
    img.onload = () => {
      results[theme] = { available: true, path };
      loadedCount++;
      if (loadedCount === Object.keys(LOGO_PATHS).length) {
        callback(results);
      }
    };
    img.onerror = () => {
      console.error(\`Failed to load \${theme} logo: \${path}\`);
      results[theme] = { available: false, path };
      loadedCount++;
      if (loadedCount === Object.keys(LOGO_PATHS).length) {
        callback(results);
      }
    };
    img.src = path;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('LateLounge app initializing...');
  
  // Test logo availability first
  testLogoAvailability((logoResults) => {
    console.log('Logo availability test results:', logoResults);
    renderApp(logoResults);
  });
});

function renderApp(logoResults) {
  const appHTML = \`
    <div style="min-height: 100vh; background: #1a1a1a; color: white;">
      <!-- Header with Logo -->
      <header style="padding: 20px; text-align: center; border-bottom: 1px solid #333;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
          \${logoResults.dark?.available ? 
            \`<img src="\${logoResults.dark.path}" alt="LateLounge" style="height: 60px; width: auto;" onerror="this.style.display='none'" />\` : 
            '<div style="color: #d97706; font-size: 32px; font-weight: bold;">LateLounge</div>'
          }
        </div>
        <p style="margin-top: 10px; color: #888; font-size: 16px;">Premium Coffee Experience</p>
      </header>
      
      <!-- Menu Container -->
      <div id="menu-container" style="padding: 40px 20px; max-width: 1200px; margin: 0 auto;">
        <h1 style="text-align: center; color: #d97706; margin-bottom: 40px; font-size: 36px;">
          Our Menu - قائمتنا
        </h1>
      </div>
    </div>
  \`;
  
  document.getElementById('root').innerHTML = appHTML;
  renderMenu();
}

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
          <div style="background: #333; padding: 20px; border-radius: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
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
console.log('✅ Enhanced app.js created with logo error handling');

console.log('\n6. Final verification...');
const finalFiles = [
  'dist/index.html',
  'dist/manifest.json', 
  'dist/assets/app.js',
  'dist/assets/english-dark_1750523791780.png',
  'dist/assets/english-white_1750523827323.png'
];

let allFilesReady = true;
finalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${path.basename(file)} - ${file.includes('.png') ? (stats.size / 1024).toFixed(1) + 'KB' : 'Ready'}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesReady = false;
  }
});

console.log('\n' + '='.repeat(60));
if (allFilesReady) {
  console.log('🎉 LOGO FIX COMPLETE!');
  console.log('');
  console.log('Enhancements applied:');
  console.log('• Logo preloading in HTML head');
  console.log('• Cache-busting query parameters (v=1.1)');
  console.log('• Enhanced image rendering CSS');
  console.log('• JavaScript logo availability testing');
  console.log('• Fallback text logo if images fail');
  console.log('• Proper file permissions (644)');
  console.log('');
  console.log('Dark logo should now work correctly in production!');
  console.log('If issues persist, they are likely CDN/browser cache related.');
} else {
  console.log('❌ Logo fix incomplete - some files missing');
}
console.log('='.repeat(60));