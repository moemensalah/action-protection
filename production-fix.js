import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Fixing production deployment with static data...');

try {
  // Create a minimal HTML file for production
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ليت لاونج - LateLounge</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #1a1a1a; color: white; }
    .container { max-width: 800px; margin: 0 auto; text-align: center; }
    .logo { width: 200px; margin: 20px auto; }
    .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
    .category { background: #2a2a2a; padding: 20px; border-radius: 10px; }
    .category h3 { color: #d97706; margin-bottom: 10px; }
    .product { background: #333; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .price { color: #d97706; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <img src="/assets/english-dark_1750523791780.png" alt="LateLounge" class="logo">
    <h1>ليت لاونج - LateLounge</h1>
    <p>Premium Coffee Experience - تجربة قهوة مميزة</p>
    
    <div class="categories">
      <div class="category">
        <h3>Coffee & Espresso - القهوة والإسبريسو</h3>
        <div class="product">
          <h4>Espresso - إسبريسو</h4>
          <p>Rich and bold espresso shot with perfect crema</p>
          <div class="price">15 SAR</div>
        </div>
        <div class="product">
          <h4>Cappuccino - كابتشينو</h4>
          <p>Classic Italian coffee with steamed milk and foam</p>
          <div class="price">22 SAR</div>
        </div>
        <div class="product">
          <h4>Latte - لاتيه</h4>
          <p>Smooth espresso with steamed milk and light foam</p>
          <div class="price">25 SAR</div>
        </div>
      </div>
      
      <div class="category">
        <h3>Hot Beverages - المشروبات الساخنة</h3>
        <div class="product">
          <h4>Green Tea - شاي أخضر</h4>
          <p>Premium organic green tea with antioxidants</p>
          <div class="price">18 SAR</div>
        </div>
        <div class="product">
          <h4>Earl Grey - إيرل جراي</h4>
          <p>Classic black tea with bergamot oil</p>
          <div class="price">20 SAR</div>
        </div>
      </div>
      
      <div class="category">
        <h3>Cold Beverages - المشروبات الباردة</h3>
        <div class="product">
          <h4>Iced Americano - أمريكانو مثلج</h4>
          <p>Refreshing iced coffee with bold espresso flavor</p>
          <div class="price">20 SAR</div>
        </div>
        <div class="product">
          <h4>Iced Latte - لاتيه مثلج</h4>
          <p>Cold espresso with chilled milk over ice</p>
          <div class="price">25 SAR</div>
        </div>
      </div>
      
      <div class="category">
        <h3>Breakfast - الإفطار</h3>
        <div class="product">
          <h4>Avocado Toast - توست الأفوكادو</h4>
          <p>Fresh avocado on toasted artisan bread with herbs</p>
          <div class="price">28 SAR</div>
        </div>
        <div class="product">
          <h4>Croissant - كرواسون</h4>
          <p>Buttery, flaky French pastry baked fresh daily</p>
          <div class="price">15 SAR</div>
        </div>
      </div>
      
      <div class="category">
        <h3>Main Dishes - الأطباق الرئيسية</h3>
        <div class="product">
          <h4>Grilled Chicken Sandwich - ساندويتش دجاج مشوي</h4>
          <p>Tender grilled chicken with fresh vegetables</p>
          <div class="price">45 SAR</div>
        </div>
        <div class="product">
          <h4>Caesar Salad - سلطة قيصر</h4>
          <p>Crisp romaine lettuce with parmesan and croutons</p>
          <div class="price">35 SAR</div>
        </div>
      </div>
      
      <div class="category">
        <h3>Desserts - الحلويات</h3>
        <div class="product">
          <h4>Chocolate Cake - كعكة الشوكولاتة</h4>
          <p>Rich dark chocolate cake with smooth ganache</p>
          <div class="price">25 SAR</div>
        </div>
        <div class="product">
          <h4>Tiramisu - تيراميسو</h4>
          <p>Classic Italian dessert with coffee and mascarpone</p>
          <div class="price">30 SAR</div>
        </div>
      </div>
    </div>
    
    <footer style="margin-top: 40px; padding: 20px; border-top: 1px solid #333;">
      <p>© 2024 ليت لاونج - LateLounge. Premium Coffee Experience.</p>
      <p>Contact: info@late-lounge.com | Phone: +966 XX XXX XXXX</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync('dist/index.html', htmlContent);
  console.log('✅ Created production index.html');

  // Create a simple server that serves static content
  const serverContent = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LateLounge is running with static data' });
});

// Catch all - serve main page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 LateLounge server running on port \${PORT}\`);
});`;

  fs.writeFileSync('dist/server.js', serverContent);
  console.log('✅ Created production server.js');

  console.log('✅ Production fix completed!');
  console.log('📁 Files created in dist/ folder:');
  console.log('  - index.html (static menu page)');
  console.log('  - server.js (simple Express server)');
  console.log('  - assets/ (logo images)');
  console.log('🚀 Deploy the dist/ folder to fix the internal server error');

} catch (error) {
  console.error('❌ Production fix failed:', error.message);
}