import fs from 'fs';
import path from 'path';

console.log('Updating production build with Arabic default and complete product images...');

// Clean and create directories
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist/public/assets', { recursive: true });

// Copy logo assets
const logoFiles = ['english-dark_1750523791780.png', 'english-white_1750523827323.png'];
logoFiles.forEach(file => {
  fs.copyFileSync(`attached_assets/${file}`, `dist/public/assets/${file}`);
  fs.chmodSync(`dist/public/assets/${file}`, 0o644);
});

// Create enhanced HTML with Arabic default and dark mode
const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ليت لاونج - تجربة قهوة مميزة</title>
    <meta name="description" content="تجربة قهوة مميزة ثنائية اللغة مع قوائم عربية وإنجليزية وثيم داكن ومجموعة قهوة رائعة" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#d4af37" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        background: #1a1a1a; 
        color: white; 
        min-height: 100vh;
        direction: rtl;
      }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 40px; padding: 30px 0; }
      .logo { height: 80px; margin-bottom: 20px; }
      .title { color: #d97706; font-size: 2.5rem; margin-bottom: 10px; font-weight: bold; }
      .subtitle { color: #999; font-size: 1.1rem; }
      .categories { display: grid; gap: 30px; }
      .category { 
        background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
        border-radius: 12px;
        padding: 30px;
        border: 1px solid #333;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      }
      .category-header { 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #d97706;
      }
      .category-image { 
        width: 60px; 
        height: 60px; 
        border-radius: 8px; 
        object-fit: cover;
        border: 2px solid #d97706;
      }
      .category-title { 
        color: #d97706; 
        font-size: 1.5rem; 
        font-weight: 600;
      }
      .products { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
        gap: 20px; 
      }
      .product { 
        background: #333; 
        border-radius: 8px; 
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid #444;
      }
      .product:hover { 
        transform: translateY(-5px); 
        box-shadow: 0 8px 25px rgba(217, 119, 6, 0.3);
      }
      .product-image { 
        width: 100%; 
        height: 180px; 
        object-fit: cover;
      }
      .product-content { padding: 20px; }
      .product-title { 
        color: white; 
        font-size: 1.1rem; 
        margin-bottom: 8px; 
        font-weight: 500;
      }
      .product-desc { 
        color: #bbb; 
        font-size: 0.9rem; 
        margin-bottom: 12px; 
        line-height: 1.4;
      }
      .product-price { 
        color: #d97706; 
        font-weight: bold; 
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .language-switch {
        position: fixed;
        top: 20px;
        left: 20px;
        background: #d97706;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        z-index: 1000;
      }
      .theme-switch {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #444;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
      }
    </style>
</head>
<body>
    <button class="language-switch" onclick="toggleLanguage()">English</button>
    <button class="theme-switch" onclick="toggleTheme()">🌙</button>
    
    <div class="container">
        <div class="header">
            <img src="/assets/english-dark_1750523791780.png" alt="ليت لاونج" class="logo">
            <h1 class="title">ليت لاونج</h1>
            <p class="subtitle">تجربة قهوة مميزة - Premium Coffee Experience</p>
        </div>
        
        <div id="menu-content" class="categories">
            <!-- Menu will be populated by JavaScript -->
        </div>
    </div>

    <script>
        let currentLang = 'ar';
        let currentTheme = 'dark';
        
        const menuData = {
            categories: [
                {
                    id: 1,
                    nameEn: "Coffee & Espresso",
                    nameAr: "القهوة والإسبريسو",
                    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                    products: [
                        {
                            nameEn: "Espresso", nameAr: "إسبريسو",
                            descEn: "Rich and bold espresso shot with perfect crema",
                            descAr: "جرعة إسبريسو غنية وجريئة مع كريما مثالية",
                            price: 15,
                            image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Cappuccino", nameAr: "كابتشينو",
                            descEn: "Classic Italian coffee with steamed milk and foam",
                            descAr: "قهوة إيطالية كلاسيكية مع حليب مبخر ورغوة",
                            price: 22,
                            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Latte", nameAr: "لاتيه",
                            descEn: "Smooth espresso with steamed milk and light foam",
                            descAr: "إسبريسو ناعم مع حليب مبخر ورغوة خفيفة",
                            price: 25,
                            image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Turkish Coffee", nameAr: "قهوة تركية",
                            descEn: "Traditional Turkish coffee served with authentic preparation",
                            descAr: "قهوة تركية تقليدية تُقدم بالتحضير الأصيل",
                            price: 20,
                            image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Arabic Coffee", nameAr: "قهوة عربية",
                            descEn: "Traditional Arabic coffee with cardamom and dates",
                            descAr: "قهوة عربية تقليدية مع الهيل والتمر",
                            price: 18,
                            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        }
                    ]
                },
                {
                    id: 2,
                    nameEn: "Hot Beverages",
                    nameAr: "المشروبات الساخنة",
                    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                    products: [
                        {
                            nameEn: "Green Tea", nameAr: "شاي أخضر",
                            descEn: "Premium organic green tea with antioxidants",
                            descAr: "شاي أخضر عضوي فاخر مع مضادات الأكسدة",
                            price: 18,
                            image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Earl Grey", nameAr: "إيرل جراي",
                            descEn: "Classic black tea with bergamot oil",
                            descAr: "شاي أسود كلاسيكي مع زيت البرغموت",
                            price: 20,
                            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Moroccan Mint Tea", nameAr: "شاي النعناع المغربي",
                            descEn: "Refreshing mint tea with traditional Moroccan preparation",
                            descAr: "شاي النعناع المنعش بالتحضير المغربي التقليدي",
                            price: 22,
                            image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Hot Chocolate", nameAr: "شوكولاتة ساخنة",
                            descEn: "Rich hot chocolate with whipped cream and marshmallows",
                            descAr: "شوكولاتة ساخنة غنية مع كريمة مخفوقة ومارشميلو",
                            price: 25,
                            image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        }
                    ]
                },
                {
                    id: 3,
                    nameEn: "Cold Beverages",
                    nameAr: "المشروبات الباردة",
                    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                    products: [
                        {
                            nameEn: "Iced Americano", nameAr: "أمريكانو مثلج",
                            descEn: "Refreshing iced coffee with bold espresso flavor",
                            descAr: "قهوة مثلجة منعشة بنكهة إسبريسو جريئة",
                            price: 20,
                            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Iced Latte", nameAr: "لاتيه مثلج",
                            descEn: "Cold espresso with chilled milk over ice",
                            descAr: "إسبريسو بارد مع حليب مبرد على الثلج",
                            price: 25,
                            image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Fresh Orange Juice", nameAr: "عصير برتقال طازج",
                            descEn: "Freshly squeezed orange juice with natural pulp",
                            descAr: "عصير برتقال طازج مع اللب الطبيعي",
                            price: 16,
                            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Iced Tea", nameAr: "شاي مثلج",
                            descEn: "Refreshing iced tea with lemon and mint",
                            descAr: "شاي مثلج منعش مع الليمون والنعناع",
                            price: 15,
                            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        }
                    ]
                },
                {
                    id: 4,
                    nameEn: "Breakfast Items",
                    nameAr: "أصناف الإفطار",
                    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                    products: [
                        {
                            nameEn: "Avocado Toast", nameAr: "توست الأفوكادو",
                            descEn: "Fresh avocado on toasted artisan bread with herbs",
                            descAr: "أفوكادو طازج على خبز حرفي محمص مع الأعشاب",
                            price: 28,
                            image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Croissant", nameAr: "كرواسون",
                            descEn: "Buttery, flaky French pastry baked fresh daily",
                            descAr: "معجنات فرنسية مقرمشة بالزبدة مخبوزة طازجة يومياً",
                            price: 15,
                            image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        }
                    ]
                },
                {
                    id: 5,
                    nameEn: "Main Dishes",
                    nameAr: "الأطباق الرئيسية",
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                    products: [
                        {
                            nameEn: "Grilled Chicken Sandwich", nameAr: "ساندويتش دجاج مشوي",
                            descEn: "Tender grilled chicken with fresh vegetables",
                            descAr: "دجاج مشوي طري مع خضروات طازجة",
                            price: 45,
                            image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        },
                        {
                            nameEn: "Caesar Salad", nameAr: "سلطة قيصر",
                            descEn: "Crisp romaine lettuce with parmesan and croutons",
                            descAr: "خس روماني مقرمش مع البارميزان والخبز المحمص",
                            price: 35,
                            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                        }
                    ]
                }
            ]
        };

        function toggleLanguage() {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            document.documentElement.setAttribute('lang', currentLang);
            document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
            document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
            document.querySelector('.language-switch').textContent = currentLang === 'ar' ? 'English' : 'العربية';
            renderMenu();
        }

        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.className = currentTheme;
            document.body.style.background = currentTheme === 'dark' ? '#1a1a1a' : '#ffffff';
            document.body.style.color = currentTheme === 'dark' ? 'white' : '#333';
            document.querySelector('.theme-switch').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
            updateLogoForTheme();
            renderMenu();
        }

        function updateLogoForTheme() {
            const logo = document.querySelector('.logo');
            const logoSrc = currentTheme === 'dark' 
                ? '/assets/english-dark_1750523791780.png'
                : '/assets/english-white_1750523827323.png';
            logo.src = logoSrc;
        }

        function renderMenu() {
            const container = document.getElementById('menu-content');
            
            const menuHTML = menuData.categories.map(category => {
                const categoryName = currentLang === 'ar' ? category.nameAr : category.nameEn;
                
                const productsHTML = category.products.map(product => {
                    const productName = currentLang === 'ar' ? product.nameAr : product.nameEn;
                    const productDesc = currentLang === 'ar' ? product.descAr : product.descEn;
                    
                    return \`
                        <div class="product">
                            <img src="\${product.image}" alt="\${productName}" class="product-image" loading="lazy">
                            <div class="product-content">
                                <h3 class="product-title">\${productName}</h3>
                                <p class="product-desc">\${productDesc}</p>
                                <div class="product-price">\${product.price} \${currentLang === 'ar' ? 'ريال سعودي' : 'SAR'}</div>
                            </div>
                        </div>
                    \`;
                }).join('');
                
                return \`
                    <div class="category">
                        <div class="category-header">
                            <img src="\${category.image}" alt="\${categoryName}" class="category-image" loading="lazy">
                            <h2 class="category-title">\${categoryName}</h2>
                        </div>
                        <div class="products">
                            \${productsHTML}
                        </div>
                    </div>
                \`;
            }).join('');
            
            container.innerHTML = menuHTML;
        }

        // Initialize the menu on page load
        document.addEventListener('DOMContentLoaded', function() {
            renderMenu();
        });
    </script>
    
    <!--Start of Tawk.to Script-->
    <script type="text/javascript">
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/6856e499f4cfc5190e97ea98/1iu9mpub8';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
    })();
    </script>
    <!--End of Tawk.to Script-->
</body>
</html>`;

fs.writeFileSync('dist/index.html', htmlContent);

// Create manifest.json
const manifestContent = {
  "name": "ليت لاونج - تجربة قهوة مميزة",
  "short_name": "ليت لاونج",
  "description": "موقع مقهى ثنائي اللغة يضم قهوة مميزة وعناصر قائمة",
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

// Create server.js
const serverContent = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`ليت لاونج server running on port \${PORT}\`);
});`;

fs.writeFileSync('dist/server.js', serverContent);

// Create package.json
const packageJson = {
  "name": "latelounge-arabic-production",
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

console.log('✅ Production build updated with:');
console.log('- Arabic as default language');
console.log('- Dark mode as default theme');
console.log('- Complete product images for all categories');
console.log('- Enhanced interactive features');
console.log('- Logo assets in correct location (dist/public/assets)');
console.log('');
console.log('Files created:');
console.log('- dist/index.html (Arabic/Dark default)');
console.log('- dist/manifest.json (Arabic metadata)');
console.log('- dist/server.js (Enhanced Express server)');
console.log('- dist/public/assets/english-dark_1750523791780.png');
console.log('- dist/public/assets/english-white_1750523827323.png');
console.log('- dist/package.json');
console.log('');
console.log('Ready for deployment with complete demo data!');